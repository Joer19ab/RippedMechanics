// ============================================================================
// RippedMechanics Progress Tracker – App Logic v2.0
// ============================================================================

const DATA_KEY        = 'rippedmechanics_data_v2';
const BACKEND_DATA_ENDPOINT = '/api/tracker-data';
const WEEKS_COUNT     = 16;
const SESSIONS_PER_WEEK = 12;
const PROGRAM_START   = new Date('2026-05-11T00:00:00');
const RACE_DATE_HYROX = new Date('2026-09-06T00:00:00');
const RACE_DATE_703   = new Date('2027-06-22T00:00:00');

const SESSIONS = [
    { id: 0, day: 'MON AM', desc: 'Easy Run Z2 + Strides',      type: 'Run',     dayIndex: 1 },
    { id: 1, day: 'MON PM', desc: 'Lower Strength + Sled',       type: 'Strength',dayIndex: 1 },
    { id: 2, day: 'TUE AM', desc: 'Swim Technique / Aerobic',    type: 'Swim',    dayIndex: 2 },
    { id: 3, day: 'TUE PM', desc: 'Bike Threshold',              type: 'Bike',    dayIndex: 2 },
    { id: 4, day: 'WED AM', desc: 'Hyrox Engine Intervals',      type: 'Hyrox',   dayIndex: 3 },
    { id: 5, day: 'WED PM', desc: 'Mobility + Breathing',        type: 'Recovery',dayIndex: 3 },
    { id: 6, day: 'THU AM', desc: 'Swim + Pull Focus',           type: 'Swim',    dayIndex: 4 },
    { id: 7, day: 'THU PM', desc: 'Run Threshold / Tempo',       type: 'Run',     dayIndex: 4 },
    { id: 8, day: 'FRI AM', desc: 'Easy Bike Z2',                type: 'Bike',    dayIndex: 5 },
    { id: 9, day: 'FRI PM', desc: 'Hyrox Strength Circuit',      type: 'Hyrox',   dayIndex: 5 },
    { id: 10,day: 'SAT',    desc: 'Long Bike or Brick',          type: 'Bike',    dayIndex: 6 },
    { id: 11,day: 'SUN',    desc: 'Long Run Z2 + Mobility',      type: 'Run',     dayIndex: 0 },
];

// ============================================================================
class ProgressTracker {
    constructor() {
        this.currentWeek = this.calcCurrentWeek();
        this.data        = this.loadData();
        this.charts      = {};
        this.activeBench = 'run';
        this.backendState = 'unknown';
        this.hasSyncedFromBackend = false;
        this.rebuildChartsPending = false;
        this.rebuildChartsTimer = null;
        this.lastRebuildWeek = null;
        this.init();
    }

    init() {
        this.renderCountdowns();
        this.renderWeekOptions();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderSessionGrid();
        this.loadWeekData();
        this.initCharts();
        this.syncFromBackend();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    calcCurrentWeek() {
        const now      = new Date();
        const diffMs   = now - PROGRAM_START;
        const diffDays = Math.floor(diffMs / 86400000);
        const week     = Math.floor(diffDays / 7) + 1;
        return Math.max(1, Math.min(week, WEEKS_COUNT));
    }

    getWeekStart(week) {
        const d = new Date(PROGRAM_START.getTime() + (week - 1) * 7 * 86400000);
        return d.toISOString().split('T')[0];
    }
    getWeekEnd(week) {
        const d = new Date(PROGRAM_START.getTime() + ((week - 1) * 7 + 6) * 86400000);
        return d.toISOString().split('T')[0];
    }
    getPhase(week) {
        if (week <= 4)  return 1;
        if (week <= 8)  return 2;
        if (week <= 12) return 3;
        if (week <= 15) return 4;
        return 5;
    }
    getPhaseName(p) {
        return ['','Foundation','Build','Specificity','Sharpen','Race'][p] || '';
    }
    trendToScore(t) {
        return { up: 85, stable: 70, down: 45 }[t] ?? 60;
    }
    daysBetween(a, b) {
        return Math.max(0, Math.ceil((b - a) / 86400000));
    }
    showToast(msg, ms = 2200) {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), ms);
    }
    parseMMSS(str) {
        if (!str) return 0;
        const parts = str.split(':');
        if (parts.length !== 2) return 0;
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    formatMMSS(secs) {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2,'0')}`;
    }

    // ── Data ─────────────────────────────────────────────────────────────────
    loadData() {
        const stored = localStorage.getItem(DATA_KEY);
        const def    = this.getDefaultData();
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return this.mergeWithDefaults(parsed);
            } catch {
                return def;
            }
        }
        return def;
    }
    saveData() {
        localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
        this.syncToBackend();
    }

    mergeWithDefaults(candidate) {
        const def = this.getDefaultData();
        if (!candidate || typeof candidate !== 'object') return def;
        const merged = { ...candidate };
        for (let i = 1; i <= WEEKS_COUNT; i++) {
            const k = `week_${i}`;
            if (!merged[k]) {
                merged[k] = def[k];
                continue;
            }
            merged[k] = {
                ...def[k],
                ...merged[k],
                benchmarks: {
                    ...def[k].benchmarks,
                    ...(merged[k].benchmarks || {}),
                },
                session_status: Array.isArray(merged[k].session_status)
                    ? merged[k].session_status.slice(0, SESSIONS_PER_WEEK)
                    : new Array(SESSIONS_PER_WEEK).fill(false),
            };
            if (merged[k].session_status.length < SESSIONS_PER_WEEK) {
                const missing = SESSIONS_PER_WEEK - merged[k].session_status.length;
                merged[k].session_status.push(...new Array(missing).fill(false));
            }
        }
        return merged;
    }

    async syncFromBackend() {
        if (this.hasSyncedFromBackend) return;
        this.hasSyncedFromBackend = true;
        try {
            const res = await fetch(BACKEND_DATA_ENDPOINT, {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Accept': 'application/json' },
            });
            if (!res.ok) {
                this.backendState = 'offline';
                return;
            }
            const payload = await res.json();
            const incoming = payload?.data ?? payload;
            if (!incoming || typeof incoming !== 'object') return;

            this.data = this.mergeWithDefaults(incoming);
            localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
            this.backendState = 'online';

            this.renderSessionGrid();
            this.loadWeekData();
            this.renderDashboard();
            this.rebuildCharts();
            this.showToast('Synced with backend', 1400);
        } catch {
            this.backendState = 'offline';
        }
    }

    async syncToBackend() {
        try {
            const res = await fetch(BACKEND_DATA_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: this.data }),
            });
            this.backendState = res.ok ? 'online' : 'offline';
        } catch {
            this.backendState = 'offline';
        }
    }
    getDefaultData() {
        const data = {};
        for (let i = 1; i <= WEEKS_COUNT; i++) {
            data[`week_${i}`] = {
                week: i,
                completed_sessions: 0,
                compliance_score: 0,
                session_status: new Array(SESSIONS_PER_WEEK).fill(false),
                run_trend: '', bike_trend: '', swim_trend: '', hyrox_trend: '',
                avg_sleep: 0, sleep_consistency: '',
                hrv_trend: '', rhr_trend: '', hrv_value: 0, rhr_value: 0,
                macro_adherence: 0, carb_periodization: 0, fueling_score: 0,
                avg_weight: 0,
                next_week_load: '', volume_change: 0, intensity_change: '', priorities: '',
                benchmarks: { run_5k_seconds: 0, ftp_watts: 0, squat_kg: 0, deadlift_kg: 0 },
                timestamp: ''
            };
        }
        return data;
    }

    // ── Countdowns ───────────────────────────────────────────────────────────
    renderCountdowns() {
        const now = new Date();
        const h   = this.daysBetween(now, RACE_DATE_HYROX);
        const i   = this.daysBetween(now, RACE_DATE_703);
        const el1 = document.getElementById('hyroxCountdown');
        const el2 = document.getElementById('ironmanCountdown');
        if (el1) el1.textContent = h;
        if (el2) el2.textContent = i;
    }

    // ── Week Options ─────────────────────────────────────────────────────────
    renderWeekOptions() {
        const sel = document.getElementById('weekSelect');
        if (!sel) return;
        sel.innerHTML = '';
        for (let i = 1; i <= WEEKS_COUNT; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `Week ${i}  (${this.getWeekStart(i)} → ${this.getWeekEnd(i)})`;
            if (i === this.currentWeek) opt.selected = true;
            sel.appendChild(opt);
        }
    }

    // ── Event Listeners ──────────────────────────────────────────────────────
    setupEventListeners() {
        window.addEventListener('resize', () => this.handleWindowResize());
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => this.switchTab(e.currentTarget.dataset.tab, e.currentTarget));
        });
        document.getElementById('prevWeek')?.addEventListener('click', () => {
            if (this.currentWeek > 1) { this.currentWeek--; this.syncWeekSelect(); this.onWeekChange(); }
        });
        document.getElementById('nextWeek')?.addEventListener('click', () => {
            if (this.currentWeek < WEEKS_COUNT) { this.currentWeek++; this.syncWeekSelect(); this.onWeekChange(); }
        });
        document.getElementById('weekSelect')?.addEventListener('change', e => {
            this.currentWeek = parseInt(e.target.value);
            this.onWeekChange();
        });
        document.getElementById('saveTrackingBtn')?.addEventListener('click', () => this.saveWeeklyUpdate());
        document.getElementById('clearSessionsBtn')?.addEventListener('click', () => this.clearSessions());
        document.getElementById('importBtn')?.addEventListener('click', () => this.importData());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('clearDataBtn')?.addEventListener('click', () => this.clearAllData());
        document.querySelectorAll('.trend-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                document.querySelectorAll('.trend-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.updateTrendChart(e.currentTarget.dataset.metric);
            });
        });
        document.querySelectorAll('.bench-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                document.querySelectorAll('.bench-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.activeBench = e.currentTarget.dataset.bench;
                this.updateBenchmarkChart();
            });
        });
    }

    handleWindowResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.reflowDashboardMiniCharts();
        }, 120);
    }

    clampCanvasSize(canvas, targetHeight, minWidth = 320, maxWidth = 1400) {
        if (!canvas) return false;
        const parentWidth = canvas.parentElement?.clientWidth || 640;
        const targetWidth = Math.max(minWidth, Math.min(maxWidth, Math.floor(parentWidth)));
        const oversized = canvas.width > 2500 || canvas.height > 1500;

        canvas.style.width = '100%';
        canvas.style.height = `${targetHeight}px`;
        canvas.style.maxHeight = `${targetHeight}px`;

        if (oversized || canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            return true;
        }
        return false;
    }

    reflowDashboardMiniCharts() {
        const sparkCanvas = document.getElementById('complianceSparkline');
        const sparkChanged = this.clampCanvasSize(sparkCanvas, 70);
        if (sparkChanged && this.charts.sparkline) {
            this.destroyChart('sparkline');
            this.renderComplianceSparkline();
        }
    }

    syncWeekSelect() {
        const sel = document.getElementById('weekSelect');
        if (sel) sel.value = this.currentWeek;
    }
    onWeekChange() {
        this.renderSessionGrid();
        this.loadWeekData();
        this.renderDashboard();
        // Only rebuild charts if the analytics tab is currently active
        // This prevents unnecessary reflows when switching weeks on other tabs
        const analyticsActive = document.getElementById('analytics')?.classList.contains('active');
        if (analyticsActive) {
            this.rebuildCharts();
        }
    }

    // ── Tab Switching ────────────────────────────────────────────────────────
    switchTab(tabName, btn) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabName)?.classList.add('active');
        btn?.classList.add('active');
        if (tabName === 'analytics') {
            // Use a shorter delay for analytics tab and leverage debouncing
            requestAnimationFrame(() => this.rebuildCharts());
        }
        if (tabName === 'dashboard') this.renderDashboard();
    }

    // ── Dashboard ────────────────────────────────────────────────────────────
    renderDashboard() {
        const wk   = this.currentWeek;
        const wkd  = this.data[`week_${wk}`];
        const done = wkd.session_status?.filter(Boolean).length ?? 0;
        const phase = this.getPhase(wk);

        // Ring
        const circumference = 2 * Math.PI * 50; // r=50
        const pct     = (wk / WEEKS_COUNT) * 100;
        const offset  = circumference * (1 - pct / 100);
        const ringFill = document.getElementById('programRingFill');
        if (ringFill) {
            ringFill.style.strokeDasharray  = circumference;
            ringFill.style.strokeDashoffset = offset;
        }
        this.setText('ringWeekText',   `W${wk}`);
        this.setText('ringPctText',    pct.toFixed(1) + '%');
        this.setText('ringCaption',    `Week ${wk} of ${WEEKS_COUNT} · Phase ${phase}: ${this.getPhaseName(phase)}`);

        // Quick stats
        this.setText('dashWeek',       `W${wk}`);
        this.setText('dashCompliance', `${done}/12`);
        this.setText('dashSleep',      wkd.avg_sleep ? `${wkd.avg_sleep}h` : '—');
        this.setText('dashHRV',        wkd.hrv_value || '—');
        this.setText('dashWeight',     wkd.avg_weight ? `${wkd.avg_weight}kg` : '—');
        this.setText('dashNutrition',  wkd.macro_adherence ? `${wkd.macro_adherence}%` : '—');

        // Timeline marker
        const markerPct = ((wk - 0.5) / WEEKS_COUNT) * 100;
        const marker = document.getElementById('currentWeekMarker');
        if (marker) marker.style.left = `${markerPct}%`;

        // Today's session
        this.renderTodaySession();

        // Dashboard radar
        this.renderDashRadar();

        // Compliance sparkline
        this.renderComplianceSparkline();
    }

    setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    renderTodaySession() {
        const container = document.getElementById('todaySession');
        if (!container) return;
        const today = new Date().getDay(); // 0=Sun,1=Mon,...
        const todays = SESSIONS.filter(s => s.dayIndex === today);
        if (todays.length === 0) {
            container.innerHTML = `<div class="today-session-item ts-rest">
                <span class="ts-time">TODAY</span>
                <span class="ts-desc">Rest day — Focus on recovery &amp; mobility</span>
                <span class="ts-type">Rest</span>
            </div>`;
        } else {
            container.innerHTML = todays.map(s => `
                <div class="today-session-item">
                    <span class="ts-time">${s.day.split(' ')[1] || s.day}</span>
                    <span class="ts-desc">${s.desc}</span>
                    <span class="ts-type">${s.type}</span>
                </div>`).join('');
        }
    }

    // ── Session Grid ─────────────────────────────────────────────────────────
    renderSessionGrid() {
        const container = document.getElementById('sessionGrid');
        if (!container) return;
        const wkd = this.data[`week_${this.currentWeek}`];
        const statuses = wkd.session_status || new Array(SESSIONS_PER_WEEK).fill(false);

        container.innerHTML = SESSIONS.map((s, i) => `
            <label class="session-check ${statuses[i] ? 'done' : ''}" data-idx="${i}">
                <input type="checkbox" ${statuses[i] ? 'checked' : ''} data-idx="${i}">
                <span class="sc-day">${s.day}</span>
                <span class="sc-desc">${s.desc}</span>
            </label>`).join('');

        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', e => this.toggleSession(parseInt(e.target.dataset.idx), e.target.checked));
        });
        this.updateSessionFooter();
    }

    toggleSession(idx, checked) {
        const wkd = this.data[`week_${this.currentWeek}`];
        if (!wkd.session_status) wkd.session_status = new Array(SESSIONS_PER_WEEK).fill(false);
        wkd.session_status[idx] = checked;
        const done = wkd.session_status.filter(Boolean).length;
        wkd.completed_sessions = done;
        wkd.compliance_score   = Math.round((done / SESSIONS_PER_WEEK) * 100);
        this.saveData();

        const label = document.querySelector(`.session-check[data-idx="${idx}"]`);
        if (label) label.classList.toggle('done', checked);
        this.updateSessionFooter();
        this.renderDashboard();
    }

    clearSessions() {
        const wkd = this.data[`week_${this.currentWeek}`];
        wkd.session_status     = new Array(SESSIONS_PER_WEEK).fill(false);
        wkd.completed_sessions = 0;
        wkd.compliance_score   = 0;
        this.saveData();
        this.renderSessionGrid();
        this.renderDashboard();
    }

    updateSessionFooter() {
        const wkd  = this.data[`week_${this.currentWeek}`];
        const done = wkd.session_status?.filter(Boolean).length ?? 0;
        const rate = Math.round((done / SESSIONS_PER_WEEK) * 100);
        this.setText('sgCompleted',      done);
        this.setText('sgComplianceRate', rate + '%');
    }

    // ── Load/Save Week Form ──────────────────────────────────────────────────
    loadWeekData() {
        const d = this.data[`week_${this.currentWeek}`];
        this.setVal('runTrend',          d.run_trend);
        this.setVal('bikeTrend',         d.bike_trend);
        this.setVal('swimTrend',         d.swim_trend);
        this.setVal('hyroxTrend',        d.hyrox_trend);
        this.setVal('avgSleep',          d.avg_sleep || '');
        this.setVal('sleepConsistency',  d.sleep_consistency);
        this.setVal('hrvValue',          d.hrv_value || '');
        this.setVal('rhrValue',          d.rhr_value || '');
        this.setVal('hrvTrend',          d.hrv_trend);
        this.setVal('rhrTrend',          d.rhr_trend);
        this.setVal('macroAdherence',    d.macro_adherence || '');
        this.setVal('carbPeriodization', d.carb_periodization || '');
        this.setVal('fuelingScore',      d.fueling_score || '');
        this.setVal('avgWeight',         d.avg_weight || '');
        this.setVal('nextWeekLoad',      d.next_week_load);
        this.setVal('volumeChange',      d.volume_change || '');
        this.setVal('intensityChange',   d.intensity_change);
        this.setVal('priorities',        d.priorities);
        // benchmarks
        const b = d.benchmarks || {};
        this.setVal('bench5k',       b.run_5k_seconds ? this.formatMMSS(b.run_5k_seconds) : '');
        this.setVal('benchFTP',      b.ftp_watts || '');
        this.setVal('benchSquat',    b.squat_kg || '');
        this.setVal('benchDeadlift', b.deadlift_kg || '');
    }

    setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val ?? '';
    }
    getVal(id) {
        return document.getElementById(id)?.value ?? '';
    }

    saveWeeklyUpdate() {
        const wk  = this.currentWeek;
        const wkd = this.data[`week_${wk}`];
        const done = wkd.session_status?.filter(Boolean).length ?? 0;

        this.data[`week_${wk}`] = {
            ...wkd,
            completed_sessions:  done,
            compliance_score:    Math.round((done / SESSIONS_PER_WEEK) * 100),
            run_trend:           this.getVal('runTrend'),
            bike_trend:          this.getVal('bikeTrend'),
            swim_trend:          this.getVal('swimTrend'),
            hyrox_trend:         this.getVal('hyroxTrend'),
            avg_sleep:           parseFloat(this.getVal('avgSleep')) || 0,
            sleep_consistency:   this.getVal('sleepConsistency'),
            hrv_value:           parseInt(this.getVal('hrvValue')) || 0,
            rhr_value:           parseInt(this.getVal('rhrValue')) || 0,
            hrv_trend:           this.getVal('hrvTrend'),
            rhr_trend:           this.getVal('rhrTrend'),
            macro_adherence:     parseInt(this.getVal('macroAdherence')) || 0,
            carb_periodization:  parseInt(this.getVal('carbPeriodization')) || 0,
            fueling_score:       parseInt(this.getVal('fuelingScore')) || 0,
            avg_weight:          parseFloat(this.getVal('avgWeight')) || 0,
            next_week_load:      this.getVal('nextWeekLoad'),
            volume_change:       parseInt(this.getVal('volumeChange')) || 0,
            intensity_change:    this.getVal('intensityChange'),
            priorities:          this.getVal('priorities'),
            benchmarks: {
                run_5k_seconds: this.parseMMSS(this.getVal('bench5k')),
                ftp_watts:      parseInt(this.getVal('benchFTP')) || 0,
                squat_kg:       parseInt(this.getVal('benchSquat')) || 0,
                deadlift_kg:    parseInt(this.getVal('benchDeadlift')) || 0,
            },
            timestamp: new Date().toISOString(),
        };

        this.saveData();
        this.renderDashboard();
        this.rebuildCharts();
        this.showToast(`✅ Week ${wk} saved!`);
    }

    // ── Charts ───────────────────────────────────────────────────────────────
    initCharts() {
        this.renderDashRadar();
        this.renderComplianceSparkline();
        // other charts built lazily when analytics tab opens
    }

    rebuildCharts() {
        // Only rebuild if analytics tab is visible
        const analyticsActive = document.getElementById('analytics')?.classList.contains('active');
        if (!analyticsActive) return;
        
        // Debounce: if a rebuild is already pending, don't queue another one
        if (this.rebuildChartsPending) return;
        
        // Mark as pending and debounce with a 150ms delay
        this.rebuildChartsPending = true;
        clearTimeout(this.rebuildChartsTimer);
        
        this.rebuildChartsTimer = setTimeout(() => {
            this.rebuildChartsPending = false;
            
            // Use requestAnimationFrame to batch DOM updates
            requestAnimationFrame(() => {
                this.buildComplianceChart();
                this.buildPerformanceRadar();
                this.buildTrendChart('all');
                this.buildRecoveryChart();
                this.buildHRVRHRChart();
                this.buildNutritionChart();
                this.buildWeightChart();
                this.buildBenchmarkChart('run');
                this.buildZoneDonut();
                this.buildDisciplineDonut();
                this.updateAnalyticsSummary();
                this.updatePhaseRecommendations();
            });
        }, 150);
    }

    chartOptions(overrides = {}) {
        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
                tooltip: { backgroundColor: '#1e293b', borderColor: '#475569', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8' },
            },
            scales: {
                y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(71,85,105,0.25)' } },
                x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(71,85,105,0.15)' } },
            },
            ...overrides,
        };
    }
    destroyChart(key) {
        if (this.charts[key]) { this.charts[key].destroy(); delete this.charts[key]; }
    }
    weekLabels() {
        const labels = [];
        for (let i = 1; i <= this.currentWeek; i++) labels.push(`W${i}`);
        return labels;
    }
    weekData(fn) {
        const out = [];
        for (let i = 1; i <= this.currentWeek; i++) out.push(fn(this.data[`week_${i}`]));
        return out;
    }

    // Dashboard Radar (small)
    renderDashRadar() {
        const container = document.getElementById('performanceSnapshot');
        if (!container) return;

        this.destroyChart('dashRadar');

        const wkd = this.data[`week_${this.currentWeek}`];

        const metrics = [
            { label: 'Run', value: this.trendToScore(wkd.run_trend) },
            { label: 'Bike', value: this.trendToScore(wkd.bike_trend) },
            { label: 'Swim', value: this.trendToScore(wkd.swim_trend) },
            { label: 'Hyrox', value: this.trendToScore(wkd.hyrox_trend) },
            { label: 'Sleep', value: wkd.avg_sleep ? Math.min(Math.round((wkd.avg_sleep / 8) * 100), 100) : 60 },
            { label: 'Nutrition', value: wkd.macro_adherence || 60 },
        ];

        const overall = Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length);
        const status = overall >= 80 ? 'On Track' : (overall >= 65 ? 'Stable' : 'Needs Focus');

        container.innerHTML = `
            <div class="ps-head">
                <div class="ps-score">${overall}</div>
                <div class="ps-status">${status}</div>
            </div>
            ${metrics.map(m => `
                <div class="ps-metric">
                    <div class="ps-label">${m.label}</div>
                    <div class="ps-track"><div class="ps-fill" style="width:${Math.max(0, Math.min(100, m.value))}%"></div></div>
                    <div class="ps-value">${m.value}</div>
                </div>
            `).join('')}
            <div class="ps-foot">Snapshot score is calculated from discipline trends, sleep, and nutrition this week.</div>
        `;
    }

    renderComplianceSparkline() {
        const ctx = document.getElementById('complianceSparkline');
        if (!ctx) return;
        this.clampCanvasSize(ctx, 70);
        const labels = [];
        const data   = [];
        for (let i = 1; i <= WEEKS_COUNT; i++) {
            labels.push(`W${i}`);
            const wkd = this.data[`week_${i}`];
            data.push(wkd.compliance_score || null);
        }
        const bgColors = labels.map((_, i) => {
            if (i + 1 === this.currentWeek) return 'rgba(59,130,246,0.8)';
            const s = this.data[`week_${i+1}`].compliance_score;
            if (!s) return 'rgba(71,85,105,0.35)';
            if (s >= 90) return 'rgba(16,185,129,0.7)';
            if (s >= 70) return 'rgba(59,130,246,0.7)';
            return 'rgba(239,68,68,0.7)';
        });

        if (this.charts.sparkline) {
            this.charts.sparkline.data.labels = labels;
            this.charts.sparkline.data.datasets[0].data = data;
            this.charts.sparkline.data.datasets[0].backgroundColor = bgColors;
            this.charts.sparkline.update('none');
            return;
        }

        this.charts.sparkline = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Compliance %', data, backgroundColor: bgColors, borderRadius: 4 }],
            },
            options: this.chartOptions({
                responsive: false,
                maintainAspectRatio: false,
                animation: false,
                events: [],
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(71,85,105,0.2)' } },
                    x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
                },
                plugins: { legend: { display: false } },
            }),
        });
    }

    // Analytics Charts
    buildComplianceChart() {
        const ctx = document.getElementById('complianceChart');
        if (!ctx) return;
        this.destroyChart('compliance');
        this.charts.compliance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.weekLabels(),
                datasets: [{
                    label: 'Compliance %',
                    data: this.weekData(d => d.compliance_score || null),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
                    spanGaps: true,
                }],
            },
            options: this.chartOptions({ scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.2)' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.1)' } } } }),
        });
    }

    buildPerformanceRadar() {
        const ctx = document.getElementById('performanceRadar');
        if (!ctx) return;
        this.destroyChart('radar');
        const wkd = this.data[`week_${this.currentWeek}`];
        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Run','Bike','Swim','Hyrox','Recovery','Nutrition'],
                datasets: [{
                    label: `Week ${this.currentWeek}`,
                    data: [
                        this.trendToScore(wkd.run_trend),
                        this.trendToScore(wkd.bike_trend),
                        this.trendToScore(wkd.swim_trend),
                        this.trendToScore(wkd.hyrox_trend),
                        wkd.avg_sleep ? Math.min((wkd.avg_sleep / 8) * 100, 100) : 60,
                        wkd.macro_adherence || 60,
                    ],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.2)',
                    pointBackgroundColor: '#3b82f6',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { r: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8', backdropColor: 'transparent' }, grid: { color: 'rgba(71,85,105,0.3)' }, pointLabels: { color: '#94a3b8', font: { size: 11 } } } },
                plugins: { legend: { labels: { color: '#94a3b8' } } },
            },
        });
    }

    buildTrendChart(metric) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        this.destroyChart('trend');
        const labels = this.weekLabels();
        const ds = [];
        const colours = { run: '#ef4444', bike: '#f59e0b', swim: '#06b6d4', hyrox: '#8b5cf6' };
        const keys = metric === 'all' ? ['run','bike','swim','hyrox'] : [metric];
        keys.forEach(k => {
            ds.push({
                label: k.charAt(0).toUpperCase() + k.slice(1),
                data: this.weekData(d => this.trendToScore(d[`${k}_trend`])),
                borderColor: colours[k],
                backgroundColor: colours[k] + '22',
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 3,
                fill: false,
                spanGaps: true,
            });
        });
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: ds },
            options: this.chartOptions({ scales: { y: { min: 30, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.2)' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.1)' } } } }),
        });
    }

    updateTrendChart(metric) {
        this.buildTrendChart(metric);
    }

    buildRecoveryChart() {
        const ctx = document.getElementById('recoveryChart');
        if (!ctx) return;
        this.destroyChart('recovery');
        const data = this.weekData(d => d.avg_sleep || null);
        const bgColors = data.map(v => {
            if (!v) return 'rgba(71,85,105,0.35)';
            if (v >= 8) return 'rgba(16,185,129,0.75)';
            if (v >= 7) return 'rgba(59,130,246,0.75)';
            return 'rgba(239,68,68,0.65)';
        });
        this.charts.recovery = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.weekLabels(),
                datasets: [{
                    label: 'Avg Sleep (h)',
                    data,
                    backgroundColor: bgColors,
                    borderRadius: 5,
                }],
            },
            options: this.chartOptions({ scales: { y: { beginAtZero: false, min: 5, max: 10, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.2)' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } } }),
        });
    }

    buildHRVRHRChart() {
        const ctx = document.getElementById('hrvRhrChart');
        if (!ctx) return;
        this.destroyChart('hrvrhr');
        const labels = this.weekLabels();
        this.charts.hrvrhr = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: 'HRV', data: this.weekData(d => d.hrv_value || null), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 2, tension: 0.35, yAxisID: 'y', pointRadius: 3, spanGaps: true },
                    { label: 'RHR (bpm)', data: this.weekData(d => d.rhr_value || null), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2, tension: 0.35, yAxisID: 'y2', pointRadius: 3, spanGaps: true },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } }, tooltip: { backgroundColor: '#1e293b', borderColor: '#475569', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8' } },
                scales: {
                    y:  { beginAtZero: false, position: 'left',  ticks: { color: '#10b981', font: { size: 10 } }, grid: { color: 'rgba(71,85,105,0.2)' }, title: { display: true, text: 'HRV', color: '#10b981', font: { size: 10 } } },
                    y2: { beginAtZero: false, position: 'right', ticks: { color: '#f59e0b', font: { size: 10 } }, grid: { display: false }, title: { display: true, text: 'RHR bpm', color: '#f59e0b', font: { size: 10 } } },
                    x:  { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(71,85,105,0.1)' } },
                },
            },
        });
    }

    buildNutritionChart() {
        const ctx = document.getElementById('nutritionChart');
        if (!ctx) return;
        this.destroyChart('nutrition');
        this.charts.nutrition = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.weekLabels(),
                datasets: [
                    { label: 'Macro Adherence', data: this.weekData(d => d.macro_adherence || null),    borderColor: '#3b82f6', tension: 0.35, borderWidth: 2, pointRadius: 3, spanGaps: true },
                    { label: 'Carb Periodization', data: this.weekData(d => d.carb_periodization || null), borderColor: '#f59e0b', tension: 0.35, borderWidth: 2, pointRadius: 3, spanGaps: true },
                    { label: 'Fueling Score',  data: this.weekData(d => d.fueling_score || null),       borderColor: '#10b981', tension: 0.35, borderWidth: 2, pointRadius: 3, spanGaps: true },
                ],
            },
            options: this.chartOptions({ scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.2)' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.1)' } } } }),
        });
    }

    buildWeightChart() {
        const ctx = document.getElementById('weightChart');
        if (!ctx) return;
        this.destroyChart('weight');
        const data = this.weekData(d => d.avg_weight || null);
        this.charts.weight = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.weekLabels(),
                datasets: [
                    { label: 'Body Weight (kg)', data, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.1)', borderWidth: 2, tension: 0.35, fill: true, pointRadius: 3, spanGaps: true },
                    { label: 'Baseline (84kg)', data: data.map(() => 84), borderColor: 'rgba(239,68,68,0.5)', borderWidth: 1, borderDash: [5,5], pointRadius: 0, fill: false },
                ],
            },
            options: this.chartOptions({ scales: { y: { beginAtZero: false, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.2)' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.1)' } } } }),
        });
    }

    buildBenchmarkChart(bench) {
        const ctx = document.getElementById('benchmarkChart');
        if (!ctx) return;
        this.destroyChart('benchmark');
        const labels  = this.weekLabels();
        const cfg = {
            run:      { label: '5K Time (min)', fn: d => d.benchmarks?.run_5k_seconds ? +(d.benchmarks.run_5k_seconds / 60).toFixed(2) : null, color: '#ef4444', goal: 22, goalLabel: 'Target: 22:00' },
            ftp:      { label: 'FTP (W)',        fn: d => d.benchmarks?.ftp_watts || null, color: '#f59e0b', goal: 270, goalLabel: 'Target: 270W' },
            squat:    { label: 'Squat 1RM (kg)', fn: d => d.benchmarks?.squat_kg || null, color: '#8b5cf6', goal: 120, goalLabel: 'Target: 120kg' },
            deadlift: { label: 'Deadlift 1RM (kg)', fn: d => d.benchmarks?.deadlift_kg || null, color: '#06b6d4', goal: 150, goalLabel: 'Target: 150kg' },
        };
        const c = cfg[bench] || cfg.run;
        this.charts.benchmark = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: c.label, data: this.weekData(c.fn), borderColor: c.color, backgroundColor: c.color + '22', borderWidth: 2, tension: 0.35, fill: true, pointRadius: 4, spanGaps: true },
                    { label: c.goalLabel, data: labels.map(() => c.goal), borderColor: 'rgba(16,185,129,0.6)', borderWidth: 1.5, borderDash: [6,4], pointRadius: 0, fill: false },
                ],
            },
            options: this.chartOptions({ scales: { y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.2)' } }, x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(71,85,105,0.1)' } } } }),
        });
    }

    updateBenchmarkChart() { this.buildBenchmarkChart(this.activeBench); }

    buildZoneDonut() {
        const ctx = document.getElementById('zoneDonutChart');
        if (!ctx) return;
        this.destroyChart('zone');
        this.charts.zone = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Z1 Recovery', 'Z2 Aerobic', 'Z3 Tempo', 'Z4 Threshold', 'Z5 VO2max'],
                datasets: [{ data: [5, 55, 15, 15, 10], backgroundColor: ['#334155','#3b82f6','#f59e0b','#f97316','#ef4444'], borderColor: '#1e293b', borderWidth: 2 }],
            },
            options: {
                responsive: true,
                cutout: '60%',
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10 } } },
            },
        });
    }

    buildDisciplineDonut() {
        const ctx = document.getElementById('disciplineDonutChart');
        if (!ctx) return;
        this.destroyChart('discipline');
        this.charts.discipline = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Run', 'Bike', 'Swim', 'Hyrox', 'Strength', 'Recovery'],
                datasets: [{ data: [28, 25, 15, 18, 9, 5], backgroundColor: ['#ef4444','#f59e0b','#06b6d4','#8b5cf6','#f97316','#10b981'], borderColor: '#1e293b', borderWidth: 2 }],
            },
            options: {
                responsive: true,
                cutout: '60%',
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10 } } },
            },
        });
    }

    updateAnalyticsSummary() {
        let best = 0, bestWeek = 0, total = 0, count = 0, totalSleep = 0, sleepCount = 0;
        const firstWeight = this.data['week_1']?.avg_weight || 0;
        let lastWeight = 0;
        for (let i = 1; i <= this.currentWeek; i++) {
            const d = this.data[`week_${i}`];
            const s = d.compliance_score;
            if (s > 0) { total += s; count++; if (s > best) { best = s; bestWeek = i; } }
            if (d.avg_sleep > 0) { totalSleep += d.avg_sleep; sleepCount++; }
            if (d.avg_weight > 0) lastWeight = d.avg_weight;
        }
        const avgC = count ? Math.round(total / count) : 0;
        const avgS = sleepCount ? (totalSleep / sleepCount).toFixed(1) : '—';
        const wc   = (firstWeight && lastWeight) ? (lastWeight - firstWeight).toFixed(1) : '—';

        const asBest = document.getElementById('asBestCompliance');
        const asAvg  = document.getElementById('asAvgCompliance');
        const asSleep= document.getElementById('asAvgSleep');
        const asWt   = document.getElementById('asWeightChange');
        if (asBest) asBest.querySelector('.as-val').textContent = bestWeek ? `W${bestWeek} (${best}%)` : '—';
        if (asAvg)  asAvg.querySelector('.as-val').textContent  = avgC ? `${avgC}%` : '—';
        if (asSleep)asSleep.querySelector('.as-val').textContent = avgS !== '—' ? `${avgS}h` : '—';
        if (asWt)   asWt.querySelector('.as-val').textContent   = wc !== '—' ? `${wc > 0 ? '+' : ''}${wc}kg` : '—';
    }

    // ── Phase Recommendations ─────────────────────────────────────────────────
    updatePhaseRecommendations() {
        const phase = this.getPhase(this.currentWeek);
        const container = document.getElementById('phaseRecommendations');
        if (!container) return;
        const recs = {
            1: [
                { title: 'Establish Aerobic Base', desc: 'Keep 80%+ of sessions at Z2 heart rate. Do not chase pace.' },
                { title: 'Complete Baseline Tests', desc: 'Document 5K run, FTP bike test, and swim 400m time by end of Phase 1.' },
                { title: 'Sleep Priority', desc: 'Target 04:30 wake, 20:30 sleep every night this phase. Consistency beats duration.' },
            ],
            2: [
                { title: 'Progressive Overload', desc: 'Increase weekly volume by 5–10% per week. Use HRV to confirm readiness.' },
                { title: 'Practice Race Fueling', desc: 'Hit 60–90g carbs/hour on all sessions over 90 minutes.' },
                { title: 'Threshold Blocks', desc: 'Respect the hard days — Tue PM, Thu PM, and Fri PM are your key sessions.' },
            ],
            3: [
                { title: 'Compromised Running', desc: 'All run sessions this phase should follow a strength or Hyrox station effort.' },
                { title: 'Target Weak Stations', desc: 'Identify your 2 weakest Hyrox stations and add extra volume to those.' },
                { title: 'Mental Rehearsal', desc: 'Visualise your race execution — splits, station transitions, pacing strategy.' },
            ],
            4: [
                { title: 'Race Simulation', desc: 'Complete at least one full-distance Hyrox simulation with real-race fueling and pacing.' },
                { title: 'Protect Recovery', desc: 'Sleep ≥8h. Reduce optional training. Every session must have a purpose.' },
                { title: 'Dial In Gear', desc: 'Confirm shoes, kit, nutrition strategy — no new kit on race day.' },
            ],
            5: [
                { title: 'Taper Smart', desc: 'Cut volume 40–50% but maintain short, sharp intensity sessions.' },
                { title: 'Race Day Logistics', desc: 'Confirm travel, warm-up plan, nutrition timing, and station order strategy.' },
                { title: 'Trust The Training', desc: 'Fitness is built — nothing you do this week can add fitness. Focus on arrival and execution.' },
            ],
        };
        container.innerHTML = (recs[phase] || recs[1]).map(r => `
            <div class="recommendation-item">
                <h5>${r.title}</h5>
                <p>${r.desc}</p>
            </div>`).join('');
    }

    // ── Import / Export ───────────────────────────────────────────────────────
    importData() {
        const file = document.getElementById('dataImport')?.files[0];
        if (!file) { this.showToast('Select a JSON file first'); return; }
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const imported = JSON.parse(e.target.result);
                this.data = { ...this.data, ...imported };
                this.saveData();
                this.onWeekChange();
                this.showToast('✅ Data imported');
            } catch (err) {
                this.showToast('❌ Invalid JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    exportData() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `rippedmechanics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('📦 Data exported');
    }

    clearAllData() {
        if (!confirm('Delete ALL training data? This cannot be undone.')) return;
        this.data = this.getDefaultData();
        this.saveData();
        this.currentWeek = this.calcCurrentWeek();
        this.syncWeekSelect();
        this.onWeekChange();
        this.showToast('🗑 All data cleared');
    }
}

// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new ProgressTracker();
});

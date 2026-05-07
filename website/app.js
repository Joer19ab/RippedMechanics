// ============================================================================
// RippedMechanics Progress Tracker - Application Logic
// ============================================================================

// Data Management
const DATA_KEY = 'rippedmechanics_data';
const WEEKS_COUNT = 16;
const SESSIONS_PER_WEEK = 12;

class ProgressTracker {
    constructor() {
        this.currentWeek = 1;
        this.data = this.loadData();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderWeekOptions();
        this.loadWeekData();
        this.initCharts();
    }

    // ========== Data Management ==========
    loadData() {
        const stored = localStorage.getItem(DATA_KEY);
        return stored ? JSON.parse(stored) : this.getDefaultData();
    }

    saveData() {
        localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
    }

    getDefaultData() {
        const data = {};
        for (let i = 1; i <= WEEKS_COUNT; i++) {
            data[`week_${i}`] = {
                week: i,
                completed_sessions: 0,
                compliance_score: 0,
                run_trend: '',
                bike_trend: '',
                swim_trend: '',
                hyrox_trend: '',
                avg_sleep: 0,
                sleep_consistency: '',
                hrv_trend: '',
                rhr_trend: '',
                macro_adherence: 0,
                carb_periodization: 0,
                fueling_score: 0,
                avg_weight: 0,
                next_week_load: '',
                volume_change: 0,
                intensity_change: '',
                priorities: '',
                timestamp: ''
            };
        }
        return data;
    }

    // ========== Event Listeners ==========
    setupEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', e => this.switchTab(e.target.dataset.tab));
        });

        // Week Navigation
        document.getElementById('prevWeek')?.addEventListener('click', () => this.previousWeek());
        document.getElementById('nextWeek')?.addEventListener('click', () => this.nextWeek());
        document.getElementById('weekSelect')?.addEventListener('change', e => {
            this.currentWeek = parseInt(e.target.value.split('-')[0]);
            this.loadWeekData();
        });

        // Tracking Inputs
        document.getElementById('completedInput')?.addEventListener('input', e => {
            const completed = parseInt(e.target.value) || 0;
            this.updateCompletionStats(completed);
        });

        // Buttons
        document.getElementById('updateComplianceBtn')?.addEventListener('click', () => this.updateComplianceData());
        document.getElementById('saveTrackingBtn')?.addEventListener('click', () => this.saveWeeklyUpdate());
        document.getElementById('importBtn')?.addEventListener('click', () => this.importData());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('clearDataBtn')?.addEventListener('click', () => this.clearData());

        // Trend Buttons
        document.querySelectorAll('.trend-btn').forEach(btn => {
            btn.addEventListener('click', e => this.switchTrendChart(e.target.dataset.metric));
        });

        // Real-time compliance update
        document.getElementById('completedInput')?.addEventListener('change', () => {
            const completed = parseInt(document.getElementById('completedInput').value) || 0;
            const rate = (completed / SESSIONS_PER_WEEK) * 100;
            document.getElementById('completionRate').textContent = Math.round(rate) + '%';
        });
    }

    // ========== Tab Switching ==========
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');

        // Mark button as active
        event.target.classList.add('active');

        // Trigger chart update if switching to analytics
        if (tabName === 'analytics') {
            setTimeout(() => this.updateCharts(), 100);
        }
    }

    // ========== Week Navigation ==========
    renderWeekOptions() {
        const select = document.getElementById('weekSelect');
        if (!select) return;

        for (let i = 1; i <= WEEKS_COUNT; i++) {
            const startDate = this.getWeekStartDate(i);
            const endDate = this.getWeekEndDate(i);
            const option = document.createElement('option');
            option.value = `${i}-${startDate}-${endDate}`;
            option.textContent = `Week ${i} (${startDate} - ${endDate})`;
            if (i === 1) option.selected = true;
            select.appendChild(option);
        }
    }

    getWeekStartDate(week) {
        const startDate = new Date('2026-05-06');
        const offset = (week - 1) * 7;
        const date = new Date(startDate.getTime() + offset * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }

    getWeekEndDate(week) {
        const startDate = new Date('2026-05-06');
        const offset = (week - 1) * 7 + 6;
        const date = new Date(startDate.getTime() + offset * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }

    previousWeek() {
        if (this.currentWeek > 1) {
            this.currentWeek--;
            this.updateWeekSelector();
            this.loadWeekData();
        }
    }

    nextWeek() {
        if (this.currentWeek < WEEKS_COUNT) {
            this.currentWeek++;
            this.updateWeekSelector();
            this.loadWeekData();
        }
    }

    updateWeekSelector() {
        const select = document.getElementById('weekSelect');
        if (select) {
            select.value = Array.from(select.options)
                .find(o => o.value.startsWith(`${this.currentWeek}-`))?.value;
        }
    }

    // ========== Load/Display Week Data ==========
    loadWeekData() {
        const weekKey = `week_${this.currentWeek}`;
        const weekData = this.data[weekKey] || this.getDefaultData()[weekKey];

        // Update all fields
        document.getElementById('completedInput').value = weekData.completed_sessions || 0;
        document.getElementById('runTrend').value = weekData.run_trend || '';
        document.getElementById('bikeTrend').value = weekData.bike_trend || '';
        document.getElementById('swimTrend').value = weekData.swim_trend || '';
        document.getElementById('hyroxTrend').value = weekData.hyrox_trend || '';
        document.getElementById('avgSleep').value = weekData.avg_sleep || '';
        document.getElementById('sleepConsistency').value = weekData.sleep_consistency || '';
        document.getElementById('hrvTrend').value = weekData.hrv_trend || '';
        document.getElementById('rhrTrend').value = weekData.rhr_trend || '';
        document.getElementById('macroAdherence').value = weekData.macro_adherence || '';
        document.getElementById('carbPeriodization').value = weekData.carb_periodization || '';
        document.getElementById('fuelingScore').value = weekData.fueling_score || '';
        document.getElementById('avgWeight').value = weekData.avg_weight || '';
        document.getElementById('nextWeekLoad').value = weekData.next_week_load || '';
        document.getElementById('volumeChange').value = weekData.volume_change || '';
        document.getElementById('intensityChange').value = weekData.intensity_change || '';
        document.getElementById('priorities').value = weekData.priorities || '';

        this.updateCompletionStats(weekData.completed_sessions);
        this.updateProgressBar();
    }

    // ========== Compliance & Stats ==========
    updateCompletionStats(completed) {
        const rate = (completed / SESSIONS_PER_WEEK) * 100;
        document.getElementById('completedSessions').textContent = `${completed}/${SESSIONS_PER_WEEK}`;
        document.getElementById('completionRate').textContent = Math.round(rate) + '%';
        document.getElementById('missedSessionsCount').textContent = SESSIONS_PER_WEEK - completed;

        // Calculate compliance score (80% of completion + 20% quality bonus)
        const score = Math.round(rate * 0.8 + 20);
        document.getElementById('avgComplianceScore').textContent = score + '%';
    }

    updateComplianceData() {
        const completed = parseInt(document.getElementById('completedInput').value) || 0;
        this.updateCompletionStats(completed);
        alert('Compliance data updated!');
    }

    updateProgressBar() {
        const progress = (this.currentWeek / WEEKS_COUNT) * 100;
        document.getElementById('programProgress').style.width = progress + '%';
        document.getElementById('progressText').textContent = `Week ${this.currentWeek} of ${WEEKS_COUNT} (${progress.toFixed(1)}%)`;
    }

    // ========== Save Weekly Update ==========
    saveWeeklyUpdate() {
        const weekKey = `week_${this.currentWeek}`;
        
        this.data[weekKey] = {
            week: this.currentWeek,
            completed_sessions: parseInt(document.getElementById('completedInput').value) || 0,
            compliance_score: parseInt(document.getElementById('avgComplianceScore').textContent) || 0,
            run_trend: document.getElementById('runTrend').value,
            bike_trend: document.getElementById('bikeTrend').value,
            swim_trend: document.getElementById('swimTrend').value,
            hyrox_trend: document.getElementById('hyroxTrend').value,
            avg_sleep: parseFloat(document.getElementById('avgSleep').value) || 0,
            sleep_consistency: document.getElementById('sleepConsistency').value,
            hrv_trend: document.getElementById('hrvTrend').value,
            rhr_trend: document.getElementById('rhrTrend').value,
            macro_adherence: parseInt(document.getElementById('macroAdherence').value) || 0,
            carb_periodization: parseInt(document.getElementById('carbPeriodization').value) || 0,
            fueling_score: parseInt(document.getElementById('fuelingScore').value) || 0,
            avg_weight: parseFloat(document.getElementById('avgWeight').value) || 0,
            next_week_load: document.getElementById('nextWeekLoad').value,
            volume_change: parseInt(document.getElementById('volumeChange').value) || 0,
            intensity_change: document.getElementById('intensityChange').value,
            priorities: document.getElementById('priorities').value,
            timestamp: new Date().toISOString()
        };

        this.saveData();
        alert(`Week ${this.currentWeek} data saved successfully!`);
        this.updateCharts();
    }

    // ========== Charts ==========
    initCharts() {
        this.createComplianceChart();
        this.createPerformanceRadar();
        this.createTrendChart();
        this.createRecoveryChart();
        this.createNutritionChart();
        this.updatePhaseRecommendations();
    }

    createComplianceChart() {
        const ctx = document.getElementById('complianceChart');
        if (!ctx) return;

        const labels = [];
        const data = [];
        for (let i = 1; i <= Math.min(this.currentWeek, WEEKS_COUNT); i++) {
            labels.push(`W${i}`);
            data.push(this.data[`week_${i}`]?.compliance_score || 0);
        }

        this.charts.compliance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Compliance Score',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#f1f5f9' } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(71, 85, 105, 0.2)' }
                    },
                    x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } }
                }
            }
        });
    }

    createPerformanceRadar() {
        const ctx = document.getElementById('performanceRadar');
        if (!ctx) return;

        const currentWeekData = this.data[`week_${this.currentWeek}`] || {};
        const trendToScore = (trend) => {
            if (trend === 'up') return 90;
            if (trend === 'stable') return 75;
            if (trend === 'down') return 50;
            return 60;
        };

        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Run', 'Bike', 'Swim', 'Hyrox', 'Recovery', 'Nutrition'],
                datasets: [{
                    label: 'Performance Status',
                    data: [
                        trendToScore(currentWeekData.run_trend),
                        trendToScore(currentWeekData.bike_trend),
                        trendToScore(currentWeekData.swim_trend),
                        trendToScore(currentWeekData.hyrox_trend),
                        currentWeekData.avg_sleep ? Math.min((currentWeekData.avg_sleep / 8) * 100, 100) : 60,
                        currentWeekData.macro_adherence || 60
                    ],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    pointBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(71, 85, 105, 0.2)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f1f5f9' } }
                }
            }
        });
    }

    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const labels = [];
        const runData = [];
        const bikeData = [];
        const swimData = [];
        const hyroxData = [];

        for (let i = 1; i <= Math.min(this.currentWeek, WEEKS_COUNT); i++) {
            labels.push(`W${i}`);
            const trendToScore = (trend) => {
                if (trend === 'up') return 80;
                if (trend === 'stable') return 70;
                if (trend === 'down') return 50;
                return 60;
            };
            runData.push(trendToScore(this.data[`week_${i}`]?.run_trend));
            bikeData.push(trendToScore(this.data[`week_${i}`]?.bike_trend));
            swimData.push(trendToScore(this.data[`week_${i}`]?.swim_trend));
            hyroxData.push(trendToScore(this.data[`week_${i}`]?.hyrox_trend));
        }

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Run', data: runData, borderColor: '#ef4444', tension: 0.3, pointRadius: 3 },
                    { label: 'Bike', data: bikeData, borderColor: '#f59e0b', tension: 0.3, pointRadius: 3 },
                    { label: 'Swim', data: swimData, borderColor: '#06b6d4', tension: 0.3, pointRadius: 3 },
                    { label: 'Hyrox', data: hyroxData, borderColor: '#8b5cf6', tension: 0.3, pointRadius: 3 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#f1f5f9' } } },
                scales: {
                    y: { max: 100, ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } },
                    x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } }
                }
            }
        });
    }

    createRecoveryChart() {
        const ctx = document.getElementById('recoveryChart');
        if (!ctx) return;

        const labels = [];
        const sleepData = [];

        for (let i = 1; i <= Math.min(this.currentWeek, WEEKS_COUNT); i++) {
            labels.push(`W${i}`);
            sleepData.push(this.data[`week_${i}`]?.avg_sleep || 0);
        }

        this.charts.recovery = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg Sleep (hours)',
                    data: sleepData,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#f1f5f9' } } },
                scales: {
                    y: { max: 10, ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } },
                    x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } }
                }
            }
        });
    }

    createNutritionChart() {
        const ctx = document.getElementById('nutritionChart');
        if (!ctx) return;

        const labels = [];
        const macroData = [];
        const carbData = [];
        const fuelingData = [];

        for (let i = 1; i <= Math.min(this.currentWeek, WEEKS_COUNT); i++) {
            labels.push(`W${i}`);
            macroData.push(this.data[`week_${i}`]?.macro_adherence || 0);
            carbData.push(this.data[`week_${i}`]?.carb_periodization || 0);
            fuelingData.push(this.data[`week_${i}`]?.fueling_score || 0);
        }

        this.charts.nutrition = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Macro Adherence', data: macroData, borderColor: '#3b82f6', tension: 0.3 },
                    { label: 'Carb Periodization', data: carbData, borderColor: '#f59e0b', tension: 0.3 },
                    { label: 'Fueling Score', data: fuelingData, borderColor: '#10b981', tension: 0.3 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#f1f5f9' } } },
                scales: {
                    y: { max: 100, ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } },
                    x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(71, 85, 105, 0.2)' } }
                }
            }
        });
    }

    switchTrendChart(metric) {
        // This could switch between different trend visualizations
        console.log('Switching trend to:', metric);
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.update();
        });
    }

    // ========== Phase Recommendations ==========
    updatePhaseRecommendations() {
        const phase = this.getPhase(this.currentWeek);
        const container = document.getElementById('phaseRecommendations');
        if (!container) return;

        const recommendations = {
            1: [
                { title: 'Focus on Technique', desc: 'Establish proper form across all modalities - run, bike, swim.' },
                { title: 'Build Aerobic Base', desc: 'Maintain 80/20 split with easy Z2 sessions dominating.' },
                { title: 'Complete Baseline Tests', desc: 'Document 5K run, bike power, swim times for reference.' }
            ],
            2: [
                { title: 'Increase Volume', desc: 'Gradually extend session durations, especially long rides/runs.' },
                { title: 'Build Capacity', desc: 'Sessions should feel sustainable; use HRV/sleep to guide load.' },
                { title: 'Refine Nutrition', desc: 'Practice fueling strategy on longer efforts.' }
            ],
            3: [
                { title: 'Hyrox Specificity', desc: 'Emphasize compromised running, sled work, and SkiErg intervals.' },
                { title: 'Increase Complexity', desc: 'Combine strength and conditioning in same sessions.' },
                { title: 'Train Weaknesses', desc: 'Target weaker Hyrox stations with dedicated focus.' }
            ],
            4: [
                { title: 'Race Simulation', desc: 'Execute full-distance practice efforts with all fueling/pacing.' },
                { title: 'Sharpen Intensity', desc: 'Peak workouts should feel race-ready in effort and specificity.' },
                { title: 'Protect Recovery', desc: 'Prioritize sleep and mobility as race approaches.' }
            ],
            5: [
                { title: 'Reduce Volume', desc: 'Taper to maintain fitness while promoting full recovery.' },
                { title: 'Maintain Intensity', desc: 'Short, sharp efforts to keep nervous system primed.' },
                { title: 'Mental Preparation', desc: 'Visualize race execution and trust the training.' }
            ]
        };

        const phaseRecs = recommendations[phase] || recommendations[1];
        container.innerHTML = phaseRecs.map(rec => `
            <div class="recommendation-item">
                <h5>${rec.title}</h5>
                <p>${rec.desc}</p>
            </div>
        `).join('');
    }

    getPhase(week) {
        if (week <= 4) return 1;
        if (week <= 8) return 2;
        if (week <= 12) return 3;
        if (week <= 15) return 4;
        return 5;
    }

    // ========== Import/Export ==========
    importData() {
        const input = document.getElementById('dataImport');
        const file = input?.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const imported = JSON.parse(e.target.result);
                this.data = { ...this.data, ...imported };
                this.saveData();
                alert('Data imported successfully!');
                this.loadWeekData();
                this.updateCharts();
            } catch (err) {
                alert('Error importing data: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rippedmechanics_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearData() {
        if (confirm('Are you sure? This will delete all tracked data.')) {
            this.data = this.getDefaultData();
            this.saveData();
            this.currentWeek = 1;
            this.loadWeekData();
            this.updateCharts();
            alert('All data cleared!');
        }
    }
}

// ============================================================================
// Initialize Application
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new ProgressTracker();
});

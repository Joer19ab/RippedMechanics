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

// Detailed session content (Week 1 reference — loaded into the Program Plan modal)
const SESSION_DETAILS = [
    // 0 — MON AM: Easy Run Z2 + Strides
    {
        title:    'Easy Run Z2 + Strides',
        day:      'MON AM',
        time:     '05:30 – 06:45',
        duration: '75 min',
        type:     'Run',
        purpose:  'Aerobic base building. HR is the governor — pace is irrelevant. Reinforce easy running economy with neuromuscular strides.',
        warmup: [
            '5 min easy jog HR < 135',
            'Leg swings forward/back × 10 each leg',
            'High knees 2×20m, butt kicks 2×20m, A-skips 2×20m',
        ],
        mainSet: [
            { block: 'Z2 Run — 40 min', details: [
                'HR cap 135–150 strict. Target pace 5:40–6:10/km on flat terrain.',
                'Walk any hill that pushes HR above 150.',
                'Breathe nasally where possible.',
                'Check posture every 10 min: tall, slight lean, relaxed shoulders.',
            ]},
            { block: 'Strides — 6×20 sec', details: [
                '85% controlled fast effort — not a sprint.',
                'Cues: tall posture, quick ground contact, relaxed jaw, arms driving back.',
                '60 sec walk/jog recovery between each.',
            ]},
        ],
        cooldown: [
            'Easy jog fading to walk — 5 min',
            '5 deep diaphragmatic breaths before moving on',
        ],
        kpi: 'Avg HR below 148. No cardiac drift in final 15 min. Pace-HR ratio stable. Log avg HR and avg pace.',
    },
    // 1 — MON PM: Lower Strength + Sled
    {
        title:    'Lower Strength + Sled Development',
        day:      'MON PM',
        time:     '16:30 – 18:00',
        duration: '90 min',
        type:     'Strength',
        purpose:  'Build lower body strength and Hyrox sled power without excessive fatigue.',
        warmup: [
            'Hip circles × 10 each direction',
            'Glute bridges 2×15 (2-sec hold at top)',
            'Goblet squat 2×10 light (pause 2 sec at bottom)',
            'Ankle rotations × 10 each',
            'Banded clamshells 2×15 each side',
        ],
        mainSet: [
            { block: 'Back Squat — 4×5 @ RPE 7 (~80–87kg)', details: [
                '3 min rest between sets.',
                'Brace 360 degrees, knees track toes, hit full depth (hip crease below knee).',
                'Drive floor away on ascent. No forward torso collapse.',
                'Log: weight, RPE, depth/bar path notes.',
            ]},
            { block: 'Romanian Deadlift — 4×6 @ RPE 7 (~75–85kg)', details: [
                '2.5 min rest between sets.',
                'Push hips back not down. Neutral spine throughout.',
                'Feel hamstrings load at bottom before reversing. Bar stays within 5cm of legs.',
                'Log: weight and RPE.',
            ]},
            { block: 'Walking Lunge — 3×20m @ 40kg', details: [
                '2 min rest between sets.',
                'Upright torso. Rear knee hovers 2cm from floor. Drive through front heel.',
                'Do not let lead knee cave inward.',
            ]},
            { block: 'Sled Push — 6×15m (moderate load)', details: [
                '60 sec rest between reps.',
                'Lean forward ~45° from vertical. Short, powerful, fully-extended strides.',
                'Stay on balls of feet. Drive through each stride to full hip extension.',
            ]},
            { block: 'Sled Pull — 6×15m (moderate load)', details: [
                '60 sec rest between reps.',
                'Face away from sled. Drive arms back forcefully.',
                'Upright posture. Quick short steps. Lean slightly back to keep tension on rope.',
            ]},
            { block: 'Core Finisher — 3 rounds (45 sec rest)', details: [
                'Plank 60 sec: brace all three planes, hips flat.',
                'Side plank 30 sec each side: hips stacked and high.',
                'Dead bug 10 reps: lower back pinned to floor throughout.',
            ]},
        ],
        cooldown: [
            'Hip flexors: 60 sec each side',
            'Hamstrings: 60 sec each side',
            'Quad stretch: 45 sec each side',
        ],
        kpi: 'No form breakdown across any set. Squat depth consistent. Sled pace steady across sets. Log all working weights.',
    },
    // 2 — TUE AM: Swim Technique / Aerobic
    {
        title:    'Swim Technique + Pull Focus',
        day:      'TUE AM',
        time:     '05:30 – 06:45',
        duration: '75 min',
        type:     'Swim',
        purpose:  'Build technique foundation and comfort. No fitness targets this week — mechanics only.',
        warmup: [
            '200m easy, any stroke. Feel neutral buoyancy and water position.',
        ],
        mainSet: [
            { block: 'Drill Set — 6×50m (20 sec rest)', details: [
                'Rep 1–2: Catch-up drill. Wait until lead arm fully extended before pulling with opposite. Forces long stroke.',
                'Rep 3–4: Fist drill. Closed fists — forces forearm feel. Open fists on 25m swim segment.',
                'Rep 5–6: Bilateral breathing drill. Breathe every 3 strokes, deliberate count.',
            ]},
            { block: 'Pull Set — 8×100m pull buoy (15–20 sec rest)', details: [
                'HR below 150. Aerobic and technical, not hard.',
                'Early vertical forearm on entry. Fingers point to floor at catch before pulling back. Elbow stays high.',
                'Count stroke cycles per 25m. Target 16–18 cycles (32–36 arm strokes). If above 20, you are slipping.',
                'Hold or reduce stroke count across the set.',
            ]},
            { block: 'Build Set — 4×50m (20 sec rest)', details: [
                'Rep 1: Easy, 60% effort.',
                'Rep 2: Moderate, 70% effort.',
                'Rep 3: Moderate-hard, 80% — hold mechanics, do not collapse form for speed.',
                'Rep 4: Hard controlled, 90% — note where stroke breaks down under effort.',
            ]},
        ],
        cooldown: [
            '200m easy backstroke or sidestroke. Full passive rest.',
        ],
        kpi: 'Stroke count holds or decreases across pull set. No dropped elbow under fatigue in build set. Breathing relaxed and bilateral.',
    },
    // 3 — TUE PM: Bike Threshold
    {
        title:    'Bike Threshold',
        day:      'TUE PM / SUN PM',
        time:     '16:15 – 17:30',
        duration: '75 min',
        type:     'Bike',
        purpose:  'Establish FTP repeatability and threshold HR at cycling effort.',
        warmup: [
            '15 min progressive build from 100W to 170W.',
            'Cadence 90–95 rpm.',
            '3×20 sec fast-pedal at 110+ rpm (at min 8, 10, 12) to prime legs.',
        ],
        mainSet: [
            { block: '3×10 min @ 218–230W (95–100% FTP) — 5 min easy spin between', details: [
                'Interval 1: Start at 218W. Let HR settle by min 2 (expect 168–172). Do not exceed 178.',
                'Interval 2: If interval 1 HR stayed below 175 at end, target 222–225W. Else hold 218W.',
                'Interval 3: Hard cap HR 180. Maintain cadence above 88 rpm. If power drops to sustain HR, accept it — HR cap wins.',
            ]},
        ],
        cooldown: [
            'Easy spin from 160W down to 90W — 10 min. Let legs spin freely.',
        ],
        fuel: '40–60g fast carbs 20 min before starting. 500ml water during.',
        kpi: 'Power CV below 5% per interval. HR below 180 throughout. RPE 7–8 in final minute of each interval. Log avg power and avg HR per interval.',
    },
    // 4 — WED AM: Hyrox Engine Intervals
    {
        title:    'Hyrox Engine Intervals',
        day:      'WED AM',
        time:     '05:30 – 06:50',
        duration: '80 min',
        type:     'Hyrox',
        purpose:  'Establish compromised running baseline. First exposure to run-SkiErg alternation.',
        warmup: [
            '5 min easy jog HR < 130',
            'Leg swings forward/back × 10 each leg',
            'Hip circles × 10 each direction',
            '2×20m high knees, 2×20m butt kicks',
            '2×20m A-skips',
        ],
        mainSet: [
            { block: '4 Rounds — 2 min easy walk/jog rest between rounds', details: [
                'RUN 800m at 10K effort (~4:55–5:10/km). Tall posture, cadence >170 spm, breathe rhythmically.',
                'IMMEDIATELY into SKIERG 500m. Hinge from hips on pull, hands drive to hip level, arms float to eye height. Stroke rate 22–26 spm. Target sub-2:05/500m.',
                'Do not rush the recovery phase on SkiErg — it costs more than you gain.',
                'Round target: complete each round within 10 sec of round 1 split. Log every split.',
            ]},
        ],
        cooldown: [
            '5 min easy jog',
            'Hip flexor kneeling lunge stretch 60 sec each side',
            '8 deep diaphragmatic breaths in 90/90 position',
        ],
        kpi: 'Round splits within 10 sec of each other. HR recovers below 145 within rest window. Form (posture and stroke) holds across all 4 rounds.',
    },
    // 5 — WED PM: Mobility + Breathing
    {
        title:    'Mobility + Breathing Reset',
        day:      'WED PM',
        time:     '16:30 – 17:10',
        duration: '40 min',
        type:     'Recovery',
        purpose:  'Parasympathetic reset. Correct chest-breathing pattern. Restore hip and thoracic mobility.',
        warmup: [],
        mainSet: [
            { block: 'Hip Flow — 7 min', details: [
                '90/90 hip stretch: 90 sec each side, breathing through tension.',
                'Pigeon pose: 90 sec each side.',
                'Kneeling hip flexor lunge: 60 sec each side, posterior pelvic tilt at end range.',
            ]},
            { block: 'Thoracic Spine Flow — 5 min', details: [
                'Thread the needle: 10 slow reps each side.',
                'Cat-cow: 15 reps, full range, 3 sec each direction.',
                'Thoracic extension over foam roller: 60 sec upper back, 60 sec mid back.',
            ]},
            { block: 'Ankle Mobility — 3 min', details: [
                'Wall ankle stretch: 30 sec each side.',
                'Banded dorsiflexion: 30 sec each side.',
            ]},
            { block: 'Trunk Stability — 10 min', details: [
                'Dead bug: 3×10 reps, 3-sec lowering phase. Lower back stays pinned to floor.',
                'Bird dog: 3×10 each side, 3-sec hold at full extension. No hip rotation.',
                'Pallof press: 3×12 each side. Brace hard before pressing out.',
            ]},
            { block: 'Diaphragmatic Breathing — 8 min', details: [
                'Lie prone (crocodile breathing). Hand on lower back to feel expansion.',
                'Inhale 5 sec through nose: belly and lower back expand, chest stays still.',
                'Hold 2 sec. Exhale 7 sec through pursed lips.',
                '4 rounds of 8 breaths. 30 sec passive rest between rounds.',
                'This directly corrects chest-breathing pattern. Do this every session this week.',
            ]},
        ],
        cooldown: [],
        kpi: 'Tension clearly reduced by end. Breathing feels lower and slower. Evening HRV trend positive.',
    },
    // 6 — THU AM: Swim + Pull Focus
    {
        title:    'Swim Technique + CSS Prep',
        day:      'THU AM',
        time:     '05:30 – 07:00',
        duration: '90 min',
        type:     'Swim',
        purpose:  'Reinforce technique from Tuesday. Introduce more aerobic load.',
        warmup: [
            '300m easy mixed strokes. No effort. Focus on water feel and relaxed neck position.',
        ],
        mainSet: [
            { block: 'Drill Set — 8×50m (25m drill + 25m swim, 20 sec rest)', details: [
                'Catch-up drill: lead arm fully extended before opposite arm pulls.',
                'Fingertip drag: drag fingertips along water surface on recovery to enforce high elbow.',
                '6-kick switch: 6 flutter kicks between each stroke cycle — reinforces hip rotation.',
            ]},
            { block: 'Aerobic Set — 6×100m (20 sec rest)', details: [
                'HR below 145 throughout. Moderate and controlled.',
                'Target 16–18 stroke cycles per 25m length.',
                '2-beat kick — not powerful, just enough for balance.',
                'Exhale fully underwater before rotating to breathe. Head rotation minimal — one goggle in, one goggle out.',
            ]},
            { block: 'Pull Set — 200m pull buoy (easy)', details: [
                'Press chest slightly down, high elbow catch.',
                'Feel the forearm pressing back through the water (not just the palm).',
            ]},
        ],
        cooldown: [
            '200m easy backstroke or sidestroke.',
        ],
        kpi: 'Breathing pattern every 3 strokes throughout aerobic set. Relaxed neck and shoulders. Hips not sinking. Stroke count stable or decreasing across aerobic set.',
    },
    // 7 — THU PM: Run Threshold / Tempo
    {
        title:    'Run Threshold Intervals',
        day:      'THU PM',
        time:     '16:15 – 17:30',
        duration: '75 min',
        type:     'Run',
        purpose:  'Establish threshold HR at true running effort. First structured threshold session.',
        warmup: [
            '10 min easy jog building from HR 130 to 150.',
            'A-skip 2×20m, B-skip 2×20m, butt kicks 2×20m.',
            '3 strides building progressively to near-threshold pace (~4:45/km on stride 3).',
        ],
        mainSet: [
            { block: '4×8 min @ HR 172–178 — 2 min easy jog recovery', details: [
                'Rep 1: Start conservatively at 4:50/km. Let HR climb to the band naturally by min 2. Target HR 172–175.',
                'Rep 2–3: Settle into steady state. Adjust pace to hold HR band. If HR drifts above 178, slow 5–10 sec/km.',
                'Rep 4: Accumulated fatigue makes this harder. Shorten stride slightly, cadence above 170 spm. If HR exceeds 180, slow to 5:20/km.',
                'Recovery jog: HR must return below 145 within 90 sec. If not, extend rest to 3 min.',
            ]},
        ],
        cooldown: [
            'Easy jog fading to walk — 10 min.',
            'Standing quad stretch 45 sec each, calf stretch 45 sec each, kneeling hip flexor 60 sec each.',
        ],
        fuel: '30–45g carbs 30 min pre-session (e.g. rice cakes + honey).',
        kpi: 'All 4 reps completed within HR band 172–178. Pace SD below 10 sec/km across reps 2–4. Form intact in rep 4. Log avg HR and avg pace per rep.',
    },
    // 8 — FRI AM: Easy Bike Z2
    {
        title:    'Easy Bike Z2 Aerobic',
        day:      'FRI AM',
        time:     '05:30 – 06:40',
        duration: '70 min',
        type:     'Bike',
        purpose:  'Active recovery ride. Preserve legs. Build aerobic base at low cardiac cost.',
        warmup: [],
        mainSet: [
            { block: 'Continuous Ride — 60–70 min @ 130–170W, cadence 88–95 rpm', details: [
                'Breathing rule: nasal only throughout. If you cannot breathe nasally, you are going too hard.',
                'Back off immediately and hold lower power until breathing normalises.',
            ]},
            { block: 'Cadence Work — 5×1 min at 100–110 rpm', details: [
                'Spread evenly through the ride (e.g. min 15, 25, 35, 45, 55).',
                'Power stays flat in Z2 range during cadence reps. Spin, do not grind.',
                '2 min normal cadence 88–92 rpm between each.',
            ]},
        ],
        cooldown: [
            'Final 10 min: power below 130W, cadence 85 rpm, spin legs loose.',
        ],
        kpi: 'Avg HR below 145. No cardiac drift (HR not rising over equal power blocks). Avg power stays inside Z2 range.',
    },
    // 9 — FRI PM: Hyrox Strength Circuit
    {
        title:    'Hyrox Strength Endurance Circuit',
        day:      'FRI PM',
        time:     '05:30 – 07:00',
        duration: '90 min',
        type:     'Hyrox',
        purpose:  'Hyrox station conditioning. Build movement quality under metabolic load.',
        warmup: [
            'Row 500m easy, damper 3–4.',
            '10 hip circles each direction.',
            '10 bodyweight squats slow.',
            '10 shoulder circles forward and back.',
            '10 band pull-aparts.',
        ],
        mainSet: [
            { block: '4 Rounds — 3 min rest between rounds. Log every round split.', details: [
                'ROW 750m: Damper 4–5. Legs first, then lean back, then pull arms to lower ribs. Stroke rate 24–28 spm. Target sub-2:26 for 750m.',
                'FARMER CARRY 100m: 40–50kg total (20–25kg each hand). Walk tall, no torso lean. Pack shoulders down and back. Brace core hard.',
                'SANDBAG LUNGE 25m: 20kg sandbag on shoulder. Upright torso throughout. Rear knee hovers 2cm from floor. Drive through front heel. Alternate shoulder each round.',
                'BURPEE BROAD JUMP ×20: Jump forward maximum distance each rep. No pausing between burpees. Chest touches floor each rep.',
                'WALL BALL ×25: 9kg ball. Full squat depth (hip crease below knee). Explosive hip drive. Target: 20+ unbroken in round 1. In rounds 3–4, break at 15, rest 5 sec, finish 10.',
            ]},
        ],
        cooldown: [
            'Hip flexors: 60 sec each side.',
            'Thoracic extension over foam roller: 60 sec.',
            'Seated hamstring stretch: 60 sec each side.',
        ],
        kpi: 'All 4 rounds completed. Round 4 split within 45 sec of round 1. Movement quality maintained (no form collapse on lunges or squat depth on wall balls). All round splits logged.',
    },
    // 10 — SAT: Long Bike or Brick
    {
        title:    'Long Bike + Short Brick Run',
        day:      'SAT AM',
        time:     '08:00 – 11:00',
        duration: '2.5–3 h',
        type:     'Bike',
        purpose:  'Long aerobic bike base. First brick run of the cycle. Practice race fueling.',
        warmup: [],
        mainSet: [
            { block: 'Bike — 2.5 to 3 h', details: [
                '0–90 min: Pure Z2, 130–165W, cadence 88–95 rpm. HR cap 148. If HR drifts above 148 on flat, ease off.',
                '90–150 min: Upper Z2, 165–185W, cadence 90–95 rpm. HR allowed to rise to 155.',
                '150–180 min: Low tempo, 185–205W, cadence 92+ rpm. HR 155–165. Controlled sustained effort — not a hard push.',
            ]},
            { block: 'Fueling Protocol on Bike', details: [
                'Timer every 20 min: drink 150–200ml + take a gel or chew (20–30g carbs).',
                'Target: 70–90g carbs/hour, 600mg sodium/hour. Do not rely on hunger.',
                'This is race nutrition rehearsal as much as a training session.',
            ]},
            { block: 'Brick Run — 20 min immediately off bike', details: [
                'Transition within 60 sec of stopping. Change shoes, go.',
                'HR will spike to 160–170 on first steps — normal. Do not panic, do not slow to a walk.',
                'HR should return below 160 within 3 min. If not, slow slightly.',
                'Conversational effort throughout — neuromuscular training, not cardiovascular.',
                'Focus: tall posture, cadence 170+ spm, relaxed jaw and shoulders.',
            ]},
        ],
        cooldown: [
            'Walking 5 min. Hip flexors 60 sec each. Calf stretch 45 sec each.',
        ],
        fuel: '70–90g carbs/hour on bike. 600mg sodium/hour. Fueling alarm every 20 min.',
        kpi: 'Cardiac drift on bike below 10 bpm over equal power blocks in Z2 segment. Brick run HR settles within 3 min. Fueling alarm executed every 20 min — log it.',
    },
    // 11 — SUN: Long Run Z2 + Mobility
    {
        title:    'Long Run Z2',
        day:      'SUN AM',
        time:     '08:30 – 10:00',
        duration: '75–90 min',
        type:     'Run',
        purpose:  'The most important aerobic stimulus of the week. Do not compromise this.',
        warmup: [],
        mainSet: [
            { block: '75–90 min continuous — HR cap 150 strict', details: [
                '0–15 min: Very easy, HR cap 140. Ease in, do not start at pace.',
                '15–70 min: Steady Z2, HR 140–150. Walk any hill that pushes HR above 150. Pace likely 5:40–6:30/km depending on terrain and fatigue.',
                'Final 10 min: wind down, HR below 135, jog fading to walk.',
            ]},
            { block: 'Form Cues — Check Every 10 Min', details: [
                'Posture: tall, slight forward lean from ankles not waist.',
                'Cadence: 170+ spm (use metronome app if needed — set to 174).',
                'Jaw: relaxed. Tight jaw = tight upper body.',
                'Shoulders: low, not hunched toward ears.',
                'Glutes: actively driving each stride — not just quads pulling forward.',
                'Breathing: nasal where possible. Rhythmic.',
            ]},
        ],
        cooldown: [
            'Hip flexors: 60 sec each side.',
            'Hamstrings: 60 sec each side.',
            'Calves: 45 sec each side.',
            'Thoracic extension over roller: 60 sec.',
        ],
        kpi: 'No HR drift across the 15–70 min middle block. Final km pace within 15 sec of median pace. Perceived effort conversational throughout. Log avg HR, avg pace, and total time in Z2 band.',
    },
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
                session_logs: Array.isArray(merged[k].session_logs)
                    ? merged[k].session_logs.slice(0, SESSIONS_PER_WEEK)
                    : def[k].session_logs,
            };
            if (merged[k].session_status.length < SESSIONS_PER_WEEK) {
                const missing = SESSIONS_PER_WEEK - merged[k].session_status.length;
                merged[k].session_status.push(...new Array(missing).fill(false));
            }
            if (merged[k].session_logs.length < SESSIONS_PER_WEEK) {
                const missing = SESSIONS_PER_WEEK - merged[k].session_logs.length;
                merged[k].session_logs.push(...Array.from({ length: missing }, () => ({ rpe: '', avg_hr: '', notes: '' })));
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
                session_logs: Array.from({ length: SESSIONS_PER_WEEK }, () => ({ rpe: '', avg_hr: '', notes: '' })),
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
        // Device import buttons
        document.getElementById('whoopImportBtn')?.addEventListener('click',  () => this.openDeviceImport('whoopImport',  'WHOOP'));
        document.getElementById('garminImportBtn')?.addEventListener('click', () => this.openDeviceImport('garminImport', 'Garmin'));
        // Import preview modal controls
        document.getElementById('importModalClose')?.addEventListener('click',   () => this.closeImportModal());
        document.getElementById('importModalCancel')?.addEventListener('click',  () => this.closeImportModal());
        document.getElementById('importModalConfirm')?.addEventListener('click', () => this.applyDeviceImport());
        document.getElementById('importModalOverlay')?.addEventListener('click', e => {
            if (e.target === e.currentTarget) this.closeImportModal();
        });
        // Session detail modal
        document.getElementById('sessionModalClose')?.addEventListener('click', () => this.closeSessionModal());
        document.getElementById('sessionModalOverlay')?.addEventListener('click', e => {
            if (e.target === e.currentTarget) this.closeSessionModal();
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeSessionModal(); });
        document.querySelectorAll('.wt-session[data-session-id]').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.sessionId);
                this.openSessionModal(id);
            });
        });
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

        // Auto-save tracking fields on blur/change
        const autoSaveFields = [
            'runTrend','bikeTrend','swimTrend','hyroxTrend',
            'avgSleep','sleepConsistency','hrvValue','rhrValue','hrvTrend','rhrTrend',
            'macroAdherence','carbPeriodization','fuelingScore','avgWeight',
            'bench5k','benchFTP','benchSquat','benchDeadlift',
            'nextWeekLoad','volumeChange','intensityChange','priorities'
        ];
        autoSaveFields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const evt = (el.tagName === 'SELECT') ? 'change' : 'blur';
            el.addEventListener(evt, () => {
                this._markUnsaved();
                this.saveWeeklyUpdate(true);
            });
        });
    }

    _markUnsaved() {
        // Visual indicator is shown by saveWeeklyUpdate on silent save
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
            container.innerHTML = todays.map(s => {
                const det = SESSION_DETAILS[s.id];
                const detHTML = det ? this.buildInlineSessionDetail(det, s.id) : '';
                return `
                <div class="today-session-item ts-expandable" data-ts-idx="${s.id}">
                    <div class="ts-header">
                        <span class="ts-time">${s.day.split(' ')[1] || s.day}</span>
                        <span class="ts-desc">${s.desc}</span>
                        <span class="ts-type">${s.type}</span>
                        <span class="ts-chevron" aria-hidden="true">▾</span>
                    </div>
                    <div class="ts-detail">${detHTML}</div>
                </div>`;
            }).join('');

            container.querySelectorAll('.ts-header').forEach(hdr => {
                hdr.addEventListener('click', () => {
                    const item = hdr.closest('.ts-expandable');
                    if (!item) return;
                    const isOpen = item.classList.contains('ts-open');
                    container.querySelectorAll('.ts-expandable.ts-open').forEach(x => x.classList.remove('ts-open'));
                    if (!isOpen) {
                        item.classList.add('ts-open');
                        // wire save-log buttons inside the expanded detail
                        item.querySelectorAll('.sc-log-save-btn').forEach(btn => {
                            btn.addEventListener('click', e => {
                                e.stopPropagation();
                                this.saveSessionLog(parseInt(btn.dataset.logIdx));
                            });
                        });
                    }
                });
            });
        }
    }

    // ── Session Grid ─────────────────────────────────────────────────────────
    renderSessionGrid() {
        const container = document.getElementById('sessionGrid');
        if (!container) return;
        const wkd = this.data[`week_${this.currentWeek}`];
        const statuses = wkd.session_status || new Array(SESSIONS_PER_WEEK).fill(false);
        const typeClass = { Run: 'sc-run', Bike: 'sc-bike', Swim: 'sc-swim', Hyrox: 'sc-hyrox', Strength: 'sc-strength', Recovery: 'sc-recovery' };

        container.innerHTML = SESSIONS.map((s, i) => {
            const det = SESSION_DETAILS[i];
            return `
            <div class="session-card ${statuses[i] ? 'done' : ''} ${typeClass[s.type] || ''}" data-idx="${i}">
                <div class="sc-top" data-toggle="${i}">
                    <label class="sc-check-label" title="Mark complete" onclick="event.stopPropagation()">
                        <input type="checkbox" ${statuses[i] ? 'checked' : ''} data-idx="${i}">
                    </label>
                    <div class="sc-info">
                        <span class="sc-day">${s.day}</span>
                        <span class="sc-desc">${s.desc}</span>
                    </div>
                    <div class="sc-top-right">
                        <span class="sc-type-badge">${s.type}</span>
                        <span class="sc-chevron" aria-hidden="true">▾</span>
                    </div>
                </div>
                <div class="sc-body" id="sc-body-${i}">
                    ${this.buildInlineSessionDetail(det, i)}
                </div>
            </div>`;
        }).join('');

        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', e => {
                e.stopPropagation();
                this.toggleSession(parseInt(e.target.dataset.idx), e.target.checked);
            });
        });
        container.querySelectorAll('.sc-top[data-toggle]').forEach(top => {
            top.addEventListener('click', e => {
                if (e.target.closest('.sc-check-label')) return;
                this.toggleSessionDetail(parseInt(top.dataset.toggle));
            });
        });
        container.querySelectorAll('.sc-log-save-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.saveSessionLog(parseInt(btn.dataset.logIdx));
            });
        });
        this.updateSessionFooter();
    }

    buildInlineSessionDetail(det, idx) {
        if (!det) return '';
        const wkd  = this.data[`week_${this.currentWeek}`];
        const log  = wkd?.session_logs?.[idx] || { rpe: '', avg_hr: '', notes: '' };
        let html = `<div class="sc-body-inner">`;
        html += `<div class="sc-meta-row"><span>${this._esc(det.time)}</span><span>${this._esc(det.duration)}</span></div>`;
        html += `<p class="sc-purpose">${this._esc(det.purpose)}</p>`;
        if (det.warmup && det.warmup.length) {
            html += `<div class="sc-section"><div class="sc-section-label">Warm-Up</div><ul class="sc-list">${det.warmup.map(x => `<li>${this._esc(x)}</li>`).join('')}</ul></div>`;
        }
        if (det.mainSet && det.mainSet.length) {
            html += `<div class="sc-section"><div class="sc-section-label">Main Set</div>`;
            det.mainSet.forEach(block => {
                html += `<div class="sc-block"><div class="sc-block-title">${this._esc(block.block)}</div><ul class="sc-list">${block.details.map(d => `<li>${this._esc(d)}</li>`).join('')}</ul></div>`;
            });
            html += `</div>`;
        }
        if (det.cooldown && det.cooldown.length) {
            html += `<div class="sc-section"><div class="sc-section-label">Cool-Down</div><ul class="sc-list">${det.cooldown.map(x => `<li>${this._esc(x)}</li>`).join('')}</ul></div>`;
        }
        if (det.fuel) html += `<div class="sc-fuel">⚡ <strong>Fueling:</strong> ${this._esc(det.fuel)}</div>`;
        if (det.kpi)  html += `<div class="sc-kpi">🎯 <strong>KPI:</strong> ${this._esc(det.kpi)}</div>`;
        // Session log form
        html += `<div class="sc-log-form" data-log-idx="${idx}">
            <div class="sc-log-label">Session Log</div>
            <div class="sc-log-fields">
                <div class="sc-log-field">
                    <label>RPE <span class="sc-log-hint">1–10</span></label>
                    <input type="number" class="sc-log-input" data-field="rpe" min="1" max="10" placeholder="—" value="${this._esc(String(log.rpe))}">
                </div>
                <div class="sc-log-field">
                    <label>Avg HR <span class="sc-log-hint">bpm</span></label>
                    <input type="number" class="sc-log-input" data-field="avg_hr" min="40" max="220" placeholder="—" value="${this._esc(String(log.avg_hr))}">
                </div>
                <div class="sc-log-field sc-log-field--wide">
                    <label>Quality Note</label>
                    <input type="text" class="sc-log-input" data-field="notes" maxlength="140" placeholder="One sentence on how it felt…" value="${this._esc(String(log.notes))}">
                </div>
            </div>
            <div class="sc-log-footer">
                ${log.rpe || log.avg_hr || log.notes ? `<span class="sc-log-saved">✓ Logged</span>` : ''}
                <button class="sc-log-save-btn" data-log-idx="${idx}">Save Log</button>
            </div>
        </div>`;
        html += `</div>`;
        return html;
    }

    toggleSessionDetail(idx) {
        const card = document.querySelector(`.session-card[data-idx="${idx}"]`);
        if (!card) return;
        const isOpen = card.classList.contains('open');
        // Close all others first
        document.querySelectorAll('.session-card.open').forEach(c => c.classList.remove('open'));
        if (!isOpen) card.classList.add('open');
    }

    saveSessionLog(idx) {
        const wkd = this.data[`week_${this.currentWeek}`];
        if (!wkd.session_logs) {
            wkd.session_logs = Array.from({ length: SESSIONS_PER_WEEK }, () => ({ rpe: '', avg_hr: '', notes: '' }));
        }
        const form = document.querySelector(`.sc-log-form[data-log-idx="${idx}"]`);
        if (!form) return;
        const rpe    = form.querySelector('[data-field="rpe"]')?.value    ?? '';
        const avg_hr = form.querySelector('[data-field="avg_hr"]')?.value ?? '';
        const notes  = form.querySelector('[data-field="notes"]')?.value  ?? '';
        wkd.session_logs[idx] = { rpe, avg_hr, notes };
        this.saveData();
        // Update the footer to show saved state
        const footer = form.querySelector('.sc-log-footer');
        if (footer) {
            const existing = footer.querySelector('.sc-log-saved');
            if (!existing) {
                const span = document.createElement('span');
                span.className = 'sc-log-saved';
                span.textContent = '✓ Logged';
                footer.insertBefore(span, footer.querySelector('.sc-log-save-btn'));
            }
        }
        this.showToast('Session logged ✓', 1400);
    }

    toggleSession(idx, checked) {
        const wkd = this.data[`week_${this.currentWeek}`];
        if (!wkd.session_status) wkd.session_status = new Array(SESSIONS_PER_WEEK).fill(false);
        wkd.session_status[idx] = checked;
        const done = wkd.session_status.filter(Boolean).length;
        wkd.completed_sessions = done;
        wkd.compliance_score   = Math.round((done / SESSIONS_PER_WEEK) * 100);
        this.saveData();

        const label = document.querySelector(`.session-card[data-idx="${idx}"]`);
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

    // ── Session Detail Modal ─────────────────────────────────────────────────
    openSessionModal(id) {
        const s = SESSION_DETAILS[id];
        if (!s) return;

        const typeClass = 'type-' + s.type.toLowerCase();
        const overlay = document.getElementById('sessionModalOverlay');

        document.getElementById('smDay').textContent       = s.day;
        document.getElementById('smDuration').textContent  = s.duration;
        document.getElementById('smTimeRange').textContent = s.time;
        document.getElementById('sessionModalTitle').textContent = s.title;
        document.getElementById('smPurpose').textContent   = s.purpose;

        const header = overlay.querySelector('.sm-header');
        header.className = `sm-header ${typeClass}`;

        const body = document.getElementById('smBody');
        let html = '';

        if (s.warmup && s.warmup.length > 0) {
            html += `<div class="sm-section">
                <div class="sm-section-label">Warm-Up</div>
                <ul class="sm-list">${s.warmup.map(x => `<li>${this._esc(x)}</li>`).join('')}</ul>
            </div>`;
        }

        if (s.mainSet && s.mainSet.length > 0) {
            html += `<div class="sm-section"><div class="sm-section-label">Main Set</div>`;
            s.mainSet.forEach(block => {
                html += `<div class="sm-block">
                    <div class="sm-block-title">${this._esc(block.block)}</div>
                    <ul class="sm-list">${block.details.map(d => `<li>${this._esc(d)}</li>`).join('')}</ul>
                </div>`;
            });
            html += `</div>`;
        }

        if (s.cooldown && s.cooldown.length > 0) {
            html += `<div class="sm-section">
                <div class="sm-section-label">Cool-Down</div>
                <ul class="sm-list">${s.cooldown.map(x => `<li>${this._esc(x)}</li>`).join('')}</ul>
            </div>`;
        }

        if (s.fuel) {
            html += `<div class="sm-fuel-box">⚡ <strong>Fueling:</strong> ${this._esc(s.fuel)}</div>`;
        }

        if (s.kpi) {
            html += `<div class="sm-kpi-box">🎯 <strong>KPI:</strong> ${this._esc(s.kpi)}</div>`;
        }

        body.innerHTML = html;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeSessionModal() {
        document.getElementById('sessionModalOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    _esc(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }


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

    saveWeeklyUpdate(silent = false) {
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
        if (silent) {
            this.showToast('Auto-saved', 900);
        } else {
            this.showToast(`✅ Week ${wk} saved!`);
        }
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

    // ── Device Import (WHOOP + Garmin) ────────────────────────────────────────

    parseCSV(text) {
        const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
        if (lines.length < 2) return { headers: [], rows: [] };
        const parseRow = line => {
            const result = [];
            let inQuote = false, current = '';
            for (const ch of line) {
                if (ch === '"') { inQuote = !inQuote; }
                else if (ch === ',' && !inQuote) { result.push(current.trim()); current = ''; }
                else { current += ch; }
            }
            result.push(current.trim());
            return result.map(v => v.replace(/^"|"$/g, '').trim());
        };
        const headers = parseRow(lines[0]);
        const rows = lines.slice(1).filter(l => l.trim()).map(l => {
            const vals = parseRow(l);
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
            return obj;
        });
        return { headers, rows };
    }

    detectCSVFormat(headers) {
        const h = headers.map(x => x.toLowerCase());
        if (h.some(x => x.includes('heart rate variability') || x === 'hrv (ms)')) return 'whoop_recovery';
        if (h.some(x => x.includes('hours of sleep'))) return 'whoop_sleep';
        if (h.some(x => x === 'activity type') && h.some(x => x === 'avg hr')) return 'garmin_activities';
        // WHOOP combined file may have both recovery and sleep columns
        if (h.some(x => x.includes('recovery score')) && h.some(x => x.includes('resting heart rate'))) return 'whoop_recovery';
        return 'unknown';
    }

    getWeekForDate(dateStr) {
        if (!dateStr) return null;
        const cleaned = dateStr.replace(' ', 'T').replace(/T(\d{2}:\d{2}:\d{2}).*$/, 'T$1');
        const d = new Date(cleaned);
        if (isNaN(d.getTime())) return null;
        const diffMs  = d - PROGRAM_START;
        if (diffMs < 0) return null;
        const diffDays = Math.floor(diffMs / 86400000);
        const week     = Math.floor(diffDays / 7) + 1;
        return (week >= 1 && week <= WEEKS_COUNT) ? week : null;
    }

    mapWhoopRecovery(rows) {
        const byWeek = {};
        for (const row of rows) {
            const dateStr = row['Cycle start time'] || row['cycle start time'] || '';
            if (!dateStr) continue;
            const week = this.getWeekForDate(dateStr);
            if (!week) continue;
            const hrv      = parseFloat(row['Heart rate variability (ms)'] || row['HRV (ms)'] || '');
            const rhr      = parseFloat(row['Resting heart rate (bpm)']    || '');
            const recovery = parseFloat(row['Recovery score %']             || '');
            if (!byWeek[week]) byWeek[week] = { hrv: [], rhr: [], recovery: [] };
            if (!isNaN(hrv)      && hrv      > 0) byWeek[week].hrv.push(hrv);
            if (!isNaN(rhr)      && rhr      > 0) byWeek[week].rhr.push(rhr);
            if (!isNaN(recovery) && recovery > 0) byWeek[week].recovery.push(recovery);
        }
        const arrAvg   = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b) / arr.length) : null;
        const arrTrend = arr => {
            if (arr.length < 3) return 'stable';
            const mid   = Math.floor(arr.length / 2);
            const first = arr.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
            const last  = arr.slice(mid).reduce((a, b) => a + b, 0) / (arr.length - mid);
            if (last > first * 1.05) return 'up';
            if (last < first * 0.95) return 'down';
            return 'stable';
        };
        const result = {};
        for (const [week, vals] of Object.entries(byWeek)) {
            const avgHRV = arrAvg(vals.hrv);
            const avgRHR = arrAvg(vals.rhr);
            result[`week_${week}`] = {
                ...(avgHRV !== null && { hrv_value: avgHRV, hrv_trend: arrTrend(vals.hrv) }),
                ...(avgRHR !== null && { rhr_value: avgRHR, rhr_trend: arrTrend(vals.rhr) }),
            };
        }
        return result;
    }

    mapWhoopSleep(rows) {
        const byWeek = {};
        for (const row of rows) {
            const dateStr = row['Cycle start time'] || row['cycle start time'] || '';
            if (!dateStr) continue;
            const week = this.getWeekForDate(dateStr);
            if (!week) continue;
            const hours = parseFloat(row['Hours of sleep'] || '');
            const perf  = parseFloat(row['Sleep performance %'] || '');
            const cons  = parseFloat(row['Sleep consistency %'] || '');
            if (!byWeek[week]) byWeek[week] = { hours: [], perf: [], cons: [] };
            if (!isNaN(hours) && hours > 0) byWeek[week].hours.push(hours);
            if (!isNaN(perf)  && perf  > 0) byWeek[week].perf.push(perf);
            if (!isNaN(cons)  && cons  > 0) byWeek[week].cons.push(cons);
        }
        const arrAvg  = arr => arr.length ? Math.round((arr.reduce((a, b) => a + b) / arr.length) * 10) / 10 : null;
        const perfToLabel = pct => pct >= 90 ? 'excellent' : pct >= 75 ? 'good' : pct >= 60 ? 'fair' : 'poor';
        const result = {};
        for (const [week, vals] of Object.entries(byWeek)) {
            const avgH = arrAvg(vals.hours);
            const consVal = vals.cons.length ? arrAvg(vals.cons) : (vals.perf.length ? arrAvg(vals.perf) : null);
            result[`week_${week}`] = {
                ...(avgH    !== null && { avg_sleep: avgH }),
                ...(consVal !== null && { sleep_consistency: perfToLabel(consVal) }),
            };
        }
        return result;
    }

    mapGarminActivities(rows) {
        // Garmin date format: "YYYY-MM-DD HH:MM:SS" or just "YYYY-MM-DD"
        const paceToSec = str => {
            if (!str) return 0;
            const clean = str.replace(/[^\d:]/g, '');
            const parts = clean.split(':');
            if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            return 0;
        };
        const byWeek = {};
        for (const row of rows) {
            const dateStr = row['Date'] || row['date'] || '';
            if (!dateStr) continue;
            const week = this.getWeekForDate(dateStr);
            if (!week) continue;
            const actType  = (row['Activity Type'] || '').toLowerCase();
            const distance = parseFloat(row['Distance'] || '0');     // km
            const avgPace  = (row['Avg Pace'] || '').trim();          // mm:ss /km
            const avgPower = parseFloat(row['Avg Power'] || '0');
            const normPow  = parseFloat(row['Normalized Power® (NP®)'] || row['Normalized Power (NP)'] || '0');
            const avgHR    = parseFloat(row['Avg HR'] || '0');
            const titleLc  = (row['Title'] || '').toLowerCase();
            if (!byWeek[week]) byWeek[week] = { runs: [], bikes: [], swims: [], hyrox: [] };
            if (actType.includes('run') || actType.includes('trail')) {
                byWeek[week].runs.push({ distance, avgPace, avgHR, date: dateStr });
            } else if (actType.includes('cycl') || actType.includes('bike') || actType.includes('virtual') || actType.includes('indoor')) {
                byWeek[week].bikes.push({ avgPower: Math.max(avgPower, normPow), avgHR, date: dateStr });
            } else if (actType.includes('swim') || actType.includes('pool') || actType.includes('open water')) {
                byWeek[week].swims.push({ distance, avgHR, date: dateStr });
            } else if (titleLc.includes('hyrox') || titleLc.includes('skierg') || titleLc.includes('sled')) {
                byWeek[week].hyrox.push({ date: dateStr });
            }
        }
        const result = {};
        for (const [week, vals] of Object.entries(byWeek)) {
            const wk = {};
            // Best 5K: runs of ~5km, use avg pace * 5
            const fiveKRuns = vals.runs.filter(r => r.distance >= 4.8 && r.distance <= 5.5 && r.avgPace);
            if (fiveKRuns.length > 0) {
                const best = fiveKRuns.reduce((b, r) => {
                    const s = paceToSec(r.avgPace), bs = paceToSec(b.avgPace);
                    return s > 0 && (bs === 0 || s < bs) ? r : b;
                });
                const pace5k = paceToSec(best.avgPace);
                if (pace5k > 0) { wk.benchmarks = { ...wk.benchmarks, run_5k_seconds: pace5k * 5 }; }
            }
            // FTP estimate: best avg power from rides × 0.95 (assumes longer effort)
            const bikes = vals.bikes.filter(b => b.avgPower > 50);
            if (bikes.length > 0) {
                const maxPow = Math.max(...bikes.map(b => b.avgPower));
                wk.benchmarks = { ...wk.benchmarks, ftp_watts: Math.round(maxPow * 0.95) };
            }
            // Trends from activity counts
            if (vals.runs.length >= 3)  wk.run_trend   = 'up';
            else if (vals.runs.length)  wk.run_trend   = 'stable';
            if (vals.bikes.length >= 3) wk.bike_trend  = 'up';
            else if (vals.bikes.length) wk.bike_trend  = 'stable';
            if (vals.swims.length >= 2) wk.swim_trend  = 'up';
            else if (vals.swims.length) wk.swim_trend  = 'stable';
            if (vals.hyrox.length >= 2) wk.hyrox_trend = 'up';
            else if (vals.hyrox.length) wk.hyrox_trend = 'stable';
            // Session status: mark by date+type match
            const sessionStatus = this.data[`week_${week}`]?.session_status?.slice() ?? new Array(SESSIONS_PER_WEEK).fill(false);
            const weekStart = new Date(PROGRAM_START.getTime() + (parseInt(week) - 1) * 7 * 86400000);
            const allActs = [
                ...vals.runs.map(r => ({ type: 'run', date: r.date })),
                ...vals.bikes.map(b => ({ type: 'bike', date: b.date })),
                ...vals.swims.map(s => ({ type: 'swim', date: s.date })),
                ...vals.hyrox.map(h => ({ type: 'hyrox', date: h.date })),
            ];
            for (const act of allActs) {
                const d = new Date(act.date.replace(' ', 'T'));
                if (isNaN(d.getTime())) continue;
                const dayOfWeek = d.getDay(); // 0=Sun,1=Mon,...
                // Map activity to session slot by day+type
                SESSIONS.forEach((s, i) => {
                    if (s.dayIndex === dayOfWeek) {
                        const st = s.type.toLowerCase();
                        if (act.type === 'run'   && st === 'run')      sessionStatus[i] = true;
                        if (act.type === 'bike'  && st === 'bike')     sessionStatus[i] = true;
                        if (act.type === 'swim'  && st === 'swim')     sessionStatus[i] = true;
                        if (act.type === 'hyrox' && st === 'hyrox')    sessionStatus[i] = true;
                    }
                });
            }
            const newDone = sessionStatus.filter(Boolean).length;
            wk.session_status     = sessionStatus;
            wk.completed_sessions = newDone;
            wk.compliance_score   = Math.round((newDone / SESSIONS_PER_WEEK) * 100);
            result[`week_${week}`] = wk;
        }
        return result;
    }

    buildImportPreview(mappedData, format) {
        const FIELD_LABELS = {
            hrv_value:         'HRV (avg ms)',
            rhr_value:         'RHR (avg bpm)',
            hrv_trend:         'HRV Trend',
            rhr_trend:         'RHR Trend',
            avg_sleep:         'Avg Sleep (h)',
            sleep_consistency: 'Sleep Consistency',
            run_trend:         'Run Trend',
            bike_trend:        'Bike Trend',
            swim_trend:        'Swim Trend',
            hyrox_trend:       'Hyrox Trend',
            'benchmarks.run_5k_seconds': '5K Time',
            'benchmarks.ftp_watts':      'FTP (watts)',
            completed_sessions:          'Sessions Done',
            compliance_score:            'Compliance %',
        };
        const fmtVal = (key, val) => {
            if (key === 'benchmarks.run_5k_seconds') return this.formatMMSS(val);
            if (key === 'avg_sleep') return `${val}h`;
            if (key === 'compliance_score') return `${val}%`;
            if (key === 'session_status') return `${val.filter(Boolean).length}/12 marked`;
            return String(val);
        };
        const getOldVal = (weekKey, field) => {
            const wkd = this.data[weekKey];
            if (!wkd) return '—';
            if (field.startsWith('benchmarks.')) {
                const bk = field.split('.')[1];
                const v = wkd.benchmarks?.[bk];
                return v ? fmtVal(field, v) : '—';
            }
            const v = wkd[field];
            return (v !== undefined && v !== 0 && v !== '') ? fmtVal(field, v) : '—';
        };

        const weeks = Object.keys(mappedData).sort();
        if (weeks.length === 0) return null;

        let totalChanges = 0;
        let html = '';
        for (const weekKey of weeks) {
            const wNum = parseInt(weekKey.split('_')[1]);
            const patch = mappedData[weekKey];
            const rows = [];

            const flatPatch = {};
            for (const [k, v] of Object.entries(patch)) {
                if (k === 'benchmarks' && typeof v === 'object') {
                    for (const [bk, bv] of Object.entries(v)) {
                        flatPatch[`benchmarks.${bk}`] = bv;
                    }
                } else if (k !== 'session_status' && k !== 'completed_sessions' && k !== 'compliance_score') {
                    flatPatch[k] = v;
                }
            }
            if (patch.session_status) flatPatch['session_status'] = patch.session_status;

            for (const [field, newVal] of Object.entries(flatPatch)) {
                if (!(field in FIELD_LABELS) && field !== 'session_status') continue;
                const label = FIELD_LABELS[field] || field;
                const oldStr = getOldVal(weekKey, field);
                const newStr = field === 'session_status'
                    ? fmtVal('session_status', newVal)
                    : fmtVal(field, newVal);
                rows.push({ label, oldStr, newStr });
                totalChanges++;
            }

            if (rows.length === 0) continue;
            html += `<div class="iw-block">
                <div class="iw-block-header">
                    <span class="iw-week-label">Week ${wNum}</span>
                    <span class="iw-date-range">${this.getWeekStart(wNum)} → ${this.getWeekEnd(wNum)}</span>
                </div>
                <div class="iw-rows">
                    ${rows.map(r => `<div class="iw-row">
                        <span class="iw-field">${r.label}</span>
                        <span class="iw-old">${r.oldStr}</span>
                        <span class="iw-new">${r.newStr}</span>
                    </div>`).join('')}
                </div>
            </div>`;
        }
        return { html, totalChanges, weekCount: weeks.length };
    }

    openDeviceImport(fileInputId, sourceName) {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput?.files[0];
        if (!file) { this.showToast('Select a CSV file first'); return; }
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const { headers, rows } = this.parseCSV(e.target.result);
                if (!headers.length) { this.showToast('❌ Could not read CSV headers'); return; }
                const format = this.detectCSVFormat(headers);
                let mappedData = {};
                let formatLabel = '';
                let subLine = '';
                if (format === 'whoop_recovery') {
                    mappedData  = this.mapWhoopRecovery(rows);
                    formatLabel = 'WHOOP Recovery';
                    subLine     = 'Fills HRV, RHR, and recovery trends per training week.';
                } else if (format === 'whoop_sleep') {
                    mappedData  = this.mapWhoopSleep(rows);
                    formatLabel = 'WHOOP Sleep';
                    subLine     = 'Fills average sleep hours and sleep consistency per training week.';
                } else if (format === 'garmin_activities') {
                    mappedData  = this.mapGarminActivities(rows);
                    formatLabel = 'Garmin Connect — Activities';
                    subLine     = 'Maps run benchmarks, FTP, discipline trends, and session completions.';
                } else {
                    this.showToast('❌ Unrecognised CSV format. Expected WHOOP recovery.csv, sleeps.csv, or Garmin Activities.csv');
                    return;
                }
                const preview = this.buildImportPreview(mappedData, format);
                if (!preview || preview.totalChanges === 0) {
                    this.showToast('No matching data found inside the program date range (May 11 – Aug 30, 2026)');
                    return;
                }
                this._pendingImport = mappedData;
                document.getElementById('importModalSource').textContent = formatLabel;
                document.getElementById('importModalTitle').textContent  = 'Import Preview';
                document.getElementById('importModalSub').textContent    = `${preview.weekCount} week${preview.weekCount !== 1 ? 's' : ''} · ${preview.totalChanges} field${preview.totalChanges !== 1 ? 's' : ''} — ${subLine}`;
                const body = document.getElementById('importModalBody');
                body.innerHTML = preview.html +
                    `<div class="import-warn">⚠ Existing values will be overwritten where new data is available. Review each row before confirming.</div>`;
                document.getElementById('importModalOverlay').classList.add('open');
                document.body.style.overflow = 'hidden';
            } catch (err) {
                this.showToast('❌ Parse error: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    applyDeviceImport() {
        if (!this._pendingImport) return;
        for (const [weekKey, patch] of Object.entries(this._pendingImport)) {
            if (!this.data[weekKey]) continue;
            const { benchmarks, session_status, ...rest } = patch;
            Object.assign(this.data[weekKey], rest);
            if (benchmarks) Object.assign(this.data[weekKey].benchmarks, benchmarks);
            if (session_status) {
                this.data[weekKey].session_status     = session_status;
                this.data[weekKey].completed_sessions = session_status.filter(Boolean).length;
                this.data[weekKey].compliance_score   = Math.round((this.data[weekKey].completed_sessions / SESSIONS_PER_WEEK) * 100);
            }
        }
        this._pendingImport = null;
        this.saveData();
        this.onWeekChange();
        this.closeImportModal();
        this.showToast('✅ Device data imported');
    }

    closeImportModal() {
        document.getElementById('importModalOverlay')?.classList.remove('open');
        document.body.style.overflow = '';
        this._pendingImport = null;
    }

    // ── Import / Export ───────────────────────────────────────────────────────
    importData() {        const file = document.getElementById('dataImport')?.files[0];
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

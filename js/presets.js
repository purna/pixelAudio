// presets.js — Sound presets and random generation
//
// 103 presets across 10 categories.
// Each preset is tuned and reviewed; see spreadsheet for full change history.
//
// Categories:
//   Game FX       — pickups, lasers, explosions, hits, jumps
//   Footsteps     — stone, wood, sand, gravel, snow, metal
//   UI            — clicks, hovers, panels, alarms, confirmations
//   Victory       — celebration stings
//   SF Inspired   — swords, shields, magic, coins, engines
//   Enhanced      — thunder, eruptions, 8-bit, sci-fi, ambience
//   Classic SFXR  — sonar, whoosh, helicopter, impacts, nature
//   Advanced FX   — delay, phasing, harmonics, bitcrush, filters
//   Music         — chiptune melodies, arpeggios, pads, grooves
//   Platformer 2D — game-specific UI and action sounds

class Presets {
    constructor() {
        this.presets = {
            // ── GAME FX ──────────────────────────────────────────────────
        // pickup
        pickup: {
            // Bright reward chime — Quick pickup item — bright high-frequency chime with upward slide
            attack: 0, sustain: 0.05, punch: 20, decay: 0.06,
            frequency: 5780, minFreq: 3, slide: 0.3, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.18, arpSpeed: 0.085,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // pickup_soft
        pickup_soft: {
            // Gentle collect tone — Softer triangle-wave pickup for quieter reward moments
            attack: 0, sustain: 0.06, punch: 10, decay: 0.09,
            frequency: 3200, minFreq: 0, slide: 0.2, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.09,
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.4
        },

        // laser
        laser: {
            // Sci-fi zap — Sharp descending laser blast — strong negative slide, HPF removes mud
            attack: 0, sustain: 0.1, punch: 30, decay: 0.2,
            frequency: 4500, minFreq: 100, slide: -0.55, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 25, waveform: 'square',
            lpfEnable: false,
            hpfEnable: true, hpf: 882,
            volume: 0.6
        },

        // laser_heavy
        laser_heavy: {
            // Deep cannon blast — Low-frequency cannon laser with longer sustain and deeper pitch drop
            attack: 0, sustain: 0.15, punch: 40, decay: 0.35,
            frequency: 2200, minFreq: 50, slide: -0.7, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 30, waveform: 'square',
            lpfEnable: true, lpf: 6000,
            hpfEnable: true, hpf: 200,
            volume: 0.7
        },

        // explosion
        explosion: {
            // Deep boom — Deep noise explosion — low frequency, instant attack, long decay, falling slide
            attack: 0, sustain: 0.3, punch: 40, decay: 0.75,
            frequency: 150, minFreq: 20, slide: -0.3, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'noise',
            lpfEnable: true, lpf: 4410,
            hpfEnable: false,
            volume: 0.8
        },

        // explosion_small
        explosion_small: {
            // Sharp crackle pop — Smaller explosion — higher frequency crackle with shorter tail
            attack: 0, sustain: 0.15, punch: 60, decay: 0.35,
            frequency: 400, minFreq: 30, slide: -0.25, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'noise',
            lpfEnable: true, lpf: 6000,
            hpfEnable: true, hpf: 150,
            volume: 0.65
        },

        // powerup
        powerup: {
            // Rising shimmer — Rising power-up tone — positive slide with vibrato shimmer
            attack: 0, sustain: 0.2, punch: 0, decay: 0.4,
            frequency: 200, minFreq: 0, slide: 0.6, deltaSlide: 0.1,
            vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 10,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // hit
        hit: {
            // Punchy impact thud — Mid-low frequency impact — short envelope, slight pitch fall for sense of force
            attack: 0, sustain: 0.05, punch: 50, decay: 0.15,
            frequency: 400, minFreq: 0, slide: -0.2, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: true, lpf: 4410,
            hpfEnable: true, hpf: 221,
            volume: 0.7
        },

        // hit_hard
        hit_hard: {
            // Heavy bone crunch — Heavier impact — brown noise, very low frequency, maximum punch
            attack: 0, sustain: 0.04, punch: 80, decay: 0.12,
            frequency: 200, minFreq: 0, slide: -0.35, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'brown_noise',
            lpfEnable: true, lpf: 2500,
            hpfEnable: true, hpf: 100,
            volume: 0.85
        },

        // jump
        jump: {
            // Light spring bounce — Crisp upward jump — high freq square with positive slide
            attack: 0, sustain: 0.1, punch: 10, decay: 0.2,
            frequency: 2000, minFreq: 0, slide: 0.25, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // jump_double
        jump_double: {
            // Floaty double jump — Higher-pitched second jump — more air, slightly longer
            attack: 0, sustain: 0.12, punch: 5, decay: 0.25,
            frequency: 2800, minFreq: 0, slide: 0.2, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 8, vibratoSpeed: 8,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // blip
        blip: {
            // Neutral digital ping — Neutral short blip — generic UI or game feedback tone
            attack: 0, sustain: 0.04, punch: 0, decay: 0.08,
            frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

            // ── FOOTSTEPS ──────────────────────────────────────────────────
        // step_stone
        step_stone: {
            // Crunchy stone strike — Stone footstep — noise burst with HPF crunch and short attack
            attack: 0.005, sustain: 0.02, punch: 40, decay: 0.08,
            frequency: 300, minFreq: 50, slide: -0.1, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 8000,
            hpfEnable: true, hpf: 200,
            volume: 0.8
        },

        // step_stone_heavy
        step_stone_heavy: {
            // Heavy armoured thud — Heavy stone step for armoured characters — more punch and bass
            attack: 0.005, sustain: 0.03, punch: 65, decay: 0.1,
            frequency: 200, minFreq: 30, slide: -0.15, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 6000,
            hpfEnable: true, hpf: 100,
            volume: 0.9
        },

        // step_wood
        step_wood: {
            // Hollow wooden knock — Hollow wooden step — low-pass filtered noise for warm wooden tone
            attack: 0.01, sustain: 0.03, punch: 10, decay: 0.08,
            frequency: 150, minFreq: 50, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 1200,
            hpfEnable: true, hpf: 80,
            volume: 1
        },

        // step_sand
        step_sand: {
            // Soft shuffling brush — Sandy step — gentle noise with soft attack and no HPF
            attack: 0.02, sustain: 0.05, punch: 0, decay: 0.15,
            frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 3000,
            hpfEnable: false,
            volume: 0.6
        },

        // step_gravel
        step_gravel: {
            // Crunchy gravel scatter — Gravel step — mid-frequency crunch with punch
            attack: 0.005, sustain: 0.05, punch: 50, decay: 0.12,
            frequency: 600, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 5000,
            hpfEnable: true, hpf: 200,
            volume: 0.7
        },

        // step_snow
        step_snow: {
            // Muffled powder crunch — Snow step — heavily low-pass filtered for muffled crunch
            attack: 0.01, sustain: 0.08, punch: 20, decay: 0.15,
            frequency: 1200, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 2000,
            hpfEnable: true, hpf: 800,
            volume: 0.5
        },

        // step_metal
        step_metal: {
            // Sharp metallic ring — Metal grate step — sawtooth with vibrato ring and HPF
            attack: 0.001, sustain: 0.04, punch: 50, decay: 0.15,
            frequency: 350, minFreq: 0, slide: -0.05, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 12,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 5000,
            hpfEnable: true, hpf: 150,
            volume: 0.75
        },

            // ── UI ──────────────────────────────────────────────────
        // click
        click: {
            // Sharp button click — Instant button click — very short square burst, no slide
            attack: 0, sustain: 0.02, punch: 0, decay: 0.05,
            frequency: 1200, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // button_click
        button_click: {
            // Soft button tap — Softer button click — lower freq, slightly longer tail
            attack: 0, sustain: 0.03, punch: 0, decay: 0.08,
            frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // hover
        hover: {
            // Delicate hover tick — Subtle hover — soft triangle wave, minimal decay
            attack: 0.01, sustain: 0.06, punch: 0, decay: 0.05,
            frequency: 1000, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.4
        },

        // panel_open
        panel_open: {
            // Upward whoosh sweep — Panel opening — sine wave with slight positive slide
            attack: 0.02, sustain: 0.15, punch: 0, decay: 0.2,
            frequency: 400, minFreq: 0, slide: 0.1, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // panel_close
        panel_close: {
            // Downward whoosh sweep — Panel closing — sine wave with negative slide
            attack: 0.01, sustain: 0.1, punch: 0, decay: 0.15,
            frequency: 300, minFreq: 0, slide: -0.2, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // alarm
        alarm: {
            // Urgent repeating arp — Alert alarm — square wave arpeggio, urgent feel
            attack: 0.01, sustain: 0.2, punch: 0, decay: 0.1,
            frequency: 880, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.15,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.65
        },

        // quest_done
        quest_done: {
            // Triumphant fanfare sweep — Quest complete — triangle arp with rising slide and delta slide
            attack: 0.02, sustain: 0.3, punch: 0, decay: 0.3,
            frequency: 600, minFreq: 0, slide: 0.2, deltaSlide: 0.1,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.1,
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // error
        error: {
            // Descending error buzz — Error beep — descending square with strong vibrato
            attack: 0, sustain: 0.1, punch: 0, decay: 0.15,
            frequency: 200, minFreq: 0, slide: -0.5, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 15,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // success
        success: {
            // Positive confirmation pip — Success beep — short square arp with slight positive feel
            attack: 0.02, sustain: 0.1, punch: 0, decay: 0.15,
            frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.08,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // ui_confirm
        ui_confirm: {
            // Gentle upward confirm — Confirmation tone — sine with slight upward slide
            attack: 0.01, sustain: 0.05, punch: 0, decay: 0.08,
            frequency: 440, minFreq: 0, slide: 0.1, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // ui_cancel
        ui_cancel: {
            // Soft downward dismiss — Cancel/back tone — sawtooth with slight downward slide
            attack: 0.01, sustain: 0.05, punch: 0, decay: 0.08,
            frequency: 220, minFreq: 0, slide: -0.1, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // menu_move
        menu_move: {
            // Soft navigation tick — Menu navigation — brief triangle blip
            attack: 0, sustain: 0.03, punch: 0, decay: 0.04,
            frequency: 600, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.4
        },

        // keyboard
        keyboard: {
            // Crisp typing click — Keyboard type — very short square blip
            attack: 0, sustain: 0.03, punch: 0, decay: 0.02,
            frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.3
        },

        // switch_select
        switch_select: {
            // Snappy toggle tick — Switch toggle — very short high square
            attack: 0, sustain: 0.02, punch: 0, decay: 0.02,
            frequency: 1500, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 30, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.4
        },

            // ── VICTORY ──────────────────────────────────────────────────
        // victory
        victory: {
            // Epic celebration sting — Epic victory — square arp with vibrato, updown mode
            attack: 0.05, sustain: 0.4, punch: 0, decay: 0.5,
            frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 10, vibratoSpeed: 5,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.12, arpMode: 'updown',
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.7
        },

            // ── SF INSPIRED ──────────────────────────────────────────────────
        // sword_swing
        sword_swing: {
            // Whooshing blade sweep — Sword swing — falling noise whoosh with LPF
            attack: 0.01, sustain: 0.1, punch: 0, decay: 0.15,
            frequency: 600, minFreq: 0, slide: -0.4, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 4000,
            hpfEnable: false,
            volume: 0.7
        },

        // sword_swing_heavy
        sword_swing_heavy: {
            // Slow heavy cleave — Heavy sword swing — lower start freq, more decay, bigger whoosh
            attack: 0.02, sustain: 0.15, punch: 20, decay: 0.25,
            frequency: 300, minFreq: 0, slide: -0.3, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 3000,
            hpfEnable: true, hpf: 80,
            volume: 0.8
        },

        // shield_block
        shield_block: {
            // Metallic clang deflect — Shield block — high punch square clang with ring-out
            attack: 0.001, sustain: 0.05, punch: 80, decay: 0.2,
            frequency: 200, minFreq: 50, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: true, lpf: 3000,
            hpfEnable: true, hpf: 100,
            volume: 0.8
        },

        // magic_spell
        magic_spell: {
            // Shimmering ascend cast — Magic cast — sine arp with vibrato and rising slide
            attack: 0.05, sustain: 0.3, punch: 0, decay: 0.4,
            frequency: 880, minFreq: 0, slide: 0.2, deltaSlide: 0.1,
            vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 15,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.08,
            duty: 0, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // magic_spell_dark
        magic_spell_dark: {
            // Deep sinister cast — Dark magic — sawtooth arp with downward slide and LPF
            attack: 0.08, sustain: 0.4, punch: 20, decay: 0.5,
            frequency: 440, minFreq: 0, slide: -0.15, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 8,
            arpEnable: true, arpMult: 0.75, arpSpeed: 0.1, arpMode: 'down',
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 3500, lpfResonance: 2,
            hpfEnable: false,
            volume: 0.65
        },

        // coin_collect
        coin_collect: {
            // Bright double-chime — Coin collect — high square arp with upward slide
            attack: 0, sustain: 0.03, punch: 0, decay: 0.1,
            frequency: 2000, minFreq: 0, slide: 0.3, deltaSlide: 0.1,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.08,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // door_creak
        door_creak: {
            // Slow wooden groan — Wooden door creak — low sawtooth with falling slide and LPF
            attack: 0.02, sustain: 0.2, punch: 0, decay: 0.3,
            frequency: 150, minFreq: 50, slide: -0.1, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 800,
            hpfEnable: false,
            volume: 0.7
        },

        // engine
        engine: {
            // Deep mechanical rumble — Engine rumble — low sawtooth with vibrato churn
            attack: 0.1, sustain: 0.4, punch: 0, decay: 0.1,
            frequency: 80, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 20,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 400,
            hpfEnable: false,
            volume: 0.6
        },

        // bubble_pop
        bubble_pop: {
            // Soft water bubble burst — Bubble pop — sine with max punch and falling slide
            attack: 0.001, sustain: 0.02, punch: 100, decay: 0.05,
            frequency: 800, minFreq: 0, slide: -0.5, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'sine',
            lpfEnable: true, lpf: 6000,
            hpfEnable: false,
            volume: 0.5
        },

        // retro_explosion
        retro_explosion: {
            // Chaotic retro boom — Retro arcade explosion — noise with vibrato chaos
            attack: 0, sustain: 0.3, punch: 100, decay: 0.5,
            frequency: 100, minFreq: 0, slide: -0.4, deltaSlide: -0.2,
            vibratoEnable: true, vibratoDepth: 50, vibratoSpeed: 30,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 2000,
            hpfEnable: true, hpf: 50,
            volume: 0.9
        },

        // powerup_arcade
        powerup_arcade: {
            // Ascending arcade sweep — Arcade power-up — square arp with delta slide and vibrato
            attack: 0.02, sustain: 0.4, punch: 0, decay: 0.3,
            frequency: 330, minFreq: 0, slide: 0.5, deltaSlide: 0.15,
            vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 8,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.06,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // laser_retro
        laser_retro: {
            // Classic 8-bit zap — Retro laser — sharp descending square, strong slide
            attack: 0, sustain: 0.1, punch: 0, decay: 0.2,
            frequency: 1200, minFreq: 0, slide: -0.8, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 25, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

            // ── ENHANCED ──────────────────────────────────────────────────
        // thunder
        thunder: {
            // Rolling thunder crack — Thunder — deep noise rumble with vibrato, long decay
            attack: 0.01, sustain: 0.5, punch: 50, decay: 0.8,
            frequency: 60, minFreq: 20, slide: -0.1, deltaSlide: -0.05,
            vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 5,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 3000,
            hpfEnable: false,
            volume: 1
        },

        // volcanic_eruption
        volcanic_eruption: {
            // Massive seismic roar — Volcanic eruption — sub-bass noise with long sustain and punch
            attack: 0, sustain: 0.8, punch: 80, decay: 1,
            frequency: 40, minFreq: 10, slide: 0, deltaSlide: -0.02,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 3,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 2000,
            hpfEnable: false,
            volume: 1
        },

        // bit8_jump
        bit8_jump: {
            // 8-bit spring leap — 8-bit jump — square with bitcrush for lo-fi crunch
            attack: 0, sustain: 0.08, punch: 30, decay: 0.2,
            frequency: 400, minFreq: 0, slide: 0.5, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            jumpEnable: true, jumpTime: 0.05, jumpFreq: 800,
            bitcrushEnable: true, bitcrush: 4,
            volume: 0.6
        },

        // sci_fi_laser
        sci_fi_laser: {
            // Futuristic energy beam — Sci-fi laser — sawtooth with strong descending slide
            attack: 0.001, sustain: 0.15, punch: 0, decay: 0.25,
            frequency: 1500, minFreq: 0, slide: -0.9, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1, arpSpeed: 0.08,
            duty: 30, waveform: 'sawtooth',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // glitch_hit
        glitch_hit: {
            // Distorted impact stab — Glitchy hit — square with vibrato chaos and BPF
            attack: 0, sustain: 0.05, punch: 100, decay: 0.1,
            frequency: 200, minFreq: 0, slide: -0.6, deltaSlide: -0.5,
            vibratoEnable: true, vibratoDepth: 50, vibratoSpeed: 40,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: true, lpf: 5000,
            hpfEnable: true, hpf: 100,
            bpfEnable: true, bpf: 1500, bpfResonance: 3,
            volume: 0.8
        },

        // boss_defeated
        boss_defeated: {
            // Dramatic descending sting — Boss defeat — sawtooth arp with falling slide and vibrato
            attack: 0.05, sustain: 0.5, punch: 40, decay: 0.6,
            frequency: 220, minFreq: 0, slide: -0.3, deltaSlide: -0.1,
            vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 10,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.1, arpMode: 'updown',
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 6000,
            hpfEnable: false,
            volume: 0.7
        },

        // level_complete
        level_complete: {
            // Ascending victory fanfare — Level complete — square arp with vibrato, full frequency
            attack: 0.1, sustain: 0.4, punch: 0, decay: 0.5,
            frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 5,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.08, arpMode: 'updown',
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // forest_ambience
        forest_ambience: {
            // Rustling leaves background — Forest ambience — pink noise with LPF for airy texture
            attack: 0.5, sustain: 1, punch: 0, decay: 0.5,
            frequency: 100, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'pink_noise',
            lpfEnable: true, lpf: 4000, lpfResonance: 2,
            hpfEnable: true, hpf: 50,
            sustainLevel: 40,
            volume: 0.4
        },

        // water_splash
        water_splash: {
            // Liquid burst impact — Water splash — brown noise with punch and vibrato
            attack: 0.005, sustain: 0.15, punch: 60, decay: 0.2,
            frequency: 500, minFreq: 0, slide: -0.2, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 15,
            arpEnable: false,
            duty: 0, waveform: 'brown_noise',
            lpfEnable: true, lpf: 4000,
            hpfEnable: true, hpf: 300,
            volume: 0.7
        },

        // bit8_coin
        bit8_coin: {
            // 8-bit coin ping — 8-bit coin — high square arp with bitcrush
            attack: 0, sustain: 0.02, punch: 0, decay: 0.08,
            frequency: 1500, minFreq: 0, slide: 0.2, deltaSlide: 0.1,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.04,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            bitcrushEnable: true, bitcrush: 3,
            volume: 0.5
        },

            // ── CLASSIC SFXR ──────────────────────────────────────────────────
        // sonar
        sonar: {
            // Haunting underwater ping — Sonar ping — sine with vibrato and falling slide
            attack: 0.01, sustain: 0.3, punch: 0, decay: 0.4,
            frequency: 880, minFreq: 0, slide: -0.5, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 8,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // whoosh
        whoosh: {
            // Fast air rush sweep — Whoosh — noise with vibrato, LPF and HPF shaping
            attack: 0.05, sustain: 0.2, punch: 0, decay: 0.3,
            frequency: 400, minFreq: 0, slide: -0.2, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 5,
            arpEnable: false,
            duty: 50, waveform: 'noise',
            lpfEnable: true, lpf: 2500,
            hpfEnable: true, hpf: 100,
            volume: 0.6
        },

        // helicopter
        helicopter: {
            // Rhythmic rotor chop — Helicopter — sawtooth with heavy vibrato and LPF
            attack: 0.1, sustain: 0.6, punch: 0, decay: 0.2,
            frequency: 100, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 15,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 600,
            hpfEnable: false,
            volume: 0.5
        },

        // clock_ticking
        clock_ticking: {
            // Precise mechanical tick — Clock tick — very short high square with punch
            attack: 0.001, sustain: 0.03, punch: 80, decay: 0.02,
            frequency: 2000, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.3
        },

        // metallic_clang
        metallic_clang: {
            // Ringing metal impact — Metal clang — sawtooth with vibrato ring-out
            attack: 0.001, sustain: 0.1, punch: 60, decay: 0.3,
            frequency: 400, minFreq: 0, slide: -0.1, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 20,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 3000,
            hpfEnable: true, hpf: 100,
            volume: 0.7
        },

        // wood_impact
        wood_impact: {
            // Dull hollow thud — Wood impact — brown noise with LPF for warm thud
            attack: 0.001, sustain: 0.03, punch: 70, decay: 0.1,
            frequency: 180, minFreq: 50, slide: -0.2, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'brown_noise',
            lpfEnable: true, lpf: 1500,
            hpfEnable: true, hpf: 100,
            volume: 0.8
        },

        // glass_shatter
        glass_shatter: {
            // Crystalline high shatter — Glass break — high noise burst with vibrato, falling slide
            attack: 0.001, sustain: 0.1, punch: 80, decay: 0.3,
            frequency: 2500, minFreq: 0, slide: -0.5, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 30,
            arpEnable: false,
            duty: 50, waveform: 'noise',
            lpfEnable: true, lpf: 8000,
            hpfEnable: false,
            volume: 0.7
        },

        // fire_crackle
        fire_crackle: {
            // Warm crackling flame — Fire crackle — brown noise with LPF and slow vibrato
            attack: 0.1, sustain: 0.5, punch: 0, decay: 0.4,
            frequency: 100, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 10,
            arpEnable: false,
            duty: 0, waveform: 'brown_noise',
            lpfEnable: true, lpf: 3000,
            hpfEnable: true, hpf: 80,
            volume: 0.5
        },

        // wind_howl
        wind_howl: {
            // Eerie howling gust — Wind howl — pink noise with vibrato and slow attack
            attack: 0.3, sustain: 0.8, punch: 0, decay: 0.4,
            frequency: 150, minFreq: 0, slide: 0.1, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 3,
            arpEnable: false,
            duty: 0, waveform: 'pink_noise',
            lpfEnable: true, lpf: 1500,
            hpfEnable: true, hpf: 50,
            volume: 0.5
        },

            // ── ADVANCED FX ──────────────────────────────────────────────────
        // advanced
        advanced: {
            // Harmonically rich bass — Distorted sawtooth bass with custom BPF routing and harmonics
            attack: 0.01, sustain: 0.15, punch: 40, decay: 0.25,
            frequency: 110, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 1200, lpfResonance: 3,
            hpfEnable: true, hpf: 60,
            distortionEnable: true, distortion: 45,
            harmonic2: 50,
            harmonic3: 25,
            volume: 0.75
        },

        // phased_sweep
        phased_sweep: {
            // Sweeping phaser rise — Sawtooth sweep with phase delay offset and vibrato
            attack: 0.05, sustain: 0.3, punch: 0, decay: 0.4,
            frequency: 440, minFreq: 0, slide: 0.3, deltaSlide: 0.05,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 8,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 4000,
            hpfEnable: false,
            volume: 0.6
        },

        // space_echo
        space_echo: {
            // Spacious reverb ping — Echoing sine tone with delay feedback for space/reverb effect
            attack: 0.02, sustain: 0.4, punch: 0, decay: 0.5,
            frequency: 660, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 5,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            delayEnable: true, delayTime: 0.25, delayFeedback: 40,
            volume: 0.5
        },

        // retro_organ
        retro_organ: {
            // Warm vintage keys — Sawtooth organ tone with LPF warmth and harmonics
            attack: 0.01, sustain: 0.5, punch: 0, decay: 0.1,
            frequency: 220, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 3000,
            hpfEnable: false,
            sustainLevel: 25,
            volume: 0.5
        },

        // bitcrush_bass
        bitcrush_bass: {
            // Gritty lo-fi bass — Square bass with bitcrush for lo-fi grit
            attack: 0.01, sustain: 0.15, punch: 30, decay: 0.2,
            frequency: 130, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            bitcrushEnable: true, bitcrush: 5,
            volume: 0.6
        },

        // filtered_sweep
        filtered_sweep: {
            // Resonant filter rise — Square wave with rising slide, LPF resonance and BPF shaping
            attack: 0.02, sustain: 0.3, punch: 0, decay: 0.3,
            frequency: 880, minFreq: 0, slide: 0.4, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: true, lpf: 8000, lpfResonance: 6,
            hpfEnable: false,
            bpfEnable: true, bpf: 2000, bpfResonance: 3,
            volume: 0.6
        },

        // metallic_echo
        metallic_echo: {
            // Ringing metallic delay — Sawtooth with delay feedback and vibrato ring-out
            attack: 0.001, sustain: 0.15, punch: 40, decay: 0.4,
            frequency: 880, minFreq: 0, slide: -0.1, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 15,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 5000,
            hpfEnable: false,
            delayEnable: true, delayTime: 0.15, delayFeedback: 50,
            volume: 0.6
        },

        // lofi_pad
        lofi_pad: {
            // Hazy warm dreampad — Lo-fi ambient triangle pad with harmonics and slow attack
            attack: 0.2, sustain: 0.8, punch: 0, decay: 0.5,
            frequency: 330, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 10, vibratoSpeed: 3,
            arpEnable: false,
            duty: 50, waveform: 'triangle',
            lpfEnable: true, lpf: 3500, lpfResonance: 1,
            hpfEnable: false,
            bitcrushEnable: true, bitcrush: 2,
            harmonic2: 20,
            harmonic3: 8,
            volume: 0.45
        },

            // ── MUSIC ──────────────────────────────────────────────────
        // chip_melody
        chip_melody: {
            // Bright chiptune lead — Chip tune melody — square arp with vibrato, updown mode
            attack: 0.01, sustain: 0.6, punch: 0, decay: 0.2,
            frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 8, vibratoSpeed: 6,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.12, arpMode: 'updown',
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // retro_bass_line
        retro_bass_line: {
            // Punchy synth bass — Retro bass — low square with arp and LPF warmth
            attack: 0.02, sustain: 0.8, punch: 20, decay: 0.3,
            frequency: 110, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.15,
            duty: 50, waveform: 'square',
            lpfEnable: true, lpf: 1500,
            hpfEnable: false,
            sustainLevel: 20,
            volume: 0.6
        },

        // space_arpeggio
        space_arpeggio: {
            // Cosmic sequenced notes — Space arpeggio — sine with BPF modulation and updown arp
            attack: 0.05, sustain: 0.5, punch: 0, decay: 0.4,
            frequency: 440, minFreq: 0, slide: 0.1, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 5,
            arpEnable: true, arpMult: 2, arpSpeed: 0.08, arpMode: 'updown',
            duty: 50, waveform: 'sine',
            lpfEnable: true, lpf: 6000,
            hpfEnable: false,
            bpfEnable: true, bpf: 1200, bpfResonance: 2,
            volume: 0.5
        },

        // dreamy_sequence
        dreamy_sequence: {
            // Slow ethereal pads — Dreamy triangle sequence — slow BPF arp with vibrato
            attack: 0.15, sustain: 0.7, punch: 0, decay: 0.5,
            frequency: 330, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 12, vibratoSpeed: 4,
            arpEnable: true, arpMult: 1.33, arpSpeed: 0.18, arpMode: 'updown',
            duty: 50, waveform: 'triangle',
            lpfEnable: true, lpf: 4000,
            hpfEnable: false,
            bpfEnable: true, bpf: 800, bpfResonance: 2,
            volume: 0.5
        },

        // bit8_dance
        bit8_dance: {
            // 8-bit dance groove — 8-bit dance — square arp with bitcrush and LPF
            attack: 0.01, sustain: 0.4, punch: 15, decay: 0.2,
            frequency: 659, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.2, arpSpeed: 0.06,
            duty: 25, waveform: 'square',
            lpfEnable: true, lpf: 6000,
            hpfEnable: false,
            bitcrushEnable: true, bitcrush: 4,
            volume: 0.5
        },

        // funky_waveform
        funky_waveform: {
            // Wah-wah funk stab — Funky sawtooth — arp with LPF resonance for wah character
            attack: 0.02, sustain: 0.5, punch: 30, decay: 0.25,
            frequency: 220, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 10, vibratoSpeed: 8,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.1,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 3000, lpfResonance: 4,
            hpfEnable: false,
            sustainLevel: 30,
            volume: 0.6
        },

        // arcade_tune
        arcade_tune: {
            // Bright arcade lead — Arcade melody — square arp with bitcrush and vibrato
            attack: 0.005, sustain: 0.3, punch: 10, decay: 0.15,
            frequency: 880, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 5, vibratoSpeed: 10,
            arpEnable: true, arpMult: 1.6, arpSpeed: 0.05, arpMode: 'updown',
            duty: 50, waveform: 'square',
            lpfEnable: true, lpf: 22050,
            hpfEnable: false,
            bitcrushEnable: true, bitcrush: 3,
            volume: 0.5
        },

        // synth_wave
        synth_wave: {
            // Lush sawtooth sequence — Sawtooth synth sequence — arp with BPF modulation
            attack: 0.1, sustain: 0.8, punch: 0, decay: 0.4,
            frequency: 261, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 6,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.2,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 5000,
            hpfEnable: false,
            bpfEnable: true, bpf: 1500, bpfResonance: 2,
            volume: 0.5
        },

        // glitchy_groove
        glitchy_groove: {
            // Glitch beat stutter — Glitchy beat — square with jump effect, bitcrush and BPF
            attack: 0.01, sustain: 0.35, punch: 40, decay: 0.2,
            frequency: 440, minFreq: 0, slide: 0, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 20,
            arpEnable: true, arpMult: 1.75, arpSpeed: 0.07,
            duty: 40, waveform: 'square',
            lpfEnable: true, lpf: 4000, lpfResonance: 5,
            hpfEnable: false,
            bpfEnable: true, bpf: 660, bpfResonance: 4,
            jumpEnable: true, jumpTime: 0.08, jumpFreq: 660,
            bitcrushEnable: true, bitcrush: 4,
            volume: 0.6
        },

        // cosmic_journey
        cosmic_journey: {
            // Floating space wash — Cosmic pad — slow sine arp with BPF shimmer and long envelope
            attack: 0.2, sustain: 1, punch: 0, decay: 0.6,
            frequency: 196, minFreq: 0, slide: 0.05, deltaSlide: 0.02,
            vibratoEnable: true, vibratoDepth: 18, vibratoSpeed: 3,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.25, arpMode: 'updown',
            duty: 50, waveform: 'sine',
            lpfEnable: true, lpf: 3000,
            hpfEnable: false,
            bpfEnable: true, bpf: 1000, bpfResonance: 2,
            volume: 0.5
        },

            // ── PLATFORMER 2D ──────────────────────────────────────────────────
        // victory_fanfare
        victory_fanfare: {
            // Short triumphant sting — Rapid 3-note arpeggio fanfare — bright square with vibrato, updown mode, punchy and short
            attack: 0.01, sustain: 0.25, punch: 20, decay: 0.35,
            frequency: 523, minFreq: 0, slide: 0.1, deltaSlide: 0.05,
            vibratoEnable: true, vibratoDepth: 12, vibratoSpeed: 8,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.06, arpMode: 'updown',
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.7
        },

        // panel_open_2d
        panel_open_2d: {
            // UI panel slides in — Panel swoops open — sine rising slide from low to mid, soft attack
            attack: 0.02, sustain: 0.12, punch: 0, decay: 0.15,
            frequency: 280, minFreq: 0, slide: 0.35, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.55
        },

        // panel_close_2d
        panel_close_2d: {
            // UI panel slides out — Panel swoops closed — sine falling slide from mid to low, mirrored close
            attack: 0.01, sustain: 0.1, punch: 0, decay: 0.12,
            frequency: 620, minFreq: 0, slide: -0.4, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // collectable
        collectable: {
            // Sparkly item collect — Bright gem/star/ring collect — very high square with fast arp and upward slide
            attack: 0, sustain: 0.04, punch: 15, decay: 0.1,
            frequency: 1800, minFreq: 0, slide: 0.25, deltaSlide: 0.08,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.4, arpSpeed: 0.06,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.55
        },

        // clang
        clang: {
            // Hard metal impact — Sharp metal clang — sawtooth with instant punch, fast vibrato ring-out, HPF for brightness
            attack: 0, sustain: 0.04, punch: 90, decay: 0.22,
            frequency: 350, minFreq: 0, slide: -0.15, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 35, vibratoSpeed: 25,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 6000,
            hpfEnable: true, hpf: 180,
            volume: 0.8
        },

        // wobble
        wobble: {
            // Springy rubber bounce — Rubbery wobble — sine with heavy vibrato giving a cartoon spring/bounce feel
            attack: 0.005, sustain: 0.18, punch: 30, decay: 0.2,
            frequency: 380, minFreq: 0, slide: 0.15, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 60, vibratoSpeed: 18,
            arpEnable: false,
            duty: 0, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // checkpoint
        checkpoint: {
            // Reached a save point — Save point activated — 2-note ascending arp, satisfying but brief. More restrained than quest_complete
            attack: 0.01, sustain: 0.15, punch: 0, decay: 0.25,
            frequency: 660, minFreq: 0, slide: 0.1, deltaSlide: 0.04,
            vibratoEnable: true, vibratoDepth: 8, vibratoSpeed: 6,
            arpEnable: true, arpMult: 1.33, arpSpeed: 0.09,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // button_click_2d
        button_click_2d: {
            // Soft menu button tap — Soft UI button press — triangle wave for warmth, very short, slight downward slide
            attack: 0, sustain: 0.025, punch: 0, decay: 0.06,
            frequency: 900, minFreq: 0, slide: -0.08, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // boing
        boing: {
            // Springboard launch — Classic cartoon boing — sine with extreme positive slide, high punch, instant attack
            attack: 0, sustain: 0.08, punch: 60, decay: 0.28,
            frequency: 180, minFreq: 0, slide: 0.85, deltaSlide: 0.1,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.65
        },

        // quest_complete
        quest_complete: {
            // Objective cleared fanfare — Quest objective complete — longer triangle arp with vibrato and delta slide, more rewarding than checkpoint
            attack: 0.02, sustain: 0.35, punch: 0, decay: 0.4,
            frequency: 500, minFreq: 0, slide: 0.15, deltaSlide: 0.08,
            vibratoEnable: true, vibratoDepth: 12, vibratoSpeed: 5,
            arpEnable: true, arpMult: 1.25, arpSpeed: 0.08, arpMode: 'updown',
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.65
        },

        // pickup_2d
        pickup_2d: {
            // Quick item grab — Instant item pickup — very high bright square, tiny positive slide, ultra short
            attack: 0, sustain: 0.03, punch: 10, decay: 0.07,
            frequency: 2200, minFreq: 0, slide: 0.12, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.5
        },

        // enter_portal
        enter_portal: {
            // Pulled into portal — Entering a portal — sine descends with vibrato, LPF closes down, sucked-inward feel
            attack: 0.03, sustain: 0.25, punch: 0, decay: 0.35,
            frequency: 880, minFreq: 0, slide: -0.5, deltaSlide: -0.05,
            vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 8,
            arpEnable: false,
            duty: 0, waveform: 'sine',
            lpfEnable: true, lpf: 3000,
            hpfEnable: false,
            volume: 0.6
        },

        // exit_portal
        exit_portal: {
            // Emerging from portal — Exiting a portal — sine rises with vibrato, expanding outward feel
            attack: 0.02, sustain: 0.2, punch: 10, decay: 0.35,
            frequency: 220, minFreq: 0, slide: 0.55, deltaSlide: 0.05,
            vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 8,
            arpEnable: false,
            duty: 0, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.6
        },

        // footstep_2d
        footstep_2d: {
            // Generic platform step — Light platformer footstep — short noise burst, punchy, HPF for tap crispness
            attack: 0.003, sustain: 0.018, punch: 50, decay: 0.06,
            frequency: 400, minFreq: 30, slide: -0.08, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 7000,
            hpfEnable: true, hpf: 250,
            volume: 0.7
        },

        // land_hard
        land_hard: {
            // Heavy landing impact — Player lands from a height — low punchy noise thud, instant, LPF keeps bass weight
            attack: 0, sustain: 0.04, punch: 80, decay: 0.18,
            frequency: 120, minFreq: 10, slide: -0.2, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'noise',
            lpfEnable: true, lpf: 2500,
            hpfEnable: true, hpf: 40,
            volume: 0.85
        },

        // hurt
        hurt: {
            // Player takes damage — Damage hit — square descends steeply with vibrato buzz, classic game hurt sound
            attack: 0, sustain: 0.08, punch: 20, decay: 0.18,
            frequency: 340, minFreq: 0, slide: -0.7, deltaSlide: -0.05,
            vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 25,
            arpEnable: false,
            duty: 50, waveform: 'square',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.7
        },

        // power_down
        power_down: {
            // Power lost / death — Losing a life or power — sawtooth descends with accelerating pitch drop, longer and more dramatic
            attack: 0.01, sustain: 0.3, punch: 0, decay: 0.55,
            frequency: 520, minFreq: 0, slide: -0.4, deltaSlide: -0.12,
            vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 6,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 4000,
            hpfEnable: false,
            volume: 0.7
        },

        // spring
        spring: {
            // Spring platform bounce — Spring platform — fast ascending arp with delta slide, punchy, distinct from boing
            attack: 0, sustain: 0.06, punch: 40, decay: 0.2,
            frequency: 300, minFreq: 0, slide: 0.6, deltaSlide: 0.15,
            vibratoEnable: false,
            arpEnable: true, arpMult: 1.5, arpSpeed: 0.04,
            duty: 0, waveform: 'sine',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.65
        },

        // door_open
        door_open: {
            // Wooden door swings open — Wooden door opening — low sawtooth creaks upward slowly, LPF keeps wood warmth
            attack: 0.04, sustain: 0.28, punch: 0, decay: 0.3,
            frequency: 140, minFreq: 40, slide: 0.12, deltaSlide: 0,
            vibratoEnable: true, vibratoDepth: 18, vibratoSpeed: 6,
            arpEnable: false,
            duty: 50, waveform: 'sawtooth',
            lpfEnable: true, lpf: 1000,
            hpfEnable: false,
            volume: 0.65
        },

        // coin_drop
        coin_drop: {
            // Coin tinks on ground — Coin hitting the floor — triangle with slight downward slide and punch, bright tink
            attack: 0, sustain: 0.03, punch: 70, decay: 0.14,
            frequency: 1400, minFreq: 0, slide: -0.12, deltaSlide: 0,
            vibratoEnable: false,
            arpEnable: false,
            duty: 0, waveform: 'triangle',
            lpfEnable: false,
            hpfEnable: false,
            volume: 0.55
        }
        };
    }

    get(name, includeDefaults = true) {
        const preset = this.presets[name];
        if (!preset) return null;

        if (includeDefaults) {
            const defaults = {
                attack: 0,
                sustain: 0.1,
                punch: 0,
                decay: 0.2,
                frequency: 440,
                minFreq: 0,
                slide: 0,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                arpMode: 'up',
                duty: 50,
                dutySweep: 0,
                waveform: 'square',
                lpfEnable: false,
                lpf: 22050,
                lpfResonance: 0,
                hpfEnable: false,
                hpf: 0,
                hpfResonance: 0,
                bpfEnable: false,
                bpf: 2000,
                bpfResonance: 0,
                jumpEnable: false,
                jumpTime: 0.05,
                jumpFreq: 800,
                bitcrushEnable: false,
                bitcrush: 4,
                distortionEnable: false,
                distortion: 20,
                delayEnable: false,
                delayTime: 0.2,
                delayFeedback: 30,
                harmonic2: 0,
                harmonic3: 0,
                sustainLevel: 100,
                decayShape: 'linear',
                volume: 0.5,
                gain: -10
            };
            return { ...defaults, ...preset };
        }
        return { ...preset };
    }

    getAll() {
        return Object.keys(this.presets);
    }

    // Get all preset names within a category
    getByCategory(category) {
        return Object.entries(this.presets)
            .filter(([_, v]) => v._category === category)
            .map(([k]) => k);
    }

    add(name, settings) {
        this.presets[name] = { ...settings };
    }

    remove(name) {
        if (this.presets.hasOwnProperty(name)) {
            delete this.presets[name];
            return true;
        }
        return false;
    }

    // Generate a random preset with plausible constraints
    generateRandom() {
        const waveforms = ['square', 'sine', 'triangle', 'sawtooth', 'noise', 'brown_noise', 'pink_noise'];
        return {
            attack:          Math.random() * 0.2,
            sustain:         Math.random() * 0.5,
            sustainLevel:    50 + Math.random() * 50,
            punch:           Math.random() * 100,
            decay:           Math.random() * 1,
            decayShape:      Math.random() > 0.5 ? 'exponential' : 'linear',
            frequency:       100 + Math.random() * 1500,
            minFreq:         Math.random() * 500,
            slide:           (Math.random() - 0.5) * 2,
            deltaSlide:      (Math.random() - 0.5) * 0.5,
            vibratoEnable:   Math.random() > 0.7,
            vibratoDepth:    Math.random() * 50,
            vibratoSpeed:    Math.random() * 30,
            arpEnable:       Math.random() > 0.7,
            arpMult:         0.5 + Math.random() * 1.5,
            arpSpeed:        Math.random() * 0.5,
            jumpEnable:      Math.random() > 0.8,
            jumpTime:        Math.random() * 0.1,
            jumpFreq:        500 + Math.random() * 1000,
            bitcrushEnable:  Math.random() > 0.8,
            bitcrush:        Math.floor(Math.random() * 7) + 1,
            distortionEnable: Math.random() > 0.8,
            distortion:      Math.random() * 50,
            delayEnable:     Math.random() > 0.85,
            delayTime:       0.1 + Math.random() * 0.3,
            delayFeedback:   20 + Math.random() * 40,
            duty:            Math.random() * 100,
            dutySweepEnable: Math.random() > 0.8,
            dutySweep:       (Math.random() - 0.5) * 100,
            harmonic2:       Math.random() * 50,
            harmonic3:       Math.random() * 30,
            lpfResonance:    Math.random() * 5,
            hpfResonance:    Math.random() * 5,
            bpfEnable:       Math.random() > 0.9,
            bpf:             500 + Math.random() * 3000,
            bpfResonance:    Math.random() * 5,
            waveform:        waveforms[Math.floor(Math.random() * waveforms.length)],
            volume:          0.5
        };
    }
}

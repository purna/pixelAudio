// presets.js - Sound presets and random generation

class Presets {
    constructor() {
        this.presets = {
            // --- GAME FX ---
            pickup: {
                attack: 0, sustain: 0.075, punch: 48, decay: 0.053,
                frequency: 1243, minFreq: 3, slide: 0, deltaSlide: 0,
                vibratoEnable: false, vibratoDepth: 0, vibratoSpeed: 0,
                arpEnable: true, arpMult: 1.18, arpSpeed: 0.085,
                duty: 50, waveform: 'square',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.5
            },
            laser: {
                attack: 0, sustain: 0.15, punch: 0, decay: 0.3,
                frequency: 800, minFreq: 100, slide: -0.5, deltaSlide: 0,
                vibratoEnable: false, duty: 25, waveform: 'square',
                lpfEnable: true, lpf: 8000, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            explosion: {
                attack: 0, sustain: 0.5, punch: 80, decay: 0.8,
                frequency: 80, minFreq: 20, slide: -0.3, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'noise',
                lpfEnable: true, lpf: 1500, hpfEnable: true, hpf: 100,
                volume: 0.8
            },
            powerup: {
                attack: 0, sustain: 0.2, punch: 0, decay: 0.4,
                frequency: 200, minFreq: 0, slide: 0.6, deltaSlide: 0.1,
                vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 10,
                arpEnable: false, duty: 50, waveform: 'sine',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            hit: {
                attack: 0, sustain: 0.05, punch: 100, decay: 0.15,
                frequency: 150, minFreq: 0, slide: -0.8, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'square',
                lpfEnable: true, lpf: 3000, hpfEnable: true, hpf: 50,
                volume: 0.7
            },
            jump: {
                attack: 0, sustain: 0.1, punch: 50, decay: 0.25,
                frequency: 400, minFreq: 0, slide: 0.4, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'square',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            blip: {
                attack: 0, sustain: 0.04, punch: 0, decay: 0.08,
                frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'sine',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            
            // --- FOOTSTEPS ---
            step_stone: {
                attack: 0.005, sustain: 0.02, punch: 40, decay: 0.08,
                frequency: 300, minFreq: 50, slide: -0.1, deltaSlide: 0,
                vibratoEnable: false, waveform: 'noise',
                lpfEnable: true, lpf: 8000, hpfEnable: true, hpf: 400,
                volume: 0.8
            },
            step_wood: {
                attack: 0.01, sustain: 0.03, punch: 10, decay: 0.08,
                frequency: 150, minFreq: 50, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'noise',
                lpfEnable: true, lpf: 1200, hpfEnable: true, hpf: 100,
                volume: 1.0 // Wood needs more gain as it's filtered heavily
            },
            step_sand: {
                attack: 0.02, sustain: 0.05, punch: 0, decay: 0.15,
                frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'noise',
                lpfEnable: true, lpf: 3000, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            step_gravel: {
                attack: 0.005, sustain: 0.05, punch: 50, decay: 0.12,
                frequency: 600, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'noise',
                lpfEnable: true, lpf: 5000, hpfEnable: true, hpf: 200,
                volume: 0.7
            },
            step_snow: {
                attack: 0.01, sustain: 0.08, punch: 20, decay: 0.15,
                frequency: 1200, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'noise',
                lpfEnable: true, lpf: 6000, hpfEnable: true, hpf: 800,
                volume: 0.5
            },

            // --- UI / SYNTH ---
            click: {
                attack: 0, sustain: 0.02, punch: 0, decay: 0.05,
                frequency: 1200, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'square',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.5
            },
            hover: {
                attack: 0.01, sustain: 0.06, punch: 0, decay: 0.05,
                frequency: 1000, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'triangle',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.4
            },
            synth_pad: {
                attack: 0.1, sustain: 0.3, punch: 0, decay: 0.2,
                frequency: 440, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 5,
                arpEnable: false, duty: 50, waveform: 'sawtooth',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            alarm: {
                 attack: 0.01, sustain: 0.2, punch: 0, decay: 0.1,
                 frequency: 880, minFreq: 0, slide: 0, deltaSlide: 0,
                 vibratoEnable: false, arpEnable: true, arpMult: 1.5, arpSpeed: 0.15,
                 waveform: 'square', volume: 0.6
            },
            
            // --- SF MAKER INSPIRED ---
            sword_swing: {
                attack: 0.01, sustain: 0.1, punch: 0, decay: 0.15,
                frequency: 600, minFreq: 0, slide: -0.4, deltaSlide: 0,
                vibratoEnable: false, waveform: 'noise',
                lpfEnable: true, lpf: 4000, hpfEnable: false, hpf: 0,
                volume: 0.7
            },
            shield_block: {
                attack: 0.001, sustain: 0.05, punch: 80, decay: 0.2,
                frequency: 200, minFreq: 50, slide: 0, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'square',
                lpfEnable: true, lpf: 3000, hpfEnable: true, hpf: 100,
                volume: 0.8
            },
            magic_spell: {
                attack: 0.05, sustain: 0.3, punch: 0, decay: 0.4,
                frequency: 880, minFreq: 0, slide: 0.2, deltaSlide: 0.1,
                vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 15,
                arpEnable: false, waveform: 'sine',
                lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            coin_collect: {
                attack: 0, sustain: 0.03, punch: 0, decay: 0.1,
                frequency: 2000, minFreq: 0, slide: 0.3, deltaSlide: 0.5,
                vibratoEnable: false, arpEnable: true, arpMult: 1.5, arpSpeed: 0.08,
                waveform: 'square', lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            door_creak: {
                attack: 0.02, sustain: 0.2, punch: 0, decay: 0.3,
                frequency: 150, minFreq: 50, slide: -0.1, deltaSlide: 0,
                vibratoEnable: false, duty: 50, waveform: 'sawtooth',
                lpfEnable: true, lpf: 800, hpfEnable: false, hpf: 0,
                volume: 0.7
            },
            engine: {
                attack: 0.1, sustain: 0.4, punch: 0, decay: 0.1,
                frequency: 80, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 20,
                waveform: 'sawtooth', duty: 50,
                lpfEnable: true, lpf: 400, hpfEnable: false, hpf: 0,
                volume: 0.6
            },
            bubble_pop: {
                attack: 0.001, sustain: 0.02, punch: 100, decay: 0.05,
                frequency: 800, minFreq: 0, slide: -0.5, deltaSlide: 0,
                vibratoEnable: false, waveform: 'sine',
                lpfEnable: true, lpf: 6000, hpfEnable: false, hpf: 0,
                volume: 0.5
            },
            retro_explosion: {
                attack: 0, sustain: 0.3, punch: 100, decay: 0.5,
                frequency: 100, minFreq: 0, slide: -0.4, deltaSlide: -0.2,
                vibratoEnable: true, vibratoDepth: 50, vibratoSpeed: 30,
                waveform: 'noise',
                lpfEnable: true, lpf: 2000, hpfEnable: true, hpf: 50,
                volume: 0.9
            },
            powerup_arcade: {
                attack: 0.02, sustain: 0.4, punch: 0, decay: 0.3,
                frequency: 330, minFreq: 0, slide: 0.5, deltaSlide: 0.15,
                vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 8,
                arpEnable: true, arpMult: 1.25, arpSpeed: 0.06,
                waveform: 'square', duty: 50,
                lpfEnable: false, hpfEnable: false,
                volume: 0.6
            },
            laser_retro: {
                attack: 0, sustain: 0.1, punch: 0, decay: 0.2,
                frequency: 1200, minFreq: 0, slide: -0.8, deltaSlide: 0,
                vibratoEnable: false, duty: 25, waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            
            // --- ENHANCED SF MAKER FEATURES ---
            thunder: {
                attack: 0.01, sustain: 0.5, punch: 50, decay: 0.8,
                frequency: 60, minFreq: 20, slide: -0.1, deltaSlide: -0.05,
                vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 5,
                waveform: 'brown_noise',
                lpfEnable: true, lpf: 2000, lpfResonance: 4, hpfEnable: true, hpf: 30,
                volume: 1.0
            },
            volcanic_eruption: {
                attack: 0, sustain: 0.8, punch: 80, decay: 1.0,
                frequency: 40, minFreq: 10, slide: 0, deltaSlide: -0.02,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 3,
                waveform: 'brown_noise',
                lpfEnable: true, lpf: 3000, lpfResonance: 6, hpfEnable: true, hpf: 20,
                volume: 1.0
            },
            bit8_jump: {
                attack: 0, sustain: 0.08, punch: 30, decay: 0.2,
                frequency: 400, minFreq: 0, slide: 0.5, deltaSlide: 0,
                jumpEnable: true, jumpTime: 0.05, jumpFreq: 800,
                vibratoEnable: false, waveform: 'square',
                bitcrushEnable: true, bitcrush: 4,
                lpfEnable: false, hpfEnable: false,
                volume: 0.6
            },
            sci_fi_laser: {
                attack: 0.001, sustain: 0.15, punch: 0, decay: 0.25,
                frequency: 1500, minFreq: 0, slide: -0.9, deltaSlide: 0,
                jumpEnable: true, jumpTime: 0.02, jumpFreq: 2000,
                vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 25,
                arpEnable: true, arpMult: 1.33, arpSpeed: 0.03,
                waveform: 'sawtooth', duty: 30,
                lpfEnable: false, hpfEnable: true, hpf: 200,
                volume: 0.5
            },
            glitch_hit: {
                attack: 0, sustain: 0.05, punch: 100, decay: 0.1,
                frequency: 200, minFreq: 0, slide: -0.6, deltaSlide: -0.5,
                vibratoEnable: true, vibratoDepth: 50, vibratoSpeed: 40,
                waveform: 'square',
                bitcrushEnable: true, bitcrush: 6,
                lpfEnable: true, lpf: 5000, hpfEnable: true, hpf: 100,
                volume: 0.8
            },
            boss_defeated: {
                attack: 0.05, sustain: 0.5, punch: 40, decay: 0.6,
                frequency: 220, minFreq: 0, slide: -0.3, deltaSlide: -0.1,
                vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 10,
                arpEnable: true, arpMult: 1.5, arpSpeed: 0.1, arpMode: 'updown',
                waveform: 'sawtooth',
                lpfEnable: true, lpf: 6000, lpfResonance: 5, hpfEnable: false,
                volume: 0.7
            },
            level_complete: {
                attack: 0.1, sustain: 0.4, punch: 0, decay: 0.5,
                frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 5,
                arpEnable: true, arpMult: 1.25, arpSpeed: 0.08, arpMode: 'updown',
                waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.6
            },
            forest_ambience: {
                attack: 0.5, sustain: 1.0, punch: 0, decay: 0.5,
                frequency: 100, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'pink_noise',
                lpfEnable: true, lpf: 4000, lpfResonance: 2, hpfEnable: true, hpf: 200,
                volume: 0.4
            },
            water_splash: {
                attack: 0.005, sustain: 0.15, punch: 60, decay: 0.2,
                frequency: 500, minFreq: 0, slide: -0.2, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 15,
                waveform: 'brown_noise',
                lpfEnable: true, lpf: 4000, hpfEnable: true, hpf: 300,
                volume: 0.7
            },
            bit8_coin: {
                attack: 0, sustain: 0.02, punch: 0, decay: 0.08,
                frequency: 1500, minFreq: 0, slide: 0.2, deltaSlide: 0.8,
                arpEnable: true, arpMult: 1.5, arpSpeed: 0.04,
                waveform: 'square',
                bitcrushEnable: true, bitcrush: 3,
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            
            // --- CLASSIC SFXR SOUNDS ---
            sonar: {
                attack: 0.01, sustain: 0.3, punch: 0, decay: 0.4,
                frequency: 880, minFreq: 0, slide: -0.5, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 8,
                waveform: 'sine',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            whoosh: {
                attack: 0.05, sustain: 0.2, punch: 0, decay: 0.3,
                frequency: 400, minFreq: 0, slide: -0.2, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 5,
                waveform: 'noise',
                lpfEnable: true, lpf: 2500, hpfEnable: true, hpf: 100,
                volume: 0.6
            },
            helicopter: {
                attack: 0.1, sustain: 0.6, punch: 0, decay: 0.2,
                frequency: 100, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 15,
                waveform: 'sawtooth',
                lpfEnable: true, lpf: 600, hpfEnable: false,
                volume: 0.5
            },
            error: {
                attack: 0, sustain: 0.1, punch: 0, decay: 0.15,
                frequency: 200, minFreq: 0, slide: -0.5, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 50, vibratoSpeed: 50,
                arpEnable: false, waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            success: {
                attack: 0.02, sustain: 0.1, punch: 0, decay: 0.15,
                frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, arpEnable: true, arpMult: 1.25, arpSpeed: 0.08,
                waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            keyboard: {
                attack: 0, sustain: 0.02, punch: 0, decay: 0.02,
                frequency: 800, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.3
            },
            switch_select: {
                attack: 0, sustain: 0.01, punch: 0, decay: 0.02,
                frequency: 1500, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, duty: 30, waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.4
            },
            menu_move: {
                attack: 0, sustain: 0.03, punch: 0, decay: 0.04,
                frequency: 600, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'triangle',
                lpfEnable: false, hpfEnable: false,
                volume: 0.4
            },
            ui_confirm: {
                attack: 0.01, sustain: 0.05, punch: 0, decay: 0.08,
                frequency: 440, minFreq: 0, slide: 0.1, deltaSlide: 0,
                vibratoEnable: false, waveform: 'sine',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            ui_cancel: {
                attack: 0.01, sustain: 0.05, punch: 0, decay: 0.08,
                frequency: 220, minFreq: 0, slide: -0.1, deltaSlide: 0,
                vibratoEnable: false, waveform: 'sawtooth',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            clock_ticking: {
                attack: 0.001, sustain: 0.02, punch: 80, decay: 0.02,
                frequency: 2000, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false, waveform: 'square',
                lpfEnable: true, lpf: 8000, hpfEnable: false,
                volume: 0.3
            },
            metallic_clang: {
                attack: 0.001, sustain: 0.1, punch: 60, decay: 0.3,
                frequency: 400, minFreq: 0, slide: -0.1, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 20,
                waveform: 'sawtooth',
                lpfEnable: true, lpf: 3000, lpfResonance: 8, hpfEnable: false,
                volume: 0.7
            },
            wood_impact: {
                attack: 0.001, sustain: 0.03, punch: 70, decay: 0.1,
                frequency: 180, minFreq: 50, slide: -0.2, deltaSlide: 0,
                vibratoEnable: false, waveform: 'brown_noise',
                lpfEnable: true, lpf: 1500, hpfEnable: true, hpf: 100,
                volume: 0.8
            },
            glass_shatter: {
                attack: 0.001, sustain: 0.1, punch: 80, decay: 0.3,
                frequency: 2500, minFreq: 0, slide: -0.5, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 40, vibratoSpeed: 30,
                waveform: 'noise',
                lpfEnable: true, lpf: 8000, hpfEnable: false,
                volume: 0.7
            },
            fire_crackle: {
                attack: 0.1, sustain: 0.5, punch: 0, decay: 0.4,
                frequency: 100, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 10,
                waveform: 'brown_noise',
                lpfEnable: true, lpf: 3000, hpfEnable: true, hpf: 200,
                volume: 0.5
            },
            wind_howl: {
                attack: 0.3, sustain: 0.8, punch: 0, decay: 0.4,
                frequency: 150, minFreq: 0, slide: 0.1, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 3,
                waveform: 'pink_noise',
                lpfEnable: true, lpf: 1500, hpfEnable: true, hpf: 50,
                volume: 0.5
            },
            
            // --- ADVANCED FX WITH NEW FEATURES ---
            distorted_bass: {
                attack: 0.01, sustain: 0.2, punch: 20, decay: 0.3,
                frequency: 110, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false,
                harmonic2: 30, harmonic3: 15,
                duty: 50, waveform: 'sawtooth',
                distortionEnable: true, distortion: 40,
                lpfEnable: true, lpf: 2000, lpfResonance: 3,
                volume: 0.7
            },
            phased_sweep: {
                attack: 0.05, sustain: 0.3, punch: 0, decay: 0.4,
                frequency: 440, minFreq: 0, slide: 0.3, deltaSlide: 0.05,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 8,
                harmonic2: 25,
                duty: 50, dutySweepEnable: true, dutySweep: 30,
                waveform: 'sawtooth',
                lpfEnable: true, lpf: 4000, lpfResonance: 4,
                volume: 0.6
            },
            space_echo: {
                attack: 0.02, sustain: 0.4, punch: 0, decay: 0.5,
                frequency: 660, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 5,
                waveform: 'sine',
                delayEnable: true, delayTime: 0.25, delayFeedback: 40,
                volume: 0.5
            },
            retro_organ: {
                attack: 0.01, sustain: 0.5, punch: 0, decay: 0.1,
                frequency: 220, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false,
                harmonic2: 50, harmonic3: 25,
                duty: 50, waveform: 'sawtooth',
                lpfEnable: true, lpf: 3000, lpfResonance: 2,
                volume: 0.5
            },
            bitcrush_bass: {
                attack: 0.01, sustain: 0.15, punch: 30, decay: 0.2,
                frequency: 130, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false,
                harmonic2: 20,
                duty: 50, waveform: 'square',
                bitcrushEnable: true, bitcrush: 5,
                lpfEnable: true, lpf: 3000,
                volume: 0.6
            },
            filtered_sweep: {
                attack: 0.02, sustain: 0.3, punch: 0, decay: 0.3,
                frequency: 880, minFreq: 0, slide: 0.4, deltaSlide: 0,
                vibratoEnable: false,
                duty: 50, dutySweepEnable: true, dutySweep: -50,
                waveform: 'square',
                lpfEnable: true, lpf: 8000, lpfResonance: 6,
                bpfEnable: true, bpf: 2000, bpfResonance: 3,
                volume: 0.6
            },
            metallic_echo: {
                attack: 0.001, sustain: 0.15, punch: 40, decay: 0.4,
                frequency: 880, minFreq: 0, slide: -0.1, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 15,
                harmonic2: 40, harmonic3: 30,
                waveform: 'sawtooth',
                delayEnable: true, delayTime: 0.15, delayFeedback: 50,
                lpfEnable: true, lpf: 5000, lpfResonance: 5,
                volume: 0.6
            },
            lofi_pad: {
                attack: 0.2, sustain: 0.6, punch: 0, decay: 0.3,
                frequency: 330, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 10, vibratoSpeed: 3,
                harmonic2: 35, harmonic3: 20,
                waveform: 'triangle',
                bitcrushEnable: true, bitcrush: 3,
                distortionEnable: true, distortion: 15,
                lpfEnable: true, lpf: 2000, lpfResonance: 2,
                volume: 0.6
            },
            
            // --- MUSIC / SONGS ---
            chip_melody: {
                attack: 0.01, sustain: 0.6, punch: 0, decay: 0.2,
                frequency: 523, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 8, vibratoSpeed: 6,
                arpEnable: true, arpMult: 1.5, arpSpeed: 0.12, arpMode: 'updown',
                duty: 50, waveform: 'square',
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            retro_bass_line: {
                attack: 0.02, sustain: 0.8, punch: 20, decay: 0.3,
                frequency: 110, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false,
                arpEnable: true, arpMult: 1.25, arpSpeed: 0.15,
                harmonic2: 40, harmonic3: 20,
                duty: 50, waveform: 'square',
                lpfEnable: true, lpf: 1500, lpfResonance: 3,
                volume: 0.6
            },
            space_arpeggio: {
                attack: 0.05, sustain: 0.5, punch: 0, decay: 0.4,
                frequency: 440, minFreq: 0, slide: 0.1, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 15, vibratoSpeed: 5,
                arpEnable: true, arpMult: 2.0, arpSpeed: 0.08, arpMode: 'updown',
                harmonic2: 30,
                waveform: 'sine',
                delayEnable: true, delayTime: 0.2, delayFeedback: 35,
                lpfEnable: true, lpf: 6000, lpfResonance: 2,
                volume: 0.5
            },
            dreamy_sequence: {
                attack: 0.15, sustain: 0.7, punch: 0, decay: 0.5,
                frequency: 330, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 12, vibratoSpeed: 4,
                arpEnable: true, arpMult: 1.33, arpSpeed: 0.18, arpMode: 'updown',
                harmonic2: 35, harmonic3: 25,
                duty: 50, waveform: 'triangle',
                delayEnable: true, delayTime: 0.3, delayFeedback: 40,
                lpfEnable: true, lpf: 4000, lpfResonance: 2,
                volume: 0.5
            },
            bit8_dance: {
                attack: 0.01, sustain: 0.4, punch: 15, decay: 0.2,
                frequency: 659, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: false,
                arpEnable: true, arpMult: 1.2, arpSpeed: 0.06,
                duty: 25, dutySweepEnable: true, dutySweep: 20,
                waveform: 'square',
                bitcrushEnable: true, bitcrush: 4,
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            funky_waveform: {
                attack: 0.02, sustain: 0.5, punch: 30, decay: 0.25,
                frequency: 220, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 10, vibratoSpeed: 8,
                arpEnable: true, arpMult: 1.5, arpSpeed: 0.1,
                harmonic2: 45, harmonic3: 30,
                duty: 30, dutySweepEnable: true, dutySweep: 40,
                waveform: 'sawtooth',
                lpfEnable: true, lpf: 3000, lpfResonance: 4,
                volume: 0.6
            },
            arcade_tune: {
                attack: 0.005, sustain: 0.3, punch: 10, decay: 0.15,
                frequency: 880, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 5, vibratoSpeed: 10,
                arpEnable: true, arpMult: 1.6, arpSpeed: 0.05, arpMode: 'updown',
                duty: 50, waveform: 'square',
                bitcrushEnable: true, bitcrush: 3,
                lpfEnable: false, hpfEnable: false,
                volume: 0.5
            },
            synth_wave: {
                attack: 0.1, sustain: 0.8, punch: 0, decay: 0.4,
                frequency: 261, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 20, vibratoSpeed: 6,
                arpEnable: true, arpMult: 1.25, arpSpeed: 0.2,
                harmonic2: 40, harmonic3: 25,
                duty: 50, waveform: 'sawtooth',
                delayEnable: true, delayTime: 0.25, delayFeedback: 30,
                lpfEnable: true, lpf: 5000, lpfResonance: 3,
                volume: 0.5
            },
            glitchy_groove: {
                attack: 0.01, sustain: 0.35, punch: 40, decay: 0.2,
                frequency: 440, minFreq: 0, slide: 0, deltaSlide: 0,
                vibratoEnable: true, vibratoDepth: 25, vibratoSpeed: 20,
                arpEnable: true, arpMult: 1.75, arpSpeed: 0.07,
                jumpEnable: true, jumpTime: 0.08, jumpFreq: 660,
                duty: 40, waveform: 'square',
                bitcrushEnable: true, bitcrush: 5,
                distortionEnable: true, distortion: 20,
                lpfEnable: true, lpf: 4000, lpfResonance: 5,
                volume: 0.6
            },
            cosmic_journey: {
                attack: 0.2, sustain: 1.0, punch: 0, decay: 0.6,
                frequency: 196, minFreq: 0, slide: 0.05, deltaSlide: 0.02,
                vibratoEnable: true, vibratoDepth: 18, vibratoSpeed: 3,
                arpEnable: true, arpMult: 1.5, arpSpeed: 0.25, arpMode: 'updown',
                harmonic2: 50, harmonic3: 35,
                waveform: 'sine',
                delayEnable: true, delayTime: 0.35, delayFeedback: 45,
                lpfEnable: true, lpf: 3000, lpfResonance: 2,
                volume: 0.5
            }
        };
    }

    get(name, includeDefaults = true) {
        const preset = this.presets[name];
        if (!preset) return null;
        
        if (includeDefaults) {
            // Merge with default values to ensure all required properties exist
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

    // Generate random with constraints
    generateRandom() {
        const waveforms = ['square', 'sine', 'triangle', 'sawtooth', 'noise', 'brown_noise', 'pink_noise'];
        return {
            attack: Math.random() * 0.2,
            sustain: Math.random() * 0.5,
            sustainLevel: 50 + Math.random() * 50,
            punch: Math.random() * 100,
            decay: Math.random() * 1,
            decayShape: Math.random() > 0.5 ? 'exponential' : 'linear',
            frequency: 100 + Math.random() * 1500,
            minFreq: Math.random() * 500,
            slide: (Math.random() - 0.5) * 2,
            deltaSlide: (Math.random() - 0.5) * 0.5,
            vibratoEnable: Math.random() > 0.7,
            vibratoDepth: Math.random() * 50,
            vibratoSpeed: Math.random() * 30,
            arpEnable: Math.random() > 0.7,
            arpMult: 0.5 + Math.random() * 1.5,
            arpSpeed: Math.random() * 0.5,
            jumpEnable: Math.random() > 0.8,
            jumpTime: Math.random() * 0.1,
            jumpFreq: 500 + Math.random() * 1000,
            bitcrushEnable: Math.random() > 0.8,
            bitcrush: Math.floor(Math.random() * 7) + 1,
            distortionEnable: Math.random() > 0.8,
            distortion: Math.random() * 50,
            delayEnable: Math.random() > 0.85,
            delayTime: 0.1 + Math.random() * 0.3,
            delayFeedback: 20 + Math.random() * 40,
            duty: Math.random() * 100,
            dutySweepEnable: Math.random() > 0.8,
            dutySweep: (Math.random() - 0.5) * 100,
            harmonic2: Math.random() * 50,
            harmonic3: Math.random() * 30,
            lpfResonance: Math.random() * 5,
            hpfResonance: Math.random() * 5,
            bpfEnable: Math.random() > 0.9,
            bpf: 500 + Math.random() * 3000,
            bpfResonance: Math.random() * 5,
            waveform: waveforms[Math.floor(Math.random() * waveforms.length)],
            volume: 0.5
        };
    }
}

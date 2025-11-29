// presets.js - Sound presets and random generation

class Presets {
    constructor() {
        this.presets = {
            pickup: {
                attack: 0,
                sustain: 0.075,
                punch: 48,
                decay: 0.053,
                frequency: 1243,
                minFreq: 3,
                slide: 0,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: true,
                arpMult: 1.18,
                arpSpeed: 0.085,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -10.93
            },
            laser: {
                attack: 0,
                sustain: 0.15,
                punch: 0,
                decay: 0.3,
                frequency: 800,
                minFreq: 100,
                slide: -0.5,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 25,
                dutySweep: -20,
                lpfEnable: true,
                lpf: 8000,
                hpfEnable: false,
                hpf: 0,
                gain: -8
            },
            explosion: {
                attack: 0,
                sustain: 0.5,
                punch: 80,
                decay: 0.8,
                frequency: 80,
                minFreq: 20,
                slide: -0.3,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: true,
                lpf: 1500,
                hpfEnable: true,
                hpf: 100,
                gain: -6
            },
            powerup: {
                attack: 0,
                sustain: 0.2,
                punch: 0,
                decay: 0.4,
                frequency: 200,
                minFreq: 0,
                slide: 0.6,
                deltaSlide: 0.1,
                vibratoEnable: true,
                vibratoDepth: 30,
                vibratoSpeed: 10,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -12
            },
            hit: {
                attack: 0,
                sustain: 0.05,
                punch: 100,
                decay: 0.15,
                frequency: 150,
                minFreq: 0,
                slide: -0.8,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: true,
                lpf: 3000,
                hpfEnable: true,
                hpf: 50,
                gain: -8
            },
            jump: {
                attack: 0,
                sustain: 0.1,
                punch: 50,
                decay: 0.25,
                frequency: 400,
                minFreq: 0,
                slide: 0.4,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -10
            },
            click: {
                attack: 0,
                sustain: 0.02,
                punch: 0,
                decay: 0.05,
                frequency: 1200,
                minFreq: 0,
                slide: 0,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -15
            },
            blip: {
                attack: 0,
                sustain: 0.04,
                punch: 0,
                decay: 0.08,
                frequency: 800,
                minFreq: 0,
                slide: 0,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -12
            },
            hover: {
                attack: 0.01,
                sustain: 0.06,
                punch: 0,
                decay: 0.05,
                frequency: 1000,
                minFreq: 0,
                slide: 0,
                deltaSlide: 0,
                vibratoEnable: false,
                vibratoDepth: 0,
                vibratoSpeed: 0,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -18
            },
            synth: {
                attack: 0.1,
                sustain: 0.3,
                punch: 0,
                decay: 0.2,
                frequency: 440,
                minFreq: 0,
                slide: 0,
                deltaSlide: 0,
                vibratoEnable: true,
                vibratoDepth: 20,
                vibratoSpeed: 5,
                arpEnable: false,
                arpMult: 1,
                arpSpeed: 0,
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -10
            },
            tone: {
                attack: 0.05,
                sustain: 0.5,
                punch: 0,
                decay: 0.1,
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
                duty: 50,
                dutySweep: 0,
                lpfEnable: false,
                lpf: 22050,
                hpfEnable: false,
                hpf: 0,
                gain: -12
            }
        };
    }

    get(name) {
        return this.presets[name] ? { ...this.presets[name] } : null;
    }

    getAll() {
        return Object.keys(this.presets);
    }

    add(name, settings) {
        this.presets[name] = { ...settings };
    }

    remove(name) {
        delete this.presets[name];
    }

    generateRandom() {
        return {
            attack: Math.random() * 0.2,
            sustain: Math.random() * 0.5,
            punch: Math.random() * 100,
            decay: Math.random() * 1,
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
            duty: Math.random() * 100,
            dutySweep: (Math.random() - 0.5) * 100,
            lpfEnable: Math.random() > 0.5,
            lpf: 1000 + Math.random() * 21050,
            hpfEnable: Math.random() > 0.7,
            hpf: Math.random() * 1000,
            gain: -20 + Math.random() * 15
        };
    }

    // Generate random with constraints (for specific types of sounds)
    generateRandomType(type) {
        const templates = {
            ui: {
                attack: [0, 0.01],
                sustain: [0.02, 0.1],
                punch: [0, 50],
                decay: [0.05, 0.15],
                frequency: [800, 1500],
                minFreq: [0, 0],
                slide: [-0.2, 0.2],
                deltaSlide: [0, 0],
                vibratoEnable: false,
                duty: [40, 60],
                gain: [-20, -10]
            },
            game: {
                attack: [0, 0.05],
                sustain: [0.05, 0.3],
                punch: [0, 100],
                decay: [0.1, 0.5],
                frequency: [100, 1000],
                minFreq: [0, 200],
                slide: [-0.8, 0.8],
                deltaSlide: [-0.3, 0.3],
                duty: [30, 70],
                gain: [-15, -5]
            }
        };

        const template = templates[type] || templates.game;
        const settings = this.generateRandom();

        // Apply template constraints
        for (let key in template) {
            if (Array.isArray(template[key])) {
                const [min, max] = template[key];
                settings[key] = min + Math.random() * (max - min);
            } else {
                settings[key] = template[key];
            }
        }

        return settings;
    }
}

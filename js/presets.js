// js/presets.js
import { getActiveLayer } from './layerManager.js';
import { updateControlsFromLayer } from './ui.js';
import { refreshTimeline } from './timeline.js';

const presets = {
    pickup: { attack: 0, sustain: 0.075, punch: 48, decay: 0.053, frequency: 1243, minFreq: 3, slide: 0, deltaSlide: 0, vibratoEnable: false, vibratoDepth: 0, vibratoSpeed: 0, arpEnable: true, arpMult: 1.18, arpSpeed: 0.085, duty: 50, dutySweep: 0, lpfEnable: false, lpf: 22050, hpfEnable: false, hpf: 0, gain: -10.93 },
    laser: { attack: 0, sustain: 0.15, punch: 0, decay: 0.3, frequency: 800, minFreq: 100, slide: -0.5, deltaSlide: 0, duty: 25, dutySweep: -20, lpfEnable: true, lpf: 8000, gain: -8 },
    explosion: { attack: 0, sustain: 0.5, punch: 80, decay: 0.8, frequency: 80, minFreq: 20, slide: -0.3, deltaSlide: 0, lpfEnable: true, lpf: 1500, hpfEnable: true, hpf: 100, gain: -6 },
    powerup: { attack: 0, sustain: 0.2, punch: 0, decay: 0.4, frequency: 200, slide: 0.6, deltaSlide: 0.1, vibratoEnable: true, vibratoDepth: 30, vibratoSpeed: 10, gain: -12 },
    hit: { attack: 0, sustain: 0.05, punch: 100, decay: 0.15, frequency: 150, slide: -0.8, lpfEnable: true, lpf: 3000, hpfEnable: true, hpf: 50, gain: -8 },
    jump: { attack: 0, sustain: 0.1, punch: 50, decay: 0.25, frequency: 400, slide: 0.4, gain: -10 },
    click: { attack: 0, sustain: 0.02, decay: 0.05, frequency: 1200, gain: -15 },
    blip: { attack: 0, sustain: 0.04, decay: 0.08, frequency: 800, gain: -12 },
    hover: { attack: 0.01, sustain: 0.06, decay: 0.05, frequency: 1000, gain: -18 },
};

export function loadPreset(name) {
    const layer = getActiveLayer();
    if (!layer) return;

    let settings = presets[name];
    if (name === 'random') {
        settings = {
            attack: Math.random() * 0.3,
            sustain: Math.random() * 0.6,
            punch: Math.random() * 100,
            decay: Math.random() * 1.5,
            frequency: 100 + Math.random() * 1900,
            minFreq: Math.random() * 500,
            slide: (Math.random() - 0.5) * 4,
            deltaSlide: (Math.random() - 0.5) * 1,
            vibratoEnable: Math.random() > 0.7,
            vibratoDepth: Math.random() * 60,
            vibratoSpeed: Math.random() * 30,
            arpEnable: Math.random() > 0.6,
            arpMult: 0.5 + Math.random() * 2.5,
            arpSpeed: Math.random() * 0.5,
            duty: Math.random() * 100,
            dutySweep: (Math.random() - 0.5) * 200,
            lpfEnable: Math.random() > 0.4,
            lpf: 1000 + Math.random() * 21000,
            hpfEnable: Math.random() > 0.7,
            hpf: Math.random() * 2000,
            gain: -20 + Math.random() * 15
        };
    }

    Object.assign(layer.settings, settings);
    layer.buffer = null;
    updateControlsFromLayer(layer);
    refreshTimeline();
    layer.play();
}

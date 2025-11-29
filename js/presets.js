// js/presets.js
const presets = {
    pickup: { attack: 0, sustain: 0.075, punch: 48, decay: 0.053, frequency: 1243, ... },
    laser: { attack: 0, sustain: 0.15, punch: 0, decay: 0.3, frequency: 800, slide: -0.5, ... },
    explosion: { attack: 0, sustain: 0.5, punch: 80, decay: 0.8, frequency: 80, lpfEnable: true, lpf: 1500, ... },
    // ... all your presets
};

export function loadPreset(name, layer) {
    let settings = presets[name];
    if (name === 'random') {
        settings = generateRandomSettings();
    }
    if (settings) {
        Object.assign(layer.settings, settings);
        layer.updateControls();
        layer.play();
    }
}

function generateRandomSettings() { /* same as your randomize() */ }

// js/layerManager.js

import { createLayer, layers, getActiveLayer, setActiveLayer, playAll, exportMixWAV } from './layerManager.js';
import { generateBuffer } from './soundGenerator.js';
import { getAudioContext, bufferToWave } from './audioEngine.js';
import { updateControlsFromLayer, renderLayersList } from './ui.js';

export const layers = [];
let activeLayerId = null;

export function createLayer(name = `Layer ${layers.length + 1}`) {
    const layer = {
        id: Date.now() + Math.random(),
        name,
        muted: false,
        solo: false,
        settings: getDefaultSettings(),
        buffer: null,

        updateControls() {
            updateControlsFromLayer(this);
        },

        play() {
            if (this.muted) return;
            if (!this.buffer) this.buffer = generateBuffer(this.settings);
            const src = getAudioContext().createBufferSource();
            src.buffer = this.buffer;
            src.connect(getAudioContext().destination);
            src.start();
        },

        exportWAV() {
            if (!this.buffer) this.buffer = generateBuffer(this.settings);
            const wav = bufferToWave(this.buffer);
            downloadBlob(new Blob([wav], {type: 'audio/wav'}), `${this.name}.wav`);
        }
    };

    layers.push(layer);
    renderLayersList();
    return layer;
}

export function getActiveLayer() {
    return layers.find(l => l.id === activeLayerId);
}

export function setActiveLayer(id) {
    activeLayerId = id;
    const layer = layers.find(l => l.id === id);
    updateControlsFromLayer(layer);
    renderLayersList();
}

// Play all non-muted (respecting solo)
export function playAll() {
    const hasSolo = layers.some(l => l.solo);
    layers.forEach(l => {
        if (!l.muted && (!hasSolo || l.solo)) {
            l.play();
        }
    });
}

export function exportMixWAV() {
    // Simple sequential mix for now (Phase 5 will improve with timeline)
    const ctx = getAudioContext();
    const maxLen = Math.max(...layers.filter(l => !l.muted).map(l => l.buffer?.length || 0));
    const mix = ctx.createBuffer(1, maxLen, ctx.sampleRate);
    const data = mix.getChannelData(0);

    layers.forEach(l => {
        if (l.muted || !l.buffer) return;
        const buf = l.buffer.getChannelData(0);
        for (let i = 0; i < buf.length; i++) {
            data[i] += buf[i] / layers.filter(x => !x.muted).length;
        }
    });

    const wav = bufferToWave(mix);
    downloadBlob(new Blob([wav], {type: 'audio/wav'}), 'mix.wav');
}

function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
}

function getDefaultSettings() {
    return {
        attack: 0, sustain: 0.1, punch: 0, decay: 0.2,
        frequency: 440, minFreq: 0, slide: 0, deltaSlide: 0,
        vibratoEnable: false, vibratoDepth: 0, vibratoSpeed: 0,
        arpEnable: false, arpMult: 1, arpSpeed: 0,
        duty: 50, dutySweep: 0,
        lpfEnable: false, lpf: 22050,
        hpfEnable: false, hpf: 0,
        gain: -10
    };
}

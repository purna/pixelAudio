// js/ui.js
import { layers, setActiveLayer, getActiveLayer } from './layerManager.js';

const controlsHTML = `...`; // (your original controls HTML – I’ll provide shortened version)

export function initUI() {
    document.getElementById('controlsContainer').innerHTML = controlsHTML;
    attachSliderListeners();
}

export function updateControlsFromLayer(layer) {
    if (!layer) return;
    Object.keys(layer.settings).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') el.checked = layer.settings[key];
            else el.value = layer.settings[key];
        }
    });
    updateValueDisplays(layer.settings);
}

function attachSliderListeners() {
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => {
            const layer = getActiveLayer();
            if (!layer) return;
            const key = el.id;
            layer.settings[key] = el.type === 'checkbox' ? el.checked : parseFloat(el.value);
            updateValueDisplays(layer.settings);
            layer.buffer = null; // invalidate cache
        });
    });
}

export function renderLayersList() {
    const list = document.getElementById('layersList');
    list.innerHTML = layers.map(l => `
        <div class="layer-item ${l.id === (getActiveLayer()?.id) ? 'active' : ''}" data-id="${l.id}">
            <input value="${l.name}" class="layer-name">
            <button class="solo">${l.solo ? 'S' : '◦'}</button>
            <button class="mute">${l.muted ? 'M' : '◦'}</button>
            <button class="delete">×</button>
        </div>
    `).join('');

    // Bind events...
}

// js/main.js
import { initAudio } from './audioEngine.js';
import { initUI, renderLayersList, updateControlsFromLayer } from './ui.js';
import { createLayer, getActiveLayer, setActiveLayer, layers, playAll, exportMixWAV } from './layerManager.js';
import { loadPreset } from './presets.js';
import { saveProject, loadProjectFromFile, autoSave, autoLoad } from './fileManager.js';
import { initTimeline } from './timeline.js';

export function init() {
    initAudio();
    initUI();
    initTimeline();

    // === CREATE FIRST LAYER (this was missing!) ===
    const firstLayer = createLayer("Layer 1");
    setActiveLayer(firstLayer.id);
    updateControlsFromLayer(firstLayer);
    renderLayersList();   // <-- THIS WAS MISSING

    // === BUTTONS ===
    document.getElementById('addLayer').onclick = () => {
        const layer = createLayer(`Layer ${layers.length + 1}`);
        setActiveLayer(layer.id);
        renderLayersList();
    };

    document.getElementById('newProject').onclick = () => {
        if (confirm('Start new project? All layers will be deleted.')) {
            layers.length = 0;
            createLayer("Layer 1");
            setActiveLayer(layers[0].id);
            renderLayersList();
        }
    };

    document.getElementById('saveProject').onclick = saveProject;
    document.getElementById('loadProjectBtn').onclick = () => document.getElementById('loadProjectInput').click();
    document.getElementById('loadProjectInput').onchange = loadProjectFromFile;
    document.getElementById('exportMix').onclick = exportMixWAV;
    document.getElementById('playAll').onclick = playAll;
    document.getElementById('exportLayer').onclick = () => getActiveLayer()?.exportWAV();

    // === PRESETS ===
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.onclick = () => loadPreset(btn.dataset.preset);
    });
    document.querySelector('[data-action="randomize"]').onclick = () => loadPreset('random');

    // === AUTO SAVE/LOAD ===
    autoLoad();
    setInterval(autoSave, 8000);
}

// Start the app
window.addEventListener('DOMContentLoaded', init);

// js/main.js
import { initAudio } from './audioEngine.js';
import { initUI, updateControlsFromLayer } from './ui.js';
import { createLayer, getActiveLayer, setActiveLayer, layers, playAll, exportMixWAV } from './layerManager.js';
import { loadPreset } from './presets.js';
import { saveProject, loadProjectFromFile, autoSave, autoLoad } from './fileManager.js';

export function init() {
    initAudio();
    initUI();

    // Create first layer
    createLayer();
    setActiveLayer(layers[0].id);
    updateControlsFromLayer(getActiveLayer());

    // UI Events
    document.getElementById('addLayer').onclick = () => {
        const layer = createLayer();
        setActiveLayer(layer.id);
    };

    document.getElementById('newProject').onclick = () => {
        if (confirm('Start new project?')) {
            while (layers.length) layers.pop().destroy?.();
            createLayer();
            setActiveLayer(layers[0].id);
        }
    };

    document.getElementById('saveProject').onclick = saveProject;
    document.getElementById('loadProjectBtn').onclick = () => document.getElementById('loadProject').click();
    document.getElementById('loadProject').onchange = loadProjectFromFile;
    document.getElementById('exportMix').onclick = exportMixWAV;
    document.getElementById('playAll').onclick = playAll;
    document.getElementById('exportLayer').onclick = () => getActiveLayer().exportWAV();

    // Presets
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.onclick = () => loadPreset(btn.dataset.preset, getActiveLayer());
    });
    document.querySelector('[data-action="randomize"]').onclick = () => {
        loadPreset('random', getActiveLayer());
    };

    // Auto load/save
    autoLoad();
    setInterval(autoSave, 5000);
}

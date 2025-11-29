// js/fileManager.js
import { layers, createLayer, setActiveLayer } from './layerManager.js';

export function saveProject() {
    const data = {
        layers: layers.map(l => ({ name: l.name, settings: l.settings, muted: l.muted, solo: l.solo }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sfx-project.json'; a.click();
}

export function loadProjectFromFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = ev => {
        const data = JSON.parse(ev.target.result);
        layers.length = 0;
        data.layers.forEach(l => {
            const layer = createLayer(l.name);
            Object.assign(layer.settings, l.settings);
            layer.muted = l.muted; layer.solo = l.solo;
        });
        setActiveLayer(layers[0].id);
    };
    reader.readAsText(file);
}

export function autoSave() {
    const data = { layers: layers.map(l => ({name: l.name, settings: l.settings})) };
    localStorage.setItem('sfx-auto-save', JSON.stringify(data));
}

export function autoLoad() {
    const saved = localStorage.getItem('sfx-auto-save');
    if (saved) {
        // same as load logic
    }
}

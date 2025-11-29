// layerManager.js - Manage multiple sound layers + UI rendering

class LayerManager {
    constructor(app) {
        this.app = app;
        this.layers = [];
        this.nextLayerId = 1;
        this.selectedLayerId = null;
    }

    init() {
        this.addLayer('Layer 1');
        this.renderList(); // Initial render
    }

    addLayer(name = null) {
        const layerName = name || `Layer ${this.nextLayerId}`;
        const layer = {
            id: this.nextLayerId++,
            name: layerName,
            settings: { ...this.app.getDefaultSettings() },
            muted: false,
            solo: false,
            volume: 1.0,
            startTime: 0,
            fadeIn: 0,
            fadeOut: 0,
            color: this.generateRandomColor()
        };

        this.layers.push(layer);
        this.selectedLayerId = layer.id;

        this.notifyLayerChange();
        return layer;
    }

    removeLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) return;

        if (this.layers.length <= 1) {
            this.app.ui.showNotification('Cannot delete the last layer', 'error');
            return;
        }

        if (!confirm(`Delete layer "${this.layers[index].name}"?`)) return;

        this.layers.splice(index, 1);

        if (this.selectedLayerId === layerId) {
            this.selectedLayerId = this.layers.length > 0 ? this.layers[0].id : null;
        }

        this.notifyLayerChange();
    }

    getLayer(layerId) {
        return this.layers.find(l => l.id === layerId);
    }

    getSelectedLayer() {
        return this.getLayer(this.selectedLayerId);
    }

    selectLayer(layerId) {
        const layer = this.getLayer(layerId);
        if (layer) {
            this.selectedLayerId = layerId;
            this.app.updateSettings(layer.settings);
            this.notifyLayerChange();
        }
    }

    updateLayer(layerId, updates) {
        const layer = this.getLayer(layerId);
        if (layer) {
            Object.assign(layer, updates);
            this.notifyLayerChange();
        }
    }

    updateLayerSettings(layerId, settings) {
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.settings = { ...layer.settings, ...settings };
            this.notifyLayerChange();
        }
    }

    renameLayer(layerId, newName) {
        if (!newName || newName.trim() === '') return;
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.name = newName.trim();
            this.notifyLayerChange();
        }
    }

    toggleMute(layerId) {
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.muted = !layer.muted;
            this.notifyLayerChange();
        }
    }

    toggleSolo(layerId) {
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.solo = !layer.solo;
            this.notifyLayerChange();
        }
    }

    setLayerVolume(layerId, volume) {
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.volume = Math.max(0, Math.min(1, volume));
            this.notifyLayerChange();
        }
    }

    moveLayer(layerId, direction) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index === -1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < this.layers.length) {
            [this.layers[index], this.layers[newIndex]] = [this.layers[newIndex], this.layers[index]];
            this.notifyLayerChange();
        }
    }

    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    getActiveLayers() {
        const hasSolo = this.layers.some(l => l.solo);
        return this.layers.filter(layer => {
            if (hasSolo) return layer.solo;
            return !layer.muted;
        });
    }

    generateLayerBuffers() {
        const activeLayers = this.getActiveLayers();
        const buffers = [];
        const volumes = [];

        for (const layer of activeLayers) {
            const buffer = this.app.soundGenerator.generate(
                layer.settings,
                this.app.audioEngine.sampleRate
            );
            buffers.push(buffer);
            volumes.push(layer.volume);
        }

        return { buffers, volumes };
    }

    playAllLayers() {
        const { buffers, volumes } = this.generateLayerBuffers();
        if (buffers.length === 0) return;

        if (buffers.length === 1) {
            this.app.audioEngine.playBuffer(buffers[0]);
        } else {
            const mixedBuffer = this.app.audioEngine.mixBuffers(buffers, volumes);
            this.app.audioEngine.playBuffer(mixedBuffer);
        }
    }

    exportMixedAudio(filename = 'mixed_sfx.wav') {
        const { buffers, volumes } = this.generateLayerBuffers();
        if (buffers.length === 0) return;

        const mixedBuffer = buffers.length === 1
            ? buffers[0]
            : this.app.audioEngine.mixBuffers(buffers, volumes);

        this.app.audioEngine.downloadWAV(mixedBuffer, filename);
    }

    getState() {
        return {
            layers: this.layers.map(l => ({ ...l })),
            nextLayerId: this.nextLayerId,
            selectedLayerId: this.selectedLayerId
        };
    }

    setState(state) {
        this.layers = state.layers.map(l => ({ ...l }));
        this.nextLayerId = state.nextLayerId;
        this.selectedLayerId = state.selectedLayerId;

        if (this.selectedLayerId) {
            const layer = this.getLayer(this.selectedLayerId);
            if (layer) this.app.updateSettings(layer.settings);
        }

        this.notifyLayerChange();
    }

    clearAllLayers() {
        this.layers = [];
        this.nextLayerId = 1;
        this.selectedLayerId = null;
        this.notifyLayerChange();
    }

    notifyLayerChange() {
        this.renderList(); // Now handled internally
        const event = new CustomEvent('layersChanged', {
            detail: { layers: this.layers, selectedId: this.selectedLayerId }
        });
        document.dispatchEvent(event);
    }

    // ——————————————————————
    // UI: Render Layer List (like your pixel editor)
    // ——————————————————————
    renderList() {
        const list = document.getElementById('layersList');
        if (!list) return;

        list.innerHTML = '';

        // Show layers from top to bottom (reverse order)
        const displayLayers = [...this.layers].reverse();

        displayLayers.forEach(layer => {
            const div = document.createElement('div');
            div.className = `layer-item ${layer.id === this.selectedLayerId ? 'active' : ''}`;

            // Mute / Visibility toggle
            const muteBtn = document.createElement('i');
            muteBtn.className = `fas fa-eye${layer.muted ? '-slash' : ''} layer-vis-btn ${layer.muted ? 'hidden-layer' : ''}`;
            muteBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleMute(layer.id);
            };

            // Layer name (editable)
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'layer-name-input';
            nameInput.value = layer.name;
            nameInput.onclick = e => e.stopPropagation();
            nameInput.onblur = () => this.renameLayer(layer.id, nameInput.value.trim() || 'Layer');
            nameInput.onkeydown = e => {
                if (e.key === 'Enter') nameInput.blur();
            };

            // Delete button
            const delBtn = document.createElement('i');
            delBtn.className = 'fas fa-trash';
            delBtn.style.color = '#f44336';
            delBtn.style.fontSize = '12px';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeLayer(layer.id);
            };

            div.appendChild(muteBtn);
            div.appendChild(nameInput);
            div.appendChild(delBtn);

            // Click = select layer + go to Settings tab
            div.onclick = (e) => {
                if (e.target === nameInput || e.target === muteBtn || e.target === delBtn) return;
                this.selectLayer(layer.id);
                document.querySelector('[data-tab="settings"]')?.click();
            };

            list.appendChild(div);
        });
    }
}

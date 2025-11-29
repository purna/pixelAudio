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
        this.selectLayer(1); // Select the first layer
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

    // NEW: Duplicate layer functionality
    duplicateLayer(sourceLayer) {
        const layer = {
            id: this.nextLayerId++,
            name: sourceLayer.name + ' Copy',
            settings: { ...sourceLayer.settings },
            muted: sourceLayer.muted,
            solo: false, // Don't duplicate solo state
            volume: sourceLayer.volume,
            startTime: sourceLayer.startTime + 0.5, // Offset slightly
            fadeIn: sourceLayer.fadeIn,
            fadeOut: sourceLayer.fadeOut,
            color: this.generateRandomColor()
        };

        this.layers.push(layer);
        this.selectedLayerId = layer.id;
        
        // Update app settings and UI to reflect the new layer
        this.app.currentSettings = { ...layer.settings };
        if (this.app.ui) {
            this.app.ui.updateDisplay(layer.settings);
        }

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

        // FAILSAFE: Always ensure at least one layer exists
        if (this.layers.length === 0) {
            this.addLayer('Layer 1');
            return;
        }

        // Select another layer if we deleted the selected one
        if (this.selectedLayerId === layerId) {
            const newSelectedLayer = this.layers[Math.min(index, this.layers.length - 1)];
            this.selectLayer(newSelectedLayer.id);
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
            
            // ALWAYS update app settings and UI when selecting a layer
            this.app.currentSettings = { ...layer.settings };
            if (this.app.ui) {
                this.app.ui.updateDisplay(layer.settings);
            }
            
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
            
            // If this is the selected layer, update the app and UI immediately
            if (layerId === this.selectedLayerId) {
                this.app.currentSettings = { ...layer.settings };
                if (this.app.ui) {
                    this.app.ui.updateDisplay(layer.settings);
                }
            }
            
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
        const activeLayers = this.getActiveLayers();
        if (activeLayers.length === 0) return;
    
        this.app.audioEngine.stopAll(); // Clear any ongoing playback
    
        activeLayers.forEach(layer => {
            const buffer = this.app.soundGenerator.generate(layer.settings, this.app.audioEngine.sampleRate);
            const source = this.app.audioEngine.context.createBufferSource();
            source.buffer = buffer;
    
            // Create gain node for volume and fades
            const gainNode = this.app.audioEngine.context.createGain();
            gainNode.gain.value = layer.volume;
            source.connect(gainNode);
            gainNode.connect(this.app.audioEngine.context.destination);
    
            // Apply fades (linear ramp)
            if (layer.fadeIn > 0) {
                gainNode.gain.setValueAtTime(0, this.app.audioEngine.context.currentTime + layer.startTime);
                gainNode.gain.linearRampToValueAtTime(layer.volume, this.app.audioEngine.context.currentTime + layer.startTime + layer.fadeIn);
            }
            if (layer.fadeOut > 0) {
                const duration = this.app.soundGenerator.calculateDuration(layer.settings);
                gainNode.gain.setValueAtTime(layer.volume, this.app.audioEngine.context.currentTime + layer.startTime + duration - layer.fadeOut);
                gainNode.gain.linearRampToValueAtTime(0, this.app.audioEngine.context.currentTime + layer.startTime + duration);
            }
    
            // Schedule start
            source.start(this.app.audioEngine.context.currentTime + layer.startTime);
        });
    }

    exportMixedAudio(filename = 'mixed_sfx.wav') {
        const activeLayers = this.getActiveLayers();
        if (activeLayers.length === 0) return;
    
        const buffers = [];
        const volumes = [];
        const offsets = [];
        const sampleRate = this.app.audioEngine.sampleRate;
    
        for (const layer of activeLayers) {
            const buffer = this.app.soundGenerator.generate(layer.settings, sampleRate);
            buffers.push(buffer);
            volumes.push(layer.volume);
            offsets.push(Math.floor(layer.startTime * sampleRate)); // Samples offset
        }
    
        const mixedBuffer = this.app.audioEngine.mixBuffers(buffers, volumes, offsets);
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

    // ————————————————————————————————————————————————————————
    // UI: Render Layer List with volume controls
    // ————————————————————————————————————————————————————————
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
            muteBtn.title = layer.muted ? 'Unmute layer' : 'Mute layer';
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

            // Volume control
            const volumeContainer = document.createElement('div');
            volumeContainer.className = 'layer-volume-container';
            volumeContainer.onclick = e => e.stopPropagation();
            
            const volumeSlider = document.createElement('input');
            volumeSlider.type = 'range';
            volumeSlider.className = 'layer-volume-slider';
            volumeSlider.min = '0';
            volumeSlider.max = '100';
            volumeSlider.value = (layer.volume * 100).toFixed(0);
            volumeSlider.title = `Volume: ${(layer.volume * 100).toFixed(0)}%`;
            volumeSlider.oninput = (e) => {
                e.stopPropagation();
                const newVolume = parseFloat(e.target.value) / 100;
                this.setLayerVolume(layer.id, newVolume);
                e.target.title = `Volume: ${(newVolume * 100).toFixed(0)}%`;
            };
            
            const volumeIcon = document.createElement('i');
            volumeIcon.className = 'fas fa-volume-up';
            volumeIcon.style.fontSize = '10px';
            volumeIcon.style.color = 'var(--text-secondary)';
            volumeIcon.style.marginRight = '4px';
            
            volumeContainer.appendChild(volumeIcon);
            volumeContainer.appendChild(volumeSlider);

            // Action buttons container
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'layer-actions';
            actionsContainer.onclick = e => e.stopPropagation();

            // Duplicate button
            const dupBtn = document.createElement('i');
            dupBtn.className = 'fas fa-copy';
            dupBtn.style.color = 'var(--accent-tertiary)';
            dupBtn.style.fontSize = '12px';
            dupBtn.title = 'Duplicate layer';
            dupBtn.onclick = (e) => {
                e.stopPropagation();
                this.app.saveUndoState();
                this.duplicateLayer(layer);
                this.app.ui.showNotification('Layer duplicated', 'success');
            };

            // Delete button
            const delBtn = document.createElement('i');
            delBtn.className = 'fas fa-trash';
            delBtn.style.color = '#f44336';
            delBtn.style.fontSize = '12px';
            delBtn.title = 'Delete layer';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.app.saveUndoState();
                this.removeLayer(layer.id);
            };

            actionsContainer.appendChild(dupBtn);
            actionsContainer.appendChild(delBtn);

            div.appendChild(muteBtn);
            div.appendChild(nameInput);
            div.appendChild(volumeContainer);
            div.appendChild(actionsContainer);

            // Click = select layer
            div.onclick = (e) => {
                if (e.target === nameInput || e.target === muteBtn || e.target === delBtn || 
                    e.target === volumeSlider || e.target === dupBtn) return;
                this.selectLayer(layer.id);
            };

            list.appendChild(div);
        });
    }
}

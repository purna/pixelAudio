// layerManager.js - Manage multiple sound layers

class LayerManager {
    constructor(app) {
        this.app = app;
        this.layers = [];
        this.nextLayerId = 1;
        this.selectedLayerId = null;
    }

    init() {
        // Create initial layer
        this.addLayer('Layer 1');
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
        if (index !== -1) {
            this.layers.splice(index, 1);
            
            // Select another layer if this was selected
            if (this.selectedLayerId === layerId) {
                this.selectedLayerId = this.layers.length > 0 ? this.layers[0].id : null;
            }
            
            this.notifyLayerChange();
        }
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
        const layer = this.getLayer(layerId);
        if (layer) {
            layer.name = newName;
            this.notifyLayerChange();
        }
    }

    duplicateLayer(layerId) {
        const layer = this.getLayer(layerId);
        if (layer) {
            const newLayer = {
                ...layer,
                id: this.nextLayerId++,
                name: `${layer.name} (Copy)`,
                settings: { ...layer.settings }
            };
            this.layers.push(newLayer);
            this.selectedLayerId = newLayer.id;
            this.notifyLayerChange();
            return newLayer;
        }
        return null;
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

    // Get all active layers for mixing
    getActiveLayers() {
        const hasSolo = this.layers.some(l => l.solo);
        
        return this.layers.filter(layer => {
            if (hasSolo) {
                return layer.solo;
            }
            return !layer.muted;
        });
    }

    // Generate buffers for all active layers
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

    // Play all active layers mixed together
    playAllLayers() {
        const { buffers, volumes } = this.generateLayerBuffers();
        
        if (buffers.length === 0) {
            console.warn('No active layers to play');
            return;
        }
        
        if (buffers.length === 1) {
            this.app.audioEngine.playBuffer(buffers[0]);
        } else {
            const mixedBuffer = this.app.audioEngine.mixBuffers(buffers, volumes);
            this.app.audioEngine.playBuffer(mixedBuffer);
        }
    }

    // Export mixed audio
    exportMixedAudio(filename = 'mixed_sfx.wav') {
        const { buffers, volumes } = this.generateLayerBuffers();
        
        if (buffers.length === 0) {
            console.warn('No active layers to export');
            return;
        }
        
        const mixedBuffer = buffers.length === 1 
            ? buffers[0] 
            : this.app.audioEngine.mixBuffers(buffers, volumes);
            
        this.app.audioEngine.downloadWAV(mixedBuffer, filename);
    }

    // State management for save/load
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
        
        // Update UI with selected layer
        if (this.selectedLayerId) {
            const layer = this.getLayer(this.selectedLayerId);
            if (layer) {
                this.app.updateSettings(layer.settings);
            }
        }
        
        this.notifyLayerChange();
    }

    clearAllLayers() {
        this.layers = [];
        this.nextLayerId = 1;
        this.selectedLayerId = null;
        this.notifyLayerChange();
    }

    // Notify other components of layer changes
    notifyLayerChange() {
        // Dispatch custom event for UI updates
        const event = new CustomEvent('layersChanged', {
            detail: { layers: this.layers, selectedId: this.selectedLayerId }
        });
        document.dispatchEvent(event);
    }
}

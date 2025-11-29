// main.js - Application initialization and global state management

class SFXGeneratorApp {
    constructor() {
        this.audioEngine = null;
        this.soundGenerator = null;
        this.presets = null;
        this.ui = null;
        this.layerManager = null;
        this.timeline = null;
        this.fileManager = null;
        
        this.currentSettings = this.getDefaultSettings();
        
        // Undo/Redo stacks
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        
        // Copy/paste layer clipboard
        this.copiedLayer = null;
    }

    async init() {
        // Initialize all modules
        this.audioEngine = new AudioEngine();
        this.soundGenerator = new SoundGenerator();
        this.presets = new Presets();
        this.layerManager = new LayerManager(this);
        this.timeline = new Timeline(this);
        this.fileManager = new FileManager(this);
        this.ui = new UI(this);

        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI first, then layers
        this.ui.init();
        this.layerManager.init(); // This will select the first layer and update UI
        this.timeline.init();

        console.log('SFX Generator initialized');
        
        // Force update the display with the first layer's settings
        const firstLayer = this.layerManager.getSelectedLayer();
        if (firstLayer) {
            this.updateSettings(firstLayer.settings);
            this.ui.updateDisplay(firstLayer.settings);
        }
        
        // Mark as initialized
        this.initialized = true;
    }

    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space bar to play
            if (e.code === 'Space' && !this.isTyping()) {
                e.preventDefault();
                this.playCurrentSound();
            }
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.fileManager.exportProject();
            }
            // Ctrl/Cmd + O to open
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.fileManager.importProject();
            }
            // Ctrl/Cmd + Z to undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Ctrl/Cmd + Shift + Z to redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.redo();
            }
            // Ctrl/Cmd + Y to redo (alternative)
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
            // Ctrl/Cmd + C to copy layer
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !this.isTyping()) {
                e.preventDefault();
                this.copyLayer();
            }
            // Ctrl/Cmd + V to paste layer
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !this.isTyping()) {
                e.preventDefault();
                this.pasteLayer();
            }
            // Ctrl/Cmd + D to duplicate layer
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !this.isTyping()) {
                e.preventDefault();
                this.duplicateLayer();
            }
        });
    }

    copyLayer() {
        const layer = this.layerManager.getSelectedLayer();
        if (layer) {
            this.copiedLayer = JSON.parse(JSON.stringify(layer));
            this.ui.showNotification('Layer copied', 'success');
        }
    }

    pasteLayer() {
        if (!this.copiedLayer) {
            this.ui.showNotification('No layer to paste', 'error');
            return;
        }
        this.saveUndoState();
        const newLayer = this.layerManager.duplicateLayer(this.copiedLayer);
        if (newLayer) {
            this.ui.showNotification('Layer pasted', 'success');
        }
    }

    duplicateLayer() {
        const layer = this.layerManager.getSelectedLayer();
        if (layer) {
            this.saveUndoState();
            const newLayer = this.layerManager.duplicateLayer(layer);
            if (newLayer) {
                this.ui.showNotification('Layer duplicated', 'success');
            }
        }
    }

    isTyping() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
    }

    getDefaultSettings() {
        return {
            attack: 0,
            sustain: 0.1,
            punch: 0,
            decay: 0.2,
            frequency: 440,
            minFreq: 0,
            slide: 0,
            deltaSlide: 0,
            vibratoEnable: false,
            vibratoDepth: 0,
            vibratoSpeed: 0,
            arpEnable: false,
            arpMult: 1,
            arpSpeed: 0,
            duty: 50,
            dutySweep: 0,
            waveform: 'square', // New: waveform type
            lpfEnable: false,
            lpf: 22050,
            hpfEnable: false,
            hpf: 0,
            gain: -10
        };
    }

    updateSettings(newSettings) {
        this.currentSettings = { ...this.currentSettings, ...newSettings };
        this.ui.updateDisplay(this.currentSettings);
    }

    playCurrentSound() {
        const buffer = this.soundGenerator.generate(
            this.currentSettings,
            this.audioEngine.sampleRate
        );
        this.audioEngine.playBuffer(buffer);
    }

    downloadCurrentSound() {
        const buffer = this.soundGenerator.generate(
            this.currentSettings,
            this.audioEngine.sampleRate
        );
        this.audioEngine.downloadWAV(buffer, `sfx_${Date.now()}.wav`);
    }

    loadPreset(presetName) {
        const preset = this.presets.get(presetName);
        if (!preset) {
            console.error('Preset not found:', presetName);
            return;
        }

        // Save state for undo
        this.saveUndoState();

        const selectedLayer = this.layerManager.getSelectedLayer();

        if (selectedLayer) {
            // Apply preset to selected layer
            this.layerManager.updateLayerSettings(selectedLayer.id, preset);
            
            // Force sync app's currentSettings
            this.currentSettings = { ...preset };
            
            // Update UI to show new values
            this.ui.updateDisplay(preset);
            
            // Redraw timeline to show updated waveform
            this.timeline.render();
            
            // Play the updated layer
            const buffer = this.soundGenerator.generate(preset, this.audioEngine.sampleRate);
            this.audioEngine.playBuffer(buffer);
        } else {
            // No layer selected - this shouldn't happen, but handle it
            console.warn('No layer selected when loading preset');
            this.currentSettings = { ...preset };
            this.ui.updateDisplay(preset);
            this.playCurrentSound();
        }
    }

    randomize() {
        const randomSettings = this.presets.generateRandom();
        
        // Save state for undo
        this.saveUndoState();
        
        const selectedLayer = this.layerManager.getSelectedLayer();
        
        if (selectedLayer) {
            // Apply to selected layer
            this.layerManager.updateLayerSettings(selectedLayer.id, randomSettings);
            
            // Force sync app's currentSettings
            this.currentSettings = { ...randomSettings };
            
            // Update UI
            this.ui.updateDisplay(randomSettings);
            
            // Redraw timeline
            this.timeline.render();
        } else {
            // Fallback
            this.currentSettings = { ...randomSettings };
            this.ui.updateDisplay(randomSettings);
        }
        
        this.playCurrentSound();
    }

    saveUndoState() {
        const state = this.getState();
        this.undoStack.push(JSON.parse(JSON.stringify(state)));
        
        // Limit undo stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) {
            this.ui.showNotification('Nothing to undo', 'info');
            return;
        }
        
        // Save current state to redo stack
        const currentState = this.getState();
        this.redoStack.push(JSON.parse(JSON.stringify(currentState)));
        
        // Restore previous state
        const previousState = this.undoStack.pop();
        this.setState(previousState);
        
        this.ui.showNotification('Undo', 'info');
    }

    redo() {
        if (this.redoStack.length === 0) {
            this.ui.showNotification('Nothing to redo', 'info');
            return;
        }
        
        // Save current state to undo stack
        const currentState = this.getState();
        this.undoStack.push(JSON.parse(JSON.stringify(currentState)));
        
        // Restore next state
        const nextState = this.redoStack.pop();
        this.setState(nextState);
        
        this.ui.showNotification('Redo', 'info');
    }

    getState() {
        return {
            version: '1.0',
            currentSettings: this.currentSettings,
            sampleRate: this.audioEngine.sampleRate,
            layers: this.layerManager.getState(),
            timeline: this.timeline.getState()
        };
    }

    setState(state) {
        if (state.currentSettings) {
            this.updateSettings(state.currentSettings);
        }
        if (state.sampleRate) {
            this.audioEngine.setSampleRate(state.sampleRate);
        }
        if (state.layers) {
            this.layerManager.setState(state.layers);
        }
        if (state.timeline) {
            this.timeline.setState(state.timeline);
        }
    }
}

// Initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new SFXGeneratorApp();
    app.init();
    
    // Mark as initialized after everything is set up
    app.initialized = true;
});

// Global function for preset buttons
function loadPreset(presetName) {
    if (app && app.initialized) {
        app.loadPreset(presetName);
    } else {
        // Wait a bit and try again
        setTimeout(() => loadPreset(presetName), 100);
    }
}

// Global function for randomize button  
function randomize() {
    if (app && app.initialized) {
        app.randomize();
    } else {
        setTimeout(randomize, 100);
    }
}

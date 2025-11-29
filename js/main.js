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
        });
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
        if (!preset) return;

        const selectedLayer = this.layerManager.getSelectedLayer();

        if (selectedLayer) {
            // Apply preset to selected layer
            this.layerManager.updateLayerSettings(selectedLayer.id, preset);
            
            // Sync app's currentSettings and UI
            this.updateSettings(preset);
            this.ui.updateDisplay(preset);
            
            // Redraw timeline to show updated waveform
            this.timeline.render();
            
            // Play the updated layer
            const buffer = this.soundGenerator.generate(preset, this.audioEngine.sampleRate);
            this.audioEngine.playBuffer(buffer);
        } else {
            // Fallback: apply globally
            this.updateSettings(preset);
            this.ui.updateDisplay(preset);
            this.playCurrentSound();
        }
    }

    randomize() {
        const randomSettings = this.presets.generateRandom();
        const selectedLayer = this.layerManager.getSelectedLayer();
        
        if (selectedLayer) {
            // Apply to selected layer
            this.layerManager.updateLayerSettings(selectedLayer.id, randomSettings);
            this.updateSettings(randomSettings);
            this.ui.updateDisplay(randomSettings);
            this.timeline.render();
        } else {
            // Fallback: apply globally
            this.updateSettings(randomSettings);
        }
        
        this.playCurrentSound();
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
});

// Make app globally accessible for inline event handlers (temporary)
window.app = app;

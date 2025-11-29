// ui.js - UI controls and display updates

class UI {
    constructor(app) {
        this.app = app;
        this.elements = {};
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateDisplay(this.app.currentSettings);
    }

    cacheElements() {
        // Sliders
        this.elements = {
            attack: document.getElementById('attack'),
            sustain: document.getElementById('sustain'),
            punch: document.getElementById('punch'),
            decay: document.getElementById('decay'),
            frequency: document.getElementById('frequency'),
            minFreq: document.getElementById('minFreq'),
            slide: document.getElementById('slide'),
            deltaSlide: document.getElementById('deltaSlide'),
            vibratoEnable: document.getElementById('vibratoEnable'),
            vibratoDepth: document.getElementById('vibratoDepth'),
            vibratoSpeed: document.getElementById('vibratoSpeed'),
            arpEnable: document.getElementById('arpEnable'),
            arpMult: document.getElementById('arpMult'),
            arpSpeed: document.getElementById('arpSpeed'),
            duty: document.getElementById('duty'),
            dutySweep: document.getElementById('dutySweep'),
            waveform: document.getElementById('waveform'), // New
            lpfEnable: document.getElementById('lpfEnable'),
            lpf: document.getElementById('lpf'),
            hpfEnable: document.getElementById('hpfEnable'),
            hpf: document.getElementById('hpf'),
            gain: document.getElementById('gain')
        };

        // Value displays
        this.displays = {
            attackVal: document.getElementById('attackVal'),
            sustainVal: document.getElementById('sustainVal'),
            punchVal: document.getElementById('punchVal'),
            decayVal: document.getElementById('decayVal'),
            freqVal: document.getElementById('freqVal'),
            minFreqVal: document.getElementById('minFreqVal'),
            slideVal: document.getElementById('slideVal'),
            deltaSlideVal: document.getElementById('deltaSlideVal'),
            vibratoDepthVal: document.getElementById('vibratoDepthVal'),
            vibratoSpeedVal: document.getElementById('vibratoSpeedVal'),
            arpMultVal: document.getElementById('arpMultVal'),
            arpSpeedVal: document.getElementById('arpSpeedVal'),
            dutyVal: document.getElementById('dutyVal'),
            dutySweepVal: document.getElementById('dutySweepVal'),
            lpfVal: document.getElementById('lpfVal'),
            hpfVal: document.getElementById('hpfVal'),
            gainVal: document.getElementById('gainVal')
        };
    }

    setupEventListeners() {
        // Add input listeners to all sliders
        for (let key in this.elements) {
            const element = this.elements[key];
            if (element) {
                element.addEventListener('input', () => {
                    this.onSettingsChange();
                });
            }
        }
    }

    onSettingsChange() {
        // Save undo state only on first change (debounced)
        if (!this.settingsChangeTimeout) {
            this.app.saveUndoState();
        }
        
        // Clear previous timeout
        if (this.settingsChangeTimeout) {
            clearTimeout(this.settingsChangeTimeout);
        }
        
        // Debounce to avoid saving too many undo states
        this.settingsChangeTimeout = setTimeout(() => {
            this.settingsChangeTimeout = null;
        }, 500);
        
        const settings = this.getSettingsFromUI();
        this.app.updateSettings(settings);
        
        // Also update the selected layer's settings
        const selectedLayer = this.app.layerManager.getSelectedLayer();
        if (selectedLayer) {
            this.app.layerManager.updateLayerSettings(selectedLayer.id, settings);
            this.app.timeline.render(); // Update waveform display
        }
    }

    getSettingsFromUI() {
        const settings = {};
        
        for (let key in this.elements) {
            const el = this.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    settings[key] = el.checked;
                } else if (el.tagName === 'SELECT') {
                    settings[key] = el.value;
                } else {
                    settings[key] = parseFloat(el.value);
                }
            }
        }
        
        return settings;
    }

    updateDisplay(settings) {
        // Always update sliders from the passed settings object
        for (let key in settings) {
            const el = this.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = settings[key];
                } else {
                    el.value = settings[key];
                }
            }
        }

        // Update value labels
        this.displays.attackVal.textContent = settings.attack.toFixed(3) + 's';
        this.displays.sustainVal.textContent = settings.sustain.toFixed(3) + 's';
        this.displays.punchVal.textContent = settings.punch.toFixed(0) + '%';
        this.displays.decayVal.textContent = settings.decay.toFixed(3) + 's';
        this.displays.freqVal.textContent = settings.frequency.toFixed(0) + 'Hz';
        this.displays.minFreqVal.textContent = settings.minFreq.toFixed(0) + 'Hz';
        this.displays.slideVal.textContent = settings.slide.toFixed(3);
        this.displays.deltaSlideVal.textContent = settings.deltaSlide.toFixed(3);
        this.displays.vibratoDepthVal.textContent = settings.vibratoDepth.toFixed(0) + '%';
        this.displays.vibratoSpeedVal.textContent = settings.vibratoSpeed.toFixed(1) + 'Hz';
        this.displays.arpMultVal.textContent = 'x' + settings.arpMult.toFixed(2);
        this.displays.arpSpeedVal.textContent = settings.arpSpeed.toFixed(3) + 's';
        this.displays.dutyVal.textContent = settings.duty.toFixed(0) + '%';
        this.displays.dutySweepVal.textContent = settings.dutySweep.toFixed(0) + '%/s';
        this.displays.lpfVal.textContent = settings.lpf.toFixed(0) + 'Hz';
        this.displays.hpfVal.textContent = settings.hpf.toFixed(0) + 'Hz';
        this.displays.gainVal.textContent = settings.gain.toFixed(1) + ' dB';
    }

    showPlayingFeedback() {
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) {
            playBtn.classList.add('playing');
            setTimeout(() => {
                playBtn.classList.remove('playing');
            }, 500);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    setLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    updateSampleRateButtons(sampleRate) {
        document.querySelectorAll('.radio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick*="${sampleRate}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}

// Global functions for inline event handlers (temporary backwards compatibility)
function playSound() {
    if (window.app) {
        app.playCurrentSound();
        app.ui.showPlayingFeedback();
    }
}

function downloadSound() {
    if (window.app) {
        app.downloadCurrentSound();
        app.ui.showNotification('Sound downloaded!', 'success');
    }
}

function randomize() {
    if (window.app) {
        app.randomize();
    }
}

function loadPreset(presetName) {
    if (window.app) {
        app.loadPreset(presetName);
    }
}

function setSampleRate(rate) {
    if (window.app) {
        app.audioEngine.setSampleRate(rate);
        app.ui.updateSampleRateButtons(rate);
    }
}

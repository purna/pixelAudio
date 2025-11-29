// ui.js - Updated with per-layer volume + waveform preview + tooltips

class UI {
    constructor(app) {
        this.app = app;
        this.elements = {};
        this.displays = {};
        this.waveformCanvas = null;
        this.waveformCtx = null;
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.updateDisplay(this.app.currentSettings);
        this.drawWaveformPreview(this.app.currentSettings);
    }

    cacheElements() {
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
            lpfEnable: document.getElementById('lpfEnable'),
            lpf: document.getElementById('lpf'),
            hpfEnable: document.getElementById('hpfEnable'),
            hpf: document.getElementById('hpf'),
            gain: document.getElementById('gain'),
            volume: document.getElementById('layerVolume')  // FIXED: was layerVolume
        };

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
            gainVal: document.getElementById('gainVal'),
            volumeVal: document.getElementById('layerVolumeVal')  // FIXED: was layerVolumeVal
        };

        // Waveform preview
        this.waveformCanvas = document.getElementById('waveform-preview');
        this.waveformCtx = this.waveformCanvas?.getContext('2d');
    }

    setupEventListeners() {
        for (let key in this.elements) {
            const element = this.elements[key];
            if (element && element.type !== 'checkbox') {
                element.addEventListener('input', () => {
                    this.handleInput(key, element);
                });
            }
        }

        // Layer volume is special — updates selected layer only
        if (this.elements.volume) {
            this.elements.volume.addEventListener('input', () => {
                const value = this.elements.volume.value;
                const layer = this.app.layerManager.getSelectedLayer();
                if (layer) {
                    const volume = value / 100;
                    this.app.layerManager.updateLayer(layer.id, { volume });
                    this.displays.volumeVal.textContent = value + '%';
                    this.drawWaveformPreview(this.app.currentSettings);
                }
            });
        }
    }

    handleInput(key, element) {
        let value = element.type === 'checkbox' ? element.checked : parseFloat(element.value);
        const updates = { [key]: value };

        if (key.includes('Enable')) {
            updates[key] = element.checked;
        }

        const layer = this.app.layerManager.getSelectedLayer();
        if (layer) {
            this.app.layerManager.updateLayerSettings(layer.id, updates);
        } else {
            this.app.updateSettings(updates);
        }

        this.updateDisplay(this.app.currentSettings);
        this.drawWaveformPreview(this.app.currentSettings);
    }

    updateDisplay(settings) {
        // Update all value displays
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
        this.displays.arpMultVal.textContent = '×' + settings.arpMult.toFixed(2);
        this.displays.arpSpeedVal.textContent = settings.arpSpeed.toFixed(3) + 's';
        this.displays.dutyVal.textContent = settings.duty.toFixed(0) + '%';
        this.displays.dutySweepVal.textContent = settings.dutySweep.toFixed(0);
        this.displays.lpfVal.textContent = settings.lpf.toFixed(0) + 'Hz';
        this.displays.hpfVal.textContent = settings.hpf.toFixed(0) + 'Hz';
        this.displays.gainVal.textContent = settings.gain.toFixed(1) + ' dB';

        // Update layer volume display
        const selectedLayer = this.app.layerManager.getSelectedLayer();
        if (selectedLayer && this.elements.volume && this.displays.volumeVal) {
            const volPercent = Math.round(selectedLayer.volume * 100);
            this.elements.volume.value = volPercent;
            this.displays.volumeVal.textContent = volPercent + '%';
        }
    }

    drawWaveformPreview(settings) {
        if (!this.waveformCtx) return;

        const ctx = this.waveformCtx;
        const w = this.waveformCanvas.width;
        const h = this.waveformCanvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0f0f1b';
        ctx.fillRect(0, 0, w, h);

        // Center lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
        ctx.stroke();

        try {
            const buffer = this.app.soundGenerator.generate(settings, 44100);
            const data = buffer.getChannelData(0);
            const step = Math.floor(data.length / w);

            // Draw actual waveform (green)
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const i = x * step;
                const y = h/2 - data[i] * (h/2 - 10);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw envelope (yellow dashed)
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            const duration = settings.attack + settings.sustain + settings.decay;
            for (let x = 0; x < w; x++) {
                const t = (x / w) * duration;
                const env = this.app.soundGenerator.calculateEnvelope(t, settings);
                const y = h/2 - env * (h/2 - 10);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        } catch (e) {
            console.warn("Waveform preview failed:", e);
        }
    }

    // ... rest of UI methods (showNotification, etc.)
}

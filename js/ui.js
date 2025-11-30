// js/ui.js

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
        
        // Initial updates
        this.updateDisplay(this.app.currentSettings);
        this.drawWaveformPreview(this.app.currentSettings);
    }

    cacheElements() {
        this.elements = {
            // ... (keep your existing cached inputs: attack, sustain, etc.) ...
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
            waveform: document.getElementById('waveform'),
            gain: document.getElementById('gain'),
            volume: document.getElementById('layerVolume'),
            
            // NEW: Cache Tabs and Timeline Input
            totalLength: document.getElementById('totalLength'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content')
        };

        this.displays = {
            // ... (keep your existing display elements) ...
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
            volumeVal: document.getElementById('layerVolumeVal')
        };

        this.waveformCanvas = document.getElementById('waveform-preview');
        this.waveformCtx = this.waveformCanvas?.getContext('2d');
    }

    setupEventListeners() {
        // 1. Existing Input Listeners
        for (let key in this.elements) {
            const element = this.elements[key];
            // Skip the new UI elements we added to cache, only attach input listeners to controls
            if (element && element.tagName !== 'DIV' && !key.includes('tab') && key !== 'totalLength') {
                if (element.type !== 'checkbox') {
                    element.addEventListener('input', () => this.handleInput(key, element));
                } else {
                    element.addEventListener('change', () => this.handleInput(key, element));
                }
            }
        }

        if (this.elements.waveform) {
            this.elements.waveform.addEventListener('change', () => this.handleInput('waveform', this.elements.waveform));
        }

        // 2. Timeline Length Control (Moved from HTML)
        if (this.elements.totalLength) {
            this.elements.totalLength.addEventListener('change', (e) => {
                const newLength = parseFloat(e.target.value);
                if (this.app && this.app.timeline) {
                    this.app.timeline.totalLength = newLength;
                    this.app.timeline.render();
                }
            });
        }

        // 3. Tab Switching Logic (Moved from HTML)
        if (this.elements.tabBtns) {
            this.elements.tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all
                    this.elements.tabBtns.forEach(b => b.classList.remove('active'));
                    this.elements.tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active to clicked
                    btn.classList.add('active');
                    const targetId = btn.getAttribute('data-tab');
                    document.getElementById(targetId)?.classList.add('active');
                });
            });
        }

        // 4. Global Event Listeners for Waveform Updates
        // When layers change (selection or parameters), redraw the preview
        document.addEventListener('layersChanged', () => {
            const layer = this.app.layerManager.getSelectedLayer();
            if (layer) {
                this.updateDisplay(layer.settings);
                this.drawWaveformPreview(layer.settings);
            }
        });

        if (this.elements.volume) {
            this.elements.volume.addEventListener('input', () => {
                const value = this.elements.volume.value;
                const layer = this.app.layerManager.getSelectedLayer();
                if (layer) {
                    const volume = value / 100;
                    this.app.layerManager.updateLayer(layer.id, { volume });
                    this.displays.volumeVal.textContent = value + '%';
                    // Redraw to reflect changes if necessary
                    this.drawWaveformPreview(this.app.currentSettings);
                }
            });
        }
    }

    handleInput(key, element) {
        let value;
        
        if (element.tagName === 'SELECT') {
            value = element.value;
        } else if (element.type === 'checkbox') {
            value = element.checked;
        } else {
            value = parseFloat(element.value);
        }
        
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

    // ... (Keep updateDisplay and drawWaveformPreview exactly as they were) ...
    
    updateDisplay(settings) {
        // ... paste existing updateDisplay code here ...
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

        if (this.elements.attack) this.elements.attack.value = settings.attack;
        if (this.elements.sustain) this.elements.sustain.value = settings.sustain;
        if (this.elements.punch) this.elements.punch.value = settings.punch;
        if (this.elements.decay) this.elements.decay.value = settings.decay;
        if (this.elements.frequency) this.elements.frequency.value = settings.frequency;
        if (this.elements.minFreq) this.elements.minFreq.value = settings.minFreq;
        if (this.elements.slide) this.elements.slide.value = settings.slide;
        if (this.elements.deltaSlide) this.elements.deltaSlide.value = settings.deltaSlide;
        if (this.elements.vibratoDepth) this.elements.vibratoDepth.value = settings.vibratoDepth;
        if (this.elements.vibratoSpeed) this.elements.vibratoSpeed.value = settings.vibratoSpeed;
        if (this.elements.arpMult) this.elements.arpMult.value = settings.arpMult;
        if (this.elements.arpSpeed) this.elements.arpSpeed.value = settings.arpSpeed;
        if (this.elements.duty) this.elements.duty.value = settings.duty;
        if (this.elements.dutySweep) this.elements.dutySweep.value = settings.dutySweep;
        if (this.elements.lpf) this.elements.lpf.value = settings.lpf;
        if (this.elements.hpf) this.elements.hpf.value = settings.hpf;
        if (this.elements.gain) this.elements.gain.value = settings.gain;

        if (this.elements.vibratoEnable) this.elements.vibratoEnable.checked = settings.vibratoEnable;
        if (this.elements.arpEnable) this.elements.arpEnable.checked = settings.arpEnable;
        if (this.elements.lpfEnable) this.elements.lpfEnable.checked = settings.lpfEnable;
        if (this.elements.hpfEnable) this.elements.hpfEnable.checked = settings.hpfEnable;

        const selectedLayer = this.app.layerManager.getSelectedLayer();
        if (selectedLayer && this.elements.volume && this.displays.volumeVal) {
            const volPercent = Math.round(selectedLayer.volume * 100);
            this.elements.volume.value = volPercent;
            this.displays.volumeVal.textContent = volPercent + '%';
        }

        if (this.elements.waveform) {
            this.elements.waveform.value = settings.waveform;
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
    
    showNotification(message, type = 'info') {
        // ... (Keep existing showNotification code) ...
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        Object.assign(notification.style, {
            position: 'fixed', top: '20px', right: '20px', padding: '12px 20px',
            borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500',
            zIndex: '10000', opacity: '0', transform: 'translateY(-20px)', transition: 'all 0.3s ease'
        });
        const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
        notification.style.backgroundColor = colors[type] || colors.info;
        document.body.appendChild(notification);
        setTimeout(() => { notification.style.opacity = '1'; notification.style.transform = 'translateY(0)'; }, 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
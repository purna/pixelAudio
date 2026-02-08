// fmodManager.js - FMOD-style effects, events, and Unity integration

class FMODManager {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.context = audioEngine.context;

        // FMOD-style master bus chain
        this.masterBus = this.context.createGain();

        // Effects chain
        this.eq = this.createEQ();
        this.compressor = this.createCompressor();
        this.limiter = this.createLimiter();

        // Connect effects chain
        this.masterBus.connect(this.eq.input);
        this.eq.connect(this.compressor);
        this.compressor.connect(this.limiter);
        this.limiter.connect(this.context.destination);

        // Event system
        this.events = new Map();
        this.eventParameters = new Map();

        // Parameter automation
        this.parameterCurves = new Map();
        this.automationCallbacks = [];

        // FMOD bank export
        this.bankData = {
            version: '2.0',
            events: [],
            banks: [],
            parameters: []
        };

        // Bank settings
        this.currentBankName = 'MySoundBank';
        this.currentPlatform = 'all';
        this.collectionsAsBanks = true;

        this.initFMODDefaults();
    }

    // ============ FMOD-STYLE EFFECTS CHAIN ============

    createEQ() {
        // FMOD-style 4-band EQ
        const eq = {
            input: this.context.createGain(),
            low: this.context.createBiquadFilter(),
            mid: this.context.createBiquadFilter(),
            high: this.context.createBiquadFilter(),
            output: this.context.createGain(),
            connect: function (target) {
                this.output.connect(target);
                return target;
            }
        };

        // Low shelf (FMOD EQ Low)
        eq.low.type = 'lowshelf';
        eq.low.frequency.value = 320;
        eq.low.gain.value = 0;

        // Peaking mid (FMOD EQ Mid)
        eq.mid.type = 'peaking';
        eq.mid.frequency.value = 1000;
        eq.mid.Q.value = 1;
        eq.mid.gain.value = 0;

        // High shelf (FMOD EQ High)
        eq.high.type = 'highshelf';
        eq.high.frequency.value = 3200;
        eq.high.gain.value = 0;

        // Connect EQ chain
        eq.input.connect(eq.low);
        eq.low.connect(eq.mid);
        eq.mid.connect(eq.high);
        eq.high.connect(eq.output);

        return eq;
    }

    createCompressor() {
        // FMOD-style compressor
        const compressor = this.context.createDynamicsCompressor();
        compressor.threshold.value = -24;  // FMOD default: -24dB
        compressor.ratio.value = 4;        // FMOD default: 4:1
        compressor.attack.value = 0.003;   // 3ms attack
        compressor.release.value = 0.25;    // 250ms release
        compressor.knee.value = 30;
        return compressor;
    }

    createLimiter() {
        // FMOD-style limiter (hard knee compressor)
        const limiter = this.context.createDynamicsCompressor();
        limiter.threshold.value = -1;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.001;
        limiter.release.value = 0.1;
        limiter.knee.value = 0;
        return limiter;
    }

    // EQ Controls (FMOD-style)
    setEQ(band, value) {
        switch (band) {
            case 'low':
                this.eq.low.gain.value = value; // dB
                break;
            case 'mid':
                this.eq.mid.gain.value = value; // dB
                break;
            case 'high':
                this.eq.high.gain.value = value; // dB
                break;
        }
    }

    getEQ(band) {
        switch (band) {
            case 'low': return this.eq.low.gain.value;
            case 'mid': return this.eq.mid.gain.value;
            case 'high': return this.eq.high.gain.value;
        }
        return 0;
    }

    setCompressor(threshold = -24, ratio = 4, attack = 0.003, release = 0.25) {
        this.compressor.threshold.value = threshold;
        this.compressor.ratio.value = ratio;
        this.compressor.attack.value = attack;
        this.compressor.release.value = release;
    }

    // ============ FMOD EVENT SYSTEM ============

    initFMODDefaults() {
        // Default event categories (FMOD-style)
        this.eventCategories = {
            'sfx/ui': { name: 'UI Sounds', color: '#4CAF50' },
            'sfx/gameplay': { name: 'Gameplay', color: '#2196F3' },
            'sfx/environment': { name: 'Environment', color: '#FF9800' },
            'sfx/music': { name: 'Music', color: '#9C27B0' },
            'sfx/voice': { name: 'Voice', color: '#E91E63' }
        };

        // Default parameters (FMOD-style)
        this.defaultParameters = {
            'pitch': { min: -12, max: 12, default: 0, unit: 'st' },
            'volume': { min: 0, max: 1, default: 1, unit: '' },
            'attack': { min: 0, max: 2, default: 0.01, unit: 's' },
            'decay': { min: 0, max: 4, default: 0.5, unit: 's' },
            'filterFreq': { min: 20, max: 20000, default: 20000, unit: 'Hz' },
            'distortion': { min: 0, max: 1, default: 0, unit: '' }
        };

        // Initialize 4 default banks
        this.banks = new Map();
        const defaultBanks = [
            { name: 'UI Sounds', category: 'ui' },
            { name: 'Gameplay', category: 'gameplay' },
            { name: 'Environment', category: 'environment' },
            { name: 'Music', category: 'music' }
        ];

        defaultBanks.forEach((bank, index) => {
            this.banks.set('bank_' + (index + 1), {
                id: 'bank_' + (index + 1),
                name: bank.name,
                category: bank.category,
                collections: [],
                events: [],
                createdAt: new Date().toISOString()
            });
        });
    }

    createEvent(id, options = {}) {
        // FMOD-style event creation
        const event = {
            id: id,
            name: options.name || id,
            category: options.category || 'sfx/gameplay',
            sounds: [],
            parameters: {},
            volume: options.volume || 1,
            pitch: options.pitch || 0,
            spatial: options.spatial || false,
            probability: options.probability || 100,
            mode: options.mode || 'one-shot' // one-shot, looping, continuous
        };

        this.events.set(id, event);
        return event;
    }

    addSoundToEvent(eventId, soundData) {
        const event = this.events.get(eventId);
        if (event) {
            event.sounds.push({
                index: event.sounds.length,
                name: soundData.name || 'Sound ' + (event.sounds.length + 1),
                settings: soundData.settings || {},
                probability: soundData.probability || 100
            });
        }
    }

    getEvent(eventId) {
        return this.events.get(eventId);
    }

    getAllEvents() {
        return Array.from(this.events.values());
    }

    // Map preset to FMOD event
    presetToFMODEvent(presetName, settings) {
        const eventId = 'sfx/' + presetName.toLowerCase().replace(/\s+/g, '_');

        if (!this.events.has(eventId)) {
            this.createEvent(eventId, {
                name: presetName,
                category: this.categorizePreset(presetName)
            });
        }

        const event = this.events.get(eventId);
        event.sounds = [{
            index: 0,
            name: presetName,
            settings: settings
        }];

        // FMOD-style parameters from settings
        event.parameters = {
            pitch: (settings.frequency / 440 - 1) * 12, // Semitones
            volume: settings.volume || 0.8,
            attack: settings.attack || 0.01,
            decay: settings.decay || 0.2,
            filterFreq: settings.lpf || 20000
        };

        return event;
    }

    categorizePreset(presetName) {
        const name = presetName.toLowerCase();
        if (name.includes('click') || name.includes('hover') || name.includes('menu')) {
            return 'sfx/ui';
        } else if (name.includes('step') || name.includes('walk')) {
            return 'sfx/environment';
        } else if (name.includes('music') || name.includes('melody') || name.includes('arp')) {
            return 'sfx/music';
        } else {
            return 'sfx/gameplay';
        }
    }

    // ============ PARAMETER AUTOMATION ============

    createParameter(name, options = {}) {
        const param = {
            name: name,
            min: options.min || 0,
            max: options.max || 1,
            default: options.default || 0.5,
            unit: options.unit || '',
            value: options.default || 0.5,
            curve: null // Automation curve
        };

        this.eventParameters.set(name, param);

        // Add to bank data
        this.bankData.parameters.push({
            name: name,
            min: param.min,
            max: param.max,
            default: param.default,
            unit: param.unit
        });

        return param;
    }

    setParameterValue(name, value) {
        const param = this.eventParameters.get(name);
        if (param) {
            param.value = Math.max(param.min, Math.min(param.max, value));

            // Apply to active sounds
            this.applyParameterToActiveSounds(name, param.value);
        }
    }

    getParameterValue(name) {
        const param = this.eventParameters.get(name);
        return param ? param.value : null;
    }

    // FMOD-style automation curve
    createAutomationCurve(paramName, points) {
        // points: [{time: 0, value: 0}, {time: 0.5, value: 1}, {time: 1, value: 0}]
        const curve = {
            parameter: paramName,
            points: points,
            type: 'linear' // linear, stepped, curve
        };

        this.parameterCurves.set(paramName, curve);
        return curve;
    }

    // Evaluate curve at given time
    evaluateCurve(curve, time) {
        const points = curve.points;
        const type = curve.type;

        // Find surrounding points
        let prev = points[0];
        let next = points[points.length - 1];

        for (let i = 0; i < points.length; i++) {
            if (points[i].time <= time) prev = points[i];
            if (points[i].time > time) {
                next = points[i];
                break;
            }
        }

        // Interpolate
        const t = (time - prev.time) / (next.time - prev.time || 1);

        if (type === 'stepped') {
            return prev.value;
        }

        // Linear interpolation
        return prev.value + (next.value - prev.value) * t;
    }

    // Start automation playback
    startAutomation(paramName, duration, onUpdate, onComplete) {
        const curve = this.parameterCurves.get(paramName);
        if (!curve) return;

        const startTime = this.context.currentTime;
        let animationId = null;

        const update = function () {
            const elapsed = this.context.currentTime - startTime;
            const normalizedTime = Math.min(1, elapsed / duration);

            const value = this.evaluateCurve(curve, normalizedTime);
            this.setParameterValue(paramName, value);

            if (onUpdate) onUpdate(value);

            if (normalizedTime < 1) {
                animationId = requestAnimationFrame(update.bind(this));
            } else {
                if (onComplete) onComplete();
            }
        }.bind(this);

        update();

        return function () {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }

    applyParameterToActiveSounds(paramName, value) {
        // Apply parameter value to currently playing sounds
        // This would hook into the audio engine's active sources
    }

    // ============ FMOD STUDIO EXPORT ============

    // Export as FMOD Studio compatible JSON bank
    exportFMODBank(options = {}) {
        const bank = {
            name: options.name || this.currentBankName || 'PixelAudioBank',
            format: 'FMOD Studio Bank',
            version: this.bankData.version,
            platform: this.currentPlatform || 'all',
            events: [],
            banks: [],
            parameters: Array.from(this.eventParameters.values()),
            metadata: {
                exportedFrom: 'Pixel Audio Studio',
                exportDate: new Date().toISOString(),
                toolVersion: '1.0'
            }
        };

        // Convert events to FMOD format
        this.events.forEach(function (event, id) {
            const fmodEvent = {
                path: 'event:/' + id,
                name: event.name,
                category: event.category,
                volume: event.volume,
                pitch: event.pitch,
                mode: event.mode,
                sounds: event.sounds.map(function (sound, idx) {
                    return {
                        name: sound.name,
                        path: 'event:/' + id + '/' + sound.name,
                        probability: sound.probability,
                        parameters: sound.settings ? {
                            pitch: (sound.settings.frequency / 440 - 1) * 12,
                            attack: sound.settings.attack,
                            decay: sound.settings.decay,
                            filterFreq: sound.settings.lpf
                        } : {}
                    };
                }),
                parameters: event.parameters
            };

            bank.events.push(fmodEvent);
        }.bind(this));

        return bank;
    }

    // Export as Unity-compatible audio data
    exportUnityData() {
        const unityData = {
            version: '1.0',
            events: [],
            banks: []
        };

        this.events.forEach(function (event, id) {
            unityData.events.push({
                id: id,
                name: event.name,
                category: event.category.replace('sfx/', ''),
                audioSettings: {
                    pitch: event.pitch,
                    volume: event.volume,
                    spatialBlend: event.spatial ? 1 : 0
                },
                sounds: event.sounds.map(function (sound) {
                    return {
                        name: sound.name,
                        settings: sound.settings
                    };
                })
            });
        }.bind(this));

        return unityData;
    }

    // Export current sound as WAV for FMOD Studio import
    exportWAVForFMOD(settings, filename) {
        if (this.audioEngine && this.audioEngine.downloadWAV) {
            this.audioEngine.downloadWAV(null, filename);
        }
    }

    // Download FMOD bank JSON
    downloadFMODBank() {
        const bankData = this.exportFMODBank();
        const blob = new Blob([JSON.stringify(bankData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (this.currentBankName || 'MySoundBank') + '_FMOD_Bank.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Download Unity C# scripts
    downloadUnityScripts() {
        const unityData = this.exportUnityData();

        // Generate C# event manager
        let eventMethods = '';

        unityData.events.forEach(function (event) {
            const methodName = event.name.replace(/\s+/g, '');
            eventMethods +=
                '    public void Play' + methodName + '(AudioSource source = null)\n' +
                '    {\n' +
                '        if (source == null) source = CreateTempSource();\n' +
                '        source.pitch = ' + event.audioSettings.pitch.toFixed(2) + 'f;\n' +
                '        source.volume = ' + event.audioSettings.volume.toFixed(2) + 'f;\n' +
                '        // Play ' + event.name + '\n' +
                '    }\n\n';
        });

        const eventManager =
            '// Auto-generated by Pixel Audio Studio\n' +
            'using UnityEngine;\n' +
            '\n' +
            'public class PixelAudioManager : MonoBehaviour\n' +
            '{\n' +
            '    private static PixelAudioManager _instance;\n' +
            '    public static PixelAudioManager Instance\n' +
            '    {\n' +
            '        get\n' +
            '        {\n' +
            '            if (_instance == null)\n' +
            '            {\n' +
            '                _instance = new GameObject("PixelAudioManager").AddComponent<PixelAudioManager>();\n' +
            '            }\n' +
            '            return _instance;\n' +
            '        }\n' +
            '    }\n' +
            '\n' +
            '    // Event Methods\n' +
            eventMethods +
            '    private AudioSource CreateTempSource()\n' +
            '    {\n' +
            '        GameObject temp = new GameObject("TempAudio");\n' +
            '        AudioSource src = temp.AddComponent<AudioSource>();\n' +
            '        Destroy(temp, 5f);\n' +
            '        return src;\n' +
            '    }\n' +
            '}\n';

        const blob = new Blob([eventManager], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PixelAudioManager.cs';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ============ UTILITY ============

    // Connect a source to the master bus
    connectToMaster(source) {
        source.connect(this.masterBus);
    }

    // Get master bus for monitoring
    getMasterBus() {
        return this.masterBus;
    }

    // Set master volume
    setMasterVolume(volume) {
        this.masterBus.gain.value = volume;
    }

    // Get current meter level
    getMeterLevel() {
        // Would need AnalyserNode for real metering
        return this.masterBus.gain.value;
    }
}

// Export for use
window.FMODManager = FMODManager;

// ============ BANK MANAGEMENT ============

FMODManager.prototype.createBank = function (id, options = {}) {
    const bank = {
        id: id,
        name: options.name || 'New Bank',
        category: options.category || 'custom',
        collections: [],
        events: [],
        createdAt: new Date().toISOString()
    };
    this.banks.set(id, bank);
    return bank;
};

FMODManager.prototype.getBank = function (bankId) {
    return this.banks.get(bankId);
};

FMODManager.prototype.getAllBanks = function () {
    return Array.from(this.banks.values());
};

FMODManager.prototype.deleteBank = function (bankId) {
    return this.banks.delete(bankId);
};

FMODManager.prototype.addCollectionToBank = function (bankId, collectionId) {
    const bank = this.banks.get(bankId);
    if (bank && !bank.collections.includes(collectionId)) {
        bank.collections.push(collectionId);
        return true;
    }
    return false;
};

FMODManager.prototype.removeCollectionFromBank = function (bankId, collectionId) {
    const bank = this.banks.get(bankId);
    if (bank) {
        bank.collections = bank.collections.filter(id => id !== collectionId);
        return true;
    }
    return false;
};

FMODManager.prototype.exportBank = function (bankId) {
    const bank = this.banks.get(bankId);
    if (!bank) {
        console.error('Bank not found:', bankId);
        return null;
    }

    const exportData = {
        name: bank.name,
        format: 'Pixel Audio Bank',
        version: '1.0',
        category: bank.category,
        collections: bank.collections,
        events: [],
        metadata: {
            exportedFrom: 'Pixel Audio Studio',
            exportDate: new Date().toISOString()
        }
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = bank.name.replace(/\s+/g, '_') + '_Bank.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
};

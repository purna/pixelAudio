// soundGenerator.js - Core sound synthesis with SF Maker-inspired enhancements

class SoundGenerator {
    constructor() {
        this.audioEngine = null;
        this.lastNoiseValue = 0; // For brown noise
    }

    setAudioEngine(audioEngine) {
        this.audioEngine = audioEngine;
    }

    generate(settings, sampleRate = 44100) {
        const duration = settings.attack + settings.sustain + settings.decay;
        const samples = Math.floor(duration * sampleRate);
        
        // Use the AudioEngine's context if available
        let context;
        if (this.audioEngine && this.audioEngine.context) {
            context = this.audioEngine.context;
        } else {
            // Fallback: create a context for buffer creation only
            context = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const buffer = context.createBuffer(1, samples, context.sampleRate);
        const data = buffer.getChannelData(0);

        // Reset brown noise state
        this.lastNoiseValue = 0;

        // Generate audio data
        this.generateWaveform(data, settings, sampleRate);

        // Apply bitcrush if enabled (SF Maker retro effect)
        if (settings.bitcrushEnable && settings.bitcrush > 0) {
            this.applyBitcrush(data, settings.bitcrush, sampleRate);
        }

        // Apply distortion if enabled
        if (settings.distortionEnable && settings.distortion > 0) {
            this.applyDistortion(data, settings.distortion);
        }

        // Apply delay/echo if enabled
        if (settings.delayEnable && settings.delayTime > 0) {
            this.applyDelay(data, settings.delayTime, settings.delayFeedback || 0.3, sampleRate);
        }

        // Apply filters
        if (settings.lpfEnable) {
            this.applyLowPassFilter(data, settings.lpf, settings.lpfResonance || 0, sampleRate);
        }
        if (settings.hpfEnable) {
            this.applyHighPassFilter(data, settings.hpf, settings.hpfResonance || 0, sampleRate);
        }
        if (settings.bpfEnable) {
            this.applyBandPassFilter(data, settings.bpf, settings.bpfResonance || 0, sampleRate);
        }

        return buffer;
    }

    generateWaveform(data, s, sampleRate) {
        let phase = 0;
        let phase2 = 0; // For harmonics
        let phase3 = 0; // For second harmonic
        let frequency = s.frequency;
        let slide = s.slide;
        let duty = (s.duty || 50) / 100;
        let arpTime = 0;
        let arpMult = 1;
        
        // Frequency jump (SF Maker enhancement)
        let jumpPending = false;
        let jumpTarget = 0;

        // Harmonics
        const harmonic2 = s.harmonic2 || 0; // Second harmonic mix
        const harmonic3 = s.harmonic3 || 0; // Third harmonic mix

        // Filter envelope
        let filterEnvAmount = s.filterEnvAmount || 0;
        let filterEnvOffset = 0;

        const gainLinear = Math.pow(10, (s.volume || 0.5) / 20);
        const waveform = s.waveform || 'square';

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            
            // Calculate envelope
            const envelope = this.calculateEnvelope(t, s);

            // Frequency slide
            slide += (s.deltaSlide || 0) / sampleRate;
            frequency += slide;
            frequency = Math.max(s.minFreq || 0, frequency);

            // Handle frequency jump (SF Maker feature)
            if (s.jumpEnable && s.jumpTime > 0 && !jumpPending) {
                const jumpThreshold = s.jumpTime * sampleRate;
                if (i >= jumpThreshold) {
                    jumpPending = true;
                    jumpTarget = s.jumpFreq || frequency * 2;
                }
            }
            if (jumpPending) {
                // Smooth transition to jump frequency
                frequency = frequency + (jumpTarget - frequency) * 0.1;
            }

            // Arpeggiation
            if (s.arpEnable && s.arpSpeed > 0) {
                arpTime += 1 / sampleRate;
                if (arpTime > s.arpSpeed) {
                    arpTime = 0;
                    if (s.arpMode === 'updown') {
                        arpMult = arpMult === 1 ? s.harmonic2 || s.arpMult : (arpMult === (s.harmonic2 || s.arpMult) ? 1 : s.harmonic2 || s.arpMult);
                    } else {
                        arpMult = arpMult === 1 ? s.arpMult : 1;
                    }
                }
            }

            let finalFreq = frequency * arpMult;

            // Vibrato
            if (s.vibratoEnable && s.vibratoDepth > 0) {
                const vibrato = Math.sin(t * (s.vibratoSpeed || 10) * Math.PI * 2) * (s.vibratoDepth / 100);
                finalFreq *= 1 + vibrato;
            }

            // Filter envelope
            if (s.filterEnvEnable && s.filterEnvAmount > 0) {
                const filterEnvT = t / (s.attack + s.sustain + s.decay);
                filterEnvOffset = Math.sin(filterEnvT * Math.PI * 2) * s.filterEnvAmount * 0.5;
            }

            // Generate waveform based on type
            phase += (finalFreq / sampleRate) * Math.PI * 2;
            phase2 += (finalFreq * 2 / sampleRate) * Math.PI * 2; // Second harmonic
            phase3 += (finalFreq * 3 / sampleRate) * Math.PI * 2; // Third harmonic
            let sample = 0;

            switch (waveform) {
                case 'sine':
                    sample = Math.sin(phase);
                    break;
                
                case 'triangle':
                    // Triangle wave: -1 to 1 linear
                    const trianglePhase = (phase % (Math.PI * 2)) / (Math.PI * 2);
                    sample = trianglePhase < 0.5 
                        ? -1 + 4 * trianglePhase 
                        : 3 - 4 * trianglePhase;
                    break;
                
                case 'sawtooth':
                    // Sawtooth wave: linear ramp from -1 to 1
                    sample = -1 + 2 * ((phase % (Math.PI * 2)) / (Math.PI * 2));
                    break;
                
                case 'noise':
                    // White noise: random between -1 and 1
                    sample = Math.random() * 2 - 1;
                    break;
                
                case 'brown_noise':
                    // Brown noise: integrated white noise for deeper sounds
                    const white = Math.random() * 2 - 1;
                    this.lastNoiseValue = (this.lastNoiseValue + (0.02 * white)) / 1.02;
                    sample = this.lastNoiseValue * 3.5;
                    break;
                
                case 'pink_noise':
                    // Pink noise approximation
                    sample = (Math.random() * 2 - 1) * 0.5 + (Math.random() * 2 - 1) * 0.25;
                    break;
                
                case 'square':
                default:
                    // Square wave with duty cycle
                    sample = (phase % (Math.PI * 2)) < (Math.PI * 2 * duty) ? 1 : -1;
                    break;
            }

            // Duty sweep (only applies to square wave)
            if (waveform === 'square' && s.dutySweepEnable) {
                duty += (s.dutySweep / 100) / sampleRate;
                duty = Math.max(0, Math.min(1, duty));
            }

            // Apply harmonics for richer sounds
            let finalSample = sample;
            if (harmonic2 > 0) {
                const sample2 = (phase2 % (Math.PI * 2)) < Math.PI ? 1 : -1;
                finalSample = finalSample * (1 - harmonic2) + sample2 * harmonic2;
            }
            if (harmonic3 > 0) {
                const sample3 = Math.sin(phase3);
                finalSample = finalSample * (1 - harmonic3) + sample3 * harmonic3;
            }

            data[i] = finalSample * envelope * gainLinear;
        }
    }

    calculateEnvelope(t, settings) {
        let envelope = 0;
        
        if (t < settings.attack) {
            // Attack phase
            envelope = t / settings.attack;
        } else if (t < settings.attack + settings.sustain) {
            // Sustain phase
            const sustainLevel = settings.sustainLevel !== undefined ? settings.sustainLevel : 1;
            envelope = sustainLevel;
            
            // Apply punch if enabled
            if (settings.punch > 0) {
                const punchT = (t - settings.attack) / settings.sustain;
                envelope += (settings.punch / 100) * (1 - punchT);
            }
        } else {
            // Decay phase
            const decayT = (t - settings.attack - settings.sustain) / settings.decay;
            const sustainLevel = settings.sustainLevel !== undefined ? settings.sustainLevel : 1;
            
            if (settings.decayShape === 'exponential') {
                envelope = sustainLevel * Math.pow(1 - decayT, 2);
            } else {
                envelope = sustainLevel * (1 - decayT);
            }
        }
        
        return Math.max(0, Math.min(1, envelope));
    }

    applyLowPassFilter(data, cutoff, resonance, sampleRate) {
        // Biquad-style lowpass with resonance
        const Q = 1 + (resonance || 0) * 10;
        const omega = 2 * Math.PI * cutoff / sampleRate;
        const sinOmega = Math.sin(omega);
        const cosOmega = Math.cos(omega);
        const alpha = sinOmega / (2 * Q);
        const b0 = (1 - cosOmega) / 2;
        const b1 = 1 - cosOmega;
        const b2 = (1 - cosOmega) / 2;
        const a0 = 1 + alpha;
        const a1 = -2 * cosOmega;
        const a2 = 1 - alpha;
        
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        
        for (let i = 0; i < data.length; i++) {
            const x = data[i];
            const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
            x2 = x1;
            x1 = x;
            y2 = y1;
            y1 = y;
            data[i] = y;
        }
    }

    applyHighPassFilter(data, cutoff, resonance, sampleRate) {
        // Biquad-style highpass with resonance
        const Q = 1 + (resonance || 0) * 10;
        const omega = 2 * Math.PI * cutoff / sampleRate;
        const sinOmega = Math.sin(omega);
        const cosOmega = Math.cos(omega);
        const alpha = sinOmega / (2 * Q);
        const b0 = (1 + cosOmega) / 2;
        const b1 = -(1 + cosOmega);
        const b2 = (1 + cosOmega) / 2;
        const a0 = 1 + alpha;
        const a1 = -2 * cosOmega;
        const a2 = 1 - alpha;
        
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        
        for (let i = 0; i < data.length; i++) {
            const x = data[i];
            const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
            x2 = x1;
            x1 = x;
            y2 = y1;
            y1 = y;
            data[i] = y;
        }
    }

    applyBandPassFilter(data, cutoff, resonance, sampleRate) {
        // Biquad-style bandpass filter
        const Q = 1 + (resonance || 0) * 5;
        const omega = 2 * Math.PI * cutoff / sampleRate;
        const sinOmega = Math.sin(omega);
        const cosOmega = Math.cos(omega);
        const alpha = sinOmega / (2 * Q);
        const b0 = alpha;
        const b1 = 0;
        const b2 = -alpha;
        const a0 = 1 + alpha;
        const a1 = -2 * cosOmega;
        const a2 = 1 - alpha;
        
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        
        for (let i = 0; i < data.length; i++) {
            const x = data[i];
            const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
            x2 = x1;
            x1 = x;
            y2 = y1;
            y1 = y;
            data[i] = y;
        }
    }

    applyBitcrush(data, bitDepth, sampleRate) {
        // Bitcrush effect for retro sounds
        const factor = Math.pow(2, bitDepth) - 1;
        const lastSample = { value: 0 };
        const delay = Math.floor((sampleRate * 0.01) / (bitDepth + 1));
        
        for (let i = 0; i < data.length; i++) {
            if (i % delay === 0) {
                lastSample.value = Math.round(data[i] * factor) / factor;
            }
            data[i] = lastSample.value;
        }
    }

    applyDistortion(data, amount) {
        // Simple distortion/overdrive
        const drive = 1 + (amount || 0) * 10;
        
        for (let i = 0; i < data.length; i++) {
            // Soft clipping distortion
            data[i] = Math.tanh(data[i] * drive);
        }
    }

    applyDelay(data, time, feedback, sampleRate) {
        // Simple delay/echo effect
        const delaySamples = Math.floor(time * sampleRate);
        const delayed = new Float32Array(data.length);
        const maxDelay = delaySamples + 1;
        
        for (let i = 0; i < data.length; i++) {
            if (i < maxDelay) {
                delayed[i] = data[i];
            } else {
                delayed[i] = data[i] + delayed[i - delaySamples] * feedback;
            }
        }
        
        // Mix original with delayed signal (30% wet)
        for (let i = 0; i < data.length; i++) {
            data[i] = data[i] * 0.7 + delayed[i] * 0.3;
        }
    }

    calculateDuration(settings) {
        return settings.attack + settings.sustain + settings.decay;
    }

    // Generate multiple samples for waveform preview
    generatePreviewSamples(settings, numSamples = 200) {
        const duration = this.calculateDuration(settings);
        const samples = [];
        
        for (let i = 0; i < numSamples; i++) {
            const t = (i / numSamples) * duration;
            const envelope = this.calculateEnvelope(t, settings);
            samples.push(envelope);
        }
        
        return samples;
    }
}

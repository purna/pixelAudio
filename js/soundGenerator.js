// js/soundGenerator.js
import { getAudioContext } from './audioEngine.js';

export function generateBuffer(settings) {
    const ctx = getAudioContext();
    const sampleRate = ctx.sampleRate;
    const duration = settings.attack + settings.sustain + settings.decay + 0.1;
    const buffer = ctx.createBuffer(1, Math.ceil(duration * sampleRate), sampleRate);
    const data = buffer.getChannelData(0);

    // Same algorithm as your original (cleaned up)
    let phase = 0;
    let freq = settings.frequency;
    let slide = settings.slide;
    let duty = settings.duty / 100;
    let arpTime = 0;
    let arpMult = 1;
    const gain = Math.pow(10, settings.gain / 20);

    for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;

        // Envelope
        let env = 0;
        if (t < settings.attack) env = t / settings.attack;
        else if (t < settings.attack + settings.sustain) {
            env = 1 + (settings.punch / 100) * Math.max(0, 1 - (t - settings.attack) / settings.sustain);
        } else if (t < settings.attack + settings.sustain + settings.decay) {
            env = 1 - (t - settings.attack - settings.sustain) / settings.decay;
        }
        env = Math.max(0, Math.min(1, env));

        // Frequency slide
        slide += settings.deltaSlide / sampleRate;
        freq += slide;
        freq = Math.max(settings.minFreq, freq);

        // Arpeggio
        if (settings.arpEnable && settings.arpSpeed > 0) {
            arpTime += 1 / sampleRate;
            if (arpTime >= settings.arpSpeed) {
                arpTime = 0;
                arpMult = arpMult === 1 ? settings.arpMult : 1;
            }
        }

        let f = freq * arpMult;

        // Vibrato
        if (settings.vibratoEnable) {
            const vib = Math.sin(t * settings.vibratoSpeed * Math.PI * 2) * (settings.vibratoDepth / 100);
            f *= 1 + vib;
        }

        // Square wave
        phase += f / sampleRate * Math.PI * 2;
        const sq = (phase % (Math.PI * 2)) < (Math.PI * 2 * duty) ? 1 : -1;

        // Duty sweep
        duty += settings.dutySweep / 100 / sampleRate;
        duty = Math.clamp(0, 1);

        data[i] = sq * env * gain;
    }

    // Filters (simple IIR)
    if (settings.lpfEnable) applyLPF(data, settings.lpf, sampleRate);
    if (settings.hpfEnable) applyHPF(data, settings.hpf, sampleRate);

    return buffer;
}

function applyLPF(data, cutoff, sr) {
    const rc = 1 / (cutoff * 2 * Math.PI);
    const dt = 1 / sr;
    const a = dt / (rc + dt);
    for (let i = 1; i < data.length; i++) {
        data[i] = data[i-1] + a * (data[i] - data[i-1]);
    }
}

function applyHPF(data, cutoff, sr) {
    const rc = 1 / (cutoff * 2 * Math.PI);
    const dt = 1 / sr;
    const a = rc / (rc + dt);
    let prev = 0;
    for (let i = 1; i < data.length; i++) {
        const high = a * (prev + data[i] - data[i-1]);
        data[i] = high;
        prev = high;
    }
}

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

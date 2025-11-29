// js/audioEngine.js
let audioContext;

export function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

export function getAudioContext() {
    return audioContext;
}

export function bufferToWave(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const data = new Int16Array(buffer.length * numChannels);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const s = Math.max(-1, Math.min(1, channel[i]));
        data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    const arrayBuffer = new ArrayBuffer(44 + data.length * 2);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + data.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, data.length * 2, true);

    for (let i = 0; i < data.length; i++) {
        view.setInt16(44 + i * 2, data[i], true);
    }

    return arrayBuffer;
}

// js/timeline.js
import { layers, getActiveLayer, playAll } from './layerManager.js';
import { getAudioContext } from './audioEngine.js';

let timelineElement;
let playhead;
let currentTime = 0;
let isPlaying = false;
let startTime = 0;
let zoom = 50; // px per second
let offsetX = 0;

export function initTimeline() {
    timelineElement = document.getElementById('timeline');
    playhead = document.createElement('div');
    playhead.className = 'playhead';
    timelineElement.appendChild(playhead);

    // Add ruler
    const ruler = document.createElement('div');
    ruler.className = 'ruler';
    timelineElement.appendChild(ruler);

    renderTimeline();
    setupTimelineEvents();
    setupControls();
}

function setupControls() {
    document.getElementById('playTimeline').onclick = playTimeline;
    document.getElementById('stopTimeline').onclick = stopTimeline;
    document.getElementById('zoom').oninput = (e) => {
        zoom = parseInt(e.target.value);
        renderTimeline();
    };
}

function setupTimelineEvents() {
    let isDragging = null;

    timelineElement.addEventListener('mousedown', e => {
        const rect = timelineElement.getBoundingClientRect();
        const x = e.clientX - rect.left + offsetX;
        const time = x / zoom;

        const layerEl = e.target.closest('.timeline-layer');
        if (layerEl) {
            const layer = layers.find(l => l.id == layerEl.dataset.id);
            if (layer) {
                isDragging = layer;
                layer.startTime = time - (layerEl.offsetLeft / zoom);
            }
        } else {
            currentTime = time;
            updatePlayhead();
        }
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const rect = timelineElement.getBoundingClientRect();
        const x = e.clientX - rect.left + offsetX;
        isDragging.startTime = Math.max(0, x / zoom - 50 / zoom);
        renderTimeline();
    });

    document.addEventListener('mouseup', () => {
        isDragging = null;
    });

    timelineElement.addEventListener('wheel', e => {
        e.preventDefault();
        offsetX = Math.max(0, offsetX - e.deltaY);
        renderTimeline();
    });
}

export function renderTimeline() {
    if (!timelineElement) return;

    const tracksHTML = layers.map(layer => {
        const duration = layer.settings.attack + layer.settings.sustain + layer.settings.decay + 0.2;
        const left = (layer.startTime || 0) * zoom - offsetX;
        const width = duration * zoom;

        return `
            <div class="timeline-track">
                <div class="timeline-layer ${getActiveLayer()?.id === layer.id ? 'active' : ''}"
                     data-id="${layer.id}"
                     style="left:${left}px;width:${width}px;background:${layer.muted ? '#666' : '#667eea'}">
                    <div class="layer-name">${layer.name}</div>
                    <div class="fade-handle fade-in" style="left:0"></div>
                    <div class="fade-handle fade-out" style="right:0"></div>
                </div>
            </div>`;
    }).join('');

    timelineElement.innerHTML = `
        <div class="ruler">${generateRuler()}</div>
        ${tracksHTML}
        <div class="playhead" style="left:${currentTime * zoom - offsetX}px"></div>
    `;

    updateTimeDisplay();
}

function generateRuler() {
    let html = '';
    for (let t = 0; t < 20; t += 0.5) {
        const x = t * zoom - offsetX;
        if (x > -100 && x < timelineElement.clientWidth + 100) {
            html += `<div style="left:${x}px" class="ruler-mark ${t%1===0?'major':''}">${t.toFixed(1)}</div>`;
        }
    }
    return html;
}

function updatePlayhead() {
    if (!playhead) return;
    playhead.style.left = (currentTime * zoom - offsetX) + 'px';
    updateTimeDisplay();
}

function updateTimeDisplay() {
    document.getElementById('timeDisplay').textContent = currentTime.toFixed(2) + 's';
}

let animationFrame;
function playTimeline() {
    if (isPlaying) return;
    isPlaying = true;
    startTime = getAudioContext().currentTime;

    const playLayer = (layer) => {
        if (layer.muted || !layer.buffer) return;
        const source = getAudioContext().createBufferSource();
        source.buffer = layer.buffer;

        const gainNode = getAudioContext().createGain();
        source.connect(gainNode);
        gainNode.connect(getAudioContext().destination);

        // Fade in/out
        const start = (layer.startTime || 0);
        const duration = layer.buffer.duration;
        const fadeIn = layer.fadeIn || 0.02;
        const fadeOut = layer.fadeOut || 0.05;

        gainNode.gain.setValueAtTime(0, start);
        gainNode.gain.linearRampToValueAtTime(1, start + fadeIn);
        gainNode.gain.setValueAtTime(1, start + duration - fadeOut);
        gainNode.gain.linearRampToValueAtTime(0, start + duration);

        source.start(start);
    };

    layers.forEach(playLayer);

    const tick = () => {
        currentTime = getAudioContext().currentTime - startTime;
        updatePlayhead();
        renderTimeline();
        if (currentTime > getTotalDuration() + 1) {
            stopTimeline();
        } else {
            animationFrame = requestAnimationFrame(tick);
        }
    };
    tick();
}

function stopTimeline() {
    isPlaying = false;
    cancelAnimationFrame(animationFrame);
    currentTime = 0;
    updatePlayhead();
    renderTimeline();
}

function getTotalDuration() {
    return Math.max(...layers.map(l => (l.startTime || 0) + l.buffer?.duration || 1));
}

// Call from layerManager when layer changes
export function refreshTimeline() {
    layers.forEach(l => {
        if (!l.buffer) l.buffer = generateBuffer(l.settings);
    });
    renderTimeline();
}

// js/ui.js
import { layers, getActiveLayer, setActiveLayer, createLayer } from './layerManager.js';
import { refreshTimeline } from './timeline.js';

const controlsHTML = `
    <!-- Envelope -->
    <div class="control-section">
        <div class="section-title">Envelope</div>
        <div class="control-group">
            <label>Attack <span class="value" id="attackVal">0.000s</span></label>
            <input type="range" id="attack" min="0" max="0.5" value="0" step="0.001">
        </div>
        <div class="control-group">
            <label>Sustain <span class="value" id="sustainVal">0.100s</span></label>
            <input type="range" id="sustain" min="0" max="1" value="0.1" step="0.001">
        </div>
        <div class="control-group">
            <label>Punch <span class="value" id="punchVal">0%</span></label>
            <input type="range" id="punch" min="0" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <label>Decay <span class="value" id="decayVal">0.200s</span></label>
            <input type="range" id="decay" min="0" max="2" value="0.2" step="0.001">
        </div>
    </div>

    <!-- Frequency -->
    <div class="control-section">
        <div class="section-title">Frequency</div>
        <div class="control-group">
            <label>Start <span class="value" id="freqVal">440Hz</span></label>
            <input type="range" id="frequency" min="20" max="2000" value="440" step="1">
        </div>
        <div class="control-group">
            <label>Min Cutoff <span class="value" id="minFreqVal">0Hz</span></label>
            <input type="range" id="minFreq" min="0" max="2000" value="0" step="1">
        </div>
        <div class="control-group">
            <label>Slide <span class="value" id="slideVal">0.00</span></label>
            <input type="range" id="slide" min="-2" max="2" value="0" step="0.01">
        </div>
        <div class="control-group">
            <label>Delta Slide <span class="value" id="deltaSlideVal">0.00</span></label>
            <input type="range" id="deltaSlide" min="-1" max="1" value="0" step="0.01">
        </div>
    </div>

    <!-- Vibrato -->
    <div class="control-section">
        <div class="section-title">Vibrato</div>
        <div class="control-group checkbox-group">
            <input type="checkbox" id="vibratoEnable">
            <label>Enable Vibrato</label>
        </div>
        <div class="control-group">
            <label>Depth <span class="value" id="vibratoDepthVal">0%</span></label>
            <input type="range" id="vibratoDepth" min="0" max="100" value="0" step="1">
        </div>
        <div class="control-group">
            <label>Speed <span class="value" id="vibratoSpeedVal">0.0Hz</span></label>
            <input type="range" id="vibratoSpeed" min="0" max="50" value="0" step="0.1">
        </div>
    </div>

    <!-- Arpeggiation -->
    <div class="control-section">
        <div class="section-title">Arpeggiation</div>
        <div class="control-group checkbox-group">
            <input type="checkbox" id="arpEnable">
            <label>Enable Arpeggio</label>
        </div>
        <div class="control-group">
            <label>Frequency Mult <span class="value" id="arpMultVal">x1.00</span></label>
            <input type="range" id="arpMult" min="0.5" max="3" value="1" step="0.01">
        </div>
        <div class="control-group">
            <label>Change Speed <span class="value" id="arpSpeedVal">0.000s</span></label>
            <input type="range" id="arpSpeed" min="0" max="1" value="0" step="0.001">
        </div>
    </div>

    <!-- Duty Cycle -->
    <div class="control-section">
        <div class="section-title">Duty Cycle</div>
        <div class="control-group">
            <label>Duty Cycle <span class="value" id="dutyVal">50%</span></label>
            <input type="range" id="duty" min="0" max="100" value="50" step="1">
        </div>
        <div class="control-group">
            <label>Sweep <span class="value" id="dutySweepVal">0%/s</span></label>
            <input type="range" id="dutySweep" min="-200" max="200" value="0" step="1">
        </div>
    </div>

    <!-- Filters -->
    <div class="control-section">
        <div class="section-title">Filters</div>
        <div class="control-group checkbox-group">
            <input type="checkbox" id="lpfEnable">
            <label>Low-Pass Filter</label>
        </div>
        <div class="control-group">
            <label>LP Cutoff <span class="value" id="lpfVal">22050Hz</span></label>
            <input type="range" id="lpf" min="20" max="22050" value="22050" step="10">
        </div>
        <div class="control-group checkbox-group">
            <input type="checkbox" id="hpfEnable">
            <label>High-Pass Filter</label>
        </div>
        <div class="control-group">
            <label>HP Cutoff <span class="value" id="hpfVal">0Hz</span></label>
            <input type="range" id="hpf" min="0" max="5000" value="0" step="10">
        </div>
    </div>

    <!-- Output -->
    <div class="control-section">
        <div class="section-title">Output</div>
        <div class="control-group">
            <label>Gain <span class="value" id="gainVal">-10.0 dB</span></label>
            <input type="range" id="gain" min="-30" max="6" value="-10" step="0.1">
        </div>
    </div>
`;

export function initUI() {
    document.getElementById('controlsContainer').innerHTML = controlsHTML;
    attachControlListeners();
}

function attachControlListeners() {
    const layer = getActiveLayer();
    if (!layer) return;

    document.querySelectorAll('#controlsContainer input').forEach(input => {
        input.addEventListener('input', () => {
            const key = input.id;
            const value = input.type === 'checkbox' ? input.checked : parseFloat(input.value);
            layer.settings[key] = value;
            layer.buffer = null; // invalidate cached buffer
            updateValueDisplays();
            refreshTimeline();
        });
    });
}

export function updateControlsFromLayer(layer) {
    if (!layer) return;

    Object.keys(layer.settings).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = layer.settings[key];
            } else {
                el.value = layer.settings[key];
            }
        }
    });
    updateValueDisplays();
}

export function updateValueDisplays() {
    const s = getActiveLayer()?.settings || {};
    document.getElementById('attackVal').textContent = (s.attack ?? 0).toFixed(3) + 's';
    document.getElementById('sustainVal').textContent = (s.sustain ?? 0.1).toFixed(3) + 's';
    document.getElementById('punchVal').textContent = Math.round(s.punch || 0) + '%';
    document.getElementById('decayVal').textContent = (s.decay ?? 0.2).toFixed(3) + 's';
    document.getElementById('freqVal').textContent = Math.round(s.frequency || 440) + 'Hz';
    document.getElementById('minFreqVal').textContent = Math.round(s.minFreq || 0) + 'Hz';
    document.getElementById('slideVal').textContent = (s.slide || 0).toFixed(2);
    document.getElementById('deltaSlideVal').textContent = (s.deltaSlide || 0).toFixed(2);
    document.getElementById('vibratoDepthVal').textContent = Math.round(s.vibratoDepth || 0) + '%';
    document.getElementById('vibratoSpeedVal').textContent = (s.vibratoSpeed || 0).toFixed(1) + 'Hz';
    document.getElementById('arpMultVal').textContent = 'x' + (s.arpMult || 1).toFixed(2);
    document.getElementById('arpSpeedVal').textContent = (s.arpSpeed || 0).toFixed(3) + 's';
    document.getElementById('dutyVal').textContent = Math.round(s.duty || 50) + '%';
    document.getElementById('dutySweepVal').textContent = Math.round(s.dutySweep || 0) + '%/s';
    document.getElementById('lpfVal').textContent = Math.round(s.lpf || 22050) + 'Hz';
    document.getElementById('hpfVal').textContent = Math.round(s.hpf || 0) + 'Hz';
    document.getElementById('gainVal').textContent = (s.gain || -10).toFixed(1) + ' dB';
}

export function renderLayersList() {
    const list = document.getElementById('layersList');
    list.innerHTML = layers.map(l => `
        <div class="layer-item ${getActiveLayer()?.id === l.id ? 'active' : ''}" data-id="${l.id}">
            <input class="layer-name" value="${l.name}" data-id="${l.id}">
            <button class="solo" data-id="${l.id}" title="Solo">${l.solo ? 'S' : '◦'}</button>
            <button class="mute" data-id="${l.id}" title="Mute">${l.muted ? 'M' : '◦'}</button>
            <button class="delete" data-id="${l.id}" title="Delete">×</button>
        </div>
    `).join('');

    // Layer name editing
    document.querySelectorAll('.layer-name').forEach(input => {
        input.addEventListener('change', e => {
            const layer = layers.find(l => l.id == e.target.dataset.id);
            if (layer) layer.name = e.target.value.trim() || 'Untitled';
        });
    });

    // Click to select layer
    document.querySelectorAll('.layer-item').forEach(div => {
        div.addEventListener('click', e => {
            if (!e.target.classList.contains('delete') && 
                !e.target.classList.contains('solo') && 
                !e.target.classList.contains('mute')) {
                setActiveLayer(div.dataset.id);
            }
        });
    });

    // Solo
    document.querySelectorAll('.solo').forEach(btn => {
        btn.addEventListener('click', () => {
            const layer = layers.find(l => l.id == btn.dataset.id);
            if (layer) {
                layer.solo = !layer.solo;
                renderLayersList();
            }
        });
    });

    // Mute
    document.querySelectorAll('.mute').forEach(btn => {
        btn.addEventListener('click', () => {
            const layer = layers.find(l => l.id == btn.dataset.id);
            if (layer) {
                layer.muted = !layer.muted;
                renderLayersList();
                refreshTimeline();
            }
        });
    });

    // Delete
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this layer?')) {
                const layerId = btn.dataset.id;
                const index = layers.findIndex(l => l.id == layerId);
                if (index !== -1) {
                    layers.splice(index, 1);

                    if (layers.length === 0) {
                        const newLayer = createLayer("Layer 1");
                        setActiveLayer(newLayer.id);
                    } else {
                        setActiveLayer(layers[0].id);
                    }

                    renderLayersList();
                    refreshTimeline();
                }
            }
        });
    });
}

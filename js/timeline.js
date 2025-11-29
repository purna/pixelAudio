// timeline.js - Timeline visualization and playback control

class Timeline {
    constructor(app) {
        this.app = app;
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        
        this.zoom = 100;
        this.offsetX = 0;
        this.playheadPosition = 0;
        this.isPlaying = false;
        this.playbackStartTime = 0;
        
        this.isDragging = false;
        this.draggedLayer = null;
        this.dragStartX = 0;
        this.dragStartTime = 0;
        
        this.trackHeight = 60;
        this.trackPadding = 5;
        this.rulerHeight = 30;
    }

    init() {
        this.canvas = document.getElementById('timeline-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('layersChanged', () => this.render());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.render();
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#f8f9ff';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.drawRuler();
        this.drawTracks();
        if (this.isPlaying || this.playheadPosition > 0) this.drawPlayhead();
    }

    drawRuler() {
        const y = this.rulerHeight;
        this.ctx.fillStyle = '#e8ecff';
        this.ctx.fillRect(0, 0, this.width, y);
        this.ctx.strokeStyle = '#667eea';
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = '11px sans-serif';
        this.ctx.textAlign = 'center';

        const secondWidth = this.zoom;
        const startSecond = Math.floor(-this.offsetX / secondWidth);
        const endSecond = Math.ceil((this.width - this.offsetX) / secondWidth);

        for (let i = startSecond; i <= endSecond; i++) {
            if (i < 0) continue;
            const x = i * secondWidth + this.offsetX;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 15);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.fillText(`${i}s`, x, y - 18);
            if (this.zoom > 50) {
                for (let j = 1; j < 10; j++) {
                    const minorX = x + (j * secondWidth / 10);
                    this.ctx.beginPath();
                    this.ctx.moveTo(minorX, y - 5);
                    this.ctx.lineTo(minorX, y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.strokeStyle = '#667eea';
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
    }

    drawTracks() {
        const layers = this.app.layerManager.layers;
        const startY = this.rulerHeight;

        layers.forEach((layer, index) => {
            const y = startY + index * (this.trackHeight + this.trackPadding);
            this.drawTrack(layer, y);
        });
    }

    drawTrack(layer, y) {
        const duration = this.app.soundGenerator.calculateDuration(layer.settings);
        const x = layer.startTime * this.zoom + this.offsetX;
        const width = duration * this.zoom;

        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, y, this.width, this.trackHeight);
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.beginPath();
        this.ctx.moveTo(0, y + this.trackHeight);
        this.ctx.lineTo(this.width, y + this.trackHeight);
        this.ctx.stroke();

        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(layer.name, 10, y + 20);

        if (x + width > 0 && x < this.width) {
            this.ctx.fillStyle = layer.color;
            this.ctx.globalAlpha = layer.muted ? 0.3 : 0.8;
            this.ctx.fillRect(x, y + 5, width, this.trackHeight - 10);
            this.ctx.globalAlpha = 1;

            this.ctx.strokeStyle = layer.id === this.app.layerManager.selectedLayerId ? '#667eea' : '#333';
            this.ctx.lineWidth = layer.id === this.app.layerManager.selectedLayerId ? 3 : 1;
            this.ctx.strokeRect(x, y + 5, width, this.trackHeight - 10);
            this.ctx.lineWidth = 1;

            if (layer.fadeIn > 0) this.drawFade(x, y + 5, layer.fadeIn * this.zoom, this.trackHeight - 10, 'in');
            if (layer.fadeOut > 0) this.drawFade(x + width - layer.fadeOut * this.zoom, y + 5, layer.fadeOut * this.zoom, this.trackHeight - 10, 'out');
        }

        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'right';
        if (layer.muted) {
            this.ctx.fillStyle = '#f44336';
            this.ctx.fillText('M', this.width - 30, y + 20);
        }
        if (layer.solo) {
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillText('S', this.width - 10, y + 20);
        }
    }

    drawFade(x, y, width, height, type) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        if (type === 'in') {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + width, y + height);
            this.ctx.lineTo(x, y + height);
        } else {
            this.ctx.moveTo(x + width, y);
            this.ctx.lineTo(x, y + height);
            this.ctx.lineTo(x + width, y + height);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawPlayhead() {
        const x = this.playheadPosition * this.zoom + this.offsetX;
        if (x >= 0 && x <= this.width) {
            this.ctx.strokeStyle = '#f44336';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
        }
    }

    // ————————————————————
    // Mouse Interaction with Double-Click Fix
    // ————————————————————
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (y < this.rulerHeight) {
            this.playheadPosition = Math.max(0, (x - this.offsetX) / this.zoom);
            this.render();
            return;
        }

        const layer = this.getLayerAtPosition(x, y);
        if (layer) {
            if (e.detail === 2) { // Double-click → go to Settings tab
                this.app.layerManager.selectLayer(layer.id);
                document.querySelector('[data-tab="settings"]')?.click();
            } else {
                // Single click → select + allow dragging
                this.app.layerManager.selectLayer(layer.id);
                this.isDragging = true;
                this.draggedLayer = layer;
                this.dragStartX = x;
                this.dragStartTime = layer.startTime;
            }
        }
    }

    onMouseMove(e) {
        if (this.isDragging && this.draggedLayer) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const deltaX = x - this.dragStartX;
            const deltaTime = deltaX / this.zoom;
            const newStartTime = Math.max(0, this.dragStartTime + deltaTime);

            this.app.layerManager.updateLayer(this.draggedLayer.id, { startTime: newStartTime });
            this.render();
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.draggedLayer = null;
    }

    onWheel(e) {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom = Math.max(20, Math.min(500, this.zoom * factor));
        } else {
            this.offsetX -= e.deltaX;
            this.offsetX = Math.min(0, this.offsetX);
        }
        this.render();
    }

    getLayerAtPosition(x, y) {
        const layers = this.app.layerManager.layers;
        const startY = this.rulerHeight;

        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const trackY = startY + i * (this.trackHeight + this.trackPadding);
            if (y >= trackY && y < trackY + this.trackHeight) {
                const duration = this.app.soundGenerator.calculateDuration(layer.settings);
                const layerX = layer.startTime * this.zoom + this.offsetX;
                const layerWidth = duration * this.zoom;
                if (x >= layerX && x < layerX + layerWidth) {
                    return layer;
                }
            }
        }
        return null;
    }

    startPlayback() {
        this.isPlaying = true;
        this.playbackStartTime = Date.now();
        this.animatePlayback();
    }

    stopPlayback() {
        this.isPlaying = false;
        this.app.audioEngine.stopAll();
        this.playheadPosition = 0;
        this.render();
    }

    animatePlayback() {
        if (!this.isPlaying) return;
        const elapsed = (Date.now() - this.playbackStartTime) / 1000;
        this.playheadPosition = elapsed;
        this.render();
        requestAnimationFrame(() => this.animatePlayback());
    }

    getState() {
        return { zoom: this.zoom, offsetX: this.offsetX };
    }

    setState(state) {
        this.zoom = state.zoom || 100;
        this.offsetX = state.offsetX || 0;
        this.render();
    }
}

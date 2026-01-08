// layerManager.js - Manage multiple sound tracks + UI rendering with group/folder functionality

class LayerManager {
    constructor(app) {
        this.app = app;
        this.tracks = [];
        this.folders = []; // Array to store folder objects
        this.nextLayerId = 1;
        this.selectedLayerId = null;
        this.dragSource = null; // Track dragged item
        this.dragType = null; // 'track' or 'folder'
        this.dragTarget = null; // Track drop target for reordering
    }

    init() {
        const firstTrack = this.addTrack('Track 1');
        this.selectTrack(firstTrack.id); // Select the first track
        this.renderList(); // Initial render
        this.initFolderUI(); // Initialize folder UI

        // Listen for collection changes to update the tracks panel
        document.addEventListener('collectionChanged', () => {
            this.renderList();
        });
    }

    // Initialize folder management UI
    initFolderUI() {
        // Folder controls are now in the HTML, just add event listeners
        // Add event listeners for folder controls
        document.getElementById('add-group-btn')?.addEventListener('click', () => {
            // Automatically create a new group with a default name
            const groupNumber = this.app.collectionManager.getCurrentCollection()?.groups?.length + 1 || 1;
            const groupName = `Group ${groupNumber}`;
            this.app.collectionManager.addGroupToCurrentCollection(groupName);
        });
        document.getElementById('expand-all-btn')?.addEventListener('click', () => this.expandCollapseAll(true));
        document.getElementById('collapse-all-btn')?.addEventListener('click', () => this.expandCollapseAll(false));
    }

    addTrack(name = null) {
        const trackName = name || `Track ${this.nextLayerId}`;
        const track = {
            id: `track-${Date.now()}-${this.nextLayerId++}`,
            name: trackName,
            settings: { ...this.app.getDefaultSettings() },
            muted: false,
            solo: false,
            volume: 1.0,
            startTime: 0,
            fadeIn: 0,
            fadeOut: 0,
            color: this.generateRandomColor()
        };

        this.tracks.push(track);
        this.selectedLayerId = track.id;

        // Automatically add new tracks to the current collection
        const currentCollection = this.app.collectionManager?.getCurrentCollection();
        if (currentCollection) {
            this.app.collectionManager.addTrackToCollection(currentCollection.id, track);
        }

        this.notifyTrackChange();
        return track;
    }

    // Add track with specific ID (used when loading from collections)
    addTrackWithId(name, trackId) {
        const track = {
            id: trackId,
            name: name || `Track ${this.nextLayerId}`,
            settings: { ...this.app.getDefaultSettings() },
            muted: false,
            solo: false,
            volume: 1.0,
            startTime: 0,
            fadeIn: 0,
            fadeOut: 0,
            color: this.generateRandomColor()
        };

        this.tracks.push(track);
        this.selectedLayerId = track.id;

        // Don't automatically add to collection - it will be added by the caller
        // Note: We don't increment nextLayerId here since we're using a specific ID
        this.notifyTrackChange();
        return track;
    }

    // NEW: Duplicate track functionality
    duplicateTrack(sourceTrack) {
        const track = {
            id: `track-${Date.now()}-${this.nextLayerId++}`,
            name: sourceTrack.name + ' Copy',
            settings: { ...sourceTrack.settings },
            muted: sourceTrack.muted,
            solo: false, // Don't duplicate solo state
            volume: sourceTrack.volume,
            startTime: sourceTrack.startTime + 0.5, // Offset slightly
            fadeIn: sourceTrack.fadeIn,
            fadeOut: sourceTrack.fadeOut,
            color: this.generateRandomColor()
        };

        this.tracks.push(track);
        this.selectedLayerId = track.id;

        // Automatically add duplicated track to current collection
        const currentCollection = this.app.collectionManager?.getCurrentCollection();
        if (currentCollection) {
            this.app.collectionManager.addTrackToCollection(currentCollection.id, track);
        }

        // Update app settings and UI to reflect the new track
        this.app.currentSettings = { ...track.settings };
        if (this.app.ui) {
            this.app.ui.updateDisplay(track.settings);
        }

        this.notifyTrackChange();
        return track;
    }

    removeTrack(trackId) {
        const index = this.tracks.findIndex(t => t.id === trackId);
        if (index === -1) return;

        if (this.tracks.length <= 1) {
            this.app.notifications.showNotification('Cannot delete the last track', 'error');
            return;
        }

        if (!confirm(`Delete track "${this.tracks[index].name}"?`)) return;

        this.tracks.splice(index, 1);

        // FAILSAFE: Always ensure at least one track exists
        if (this.tracks.length === 0) {
            this.addTrack('Track 1');
            return;
        }

        // Select another track if we deleted the selected one
        if (this.selectedLayerId === trackId) {
            const newSelectedTrack = this.tracks[Math.min(index, this.tracks.length - 1)];
            this.selectTrack(newSelectedTrack.id);
        }

        // Remove from current collection as well
        const currentCollection = this.app.collectionManager?.getCurrentCollection();
        if (currentCollection) {
            this.app.collectionManager.removeTrackFromCollection(currentCollection.id, trackId);
        }

        this.notifyTrackChange();
    }

    // Layer alias methods (for compatibility with collectionManager)
    getLayer(layerId) {
        return this.getTrack(layerId);
    }

    getSelectedLayer() {
        return this.getSelectedTrack();
    }

    selectLayer(layerId) {
        this.selectTrack(layerId);
    }

    updateLayer(layerId, updates) {
        this.updateTrack(layerId, updates);
    }

    updateLayerSettings(layerId, settings) {
        this.updateTrackSettings(layerId, settings);
    }

    addLayer(name) {
        return this.addTrack(name);
    }

    addLayerWithId(name, layerId) {
        return this.addTrackWithId(name, layerId);
    }

    clearAllLayers() {
        this.clearAllTracks();
    }

    // Getter for layers array (alias for tracks)
    get layers() {
        return this.tracks;
    }

    getTrack(trackId) {
        return this.tracks.find(t => t.id === trackId);
    }

    getSelectedTrack() {
        return this.getTrack(this.selectedLayerId);
    }

    selectTrack(trackId) {
        const track = this.getTrack(trackId);
        if (track) {
            this.selectedLayerId = trackId;
            
            // ALWAYS update app settings and UI when selecting a track
            this.app.currentSettings = { ...track.settings };
            if (this.app.ui) {
                this.app.ui.updateDisplay(track.settings);
            }
            
            this.notifyTrackChange();
        }
    }

    updateTrack(trackId, updates) {
        const track = this.getTrack(trackId);
        if (track) {
            Object.assign(track, updates);
            // Sync changes back to collection storage
            if (this.app.collectionManager) {
                const currentCollection = this.app.collectionManager.getCurrentCollection();
                if (currentCollection) {
                    this.app.collectionManager.syncTrackToCollection(currentCollection.id, trackId);
                }
            }

            this.notifyTrackChange();
        }
    }
    updateTrackSettings(trackId, settings) {
        const track = this.getTrack(trackId);
        if (track) {
            track.settings = { ...track.settings, ...settings };

            // If this is the selected track, update the app and UI immediately
            if (trackId === this.selectedLayerId) {
                this.app.currentSettings = { ...track.settings };
                if (this.app.ui) {
                    this.app.ui.updateDisplay(track.settings);
                }
            }

            // Sync changes back to collection storage
            if (this.app.collectionManager) {
                const currentCollection = this.app.collectionManager.getCurrentCollection();
                if (currentCollection) {
                    this.app.collectionManager.syncTrackToCollection(currentCollection.id, trackId);
                }
            }

            this.notifyTrackChange();
        }
    }

    // Folder Management Methods
    addFolder(name = 'New Folder') {
        const folder = {
            id: `folder-${Date.now()}`,
            name: name,
            tracks: [],
            expanded: true
        };
        this.folders.push(folder);
        this.renderList();
    }

    expandCollapseAll(expand) {
        // Check if we're showing collection groups or legacy folders
        const currentCollection = this.app.collectionManager?.getCurrentCollection();
        const showCollectionGroups = currentCollection && currentCollection.groups && currentCollection.groups.length > 0;

        if (showCollectionGroups) {
            // Use collection manager for groups
            this.app.collectionManager.expandCollapseAllGroups(currentCollection.id, expand);
        } else {
            // Use legacy folder system
            this.folders.forEach(folder => {
                folder.expanded = expand;
            });
            this.renderList();
        }
    }

    addTrackToFolder(folderId, track) {
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            folder.tracks.push(track);
            // Remove from main tracks array if it exists there
            const idx = this.tracks.indexOf(track);
            if (idx > -1) {
                this.tracks.splice(idx, 1);
            }
        }
        this.renderList();
    }

    removeTrackFromFolder(folderId, track) {
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            const idx = folder.tracks.indexOf(track);
            if (idx > -1) {
                folder.tracks.splice(idx, 1);
                // Add back to main tracks array
                this.tracks.push(track);
            }
        }
        this.renderList();
    }

    getAllTracks() {
        let allTracks = [...this.tracks];
        this.folders.forEach(folder => {
            allTracks = [...allTracks, ...folder.tracks];
        });
        return allTracks;
    }

    deleteFolder(folderId) {
        const folderIndex = this.folders.findIndex(f => f.id === folderId);
        if (folderIndex === -1) return;

        // Move all tracks from folder back to main list
        const folder = this.folders[folderIndex];
        folder.tracks.forEach(track => {
            this.tracks.push(track);
        });

        // Remove folder
        this.folders.splice(folderIndex, 1);
        this.renderList();
    }

    renameTrack(trackId, newName) {
        if (!newName || newName.trim() === '') return;
        const track = this.getTrack(trackId);
        if (track) {
            track.name = newName.trim();
            // Sync changes back to collection storage
            if (this.app.collectionManager) {
                const currentCollection = this.app.collectionManager.getCurrentCollection();
                if (currentCollection) {
                    this.app.collectionManager.syncTrackToCollection(currentCollection.id, trackId);
                }
            }
            this.notifyTrackChange();
        }
    }

    toggleMute(trackId) {
        const track = this.getTrack(trackId);
        if (track) {
            track.muted = !track.muted;
            // Sync changes back to collection storage
            if (this.app.collectionManager) {
                const currentCollection = this.app.collectionManager.getCurrentCollection();
                if (currentCollection) {
                    this.app.collectionManager.syncTrackToCollection(currentCollection.id, trackId);
                }
            }
            this.notifyTrackChange();
        }
    }

    toggleSolo(trackId) {
        const track = this.getTrack(trackId);
        if (track) {
            track.solo = !track.solo;
            // Sync changes back to collection storage
            if (this.app.collectionManager) {
                const currentCollection = this.app.collectionManager.getCurrentCollection();
                if (currentCollection) {
                    this.app.collectionManager.syncTrackToCollection(currentCollection.id, trackId);
                }
            }
            this.notifyTrackChange();
        }
    }

    setTrackVolume(trackId, volume) {
        const track = this.getTrack(trackId);
        if (track) {
            track.volume = Math.max(0, Math.min(1, volume));
            // Sync changes back to collection storage
            if (this.app.collectionManager) {
                const currentCollection = this.app.collectionManager.getCurrentCollection();
                if (currentCollection) {
                    this.app.collectionManager.syncTrackToCollection(currentCollection.id, trackId);
                }
            }

            this.notifyTrackChange();
        }
    }

    moveTrack(trackId, direction) {
        const index = this.tracks.findIndex(t => t.id === trackId);
        if (index === -1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < this.tracks.length) {
            [this.tracks[index], this.tracks[newIndex]] = [this.tracks[newIndex], this.tracks[index]];
            this.notifyTrackChange();
        }
    }

    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    getActiveTracks() {
        const hasSolo = this.tracks.some(t => t.solo);
        return this.tracks.filter(track => {
            if (hasSolo) return track.solo;
            return !track.muted;
        });
    }

    generateTrackBuffers() {
        const activeTracks = this.getActiveTracks();
        const buffers = [];
        const volumes = [];

        for (const track of activeTracks) {
            const buffer = this.app.soundGenerator.generate(
                track.settings,
                this.app.audioEngine.sampleRate
            );
            buffers.push(buffer);
            volumes.push(track.volume);
        }

        return { buffers, volumes };
    }

    async playAllTracks() {
        const activeTracks = this.getActiveTracks();
        if (activeTracks.length === 0) return;

        // Ensure AudioContext is resumed before playing
        await this.app.audioEngine.ensureContextResumed();
        
        // Add delay for browser audio policies
        await new Promise(resolve => setTimeout(resolve, 100));
    
        this.app.audioEngine.stopAll(); // Clear any ongoing playback
        
        // Calculate the total duration including start times and fades
        let maxEndTime = 0;
        activeTracks.forEach(track => {
            const duration = this.app.soundGenerator.calculateDuration(track.settings);
            const endTime = track.startTime + duration + (track.fadeOut || 0);
            maxEndTime = Math.max(maxEndTime, endTime);
        });
        
        console.log('Playing', activeTracks.length, 'tracks, total duration:', maxEndTime, 'seconds');
    
        // Store all sources for stopping later
        const sources = [];
    
        activeTracks.forEach(track => {
            const buffer = this.app.soundGenerator.generate(track.settings, this.app.audioEngine.sampleRate);
            const source = this.app.audioEngine.context.createBufferSource();
            source.buffer = buffer;
    
            // Create gain node for volume and fades
            const gainNode = this.app.audioEngine.context.createGain();
            gainNode.gain.value = track.volume;
            source.connect(gainNode);
            gainNode.connect(this.app.audioEngine.context.destination);
    
            // Apply fades (linear ramp)
            if (track.fadeIn > 0) {
                gainNode.gain.setValueAtTime(0, this.app.audioEngine.context.currentTime + track.startTime);
                gainNode.gain.linearRampToValueAtTime(track.volume, this.app.audioEngine.context.currentTime + track.startTime + track.fadeIn);
            }
            if (track.fadeOut > 0) {
                const duration = this.app.soundGenerator.calculateDuration(track.settings);
                gainNode.gain.setValueAtTime(track.volume, this.app.audioEngine.context.currentTime + track.startTime + duration - track.fadeOut);
                gainNode.gain.linearRampToValueAtTime(0, this.app.audioEngine.context.currentTime + track.startTime + duration);
            }
    
            // Schedule start
            source.start(this.app.audioEngine.context.currentTime + track.startTime);
            
            // Track this source for stopping
            sources.push(source);
        });
        
        // Store all playing sources in audioEngine for later stopping
        this.app.audioEngine.setPlayingSources(sources);
        
        // Stop timeline playback when all sounds finish
        setTimeout(() => {
            if (this.app.timeline.isPlaying) {
                this.app.timeline.stopPlayback();
            }
            // Clear the playing sources
            this.app.audioEngine.setPlayingSources([]);
            // Reset play state only if still in playing state
            // (handles case where user manually paused)
            if (this.app.isPlayingAll) {
                this.app.isPlayingAll = false;
                if (this.app.updatePlayButtonIcons) {
                    this.app.updatePlayButtonIcons();
                }
            }
        }, (maxEndTime + 0.5) * 1000); // Add 0.5s buffer
    }

    exportMixedAudio(filename = 'mixed_sfx.wav') {
        try {
            const activeTracks = this.getActiveTracks();
            if (activeTracks.length === 0) {
                this.app.notifications.showNotification('No active tracks to export!', 'error');
                return;
            }

            console.log('Exporting mixed audio with', activeTracks.length, 'tracks');
    
            const buffers = [];
            const volumes = [];
            const offsets = [];
            const sampleRate = this.app.audioEngine.sampleRate;
    
            for (const track of activeTracks) {
                const buffer = this.app.soundGenerator.generate(track.settings, sampleRate);
                buffers.push(buffer);
                volumes.push(track.volume);
                offsets.push(Math.floor(track.startTime * sampleRate)); // Samples offset
            }
    
            const mixedBuffer = this.app.audioEngine.mixBuffers(buffers, volumes, offsets);
            this.app.audioEngine.downloadWAV(mixedBuffer, filename);
        } catch (error) {
            console.error('Error exporting mixed audio:', error);
            this.app.notifications.showNotification('Error exporting mixed audio: ' + error.message, 'error');
        }
    }

    getState() {
        return {
            tracks: this.tracks.map(t => ({ ...t })),
            nextLayerId: this.nextLayerId,
            selectedLayerId: this.selectedLayerId
        };
    }

    setState(state) {
        this.tracks = state.tracks.map(t => ({ ...t }));
        this.nextLayerId = state.nextLayerId;
        this.selectedLayerId = state.selectedLayerId;

        if (this.selectedLayerId) {
            const track = this.getTrack(this.selectedLayerId);
            if (track) this.app.updateSettings(track.settings);
        }

        this.notifyTrackChange();
    }

    clearAllTracks() {
        // Clear all tracks but preserve nextLayerId counter
        // This is used when switching collections to load collection-specific tracks
        this.tracks = [];
        this.selectedLayerId = null;
        this.notifyTrackChange();
    }

    notifyTrackChange() {
        this.renderList(); // Now handled internally
        const event = new CustomEvent('tracksChanged', {
            detail: { tracks: this.tracks, selectedId: this.selectedLayerId }
        });
        document.dispatchEvent(event);
    }

    // ────────────────────────────────────────────────────────────────
    // UI: Render Track List with Groups/Folders (like Pixel3D scene objects)
    // ────────────────────────────────────────────────────────────────
    renderList() {
        const list = document.getElementById('tracksList');
        if (!list) return;

        list.innerHTML = '';

        // Get current collection groups if collections are enabled
        const currentCollection = this.app.collectionManager?.getCurrentCollection();
        const showCollectionGroups = currentCollection && currentCollection.groups && currentCollection.groups.length > 0;

        if (showCollectionGroups) {
            // Render groups from current collection
            currentCollection.groups.forEach(group => {
                const folderEl = document.createElement('div');
                folderEl.className = 'layer-folder-item';
                folderEl.dataset.folderId = group.id;

                folderEl.innerHTML = `
                    <div class="folder-header" draggable="true">
                        <i class="fas ${group.expanded ? 'fa-folder-open' : 'fa-folder'} folder-icon"></i>
                        <input type="text" class="folder-name" value="${group.name}">
                        <div class="folder-actions">
                            <i class="fas fa-trash folder-delete-btn" title="Delete Folder"></i>
                            <i class="fas ${group.expanded ? 'fa-chevron-up' : 'fa-chevron-down'} folder-toggle-btn" title="${group.expanded ? 'Collapse' : 'Expand'}"></i>
                        </div>
                    </div>
                    <div class="folder-contents" style="display: ${group.expanded ? 'block' : 'none'};">
                    </div>
                `;

                // Add folder header events
                const header = folderEl.querySelector('.folder-header');
                const toggleBtn = folderEl.querySelector('.folder-toggle-btn');
                const deleteBtn = folderEl.querySelector('.folder-delete-btn');
                const nameInput = folderEl.querySelector('.folder-name');

                // Toggle folder expansion
                header.addEventListener('click', (e) => {
                    if (e.target === nameInput || e.target === toggleBtn || e.target === deleteBtn) return;
                    group.expanded = !group.expanded;
                    this.renderList();
                });

                // Toggle button
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    group.expanded = !group.expanded;
                    this.renderList();
                });

                // Delete folder
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.app.collectionManager.deleteGroup(currentCollection.id, group.id);
                });

                // Rename folder
                nameInput.addEventListener('change', (e) => {
                    this.app.collectionManager.renameGroup(currentCollection.id, group.id, e.target.value);
                });
                nameInput.addEventListener('click', (e) => e.stopPropagation());

                // Make folder header a drop target
                header.addEventListener('dragover', (e) => this.handleDragOver(e));
                header.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                header.addEventListener('drop', (e) => this.handleDropOnCollectionGroup(e, currentCollection.id, group.id));

                // Render folder contents
                const contentsEl = folderEl.querySelector('.folder-contents');
                // Use trackIds for new architecture, fallback to tracks for legacy
                const trackIds = group.trackIds || group.tracks || [];
                trackIds.forEach(trackId => {
                    const track = this.getTrack(trackId);
                    if (track) {
                        this.renderTrackInFolder(track, contentsEl, group.id);
                    }
                });

                list.appendChild(folderEl);
            });
        } else {
            // Fallback to original folder system if no collection groups
            this.folders.forEach(folder => {
                const folderEl = document.createElement('div');
                folderEl.className = 'layer-folder-item';
                folderEl.dataset.folderId = folder.id;

                folderEl.innerHTML = `
                    <div class="folder-header" draggable="true">
                        <i class="fas ${folder.expanded ? 'fa-folder-open' : 'fa-folder'} folder-icon"></i>
                        <input type="text" class="folder-name" value="${folder.name}">
                        <div class="folder-actions">
                            <i class="fas fa-trash folder-delete-btn" title="Delete Folder"></i>
                            <i class="fas ${folder.expanded ? 'fa-chevron-up' : 'fa-chevron-down'} folder-toggle-btn" title="${folder.expanded ? 'Collapse' : 'Expand'}"></i>
                        </div>
                    </div>
                    <div class="folder-contents" style="display: ${folder.expanded ? 'block' : 'none'};">
                    </div>
                `;

                // Add folder header events
                const header = folderEl.querySelector('.folder-header');
                const toggleBtn = folderEl.querySelector('.folder-toggle-btn');
                const deleteBtn = folderEl.querySelector('.folder-delete-btn');
                const nameInput = folderEl.querySelector('.folder-name');

                // Toggle folder expansion
                header.addEventListener('click', (e) => {
                    if (e.target === nameInput || e.target === toggleBtn || e.target === deleteBtn) return;
                    folder.expanded = !folder.expanded;
                    this.renderList();
                });

                // Toggle button
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    folder.expanded = !folder.expanded;
                    this.renderList();
                });

                // Delete folder
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFolder(folder.id);
                });

                // Rename folder
                nameInput.addEventListener('change', (e) => {
                    folder.name = e.target.value;
                });
                nameInput.addEventListener('click', (e) => e.stopPropagation());

                // Make folder header a drop target
                header.addEventListener('dragover', (e) => this.handleDragOver(e));
                header.addEventListener('dragleave', (e) => this.handleDragLeave(e));
                header.addEventListener('drop', (e) => this.handleDropOnFolder(e, folder.id));

                // Render folder contents
                const contentsEl = folderEl.querySelector('.folder-contents');
                folder.tracks.forEach(track => {
                    this.renderTrackInFolder(track, contentsEl, folder.id);
                });

                list.appendChild(folderEl);
            });
        }

        // Render tracks not in folders/groups
        // When using collection groups, show tracks that aren't in any group
        if (!showCollectionGroups) {
            // Legacy folder system - show all tracks not in folders
            this.tracks.forEach(track => {
                this.renderTrackInFolder(track, list, null);
            });
        } else {
            // Collection groups system - show tracks that aren't in any group
            const currentCollection = this.app.collectionManager?.getCurrentCollection();
            if (currentCollection) {
                // Find tracks that are in the collection but not in any group
                this.tracks.forEach(track => {
                    // Check if this track is in any group
                    const isInGroup = currentCollection.groups.some(group =>
                        (group.trackIds || group.tracks || []).includes(track.id)
                    );

                    // Only render if not in any group
                    if (!isInGroup) {
                        this.renderTrackInFolder(track, list, null);
                    }
                });
            }
        }
    }

    // Render a track in a specific container (folder or main list)
    renderTrackInFolder(track, container, folderId) {
        const trackDiv = document.createElement('div');
        trackDiv.className = `layer-item ${track.id === this.selectedLayerId ? 'active' : ''}`;
        trackDiv.draggable = true;
        trackDiv.dataset.folderId = folderId || 'main';
        trackDiv.dataset.trackId = track.id;

        // Mute / Visibility toggle
        const muteBtn = document.createElement('i');
        muteBtn.className = `fas fa-eye${track.muted ? '-slash' : ''} layer-vis-btn ${track.muted ? 'hidden-layer' : ''}`;
        muteBtn.title = track.muted ? 'Unmute track' : 'Mute track';
        muteBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleMute(track.id);
        };

        // Track name (editable)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'layer-name-input';
        nameInput.value = track.name;
        nameInput.onclick = e => e.stopPropagation();
        nameInput.onblur = () => this.renameTrack(track.id, nameInput.value.trim() || 'Track');
        nameInput.onkeydown = e => {
            if (e.key === 'Enter') nameInput.blur();
        };

        // Action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'layer-actions';
        actionsContainer.onclick = e => e.stopPropagation();

        // Duplicate button
        const dupBtn = document.createElement('i');
        dupBtn.className = 'fas fa-copy';
        dupBtn.style.color = 'var(--accent-tertiary)';
        dupBtn.style.fontSize = '12px';
        dupBtn.title = 'Duplicate track';
        dupBtn.onclick = (e) => {
            e.stopPropagation();
            this.app.saveUndoState();
            this.duplicateTrack(track);
            this.app.notifications.showNotification('Track duplicated', 'success');
        };

        // Add to folder / Remove from folder button
        const folderBtn = document.createElement('i');
        if (folderId) {
            // Check if this is a collection group
            const currentCollection = this.app.collectionManager?.getCurrentCollection();
            const isCollectionGroup = currentCollection?.groups?.some(g => g.id === folderId);

            if (isCollectionGroup) {
                folderBtn.className = 'fas fa-folder-minus layer-btn remove-from-folder';
                folderBtn.title = 'Remove from Group';
                folderBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.app.collectionManager.removeTrackFromGroup(currentCollection.id, folderId, track.id);
                };
            } else {
                folderBtn.className = 'fas fa-folder-minus layer-btn remove-from-folder';
                folderBtn.title = 'Remove from Folder';
                folderBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeTrackFromFolder(folderId, track);
                };
            }
        } else {
            folderBtn.className = 'fas fa-folder-plus layer-btn add-to-folder';
            folderBtn.title = 'Add to Folder';
            folderBtn.onclick = (e) => {
                e.stopPropagation();
                this.showFolderSelection(track);
            };
        }

        // Delete button
        const delBtn = document.createElement('i');
        delBtn.className = 'fas fa-trash';
        delBtn.style.color = '#f44336';
        delBtn.style.fontSize = '12px';
        delBtn.title = 'Delete track';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            this.app.saveUndoState();
            this.removeTrack(track.id);
        };

        actionsContainer.appendChild(dupBtn);
        actionsContainer.appendChild(folderBtn);
        actionsContainer.appendChild(delBtn);

        trackDiv.appendChild(muteBtn);
        trackDiv.appendChild(nameInput);
        trackDiv.appendChild(actionsContainer);

        // Drag start
        trackDiv.addEventListener('dragstart', (e) => {
            // Find the original index safely
            let originalIndex = -1;
            if (folderId) {
                // Check if this is a collection group first
                const currentCollection = this.app.collectionManager?.getCurrentCollection();
                const isCollectionGroup = currentCollection?.groups?.some(g => g.id === folderId);
    
                if (isCollectionGroup) {
                    // Find in collection group (use trackIds for new architecture)
                    const group = currentCollection.groups.find(g => g.id === folderId);
                    if (group) {
                        originalIndex = (group.trackIds || group.tracks || []).indexOf(track.id);
                    }
                } else {
                    // Find in legacy folder
                    const folder = this.folders.find(f => f.id === folderId);
                    if (folder) {
                        originalIndex = folder.tracks.indexOf(track);
                    }
                }
            } else {
                // Find in main tracks
                originalIndex = this.tracks.indexOf(track);
            }

            this.dragSource = {
                element: trackDiv,
                track: track,
                folderId: folderId,
                originalIndex: originalIndex
            };
            this.dragType = 'track';
            e.dataTransfer.setData('text/plain', 'drag-track');
            e.dataTransfer.effectAllowed = 'move';
            trackDiv.classList.add('dragging');
        });

        // Drag end
        trackDiv.addEventListener('dragend', (e) => {
            trackDiv.classList.remove('dragging');
            this.dragSource = null;
            this.dragType = null;
            this.dragTarget = null;
        });

        // Drag over for reordering
        trackDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver(e);

            // Find the target index safely
            let targetIndex = -1;
            if (folderId) {
                // Check if this is a collection group first
                const currentCollection = this.app.collectionManager?.getCurrentCollection();
                const isCollectionGroup = currentCollection?.groups?.some(g => g.id === folderId);
    
                if (isCollectionGroup) {
                    // Find in collection group (use trackIds for new architecture)
                    const group = currentCollection.groups.find(g => g.id === folderId);
                    if (group) {
                        targetIndex = (group.trackIds || group.tracks || []).indexOf(track.id);
                    }
                } else {
                    // Find in legacy folder
                    const folder = this.folders.find(f => f.id === folderId);
                    if (folder) {
                        targetIndex = folder.tracks.indexOf(track);
                    }
                }
            } else {
                // Find in main tracks
                targetIndex = this.tracks.indexOf(track);
            }

            this.dragTarget = {
                element: trackDiv,
                folderId: folderId,
                index: targetIndex
            };
        });

        // Drag leave
        trackDiv.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e);
            if (this.dragTarget?.element === trackDiv) {
                this.dragTarget = null;
            }
        });

        // Drop on track for reordering
        trackDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDragLeave(e);
            if (this.dragSource && this.dragTarget && this.dragSource.track !== this.dragTarget.track) {
                this.handleDropOnTrack(e);
            }
        });

        // Select track (clicking the row, but not inputs/buttons)
        trackDiv.onclick = (e) => {
            if (e.target.tagName === 'I' || e.target.tagName === 'INPUT') return;
            this.selectTrack(track.id);
        };

        container.appendChild(trackDiv);
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Handle folder drop targets
        const folderHeader = e.target.closest('.folder-header');
        if (folderHeader) {
            // Remove previous drop targets from tracks only
            const previousTrackDropTargets = document.querySelectorAll('.layer-item.drag-over');
            previousTrackDropTargets.forEach(el => el.classList.remove('drag-over'));

            // Remove drag-over from other folders
            const previousFolderDropTargets = document.querySelectorAll('.folder-header.drag-over');
            previousFolderDropTargets.forEach(el => {
                if (el !== folderHeader) {
                    el.classList.remove('drag-over');
                }
            });

            // Add drag-over class to folder header
            folderHeader.classList.add('drag-over');
            
            // Store the target folder ID
            const folderItem = folderHeader.closest('.layer-folder-item');
            if (folderItem) {
                this.dragState.targetFolderId = folderItem.dataset.folderId;
            }
            return;
        }

        // Handle track drop targets
        const targetElement = e.target.closest('.layer-item');
        if (!targetElement || targetElement === this.dragState.draggedElement) {
            // Remove folder drag-over if we're not over a folder anymore
            const previousFolderDropTargets = document.querySelectorAll('.folder-header.drag-over');
            previousFolderDropTargets.forEach(el => el.classList.remove('drag-over'));
            return;
        }

        // Remove previous drop targets
        const previousTrackDropTarget = document.querySelector('.layer-item.drag-over');
        if (previousTrackDropTarget) {
            previousTrackDropTarget.classList.remove('drag-over');
        }
        const previousFolderDropTargets = document.querySelectorAll('.folder-header.drag-over');
        previousFolderDropTargets.forEach(el => el.classList.remove('drag-over'));

        // Add drag-over class to new target
        targetElement.classList.add('drag-over');
        this.dragState.dropIndex = parseInt(targetElement.dataset.index);
        this.dragState.targetFolderId = null; // Not dropping on a folder
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('drag-over')) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDropOnFolder(e, folderId) {
        e.preventDefault();
        e.stopPropagation();

        // Remove drag-over class
        if (e.target.classList.contains('drag-over')) {
            e.target.classList.remove('drag-over');
        }

        if (!this.dragSource || this.dragType !== 'track') return;

        // Move track to this folder
        this.addTrackToFolder(folderId, this.dragSource.track);
    }

    handleDropOnCollectionGroup(e, collectionId, groupId) {
        e.preventDefault();
        e.stopPropagation();

        // Remove drag-over class
        if (e.target.classList.contains('drag-over')) {
            e.target.classList.remove('drag-over');
        }

        if (!this.dragSource || this.dragType !== 'track') return;

        // Move track to this collection group
        this.app.collectionManager.addTrackToGroup(collectionId, groupId, this.dragSource.track.id);
    }

    handleDropOnTrack(e) {
        e.preventDefault();
        e.stopPropagation();

        // Remove drag-over class
        if (e.target.classList.contains('drag-over')) {
            e.target.classList.remove('drag-over');
        }

        if (!this.dragSource || !this.dragTarget) return;

        const sourceTrack = this.dragSource.track;
        const targetTrack = this.dragTarget.track;

        // Same folder or both in main list
        if (this.dragSource.folderId === this.dragTarget.folderId) {
            this.reorderTracksInSameContainer(this.dragSource, this.dragTarget);
        }
        // Different containers - move from one to another
        else {
            this.moveTrackBetweenContainers(this.dragSource, this.dragTarget);
        }
    }

    // Reorder tracks within the same container (folder or main list)
    reorderTracksInSameContainer(source, target) {
        const containerId = source.folderId;
        const isFolder = containerId && containerId !== 'main';
        const container = isFolder
            ? this.folders.find(f => f.id === containerId)
            : { tracks: this.tracks };

        if (!container || !container.tracks) return;

        // Remove source track
        if (container.tracks) {
            container.tracks.splice(source.originalIndex, 1);
            // Insert at target position
            const insertIndex = target.index > source.originalIndex ? target.index - 1 : target.index;
            container.tracks.splice(insertIndex, 0, source.track);
        }

        this.renderList();
    }

    // Move track between different containers (folder to folder, folder to main, etc.)
    moveTrackBetweenContainers(source, target) {
        const sourceIsFolder = source.folderId && source.folderId !== 'main';
        const targetIsFolder = target.folderId && target.folderId !== 'main';

        // Remove from source container
        if (sourceIsFolder) {
            const sourceFolder = this.folders.find(f => f.id === source.folderId);
            if (sourceFolder) {
                sourceFolder.tracks.splice(source.originalIndex, 1);
            }
        } else {
            this.tracks.splice(source.originalIndex, 1);
        }

        // Add to target container at the target position
        if (targetIsFolder) {
            const targetFolder = this.folders.find(f => f.id === target.folderId);
            if (targetFolder) {
                targetFolder.tracks.splice(target.index, 0, source.track);
            }
        } else {
            this.tracks.splice(target.index, 0, source.track);
        }

        this.renderList();
    }

    // Show folder selection dialog for adding track to folder
    showFolderSelection(track) {
        // Create a simple dropdown to select folder
        const existingDropdown = document.getElementById('folder-select-dropdown');
        if (existingDropdown) existingDropdown.remove();

        const dropdown = document.createElement('div');
        dropdown.id = 'folder-select-dropdown';
        dropdown.className = 'folder-select-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">Select Folder</div>
            ${this.folders.map(folder => `
                <div class="dropdown-item" data-folder-id="${folder.id}">${folder.name}</div>
            `).join('')}
            <div class="dropdown-item new-folder-item">+ New Folder</div>
        `;

        // Position near the track
        const trackElement = document.querySelector(`.layer-item[data-track-id="${track.id}"]`);
        if (trackElement) {
            const rect = trackElement.getBoundingClientRect();
            dropdown.style.position = 'absolute';
            dropdown.style.left = `${rect.right + 10}px`;
            dropdown.style.top = `${rect.top}px`;
            document.body.appendChild(dropdown);

            // Add event listeners
            dropdown.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (item.classList.contains('new-folder-item')) {
                        const folderName = prompt('Enter folder name:', 'New Folder');
                        if (folderName) {
                            this.addFolder(folderName);
                            this.addTrackToFolder(this.folders[this.folders.length - 1].id, track);
                        }
                    } else {
                        const folderId = item.dataset.folderId;
                        this.addTrackToFolder(folderId, track);
                    }
                    dropdown.remove();
                });
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }
    }
}

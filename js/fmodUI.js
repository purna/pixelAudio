// fmodUI.js - FMOD Panel UI Management

class FMODUI {
    constructor(app) {
        this.app = app;
        this.fmodManager = null;
        this.selectedBankId = null;
        
        // Bind methods to ensure 'this' context is preserved
        this.addBank = this.addBank.bind(this);
        this.addCollectionToBank = this.addCollectionToBank.bind(this);
        this.exportCurrentBank = this.exportCurrentBank.bind(this);
        this.exportUnityScripts = this.exportUnityScripts.bind(this);
        this.exportAllBanks = this.exportAllBanks.bind(this);
        this.showNotification = this.showNotification.bind(this);
        
        this.init();
    }

    init() {
        console.log('FMODUI.init() called');

        // Try to get fmodManager from app
        if (this.app && this.app.fmodManager) {
            this.fmodManager = this.app.fmodManager;
            console.log('FMODUI: FMOD Manager found, binding events');
            this.bindEvents();
            this.renderBanksList();
            this.startMeterMonitoring();
            console.log('FMODUI: Initialization complete');
        } else {
            console.log('FMODUI: fmodManager not available yet, waiting...');
            // Try again in 50ms
            setTimeout(() => {
                if (this.app && this.app.fmodManager) {
                    this.fmodManager = this.app.fmodManager;
                    console.log('FMODUI: FMOD Manager found on retry, binding events');
                    this.bindEvents();
                    this.renderBanksList();
                    this.startMeterMonitoring();
                    console.log('FMODUI: Initialization complete');
                } else {
                    console.log('FMODUI: Still waiting for FMOD Manager...');
                    setTimeout(() => this.init(), 100);
                }
            }, 50);
        }
    }

    bindEvents() {
        console.log('FMODUI.bindEvents: Starting');

        // Bind FMOD control events
        this.bindFMODControls();

        // Simple direct event binding for FMOD buttons
        const buttonHandlers = {
            'fmod-add-bank': () => this.addBank(),
            'fmod-add-collection': () => this.addCollectionToBank(),
            'fmod-export-bank': () => this.exportCurrentBank(),
            'fmod-export-unity': () => this.exportUnityScripts(),
            'fmod-export-all': () => this.exportAllBanks()
        };

        // Bind events when DOM is ready
        const bindButtonEvents = () => {
            Object.keys(buttonHandlers).forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        buttonHandlers[id]();
                    });
                    console.log(`FMODUI: Bound event for ${id}`);
                } else {
                    console.warn(`FMODUI: Button ${id} not found`);
                }
            });
        };

        // Try immediately, then retry after DOM load
        bindButtonEvents();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindButtonEvents);
        }

        console.log('FMODUI.bindEvents: Complete');
    }

    bindFMODControls() {
        // Bind controls when settings modal is opened
        const bindControls = () => {
            // EQ Controls
            const eqControls = ['low', 'mid', 'high'];
            eqControls.forEach(band => {
                const slider = document.getElementById(`fmod-eq-${band}`);
                const valueDisplay = document.getElementById(`fmod-eq-${band}-value`);

                if (slider && valueDisplay) {
                    slider.addEventListener('input', (e) => {
                        const value = parseFloat(e.target.value);
                        this.fmodManager.setEQ(band, value);
                        valueDisplay.textContent = `${value > 0 ? '+' : ''}${value}dB`;
                    });

                    // Initialize display
                    const currentValue = this.fmodManager.getEQ(band);
                    valueDisplay.textContent = `${currentValue > 0 ? '+' : ''}${currentValue}dB`;
                }
            });

            // Master Volume
            const masterVolume = document.getElementById('fmod-master-volume');
            const masterVolumeValue = document.getElementById('fmod-master-volume-value');

            if (masterVolume && masterVolumeValue) {
                masterVolume.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value) / 100;
                    this.fmodManager.setMasterVolume(value);
                    masterVolumeValue.textContent = `${Math.round(value * 100)}%`;
                });

                // Initialize display
                const currentVolume = this.fmodManager.masterBus.gain.value;
                masterVolumeValue.textContent = `${Math.round(currentVolume * 100)}%`;
            }

            // Compressor Controls
            const compressorThreshold = document.getElementById('fmod-compressor-threshold');
            const compressorThresholdValue = document.getElementById('fmod-compressor-threshold-value');
            const compressorRatio = document.getElementById('fmod-compressor-ratio');
            const compressorRatioValue = document.getElementById('fmod-compressor-ratio-value');

            if (compressorThreshold && compressorThresholdValue) {
                compressorThreshold.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.fmodManager.setCompressor(value, this.fmodManager.compressor.ratio.value);
                    compressorThresholdValue.textContent = `${value}dB`;
                });

                // Initialize display
                compressorThresholdValue.textContent = `${this.fmodManager.compressor.threshold.value}dB`;
            }

            if (compressorRatio && compressorRatioValue) {
                compressorRatio.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.fmodManager.setCompressor(this.fmodManager.compressor.threshold.value, value);
                    compressorRatioValue.textContent = `${value}:1`;
                });

                // Initialize display
                compressorRatioValue.textContent = `${this.fmodManager.compressor.ratio.value}:1`;
            }
        };

        // Bind controls immediately and when settings modal opens
        bindControls();

        // Also bind when settings modal becomes visible
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const display = window.getComputedStyle(settingsModal).display;
                        if (display !== 'none') {
                            // Settings modal is now visible, bind controls
                            setTimeout(bindControls, 100);
                        }
                    }
                });
            });
            observer.observe(settingsModal, { attributes: true, attributeFilter: ['style'] });
        }
    }

    startMeterMonitoring() {
        if (!this.fmodManager) return;

        const settingsModal = document.getElementById('settings-modal');
        if (!settingsModal) return;

        // Start/stop meter based on settings modal visibility
        const updateMeterVisibility = () => {
            const isVisible = window.getComputedStyle(settingsModal).display !== 'none';
            const isAudioTab = document.querySelector('.settings-tab[data-tab="audio"]')?.classList.contains('active');

            if (isVisible && isAudioTab) {
                // Start monitoring
                if (!this.meterCallback) {
                    this.startMeterUpdates();
                }
            } else {
                // Stop monitoring
                if (this.meterCallback) {
                    this.fmodManager.stopMeterMonitoring();
                    this.meterCallback = null;
                }
            }
        };

        // Monitor settings modal visibility and tab changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    updateMeterVisibility();
                }
            });
        });

        // Also monitor tab changes
        const audioTab = document.querySelector('.settings-tab[data-tab="audio"]');
        if (audioTab) {
            audioTab.addEventListener('click', updateMeterVisibility);
        }

        observer.observe(settingsModal, { attributes: true, attributeFilter: ['style'] });

        // Initial check
        updateMeterVisibility();
    }

    startMeterUpdates() {
        const meterBar = document.getElementById('fmod-master-meter');
        const meterValue = document.getElementById('fmod-master-meter-value');

        if (!meterBar || !meterValue) return;

        this.meterCallback = (level) => {
            // Update meter bar (0-100% based on dB level, -60dB = 0%, 0dB = 100%)
            const percentage = Math.max(0, Math.min(100, (level + 60) * (100 / 60)));
            meterBar.style.width = `${percentage}%`;

            // Update color based on level (green -> yellow -> red)
            if (level < -20) {
                meterBar.style.background = 'linear-gradient(90deg, #4CAF50, #FFEB3B)';
            } else if (level < -6) {
                meterBar.style.background = 'linear-gradient(90deg, #FFEB3B, #FF5722)';
            } else {
                meterBar.style.background = '#FF5722';
            }

            // Update text display
            meterValue.textContent = level === -Infinity ? '-∞ dB' : `${level.toFixed(1)} dB`;
        };

        this.fmodManager.startMeterMonitoring(this.meterCallback);
    }

    addBank() {
        console.log('FMODUI.addBank() called');
        if (!this.fmodManager) {
            console.error('FMODUI: FMOD Manager not initialized');
            this.showNotification('FMOD Manager not initialized', 'error');
            return;
        }

        // Check max banks (4)
        const banks = this.fmodManager.getAllBanks();
        console.log('FMODUI: Current banks count:', banks.length);
        if (banks.length >= 4) {
            this.showNotification('Maximum 4 banks allowed', 'error');
            return;
        }

        // Prompt for bank name
        const name = prompt('Enter bank name:', 'New Bank');
        if (!name) {
            console.log('FMODUI: User cancelled bank creation');
            return;
        }

        const bankId = 'bank_' + Date.now();
        console.log('FMODUI: Creating bank:', name, 'with id:', bankId);
        
        const result = this.fmodManager.createBank(bankId, {
            name: name,
            category: 'custom'
        });
        
        console.log('FMODUI: Bank created result:', result);

        this.renderBanksList();
        this.selectBank(bankId);
        this.showNotification(`Bank "${name}" created!`, 'success');
        console.log('FMODUI: Bank creation complete');
    }

    addCollectionToBank() {
        console.log('FMODUI.addCollectionToBank() called');
        if (!this.fmodManager) {
            console.error('FMODUI: FMOD Manager not initialized');
            this.showNotification('FMOD Manager not initialized', 'error');
            return;
        }

        if (!this.selectedBankId) {
            console.warn('FMODUI: No bank selected');
            this.showNotification('Select a bank first', 'error');
            return;
        }

        console.log('FMODUI: Adding collection to bank:', this.selectedBankId);

        // Get available collections from collectionManager
        let availableCollections = [];
        if (this.app && this.app.collectionManager) {
            availableCollections = this.app.collectionManager.getAllCollections() || [];
            console.log('FMODUI: Available collections:', availableCollections.length);
        } else {
            console.warn('FMODUI: collectionManager not available');
        }

        // Get collections already in bank
        const bank = this.fmodManager.getBank(this.selectedBankId);
        const existingIds = bank ? bank.collections || [] : [];
        console.log('FMODUI: Existing collection IDs in bank:', existingIds);

        // Filter out already added
        availableCollections = availableCollections.filter(c => !existingIds.includes(c.id));

        if (availableCollections.length === 0) {
            console.warn('FMODUI: No available collections to add');
            this.showNotification('No available collections to add', 'error');
            return;
        }

        console.log('FMODUI: Filtered collections:', availableCollections.length);

        // Create selection UI
        const selectionHtml = availableCollections.map(c =>
            `<option value="${c.id}">${c.name}</option>`
        ).join('');

        const select = document.createElement('select');
        select.className = 'fmod-dialog-select';
        select.innerHTML = '<option value="">Select a collection</option>' + selectionHtml;

        const dialog = document.createElement('div');
        dialog.className = 'fmod-dialog-overlay';
        dialog.innerHTML = `
            <div class="fmod-dialog-content">
                <h3 class="fmod-dialog-title">Add Collection to Bank</h3>
                <p class="fmod-dialog-description">
                    Select a collection to add to this bank
                </p>
            </div>
        `;
        dialog.querySelector('.fmod-dialog-content').appendChild(select);

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn primary fmod-dialog-confirm';
        confirmBtn.textContent = 'Add Collection';
        dialog.querySelector('.fmod-dialog-content').appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn fmod-dialog-cancel';
        cancelBtn.textContent = 'Cancel';
        dialog.querySelector('.fmod-dialog-content').appendChild(cancelBtn);

        document.body.appendChild(dialog);

        cancelBtn.addEventListener('click', () => {
            console.log('FMODUI: User cancelled collection addition');
            dialog.remove();
        });

        confirmBtn.addEventListener('click', () => {
            if (select.value) {
                console.log('FMODUI: Adding collection:', select.value);
                this.fmodManager.addCollectionToBank(this.selectedBankId, select.value);
                this.renderBanksList();
                dialog.remove();
                this.showNotification('Collection added to bank!', 'success');
                console.log('FMODUI: Collection added successfully');
            }
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                console.log('FMODUI: Dialog dismissed by background click');
                dialog.remove();
            }
        });
    }

    selectBank(bankId) {
        this.selectedBankId = bankId;

        // Update UI selection
        const bankItems = document.querySelectorAll('.fmod-bank-item');
        bankItems.forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.bankId === bankId) {
                item.classList.add('selected');
            }
        });
    }

    renderBanksList() {
        const banksList = document.getElementById('fmod-banks-list');
        if (!banksList) return;

        banksList.innerHTML = '';

        if (!this.fmodManager) {
            banksList.innerHTML = '<p style="color:var(--text-secondary);font-size:0.8rem;padding:12px;text-align:center;">Loading...</p>';
            return;
        }

        const banks = this.fmodManager.getAllBanks();

        if (banks.length === 0) {
            // Create default banks
            const defaultBanks = [
                { name: 'UI Sounds', category: 'ui' },
                { name: 'Gameplay', category: 'gameplay' },
                { name: 'Environment', category: 'environment' },
                { name: 'Music', category: 'music' }
            ];

            defaultBanks.forEach((bank, index) => {
                this.fmodManager.createBank('bank_' + (index + 1), bank);
            });

            this.renderBanksList();
            return;
        }

        banks.forEach(bank => {
            const item = document.createElement('div');
            item.className = 'fmod-bank-item' + (bank.id === this.selectedBankId ? ' selected' : '');
            item.dataset.bankId = bank.id;

            const categoryClass = this.getCategoryClass(bank.category);
            const collections = bank.collections || [];
            const collectionCount = collections.length;

            // Get collection details from collectionManager
            let collectionDetails = [];
            if (this.app && this.app.collectionManager) {
                const allCollections = this.app.collectionManager.getAllCollections() || [];
                collectionDetails = collections.map(id => {
                    const found = allCollections.find(c => c.id === id);
                    return found || { name: 'Unknown Collection', id: id };
                });
            }

            // Build collections HTML
            const collectionsHtml = collectionDetails.map(collection => `
                <div class="fmod-bank-collection-item">
                    <span class="fmod-collection-name"><i class="fas fa-folder"></i> ${collection.name}</span>
                    <button class="fmod-remove-collection" data-bank-id="${bank.id}" data-collection-id="${collection.id}" title="Remove from bank">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            item.innerHTML = `
                <div class="fmod-bank-header">
                    <div class="fmod-bank-info">
                        <div class="fmod-bank-name">${bank.name}</div>
                        <div class="fmod-bank-category">${bank.category || 'custom'}</div>
                    </div>
                    <div class="fmod-bank-count">${collectionCount} collection${collectionCount !== 1 ? 's' : ''}</div>
                    <span class="fmod-bank-badge ${categoryClass}"></span>
                </div>
                <div class="fmod-bank-collections-list">${collectionsHtml || '<span class="fmod-no-collections">No collections</span>'}</div>
            `;

            // Add click handler for bank selection
            item.querySelector('.fmod-bank-header').addEventListener('click', (e) => {
                if (!e.target.closest('.fmod-remove-collection')) {
                    this.selectBank(bank.id);
                }
            });

            // Add remove collection handlers
            item.querySelectorAll('.fmod-remove-collection').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const collectionId = btn.dataset.collectionId;
                    this.removeCollectionFromBank(collectionId);
                });
            });

            banksList.appendChild(item);
        });

        // Auto-select first bank if none selected
        if (!this.selectedBankId && banks.length > 0) {
            this.selectBank(banks[0].id);
        }
    }

    removeCollectionFromBank(collectionId) {
        if (!this.selectedBankId || !this.fmodManager) return;

        this.fmodManager.removeCollectionFromBank(this.selectedBankId, collectionId);
        this.renderBanksList();
        this.showNotification('Collection removed from bank', 'info');
    }

    getCategoryClass(category) {
        if (category === 'ui') return 'fmod-badge-ui';
        if (category === 'gameplay') return 'fmod-badge-gameplay';
        if (category === 'environment') return 'fmod-badge-environment';
        if (category === 'music') return 'fmod-badge-music';
        if (category === 'voice') return 'fmod-badge-voice';
        return 'fmod-badge-gameplay';
    }

    exportCurrentBank() {
        console.log('FMODUI.exportCurrentBank() called');
        if (!this.fmodManager) {
            console.error('FMODUI: FMOD Manager not initialized');
            this.showNotification('FMOD Manager not initialized', 'error');
            return;
        }

        if (!this.selectedBankId) {
            console.warn('FMODUI: No bank selected for export');
            this.showNotification('Select a bank first', 'error');
            return;
        }

        const bank = this.fmodManager.getBank(this.selectedBankId);
        if (!bank) {
            console.error('FMODUI: Bank not found:', this.selectedBankId);
            this.showNotification('Bank not found', 'error');
            return;
        }

        console.log('FMODUI: Exporting bank:', bank.name);
        this.fmodManager.exportBank(this.selectedBankId);
        this.showNotification(`Bank "${bank.name}" exported!`, 'success');
        console.log('FMODUI: Bank export complete');
    }

    exportUnityScripts() {
        console.log('FMODUI.exportUnityScripts() called');
        if (!this.fmodManager) {
            console.error('FMODUI: FMOD Manager not initialized');
            this.showNotification('FMOD Manager not initialized', 'error');
            return;
        }

        // Export Unity scripts for all banks
        const banks = this.fmodManager.getAllBanks();
        console.log('FMODUI: Banks found:', banks.length);
        if (banks.length === 0) {
            this.showNotification('No banks to export', 'error');
            return;
        }

        console.log('FMODUI: Downloading Unity scripts');
        this.fmodManager.downloadUnityScripts();
        this.showNotification('Unity scripts exported!', 'success');
        console.log('FMODUI: Unity scripts export complete');
    }

    exportAllBanks() {
        console.log('FMODUI.exportAllBanks() called');
        if (!this.fmodManager) {
            console.error('FMODUI: FMOD Manager not initialized');
            this.showNotification('FMOD Manager not initialized', 'error');
            return;
        }

        const banks = this.fmodManager.getAllBanks();
        console.log('FMODUI: Banks found:', banks.length);
        if (banks.length === 0) {
            this.showNotification('No banks to export', 'error');
            return;
        }

        // Export each bank
        console.log('FMODUI: Exporting all banks...');
        banks.forEach(bank => {
            console.log('FMODUI: Exporting bank:', bank.name);
            this.fmodManager.exportBank(bank.id);
        });

        this.showNotification(`${banks.length} banks exported!`, 'success');
        console.log('FMODUI: All banks export complete');
    }

    showNotification(message, type = 'info') {
        if (this.app && this.app.notifications) {
            this.app.notifications.showNotification(message, type);
        } else {
            console.log(message);
        }
    }

    refresh() {
        this.renderBanksList();
    }
}

// Export for use
window.FMODUI = FMODUI;

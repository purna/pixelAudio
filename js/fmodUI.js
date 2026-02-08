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
        
        // STRATEGY: Use BOTH delegation AND direct listeners for maximum compatibility
        
        // Method 1: Event delegation on the side panel (handles all clicks)
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel) {
            console.log('FMODUI: side-panel element found, setting up event delegation');
            
            sidePanel.addEventListener('click', (e) => {
                console.log('FMODUI: Click detected on side-panel', {
                    target: e.target.tagName,
                    targetId: e.target.id,
                    targetClass: e.target.className
                });
                
                // Find the button that was clicked (handles clicks on child elements like icons)
                const button = e.target.closest('button');
                
                if (!button) {
                    console.log('FMODUI: No button found in click path');
                    return;
                }
                
                console.log('FMODUI: Button found:', button.id);
                
                // Check if this is an FMOD button
                const fmodButtonIds = ['fmod-add-bank', 'fmod-add-collection', 'fmod-export-bank', 'fmod-export-unity', 'fmod-export-all'];
                
                if (!fmodButtonIds.includes(button.id)) {
                    console.log('FMODUI: Not an FMOD button, ignoring');
                    return;
                }
                
                console.log('FMODUI: FMOD button clicked:', button.id);
                e.preventDefault();
                e.stopPropagation();
                
                // Route to appropriate handler
                switch(button.id) {
                    case 'fmod-add-bank':
                        console.log('FMODUI: Calling addBank()');
                        this.addBank();
                        break;
                    case 'fmod-add-collection':
                        console.log('FMODUI: Calling addCollectionToBank()');
                        this.addCollectionToBank();
                        break;
                    case 'fmod-export-bank':
                        console.log('FMODUI: Calling exportCurrentBank()');
                        this.exportCurrentBank();
                        break;
                    case 'fmod-export-unity':
                        console.log('FMODUI: Calling exportUnityScripts()');
                        this.exportUnityScripts();
                        break;
                    case 'fmod-export-all':
                        console.log('FMODUI: Calling exportAllBanks()');
                        this.exportAllBanks();
                        break;
                }
            }, true); // Use capture phase to catch events early
            
            console.log('FMODUI: Event delegation added to side panel (capture phase)');
        } else {
            console.error('FMODUI: side-panel element NOT FOUND!');
        }
        
        // Method 2: Direct listeners as backup (wait a bit for DOM to be ready)
        setTimeout(() => {
            const buttonIds = ['fmod-add-bank', 'fmod-add-collection', 'fmod-export-bank', 'fmod-export-unity', 'fmod-export-all'];
            const handlers = {
                'fmod-add-bank': () => this.addBank(),
                'fmod-add-collection': () => this.addCollectionToBank(),
                'fmod-export-bank': () => this.exportCurrentBank(),
                'fmod-export-unity': () => this.exportUnityScripts(),
                'fmod-export-all': () => this.exportAllBanks()
            };
            
            buttonIds.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    console.log(`FMODUI: Found button ${id}, adding direct listener`);
                    btn.addEventListener('click', (e) => {
                        console.log(`FMODUI: Direct listener triggered for ${id}`);
                        e.preventDefault();
                        e.stopPropagation();
                        handlers[id]();
                    });
                } else {
                    console.warn(`FMODUI: Button ${id} not found for direct listener`);
                }
            });
        }, 500);
        
        console.log('FMODUI.bindEvents: Complete');
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

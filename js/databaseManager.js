/**
 * DatabaseManager.js - Handle saving and loading collections to/from a database
 *
 * This implementation uses Firebase Firestore as the primary database solution by:
 * 1. Authenticating users with Google login
 * 2. Using Firestore to save/load collection data
 * 3. Providing offline fallback to localStorage
 */

class DatabaseManager {
    constructor(app) {
        this.app = app;
        this.collectionManager = app.collectionManager;
        this.firebaseAuth = getFirebaseAuthManager();
        this.db = getFirestore();

        // Check if we have Firebase credentials
        this.checkFirebaseCredentials();
    }

    /**
     * Check if Firebase credentials are available
     */
    checkFirebaseCredentials() {
        // Check if Firebase is configured
        if (!isFirebaseConfigured()) {
            console.warn('Firebase is not configured. Using localStorage as primary database.');
            this.isConfigured = false;
            return;
        }

        this.isConfigured = true;
        console.log('Firebase is configured and available');
        
        // Listen for auth state changes
        this.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.userId = user.uid;
                this.isConnected = true;
                console.log('DatabaseManager: User authenticated, userId:', this.userId);
                
                // Auto-load collections when user logs in
                if (this.autoSyncEnabled) {
                    this.loadCollectionsFromDatabase();
                }
            } else {
                this.userId = null;
                this.isConnected = false;
                console.log('DatabaseManager: User logged out');
            }
        });
        
        // Check if user is already logged in
        const currentUser = this.firebaseAuth.getCurrentUser();
        if (currentUser) {
            this.userId = currentUser.uid;
            this.isConnected = true;
            this.autoSyncEnabled = localStorage.getItem('pixelAudioAutoSync') !== 'false';
        }
    }

    /**
     * Set auto-sync preference
     */
    setAutoSync(enabled) {
        this.autoSyncEnabled = enabled;
        localStorage.setItem('pixelAudioAutoSync', enabled);
    }

    /**
     * Get auto-sync preference
     */
    getAutoSync() {
        if (this.autoSyncEnabled === undefined) {
            this.autoSyncEnabled = localStorage.getItem('pixelAudioAutoSync') !== 'false';
        }
        return this.autoSyncEnabled;
    }

    /**
     * Save a collection to the database
     */
    async saveCollectionToDatabase(collectionId) {
        // If not configured or not connected, fallback to localStorage
        if (!this.isConfigured || !this.isConnected) {
            return this.saveCollectionToLocalStorage(collectionId);
        }

        try {
            const collection = this.collectionManager.getCollection(collectionId);
            if (!collection) {
                throw new Error('Collection not found');
            }

            // Export collection data
            const exportData = this.collectionManager.exportCollection(collectionId);

            // Save to Firestore
            const userId = this.userId;
            const dbRef = this.db.collection('pixelAudioDatabases').doc(userId);
            const doc = await dbRef.get();
            
            let collections = [];
            if (doc.exists) {
                collections = doc.data().collections || [];
            }

            // Find and update existing collection or add new one
            const existingIndex = collections.findIndex(c => c.id === collectionId);
            const collectionData = {
                ...exportData,
                updatedAt: new Date().toISOString(),
                syncedAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                collections[existingIndex] = collectionData;
            } else {
                collections.push({
                    ...collectionData,
                    createdAt: new Date().toISOString()
                });
            }

            await dbRef.set({
                collections: collections,
                updatedAt: new Date().toISOString(),
                userId: userId
            }, { merge: true });

            this.app.notifications.showNotification(`Collection "${collection.name}" saved to cloud`, 'success');
            return true;

        } catch (error) {
            console.error('Error saving collection to Firebase:', error);
            this.app.notifications.showNotification('Error saving to cloud: ' + error.message, 'error');

            // Fallback to localStorage
            return this.saveCollectionToLocalStorage(collectionId);
        }
    }

    /**
     * Save collection to localStorage as fallback
     */
    saveCollectionToLocalStorage(collectionId) {
        try {
            const collection = this.collectionManager.getCollection(collectionId);
            if (!collection) {
                throw new Error('Collection not found');
            }

            const exportData = this.collectionManager.exportCollection(collectionId);
            const storageKey = `pixelAudioCollection_${collectionId}`;

            localStorage.setItem(storageKey, JSON.stringify(exportData));

            this.app.notifications.showNotification(`Collection "${collection.name}" saved locally`, 'success');
            return true;

        } catch (error) {
            console.error('Error saving collection locally:', error);
            this.app.notifications.showNotification('Error saving collection: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Load all collections from database
     */
    async loadCollectionsFromDatabase() {
        // If not configured or not connected, fallback to localStorage
        if (!this.isConfigured || !this.isConnected) {
            return this.loadCollectionsFromLocalStorage();
        }

        try {
            const userId = this.userId;
            const dbRef = this.db.collection('pixelAudioDatabases').doc(userId);
            const doc = await dbRef.get();

            if (!doc.exists) {
                console.log('No database found for user. Creating new one...');
                return 0;
            }

            const dbData = doc.data();
            const collections = dbData.collections || [];

            // Clear existing collections (except the default one created on init)
            const existingCollections = this.collectionManager.getAllCollections();
            if (existingCollections.length > 0) {
                this.collectionManager.collections = [];
                this.collectionManager.currentCollectionId = null;
                this.collectionManager.nextCollectionId = 1;
            }

            // Import each collection
            let importedCount = 0;
            for (const collectionData of collections) {
                this.collectionManager.importCollection(collectionData);
                importedCount++;
            }

            // Ensure at least one collection exists
            if (this.collectionManager.getAllCollections().length === 0) {
                this.collectionManager.addCollection('Default Collection');
            }

            // Update collections display
            this.collectionManager.updateCurrentCollectionDisplay();
            
            this.app.notifications.showNotification(`${importedCount} collections loaded from cloud`, 'success');
            return importedCount;

        } catch (error) {
            console.error('Error loading collections from Firebase:', error);
            this.app.notifications.showNotification('Error loading from cloud: ' + error.message, 'error');

            // Fallback to localStorage
            return this.loadCollectionsFromLocalStorage();
        }
    }

    /**
     * Load collections from localStorage as fallback
     */
    loadCollectionsFromLocalStorage() {
        try {
            let loadedCount = 0;

            // Clear existing collections
            const existingCollections = this.collectionManager.getAllCollections();
            if (existingCollections.length > 0) {
                this.collectionManager.collections = [];
                this.collectionManager.currentCollectionId = null;
                this.collectionManager.nextCollectionId = 1;
            }

            // Load all collections from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('pixelAudioCollection_')) {
                    const collectionData = JSON.parse(localStorage.getItem(key));
                    this.collectionManager.importCollection(collectionData);
                    loadedCount++;
                }
            }

            // Ensure at least one collection exists
            if (this.collectionManager.getAllCollections().length === 0) {
                this.collectionManager.addCollection('Default Collection');
            }

            // Update collections display
            this.collectionManager.updateCurrentCollectionDisplay();

            if (loadedCount > 0) {
                this.app.notifications.showNotification(`${loadedCount} collections loaded from local storage`, 'success');
            }

            return loadedCount;

        } catch (error) {
            console.error('Error loading collections from localStorage:', error);
            this.app.notifications.showNotification('Error loading collections: ' + error.message, 'error');
            
            // Create default collection if nothing was loaded
            if (this.collectionManager.getAllCollections().length === 0) {
                this.collectionManager.addCollection('Default Collection');
            }
            return 0;
        }
    }

    /**
     * Delete a collection from database
     */
    async deleteCollectionFromDatabase(collectionId) {
        const collection = this.collectionManager.getCollection(collectionId);
        if (!collection) {
            throw new Error('Collection not found');
        }

        // If not configured or not connected, fallback to localStorage
        if (!this.isConfigured || !this.isConnected) {
            return this.deleteCollectionFromLocalStorage(collectionId);
        }

        try {
            const userId = this.userId;
            const dbRef = this.db.collection('pixelAudioDatabases').doc(userId);
            const doc = await dbRef.get();
            
            if (doc.exists) {
                const collections = doc.data().collections || [];
                const filteredCollections = collections.filter(c => c.id !== collectionId);
                
                await dbRef.update({
                    collections: filteredCollections,
                    updatedAt: new Date().toISOString()
                });
            }

            this.app.notifications.showNotification(`Collection "${collection.name}" deleted from cloud`, 'success');
            return true;

        } catch (error) {
            console.error('Error deleting collection from Firebase:', error);
            this.app.notifications.showNotification('Error deleting from cloud: ' + error.message, 'error');

            // Fallback to localStorage
            return this.deleteCollectionFromLocalStorage(collectionId);
        }
    }

    /**
     * Delete collection from localStorage as fallback
     */
    deleteCollectionFromLocalStorage(collectionId) {
        try {
            const collection = this.collectionManager.getCollection(collectionId);
            const storageKey = `pixelAudioCollection_${collectionId}`;
            localStorage.removeItem(storageKey);

            this.app.notifications.showNotification('Collection deleted from local storage', 'success');
            return true;

        } catch (error) {
            console.error('Error deleting collection from localStorage:', error);
            this.app.notifications.showNotification('Error deleting collection: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Get database connection status
     */
    getDatabaseStatus() {
        return {
            configured: this.isConfigured,
            connected: this.isConnected,
            loggedIn: this.firebaseAuth.isLoggedIn(),
            userId: this.userId || null
        };
    }

    /**
     * Check if database is connected
     */
    isDatabaseConnected() {
        return this.isConnected;
    }

    /**
     * Check if Firebase is configured
     */
    isFirebaseConfigured() {
        return this.isConfigured;
    }

    /**
     * Get current user profile
     */
    getCurrentUserProfile() {
        return this.firebaseAuth.getUserProfile();
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const user = await this.firebaseAuth.signInWithGoogle();
            this.isConnected = true;
            this.userId = user.uid;
            return user;
        } catch (error) {
            console.error('Google sign-in failed:', error);
            throw error;
        }
    }

    /**
     * Sign out
     */
    async signOut() {
        try {
            await this.firebaseAuth.signOut();
            this.isConnected = false;
            this.userId = null;
            return true;
        } catch (error) {
            console.error('Sign out failed:', error);
            throw error;
        }
    }
}

// Add database UI controls to settings panel
class DatabaseUI {
    constructor(app) {
        this.app = app;
        this.databaseManager = new DatabaseManager(app);

        // Add database controls to settings after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.addDatabaseControlsToSettings();
        }, 1000);
    }

    addDatabaseControlsToSettings() {
        // Find the export settings section
        const exportSettingsSection = document.querySelector('.settings-tab-content[data-tab-content="export"]');
        if (!exportSettingsSection) {
            console.warn('Export settings section not found, retrying...');
            setTimeout(() => this.addDatabaseControlsToSettings(), 500);
            return;
        }

        // Check if database section already exists
        if (document.getElementById('database-settings-section')) {
            return;
        }

        // Add database section
        const databaseSection = document.createElement('div');
        databaseSection.id = 'database-settings-section';
        databaseSection.className = 'settings-section';
        databaseSection.innerHTML = `
            <div class="section-heading">
                <div class="label-group">
                    <span>Database Settings</span>
                    <i class="fas fa-circle-question info-icon small" data-tooltip="Save and sync your collections across devices using Google Cloud Firestore"></i>
                </div>
            </div>
            <div class="property-group">
                <div class="database-status" id="database-status">
                    <i class="fas fa-database"></i>
                    <span id="db-status-text">Checking...</span>
                    <span id="db-user-email" style="margin-left: 10px; color: var(--accent-color);"></span>
                    <button id="connect-google-btn" class="btn small-btn" style="margin-left: 10px;">
                        <i class="fab fa-google"></i> <span id="google-btn-text">Sign in with Google</span>
                    </button>
                </div>

                <div class="property-group" id="sync-settings" style="display: none;">
                    <label class="setting-label">
                        <input type="checkbox" id="auto-sync-collections" checked>
                        <span class="checkmark"></span> Auto-sync collections
                    </label>
                    <div class="setting-description">Automatically save and load collections to/from the cloud database</div>
                </div>

                <div class="property-group" id="cloud-actions" style="display: none;">
                    <label class="property-label">Cloud Database Actions</label>
                    <div class="database-actions">
                        <button id="sync-database-btn" class="btn small-btn" title="Download all collections from cloud">
                            <i class="fas fa-cloud-download-alt"></i> Sync Now
                        </button>
                        <button id="save-to-cloud-btn" class="btn small-btn" title="Upload current collections to cloud">
                            <i class="fas fa-cloud-upload-alt"></i> Save to Cloud
                        </button>
                    </div>
                </div>

                <div class="property-group" id="local-actions">
                    <label class="property-label">Local Storage Actions</label>
                    <div class="database-actions">
                        <button id="save-all-local-btn" class="btn small-btn">
                            <i class="fas fa-save"></i> Save All Projects
                        </button>
                        <button id="load-all-local-btn" class="btn small-btn">
                            <i class="fas fa-download"></i> Load Projects
                        </button>
                    </div>
                </div>

                <div class="property-group" id="local-collections-count">
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        <i class="fas fa-hdd"></i> Local collections: <span id="local-collection-count">0</span>
                    </div>
                </div>
            </div>
        `;

        exportSettingsSection.appendChild(databaseSection);

        // Add event listeners
        this.setupEventListeners();
        
        // Update initial status
        this.updateDatabaseStatus();
    }

    setupEventListeners() {
        // Google Sign In button
        document.getElementById('connect-google-btn')?.addEventListener('click', async () => {
            const isLoggedIn = this.databaseManager.isDatabaseConnected();
            
            if (isLoggedIn) {
                if (confirm('Are you sure you want to sign out?')) {
                    await this.databaseManager.signOut();
                    this.updateDatabaseStatus();
                    this.app.notifications.showNotification('Signed out successfully', 'info');
                }
            } else {
                try {
                    document.getElementById('google-btn-text').textContent = 'Signing in...';
                    const user = await this.databaseManager.signInWithGoogle();
                    
                    if (user) {
                        this.updateDatabaseStatus();
                        
                        // Auto-sync if enabled
                        if (this.databaseManager.getAutoSync()) {
                            const count = await this.databaseManager.loadCollectionsFromDatabase();
                            if (count > 0) {
                                this.refreshAllViews();
                            }
                        }
                        
                        this.app.notifications.showNotification(
                            `Signed in as ${user.email}`, 
                            'success'
                        );
                    }
                } catch (error) {
                    console.error('Sign in failed:', error);
                    this.app.notifications.showNotification(
                        'Sign in failed: ' + error.message, 
                        'error'
                    );
                } finally {
                    document.getElementById('google-btn-text').textContent = 'Sign in with Google';
                }
            }
        });

        // Auto-sync checkbox
        document.getElementById('auto-sync-collections')?.addEventListener('change', (e) => {
            this.databaseManager.setAutoSync(e.target.checked);
            
            if (e.target.checked && this.databaseManager.isDatabaseConnected()) {
                // Auto-sync immediately
                this.databaseManager.loadCollectionsFromDatabase();
                this.app.notifications.showNotification('Auto-sync enabled', 'success');
            } else {
                this.app.notifications.showNotification('Auto-sync disabled', 'info');
            }
        });

        // Sync database button
        document.getElementById('sync-database-btn')?.addEventListener('click', async () => {
            this.app.notifications.showNotification('Downloading collections from cloud...', 'info');
            const count = await this.databaseManager.loadCollectionsFromDatabase();
            
            if (count > 0) {
                this.refreshAllViews();
                this.app.notifications.showNotification(`Synced ${count} collections from cloud`, 'success');
            } else {
                this.app.notifications.showNotification('No collections found in cloud database', 'info');
            }
        });

        // Save to cloud button
        document.getElementById('save-to-cloud-btn')?.addEventListener('click', async () => {
            this.app.notifications.showNotification('Uploading collections to cloud...', 'info');
            
            const collections = this.databaseManager.collectionManager.getAllCollections();
            let savedCount = 0;
            
            for (const collection of collections) {
                const success = await this.databaseManager.saveCollectionToDatabase(collection.id);
                if (success) savedCount++;
            }
            
            this.app.notifications.showNotification(
                `Saved ${savedCount}/${collections.length} collections to cloud`,
                savedCount > 0 ? 'success' : 'error'
            );
        });

        // Save all local button
        document.getElementById('save-all-local-btn')?.addEventListener('click', () => {
            this.app.saveAllToBrowser();
        });

        // Load all local button
        document.getElementById('load-all-local-btn')?.addEventListener('click', () => {
            const loaded = this.app.loadFromBrowser(false);
            if (loaded) {
                this.refreshAllViews();
            }
        });
    }

    /**
     * Update database status display
     */
    updateDatabaseStatus() {
        const statusText = document.getElementById('db-status-text');
        const userEmail = document.getElementById('db-user-email');
        const connectBtn = document.getElementById('connect-google-btn');
        const googleBtnText = document.getElementById('google-btn-text');
        const syncSettings = document.getElementById('sync-settings');
        const cloudActions = document.getElementById('cloud-actions');
        const localCollectionsCount = document.getElementById('local-collection-count');

        // Update local collections count
        const localCount = localStorage.length;
        if (localCollectionsCount) {
            localCollectionsCount.textContent = localCount;
        }

        const status = this.databaseManager.getDatabaseStatus();
        
        // If Firebase is not configured
        if (!this.databaseManager.isFirebaseConfigured()) {
            if (statusText) statusText.textContent = 'Firebase not configured';
            if (userEmail) userEmail.textContent = '';
            if (connectBtn) {
                connectBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Configure Firebase';
                connectBtn.disabled = true;
                connectBtn.title = 'Please configure Firebase credentials in js/firebaseConfig.js';
            }
            if (syncSettings) syncSettings.style.display = 'none';
            if (cloudActions) cloudActions.style.display = 'none';
            return;
        }

        // If user is logged in
        if (this.databaseManager.isDatabaseConnected()) {
            const profile = this.databaseManager.getCurrentUserProfile();
            
            if (statusText) statusText.textContent = 'Connected to Cloud DB';
            if (userEmail) userEmail.textContent = profile?.email || '';
            if (connectBtn) {
                connectBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
                connectBtn.title = 'Sign out of Google account';
            }
            if (syncSettings) syncSettings.style.display = 'block';
            if (cloudActions) cloudActions.style.display = 'block';
            
            // Update auto-sync checkbox
            const autoSyncCheckbox = document.getElementById('auto-sync-collections');
            if (autoSyncCheckbox) {
                autoSyncCheckbox.checked = this.databaseManager.getAutoSync();
            }
        } else {
            // Not logged in
            if (statusText) statusText.textContent = 'Not connected';
            if (userEmail) userEmail.textContent = '';
            if (connectBtn) {
                connectBtn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
                connectBtn.disabled = false;
                connectBtn.title = 'Sign in with your Google account';
            }
            if (syncSettings) syncSettings.style.display = 'none';
            if (cloudActions) cloudActions.style.display = 'none';
        }
    }

    /**
     * Refresh all application views after data changes
     */
    refreshAllViews() {
        // Force a complete refresh of the application state
        const firstCollection = this.databaseManager.collectionManager.getAllCollections()[0];
        if (firstCollection) {
            this.databaseManager.collectionManager.setCurrentCollection(firstCollection.id);
            
            // Update UI
            setTimeout(() => {
                this.app.layerManager.init();
                this.app.timeline.init();
                this.app.collectionUI.init();
            }, 100);
        }
    }
}
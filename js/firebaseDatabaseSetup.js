/**
 * Firebase Database Setup Script
 * This script creates the necessary Firestore database structure
 * and initial collections for the PixelAudio app.
 * 
 * Usage:
 * 1. Configure Firebase in js/firebaseConfig.js with your project settings
 * 2. Deploy this script to a secure environment (e.g., Firebase Functions)
 * 3. Run the setup to initialize your database
 */

// Firebase Admin SDK setup (for server-side execution)
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'YOUR_PROJECT_ID'
});

const db = admin.firestore();

/**
 * Creates the initial database structure
 */
async function initializeDatabase() {
    console.log('Initializing Firebase Firestore database...');
    
    try {
        // Create database settings collection
        const settingsRef = db.collection('pixelAudioSettings').doc('global');
        await settingsRef.set({
            version: '1.0',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            features: {
                googleAuthEnabled: true,
                cloudSyncEnabled: true,
                maxCollectionsPerUser: 100,
                maxFileSizeMB: 50,
                supportedFormats: ['wav', 'mp3', 'ogg', 'midi']
            },
            limits: {
                maxTracksPerCollection: 1000,
                maxLayersPerTrack: 100,
                maxTimelineLength: 3600, // 1 hour in seconds
                maxPresetsPerUser: 500
            }
        });
        
        console.log('✓ Global settings created');
        
        // Create shared presets collection
        const presetsRef = db.collection('pixelAudioPresets');
        const sharedPresets = [
            {
                id: 'preset_core_gameplay',
                name: 'Core Gameplay Sounds',
                category: 'gameplay',
                description: 'Essential sounds for any game',
                isPublic: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                sounds: ['pickup', 'laser', 'explosion', 'powerup', 'hit', 'jump']
            },
            {
                id: 'preset_ui_feedback',
                name: 'UI Feedback Sounds',
                category: 'interface',
                description: 'Button clicks, menu sounds, notifications',
                isPublic: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                sounds: ['button_click', 'hover', 'menu_open', 'menu_close', 'notification']
            },
            {
                id: 'preset_environment',
                name: 'Environment & Ambience',
                category: 'environment',
                description: 'Natural and environmental sounds',
                isPublic: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                sounds: ['forest', 'cave', 'underwater', 'wind', 'rain', 'thunder']
            }
        ];
        
        for (const preset of sharedPresets) {
            await presetsRef.doc(preset.id).set(preset);
            console.log(`✓ Created preset: ${preset.name}`);
        }
        
        // Create example database document structure
        const exampleDbRef = db.collection('pixelAudioDatabases').doc('example_user');
        await exampleDbRef.set({
            name: 'Example User Database',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            settings: {
                autoSync: true,
                cloudBackupEnabled: true,
                notificationPreferences: {
                    syncSuccess: true,
                    syncFailure: true
                }
            },
            collections: [],
            metadata: {
                totalCollections: 0,
                totalTracks: 0,
                lastSync: admin.firestore.FieldValue.serverTimestamp()
            }
        });
        
        console.log('✓ Example database created');
        
        // Create security rules document (for reference)
        const rulesRef = db.collection('pixelAudioMetadata').doc('security_rules');
        await rulesRef.set({
            description: 'Firestore Security Rules for PixelAudio',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            rules: {
                read: 'Authenticated users can read their own data',
                write: 'Authenticated users can write to their own collections',
                admin: 'Admins have full access to all data'
            },
            exampleRules: `
// Firestore rules for PixelAudio
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own database
    match /pixelAudioDatabases/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read shared presets
    match /pixelAudioPresets/{presetId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Global settings are readable by all
    match /pixelAudioSettings/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
            `
        });
        
        console.log('✓ Security rules documented');
        
        console.log('\n=== Database Initialization Complete ===');
        console.log('Your Firestore database is ready to use!');
        console.log('\nNext steps:');
        console.log('1. Update firebaseConfig.js with your project credentials');
        console.log('2. Deploy Firestore security rules');
        console.log('3. Test the Google sign-in functionality');
        console.log('4. Start using the cloud sync features');
        
        return true;
        
    } catch (error) {
        console.error('\n✗ Error initializing database:', error);
        console.error('\nPlease ensure:');
        console.error('1. Firebase Admin SDK is properly configured');
        console.error('2. You have the necessary permissions (Firebase Admin)');
        console.error('3. Your project ID is correct');
        return false;
    }
}

/**
 * Creates a user database document structure
 */
async function createUserDatabase(userId, userEmail) {
    console.log(`\nCreating database for user: ${userEmail} (${userId})`);
    
    try {
        const dbRef = db.collection('pixelAudioDatabases').doc(userId);
        
        // Check if user database already exists
        const doc = await dbRef.get();
        if (doc.exists) {
            console.log('✓ Database already exists for this user');
            return doc.data();
        }
        
        // Create new user database
        await dbRef.set({
            name: `${userEmail}'s PixelAudio Database`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            userId: userId,
            userEmail: userEmail,
            settings: {
                autoSync: true,
                cloudBackupEnabled: true,
                version: '1.0'
            },
            collections: [{
                id: 'collection_default',
                name: 'Default Collection',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                groups: [],
                layers: [],
                metadata: {
                    trackCount: 0,
                    presetCount: 0
                }
            }],
            metadata: {
                totalCollections: 1,
                totalTracks: 0,
                totalPresets: 0,
                lastSync: admin.firestore.FieldValue.serverTimestamp(),
                storageUsed: 0
            }
        });
        
        console.log('✓ User database created successfully');
        
        return {
            collections: 1,
            tracks: 0,
            presets: 0
        };
        
    } catch (error) {
        console.error('✗ Error creating user database:', error);
        throw error;
    }
}

/**
 * Lists all user databases
 */
async function listUserDatabases() {
    console.log('\n=== User Databases ===');
    
    try {
        const snapshot = await db.collection('pixelAudioDatabases').get();
        
        if (snapshot.empty) {
            console.log('No user databases found.');
            return;
        }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`\nDatabase ID: ${doc.id}`);
            console.log(`Name: ${data.name}`);
            console.log(`Email: ${data.userEmail || 'N/A'}`);
            console.log(`Collections: ${data.metadata?.totalCollections || 0}`);
            console.log(`Tracks: ${data.metadata?.totalTracks || 0}`);
            console.log(`Last Sync: ${data.metadata?.lastSync?.toDate?.() || 'Never'}`);
        });
        
        console.log(`\nTotal databases: ${snapshot.size}`);
        
    } catch (error) {
        console.error('Error listing databases:', error);
    }
}

// Run setup if this script is executed directly
if (require.main === module) {
    console.log('=== PixelAudio Firebase Database Setup ===\n');
    
    initializeDatabase()
        .then(() => {
            console.log('\nSetup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\nSetup failed:', error);
            process.exit(1);
        });
}

// Export functions for use in other scripts
module.exports = {
    initializeDatabase,
    createUserDatabase,
    listUserDatabases
};
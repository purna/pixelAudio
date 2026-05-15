/**
 * Firebase Configuration
 * Replace the config values with your own Firebase project settings
 * Get these from: https://console.firebase.google.com/
 * 1. Create a project
 * 2. Enable Authentication > Google sign-in provider
 * 3. Enable Firestore Database
 * 4. Add a web app to get the config
 */

const firebaseConfig = {
  apiKey: "AIzaSyCm2UhsVlIBJHlz3IFDVZpeb7o1mbw6AEU",
  authDomain: "pixelaudio-ef1dc.firebaseapp.com",
  databaseURL: "https://pixelaudio-ef1dc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pixelaudio-ef1dc",
  storageBucket: "pixelaudio-ef1dc.firebasestorage.app",
  messagingSenderId: "20837555332",
  appId: "1:20837555332:web:d4a2b73f8e42af2f55b6d1",
  measurementId: "G-QK55KFE7V0"
};

// Initialize Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let googleProvider = null;

// Initialize Firebase (only if config is set)
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        // Import Firebase modules - using global firebase object from CDN
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firestoreDb = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();

        console.log('Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase initialization failed:', error.message);
    }
} else {
    console.warn('Firebase not configured. Please add your Firebase config to js/firebaseConfig.js');
}

/**
 * Check if Firebase is configured and available
 */
function isFirebaseConfigured() {
    return firebaseApp !== null && firebaseAuth !== null;
}

/**
 * Sign in with Google
 */
async function signInWithGoogle() {
    if (!isFirebaseConfigured()) {
        alert('Firebase is not configured. Please add your Firebase config to js/firebaseConfig.js');
        return null;
    }

    try {
        const result = await firebaseAuth.signInWithPopup(googleProvider);
        const user = result.user;
        console.log('User signed in:', user.email);
        return user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
}

/**
 * Sign out user
 */
async function signOut() {
    if (!firebaseAuth) return;

    try {
        await firebaseAuth.signOut();
        console.log('User signed out');
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

/**
 * Get current user
 */
function getCurrentFirebaseUser() {
    return firebaseAuth ? firebaseAuth.currentUser : null;
}

/**
 * Get Firestore database instance
 */
function getFirestore() {
    return firestoreDb;
}

/**
 * Create or get database document for user
 */
async function getOrCreateDatabaseDoc(userId) {
    if (!firestoreDb) {
        throw new Error('Firestore not initialized');
    }

    const dbRef = firestoreDb.collection('pixelAudioDatabases').doc(userId);
    const doc = await dbRef.get();

    if (!doc.exists) {
        // Create new database document
        await dbRef.set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            name: 'My PixelAudio Database',
            collections: [],
            settings: {
                autoSync: true
            }
        });
        console.log('Created new database document for user:', userId);
    }

    return dbRef;
}

/**
 * Save collection to Firestore database
 */
async function saveCollectionToFirestore(userId, collectionData) {
    try {
        const dbRef = await getOrCreateDatabaseDoc(userId);
        const doc = await dbRef.get();
        const dbData = doc.data();

        // Find and update existing collection or add new one
        const collections = dbData.collections || [];
        const existingIndex = collections.findIndex(c => c.id === collectionData.id);

        if (existingIndex >= 0) {
            collections[existingIndex] = {
                ...collectionData,
                updatedAt: new Date().toISOString()
            };
        } else {
            collections.push({
                ...collectionData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        await dbRef.update({
            collections: collections,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Collection saved to Firestore:', collectionData.name);
        return true;
    } catch (error) {
        console.error('Error saving collection to Firestore:', error);
        return false;
    }
}

/**
 * Load collections from Firestore database
 */
async function loadCollectionsFromFirestore(userId) {
    try {
        const dbRef = await getOrCreateDatabaseDoc(userId);
        const doc = await dbRef.get();
        const dbData = doc.data();

        return dbData.collections || [];
    } catch (error) {
        console.error('Error loading collections from Firestore:', error);
        return [];
    }
}

/**
 * Delete collection from Firestore database
 */
async function deleteCollectionFromFirestore(userId, collectionId) {
    try {
        const dbRef = await getOrCreateDatabaseDoc(userId);
        const doc = await dbRef.get();
        const dbData = doc.data();

        const collections = (dbData.collections || []).filter(c => c.id !== collectionId);

        await dbRef.update({
            collections: collections,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Collection deleted from Firestore:', collectionId);
        return true;
    } catch (error) {
        console.error('Error deleting collection from Firestore:', error);
        return false;
    }
}

/**
 * Save complete database to Firestore
 */
async function saveCompleteDatabaseToFirestore(userId, databaseData) {
    try {
        const dbRef = await getOrCreateDatabaseDoc(userId);

        await dbRef.update({
            ...databaseData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Complete database saved to Firestore');
        return true;
    } catch (error) {
        console.error('Error saving complete database to Firestore:', error);
        return false;
    }
}

/**
 * Load complete database from Firestore
 */
async function loadCompleteDatabaseFromFirestore(userId) {
    try {
        const dbRef = await getOrCreateDatabaseDoc(userId);
        const doc = await dbRef.get();

        return doc.data();
    } catch (error) {
        console.error('Error loading complete database from Firestore:', error);
        return null;
    }
}
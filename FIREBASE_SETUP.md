# Firebase Database Setup Guide

This guide explains how to set up Firebase for the PixelAudio application, enabling cloud sync with Google authentication.

## Prerequisites

1. A Firebase account (https://firebase.google.com)
2. Node.js installed (for setup script)
3. Firebase CLI installed (optional, for deploying security rules)

## Setup Steps

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter your project name (e.g., "PixelAudio-DB")
4. Follow the setup wizard and click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project console, go to **Authentication**
2. Click the **Sign-in method** tab
3. Enable **Google** sign-in provider
4. Click **Save**

### Step 3: Enable Firestore Database

1. In your Firebase project console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (or test mode for development)
4. Choose a location (e.g., `nam5` for United States)
5. Click **Enable**

### Step 4: Add Firebase Config to Your App

1. In your Firebase project console, go to **Project settings**
2. Under "Your apps", click **</>** to add a web app
3. Enter a nickname (e.g., "PixelAudio Web")
4. Click **Register app**
5. Copy the Firebase config object (it looks like this):

```javascript
{
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
}
```

6. Update `js/firebaseConfig.js` with your Firebase config values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 5: Deploy Security Rules (Optional but Recommended)

For production use, deploy the security rules to restrict database access:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init firestore`
4. Copy the security rules from `js/firebaseDatabaseSetup.js` to `firestore.rules`
5. Deploy: `firebase deploy --only firestore:rules`

### Step 6: Run Database Setup (Optional)

To initialize the database with sample data and settings:

```bash
node js/firebaseDatabaseSetup.js
```

Note: This requires Firebase Admin SDK credentials. See Firebase documentation for service account setup.

## Using Google Sign-In

### In the App UI

1. Open the PixelAudio app
2. Click the "Cloud Login" button in the top-right corner
3. Sign in with your Google account
4. Your collections will automatically sync to the cloud

### Sign Out

1. Click the "Logout" button in the top-right corner
2. Confirm the sign-out

### Auto-Sync Setting

In Settings > Export tab > Database Settings:
- Enable "Auto-sync collections" to automatically sync when you sign in
- Manual sync buttons are available for more control

## Database Structure

### Collections

```
pixelAudioDatabases (Document per user)
  ├── name: string
  ├── userId: string
  ├── settings: object
  │   ├── autoSync: boolean
  │   └── cloudBackupEnabled: boolean
  ├── collections: array
  │   └── Collection objects with tracks and layers
  └── metadata: object
      ├── totalCollections: number
      ├── totalTracks: number
      └── lastSync: timestamp

pixelAudioPresets (Shared presets)
  ├── id: string
  ├── name: string
  ├── category: string
  ├── isPublic: boolean
  └── sounds: array

pixelAudioSettings (Global settings)
  ├── version: string
  ├── features: object
  └── limits: object
```

## Troubleshooting

### Firebase Not Configured

**Error:** "Cloud database not configured" message

**Solution:** 
- Double-check your Firebase config in `js/firebaseConfig.js`
- Ensure all values are filled in (no "YOUR_" placeholders)
- Check the browser console for errors

### Sign-In Button Not Working

**Error:** Button is disabled or nothing happens

**Solution:**
- Verify Firebase is properly configured
- Check browser console for errors
- Ensure you're running on a web server (not file:// protocol)
- Clear browser cache and reload

### Collections Not Syncing

**Error:** Collections don't appear after sign-in

**Solution:**
- Manually click "Sync Now" in Settings
- Check that you're signed in (your email appears next to the button)
- Verify your Firestore database has documents in the `pixelAudioDatabases` collection

### Permission Denied Errors

**Error:** "Missing or insufficient permissions"

**Solution:**
- Deploy Firestore security rules
- Ensure rules allow read/write for authenticated users
- Check Firestore rules in Firebase Console > Firestore Database > Rules

## Security Best Practices

1. **Never commit secrets:** Don't commit your Firebase config to public repositories
2. **Use environment variables:** For production, use environment variables to store Firebase config
3. **Enable App Check:** In Firebase Console, enable App Check to prevent unauthorized access
4. **Set database rules:** Always set Firestore security rules for production
5. **Limit data access:** Use Firestore rules to restrict users to their own data only

## Offline Support

Firestore automatically provides offline persistence:
- Data is cached locally
- Writes are queued when offline and synced when online
- The app falls back to localStorage when Firebase is unavailable

## API Reference

### Firebase Functions

- `signInWithGoogle()` - Sign in with Google account
- `signOut()` - Sign out current user
- `saveCollectionToDatabase(collectionId)` - Save a collection to Firestore
- `loadCollectionsFromDatabase()` - Load all collections from Firestore
- `deleteCollectionFromDatabase(collectionId)` - Delete a collection from Firestore
- `isFirebaseConfigured()` - Check if Firebase is configured
- `isDatabaseConnected()` - Check if user is signed in and connected

### Events

- `firebaseUserSignedIn` - Fired when user signs in
- `firebaseUserSignedOut` - Fired when user signs out
- `userLogin` - Fired when login is successful
- `userLogout` - Fired when logout is successful

## Performance Considerations

- Collections are loaded on-demand when signing in (if auto-sync is enabled)
- Each collection is saved individually to minimize data transfer
- LocalStorage is used as a fast cache and fallback
- Firestore offline persistence reduces network requests

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review Firebase documentation: https://firebase.google.com/docs
3. Check Firebase console for usage limits and quotas
4. Verify your Firebase plan supports the required operations

## Migration from GitHub Database

If you were using the GitHub-based database:
1. Sign in with Google (this won't affect your GitHub repo)
2. Export your collections to localStorage
3. Sign in with Google and import collections
4. Your data is now stored in Firestore
5. You can safely remove the old GitHub OAuth setup

## License

This implementation is part of the PixelAudio project and follows the same license terms.

/**
 * Firebase Authentication Manager
 * Handles Google login and authentication state management
 */

class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.authStateChangedCallbacks = [];
        this.init();
    }

    /**
     * Initialize Firebase authentication
     */
    init() {
        if (!isFirebaseConfigured()) {
            console.warn('Firebase not configured, auth manager disabled');
            return;
        }

        // Listen for auth state changes
        firebaseAuth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.isInitialized = true;
            
            if (user) {
                console.log('User authenticated:', user.email);
                document.dispatchEvent(new CustomEvent('firebaseUserSignedIn', {
                    detail: { user: user }
                }));
            } else {
                console.log('User signed out');
                document.dispatchEvent(new CustomEvent('firebaseUserSignedOut'));
            }
            
            // Call all registered callbacks
            this.authStateChangedCallbacks.forEach(callback => callback(user));
        });
    }

    /**
     * Register callback for auth state changes
     */
    onAuthStateChanged(callback) {
        this.authStateChangedCallbacks.push(callback);
        
        // Immediately call with current user if available
        if (this.currentUser) {
            callback(this.currentUser);
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const user = await signInWithGoogle();
            
            if (user) {
                // Dispatch custom event
                document.dispatchEvent(new CustomEvent('userLogin', {
                    detail: { 
                        user: user,
                        provider: 'google'
                    }
                }));
                
                // Save login timestamp
                localStorage.setItem('pixelAudioLastLogin', new Date().toISOString());
                
                return user;
            }
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
            await signOut();
            
            // Dispatch custom event
            document.dispatchEvent(new CustomEvent('userLogout'));
            
            return true;
        } catch (error) {
            console.error('Sign out failed:', error);
            throw error;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser || getCurrentFirebaseUser();
    }

    /**
     * Get user ID
     */
    getUserId() {
        const user = this.getCurrentUser();
        return user ? user.uid : null;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    /**
     * Get user profile data
     */
    getUserProfile() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            provider: user.providerData[0]?.providerId
        };
    }
}

// Export singleton instance
let firebaseAuthManager = null;

function getFirebaseAuthManager() {
    if (!firebaseAuthManager) {
        firebaseAuthManager = new FirebaseAuthManager();
    }
    return firebaseAuthManager;
}

// Initialize if Firebase is available
if (typeof firebaseAuth !== 'undefined' && firebaseAuth) {
    firebaseAuthManager = getFirebaseAuthManager();
}

// Make available globally
window.FirebaseAuthManager = FirebaseAuthManager;
window.getFirebaseAuthManager = getFirebaseAuthManager;
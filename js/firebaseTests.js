/**
 * Test script for Firebase integration
 * This script tests the Firebase functionality without running the full app
 * 
 * Usage: Open the browser console and run these test functions
 */

// Test configuration
const FIREBASE_TEST_CONFIG = {
    requiredFiles: [
        'js/firebaseConfig.js',
        'js/firebaseAuth.js', 
        'js/databaseManager.js'
    ],
    requiredFunctions: [
        'isFirebaseConfigured',
        'signInWithGoogle',
        'signOut',
        'getCurrentFirebaseUser',
        'getFirestore'
    ]
};

/**
 * Test 1: Check if Firebase files are loaded
 */
function testFirebaseFilesLoaded() {
    console.log('=== Test 1: Checking Firebase files ===');
    
    const files = FIREBASE_TEST_CONFIG.requiredFiles;
    let allLoaded = true;
    
    for (const file of files) {
        // Check if file exists by looking for its functions
        const isLoaded = checkIfScriptLoaded(file);
        console.log(`  ${file}: ${isLoaded ? '✓ LOADED' : '✗ MISSING'}`);
        if (!isLoaded) allLoaded = false;
    }
    
    return allLoaded;
}

function checkIfScriptLoaded(filename) {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.src && script.src.includes(filename)) {
            return true;
        }
    }
    
    // Check for specific markers in loaded scripts
    if (filename === 'js/firebaseConfig.js' && typeof firebaseConfig !== 'undefined') {
        return true;
    }
    if (filename === 'js/firebaseAuth.js' && typeof FirebaseAuthManager !== 'undefined') {
        return true;
    }
    if (filename === 'js/databaseManager.js' && typeof DatabaseManager !== 'undefined') {
        return true;
    }
    
    return false;
}

/**
 * Test 2: Check Firebase configuration
 */
function testFirebaseConfiguration() {
    console.log('=== Test 2: Checking Firebase configuration ===');
    
    if (typeof firebaseConfig === 'undefined') {
        console.log('  ✗ Firebase config not found');
        return false;
    }
    
    const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    let allConfigured = true;
    
    for (const key of keys) {
        const value = firebaseConfig[key];
        const isSet = value && value !== 'YOUR_' + key.toUpperCase().replace(/_/g, '');
        console.log(`  ${key}: ${isSet ? '✓ CONFIGURED' : '✗ NOT CONFIGURED'}`);
        if (!isSet) allConfigured = false;
    }
    
    return allConfigured;
}

/**
 * Test 3: Check required functions
 */
function testRequiredFunctions() {
    console.log('=== Test 3: Checking required functions ===');
    
    let allAvailable = true;
    
    for (const funcName of FIREBASE_TEST_CONFIG.requiredFunctions) {
        const func = window[funcName];
        const isAvailable = typeof func === 'function';
        console.log(`  ${funcName}(): ${isAvailable ? '✓ AVAILABLE' : '✗ NOT AVAILABLE'}`);
        if (!isAvailable) allAvailable = false;
    }
    
    return allAvailable;
}

/**
 * Test 4: Check Firebase Auth
 */
function testFirebaseAuth() {
    console.log('=== Test 4: Checking Firebase Auth ===');
    
    if (typeof getFirebaseAuthManager === 'undefined') {
        console.log('  ✗ getFirebaseAuthManager() not available');
        return false;
    }
    
    try {
        const authManager = getFirebaseAuthManager();
        console.log('  ✓ FirebaseAuthManager initialized');
        
        const isConfigured = typeof isFirebaseConfigured === 'function' && isFirebaseConfigured();
        console.log(`  Firebase configured: ${isConfigured ? '✓ YES' : '✗ NO'}`);
        
        if (isConfigured) {
            const user = getCurrentFirebaseUser();
            console.log(`  Current user: ${user ? user.email : 'None'}`);
        }
        
        return true;
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
        return false;
    }
}

/**
 * Test 5: Check Database Manager
 */
function testDatabaseManager() {
    console.log('=== Test 5: Checking Database Manager ===');
    
    if (typeof DatabaseManager === 'undefined') {
        console.log('  ✗ DatabaseManager class not available');
        return false;
    }
    
    console.log('  ✓ DatabaseManager class available');
    
    // Check if app has databaseManager instance
    if (window.app && window.app.databaseManager) {
        console.log('  ✓ app.databaseManager initialized');
        const status = app.databaseManager.getDatabaseStatus();
        console.log(`  Database configured: ${status.configured ? '✓ YES' : '✗ NO'}`);
        console.log(`  Database connected: ${status.connected ? '✓ YES' : '✗ NO'}`);
        return true;
    }
    
    console.log('  ⚠ app.databaseManager not found (may not be initialized yet)');
    return false;
}

/**
 * Test 6: Check UI elements
 */
function testUIElements() {
    console.log('=== Test 6: Checking UI Elements ===');
    
    const elements = [
        { id: 'google-signin-btn', name: 'Google Sign-in Button' },
        { id: 'google-btn-label', name: 'Google Button Label' },
        { id: 'user-status', name: 'User Status Display' }
    ];
    
    let allPresent = true;
    
    for (const elem of elements) {
        const element = document.getElementById(elem.id);
        console.log(`  ${elem.name}: ${element ? '✓ FOUND' : '✗ MISSING'}`);
        if (!element) allPresent = false;
    }
    
    return allPresent;
}

/**
 * Run all tests
 */
function runAllTests() {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║    Firebase Integration Test Suite           ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    
    const results = [];
    results.push(['Files Loaded', testFirebaseFilesLoaded()]);
    results.push(['Configuration', testFirebaseConfiguration()]);
    results.push(['Functions', testRequiredFunctions()]);
    results.push(['Firebase Auth', testFirebaseAuth()]);
    results.push(['Database Manager', testDatabaseManager()]);
    results.push(['UI Elements', testUIElements()]);
    
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║               Test Results                   ║');
    console.log('╚══════════════════════════════════════════════╝\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const [testName, result] of results) {
        const status = result ? '✓ PASS' : '✗ FAIL';
        console.log(`  ${testName}: ${status}`);
        if (result) passed++;
        else failed++;
    }
    
    console.log(`\n  Total: ${passed}/${results.length} passed`);
    
    if (failed === 0) {
        console.log('\n  🎉 All tests passed!\n');
    } else {
        console.log(`\n  ⚠ ${failed} test(s) failed. See above for details.\n`);
    }
    
    return failed === 0;
}

// Helper function to check app initialization
function checkAppStatus() {
    console.log('=== App Status ===');
    
    if (!window.app) {
        console.log('  ✗ App not initialized');
        return false;
    }
    
    console.log('  ✓ App initialized');
    console.log(`  App initialized: ${app.initialized ? '✓ YES' : '✗ NO'}`);
    console.log(`  Database configured: ${app.databaseManager?.isFirebaseConfigured?.() ? '✓ YES' : '✗ NO'}`);
    
    return true;
}

// Export for browser console use
window.FirebaseTests = {
    runAllTests,
    checkAppStatus,
    testFirebaseFilesLoaded,
    testFirebaseConfiguration,
    testRequiredFunctions,
    testFirebaseAuth,
    testDatabaseManager,
    testUIElements
};

console.log('Firebase test suite loaded. Run FirebaseTests.runAllTests() to execute.');
console.log('Individual tests available as FirebaseTests.test*()');
// FMOD Panel Diagnostic Script
// Paste this into your browser console (F12) while on the Pixel Audio page

console.log('=== FMOD Panel Diagnostic ===');

// 1. Check if side-panel exists
const sidePanel = document.getElementById('side-panel');
console.log('1. Side panel exists:', !!sidePanel);
if (sidePanel) {
    console.log('   - Display:', window.getComputedStyle(sidePanel).display);
    console.log('   - Visibility:', window.getComputedStyle(sidePanel).visibility);
    console.log('   - Pointer events:', window.getComputedStyle(sidePanel).pointerEvents);
}

// 2. Check if FMOD panel exists
const fmodPanel = document.getElementById('panel-fmod');
console.log('2. FMOD panel exists:', !!fmodPanel);
if (fmodPanel) {
    console.log('   - Display:', window.getComputedStyle(fmodPanel).display);
    console.log('   - Visibility:', window.getComputedStyle(fmodPanel).visibility);
    console.log('   - Is active:', fmodPanel.classList.contains('active'));
}

// 3. Check if FMOD buttons exist
const buttonIds = [
    'fmod-add-bank',
    'fmod-add-collection',
    'fmod-export-bank',
    'fmod-export-unity',
    'fmod-export-all'
];

console.log('3. FMOD Buttons:');
buttonIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        const computed = window.getComputedStyle(btn);
        console.log(`   ✓ ${id}:`, {
            exists: true,
            display: computed.display,
            visibility: computed.visibility,
            pointerEvents: computed.pointerEvents,
            disabled: btn.disabled,
            zIndex: computed.zIndex
        });
    } else {
        console.log(`   ✗ ${id}: NOT FOUND`);
    }
});

// 4. Check if app and fmodUI exist
console.log('4. Application objects:');
console.log('   - window.app exists:', !!window.app);
console.log('   - app.fmodUI exists:', !!(window.app && window.app.fmodUI));
console.log('   - app.fmodManager exists:', !!(window.app && window.app.fmodManager));

// 5. Add a temporary click listener to see what's happening
console.log('5. Adding temporary click listener...');
if (sidePanel) {
    const tempListener = (e) => {
        console.log('CLICK DETECTED:', {
            target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
            targetClass: e.target.className,
            currentTarget: e.currentTarget.id,
            eventPhase: e.eventPhase,
            button: e.target.closest('button')?.id || 'no button'
        });
    };
    sidePanel.addEventListener('click', tempListener, true);
    console.log('   → Click the FMOD panel buttons and watch console output');
    console.log('   → To remove this listener later, run: (listener removed automatically after 60s)');
    setTimeout(() => {
        sidePanel.removeEventListener('click', tempListener, true);
        console.log('   → Temporary listener removed');
    }, 60000);
}

// 6. Check if panel is visible
console.log('6. Panel visibility check:');
const fmodTabBtn = document.querySelector('.icon-tab-btn[data-panel="fmod"]');
console.log('   - FMOD tab button exists:', !!fmodTabBtn);
if (fmodTabBtn) {
    console.log('   - FMOD tab active:', fmodTabBtn.classList.contains('active'));
}

console.log('\n=== Diagnostic Complete ===');
console.log('If buttons are not working, check:');
console.log('1. Are buttons visible (display not "none")?');
console.log('2. Are buttons enabled (not disabled)?');
console.log('3. Do clicks show up in the temporary listener?');
console.log('4. Does app.fmodUI exist?');

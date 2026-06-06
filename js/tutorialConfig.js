/**
 * Tutorial Configuration System
 *
 * This file defines the tutorial steps configuration and provides
 * an easy-to-use interface for setting up tutorials.
 */

/*
Config Seettings
arrowPositionOverride
Vertical Arrows (top/bottom): 'top-third', 'middle-third', 'bottom-third'
Horizontal Arrows (left/right): 'left-third', 'center-third', 'right-third'
Center Position: 'center' (default)
*/

class TutorialConfig {
    constructor() {
        // Default tutorial configuration
        this.tutorials = {
            'main': {
                enabled: true,
                steps: [
                    {
                        id: 'welcome',
                        elementId: 'workspace-area',
                        position: 'center',
                        arrowPosition: 'none', // No arrow for center position
                        arrowPositionOverride: 'center', // Arrow position along the side (center, top-third, middle-third, bottom-third)
                        marginOverride: '0',
                        heading: 'Welcome to Pixel Audio Studio Pro!',
                        content: 'This quick tutorial will guide you through the main features of the SFX creation studio. Click Next to begin.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'tracks',
                        elementId: 'panel-tracks',
                        position: 'right',
                        arrowPosition: 'left', // Arrow is on the left side of the tutorial panel, points left (away from tutorial panel)
                        arrowPositionOverride: 'top-third', // Arrow positioned in the top third of the right side
                        marginOverride: '60px', // Additional margin for better spacing
                        heading: 'Tracks Panel',
                        content: 'Manage your sound layers here. Add, remove, and organize multiple tracks to build complex sound compositions. Each layer can have its own unique sound settings.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'presets',
                        elementId: 'panel-presets',
                        position: 'right',
                        arrowPosition: 'left', // Arrow is on the left side of the tutorial panel, points left (away from tutorial panel)
                        arrowPositionOverride: 'middle-third',
                        marginOverride: '60px', // Additional margin for better spacing
                        heading: 'Sound Presets',
                        content: 'Over 100 pre-configured sound presets for game development! Categories include Core Gameplay, UI Feedback, Environment, Animals, Characters, Music, and Special Effects. Click any preset to instantly load its settings.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'synthesizer',
                        elementId: 'fixed-tools-panel',
                        position: 'right',
                        arrowPosition: 'left', // Arrow is on the left side of the tutorial panel, points left (away from tutorial panel)
                        marginOverride: '35px', // Slightly less margin for this panel
                        heading: 'Synthesizer Controls',
                        content: 'The powerful sound generator lets you create custom sounds from scratch. Adjust waveform (Square, Sine, Triangle, Saw, Noise), ADSR envelope, frequency, vibrato, filters, and advanced effects like distortion and bitcrush.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'timeline',
                        elementId: 'timeline-controls',
                        position: 'center',
                        arrowPosition: 'none',
                        marginOverride: '0px', // More margin for timeline positioning
                        heading: 'Timeline & Transport',
                        content: 'Control playback with the transport buttons. Visualize all your sound layers over time, adjust the total length, and use Undo/Redo to experiment freely. Play individual tracks or the full mix.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'export',
                        elementId: 'exportMixBtn',
                        position: 'bottom',
                        arrowPosition: 'top', // Arrow is on the top side of the tutorial panel, points up (towards target panel)
                        marginOverride: '25px', // Margin for export button positioning
                        heading: 'Export Your Sounds',
                        content: 'When you are happy with your creation, click Export Mix to render and save your sounds as WAV files. Perfect for integrating into your game engine or project!',
                        showNext: true,
                        showSkip: true
                    }
                ]
            }
        };

        // Current tutorial state
        this.currentTutorial = 'main';
        this.currentStep = 0;
        this.isActive = false;
    }

    /**
     * Add a new tutorial
     * @param {string} tutorialId - Unique identifier for the tutorial
     * @param {Object} config - Tutorial configuration
     */
    addTutorial(tutorialId, config) {
        this.tutorials[tutorialId] = config;
    }

    /**
     * Get tutorial by ID
     * @param {string} tutorialId - Tutorial identifier
     * @returns {Object|null} Tutorial configuration or null if not found
     */
    getTutorial(tutorialId) {
        return this.tutorials[tutorialId] || null;
    }

    /**
     * Get current step in current tutorial
     * @returns {Object|null} Current step or null if no active tutorial
     */
    getCurrentStep() {
        const tutorial = this.getTutorial(this.currentTutorial);
        if (!tutorial || !tutorial.steps || this.currentStep >= tutorial.steps.length) {
            return null;
        }
        return tutorial.steps[this.currentStep];
    }

    /**
     * Move to next step
     * @returns {Object|null} Next step or null if tutorial is complete
     */
    nextStep() {
        const tutorial = this.getTutorial(this.currentTutorial);
        if (!tutorial || !tutorial.steps) return null;

        this.currentStep++;
        if (this.currentStep >= tutorial.steps.length) {
            // Tutorial complete
            return null;
        }
        return this.getCurrentStep();
    }

    /**
     * Move to previous step
     * @returns {Object|null} Previous step or null if at beginning
     */
    prevStep() {
        if (this.currentStep <= 0) return null;
        this.currentStep--;
        return this.getCurrentStep();
    }

    /**
     * Reset tutorial to first step
     */
    resetTutorial() {
        this.currentStep = 0;
    }

    /**
     * Start a specific tutorial
     * @param {string} tutorialId - Tutorial to start
     */
    startTutorial(tutorialId) {
        if (this.tutorials[tutorialId]) {
            this.currentTutorial = tutorialId;
            this.currentStep = 0;
            this.isActive = true;
        }
    }

    /**
     * Stop current tutorial
     */
    stopTutorial() {
        this.isActive = false;
    }

    /**
     * Check if tutorial is active
     * @returns {boolean} True if tutorial is active
     */
    isTutorialActive() {
        return this.isActive;
    }

    /**
     * Get position class for tutorial step
     * @param {string} position - Position value from step config
     * @returns {string} CSS class for positioning
     */
    getPositionClass(position) {
        switch (position) {
            case 'top': return 'tutorial-top';
            case 'bottom': return 'tutorial-bottom';
            case 'left': return 'tutorial-left';
            case 'right': return 'tutorial-right';
            case 'center': return 'tutorial-center';
            default: return 'tutorial-right';
        }
    }
}

// Export for use in other modules
const tutorialConfig = new TutorialConfig();
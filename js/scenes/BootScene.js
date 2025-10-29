import LevelGenerator from '../systems/LevelGenerator.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading text
        const loadingText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Loading...',
            {
                fontSize: '32px',
                fill: '#00ff00',
                fontFamily: 'Courier New'
            }
        );
        loadingText.setOrigin(0.5);

        // Generate all 10 levels once and store in registry
        console.log('Generating levels...');
        const levelGenerator = new LevelGenerator();
        const levels = levelGenerator.generateAllLevels();
        
        // Store levels in game registry for access across scenes
        this.registry.set('levels', levels);
        
        // Initialize game state
        this.registry.set('currentLevel', 1);
        this.registry.set('lives', 3);
        this.registry.set('health', 3);
        this.registry.set('score', 0);
        this.registry.set('highScores', this.loadHighScores());
        
        console.log('Levels generated:', levels.length);
    }

    create() {
        // Transition to menu scene after a brief delay
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('programmerAdventure_highScores');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Could not load high scores:', error);
            return [];
        }
    }
}

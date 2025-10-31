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

        // Procedurally generate a reusable platform tile texture (64x20)
        // This avoids needing an external asset and allows tinting per theme.
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Base warm gradient (approximate by layering rectangles)
        g.fillStyle(0x9e3f00, 1); // dark burnt orange base
        g.fillRect(0, 0, 64, 20);
        g.fillStyle(0xc24e00, 1); // mid tone band
        g.fillRect(0, 4, 64, 6);
        g.fillStyle(0xe55c00, 1); // highlight band
        g.fillRect(0, 0, 64, 3);
        g.fillStyle(0xff7a1c, 0.6); // subtle glow
        g.fillRect(0, 12, 64, 4);
        // Noise speckles for texture
        g.fillStyle(0xffffff, 0.15);
        for (let i = 0; i < 30; i++) {
            const nx = Phaser.Math.Between(2, 62);
            const ny = Phaser.Math.Between(2, 18);
            g.fillRect(nx, ny, 1, 1);
        }
        // Rivet dots (darker)
        g.fillStyle(0x5a2500, 0.9);
        for (let x = 8; x < 64; x += 16) {
            g.fillCircle(x, 15, 2);
        }
        g.generateTexture('platform-tile', 64, 20);
        g.destroy();

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

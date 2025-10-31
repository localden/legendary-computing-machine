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

    // Lightweight particle texture for collisions
    const impactGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    impactGraphic.fillStyle(0xffffff, 1);
    impactGraphic.fillCircle(8, 8, 8);
    impactGraphic.fillStyle(0xfff1b5, 0.8);
    impactGraphic.fillCircle(8, 8, 4);
    impactGraphic.generateTexture('enemy-impact', 16, 16);
    impactGraphic.destroy();

        // Procedural keyboard texture for player attack
        if (!this.textures.exists('player-keyboard')) {
            const kb = this.make.graphics({ x: 0, y: 0, add: false });
            kb.fillStyle(0x222222, 1);
            kb.fillRoundedRect(0, 0, 48, 16, 3);
            kb.lineStyle(1, 0xffffff, 0.6);
            // Key grid
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 11; c++) {
                    kb.fillStyle(0x2f2f2f, 1);
                    kb.fillRect(3 + c * 4, 3 + r * 6, 3, 5);
                    kb.lineStyle(1, 0x555555, 0.7);
                    kb.strokeRect(3 + c * 4, 3 + r * 6, 3, 5);
                }
            }
            // Accent WASD keys colored
            const accentKeys = [1,2,3,4];
            accentKeys.forEach(idx => {
                kb.fillStyle(0xFF6B6B, 1);
                kb.fillRect(3 + idx * 4, 3, 3, 5);
            });
            kb.generateTexture('player-keyboard', 48, 16);
            kb.destroy();
        }

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

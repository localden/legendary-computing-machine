import { LEVEL, COLORS, PLAYER } from '../utils/constants.js';
import Player from '../entities/Player.js';
import Collectible from '../entities/Collectible.js';
import ScoreManager from '../systems/ScoreManager.js';
import HealthManager from '../systems/HealthManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Initialize scene state
        this.currentLevelNumber = this.registry.get('currentLevel') || 1;
        this.isPaused = false;
        this.gameStartTime = Date.now();
    }

    create() {
        // Load level data from registry
        const levels = this.registry.get('levels');
        this.levelData = levels[this.currentLevelNumber - 1];

        if (!this.levelData) {
            console.error('Level data not found for level:', this.currentLevelNumber);
            this.scene.start('MenuScene');
            return;
        }

        // Set world bounds
        this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.height);

        // Set background color based on theme
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];
        this.cameras.main.setBackgroundColor(themeColors.background);

        // Create platforms
        this.createPlatforms();

        // Create player
        this.createPlayer();

        // Create collectibles
        this.createCollectibles();

        // Create Close PR button
        this.createClosePRButton();

        // Setup camera to follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.levelData.width, this.levelData.height);

        // Create managers
        this.scoreManager = new ScoreManager(this);
        this.healthManager = new HealthManager(this);

        // Create HUD
        this.createHUD();

        // Setup input
        this.setupInput();

        // Create level timer
        this.setupTimer();

        // Check for pit falls
        this.setupPitDetection();

        console.log(`Level ${this.currentLevelNumber} loaded:`, this.levelData.theme);
    }

    createPlatforms() {
        // Create platform group
        this.platforms = this.physics.add.staticGroup();

        // Get theme colors
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];

        // Create platforms from level data
        this.levelData.platforms.forEach(platformData => {
            const platform = this.add.rectangle(
                platformData.x,
                platformData.y,
                platformData.width,
                platformData.height,
                themeColors.platform
            );
            this.physics.add.existing(platform, true); // true = static body
            this.platforms.add(platform);
        });
    }

    createPlayer() {
        // Spawn player at first platform
        const spawnPlatform = this.levelData.platforms[0];
        const spawnX = spawnPlatform.x + spawnPlatform.width / 2;
        const spawnY = spawnPlatform.y - 50;

        this.player = new Player(this, spawnX, spawnY);

        // Setup collision with platforms
        this.physics.add.collider(this.player, this.platforms);

        // Track when player leaves ground for coyote time
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === this.player) {
                this.player.startCoyoteTime();
            }
        });
    }

    createCollectibles() {
        this.collectibles = this.physics.add.group();

        // Create coffee cups from level data
        this.levelData.collectibles.forEach(collectibleData => {
            const collectible = new Collectible(
                this,
                collectibleData.x,
                collectibleData.y,
                collectibleData.type
            );
            this.collectibles.add(collectible);
        });

        // Setup overlap detection
        this.physics.add.overlap(
            this.player,
            this.collectibles,
            this.collectCollectible,
            null,
            this
        );
    }

    collectCollectible(player, collectible) {
        collectible.collect(player);
    }

    createClosePRButton() {
        // Create Close PR button at level end
        const buttonData = this.levelData.closePRButton;
        
        this.closePRButton = this.add.rectangle(
            buttonData.x,
            buttonData.y,
            80,
            40,
            0x00ff00
        );
        this.physics.add.existing(this.closePRButton, true);

        // Add text label
        this.closePRText = this.add.text(
            buttonData.x,
            buttonData.y,
            'Close PR',
            {
                fontSize: '14px',
                fill: '#000000',
                fontFamily: 'Courier New',
                fontStyle: 'bold'
            }
        );
        this.closePRText.setOrigin(0.5);

        // Add glow effect
        this.tweens.add({
            targets: this.closePRButton,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Setup overlap detection
        this.physics.add.overlap(
            this.player,
            this.closePRButton,
            this.completeLevelGoal,
            null,
            this
        );
    }

    completeLevelGoal() {
        // Prevent multiple triggers
        if (this.levelCompleting) {
            return;
        }
        this.levelCompleting = true;

        // Stop timer
        if (this.levelTimer) {
            this.levelTimer.remove();
        }

        // Award bonus points for time remaining
        const timeBonus = Math.floor(this.levelTimeRemaining / 1000) * 5;
        this.scoreManager.addScore(timeBonus);

        // Proceed to next level or victory
        this.time.delayedCall(500, () => {
            if (this.currentLevelNumber >= 10) {
                // Game complete!
                const totalTime = Date.now() - this.gameStartTime;
                this.scene.start('VictoryScene', { totalTime: totalTime });
            } else {
                // Next level
                this.registry.set('currentLevel', this.currentLevelNumber + 1);
                this.scene.restart();
            }
        });
    }

    setupPitDetection() {
        // Check if player falls below world
        this.pitCheckTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.player && this.player.y > LEVEL.HEIGHT + 100) {
                    this.player.fallIntoPit();
                }
            },
            loop: true
        });
    }

    createHUD() {
        // HUD container (fixed to camera)
        this.hudGraphics = this.add.graphics();
        this.hudGraphics.setScrollFactor(0);

        // Lives display
        this.livesText = this.add.text(20, 20, '', {
            fontSize: '20px',
            fill: '#FF6B6B',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.livesText.setScrollFactor(0);

        // Health display
        this.healthText = this.add.text(20, 50, '', {
            fontSize: '18px',
            fill: '#00ff00',
            fontFamily: 'Courier New'
        });
        this.healthText.setScrollFactor(0);

        // Score display
        this.scoreText = this.add.text(this.cameras.main.width - 20, 20, '', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);

        // Level display
        this.levelText = this.add.text(this.cameras.main.width - 20, 50, '', {
            fontSize: '18px',
            fill: '#4ECDC4',
            fontFamily: 'Courier New'
        });
        this.levelText.setOrigin(1, 0);
        this.levelText.setScrollFactor(0);

        // Timer display
        this.timerText = this.add.text(this.cameras.main.width / 2, 20, '', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.timerText.setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);

        // Update HUD
        this.updateHUD();
    }

    updateHUD() {
        const lives = this.registry.get('lives');
        const health = this.registry.get('health');
        const score = this.registry.get('score');

        this.livesText.setText(`Lives: ${lives}`);
        this.healthText.setText(`Health: ${'♥'.repeat(health)}`);
        this.scoreText.setText(`Score: ${score}`);
        this.levelText.setText(`Level ${this.currentLevelNumber}/10`);
    }

    setupInput() {
        // Cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // WASD keys
        this.keys = {
            w: this.input.keyboard.addKey('W'),
            a: this.input.keyboard.addKey('A'),
            s: this.input.keyboard.addKey('S'),
            d: this.input.keyboard.addKey('D'),
            space: this.input.keyboard.addKey('SPACE'),
            p: this.input.keyboard.addKey('P'),
            r: this.input.keyboard.addKey('R')
        };

        // Pause key
        this.keys.p.on('down', () => {
            this.togglePause();
        });
    }

    setupTimer() {
        // Level time limit
        this.levelTimeRemaining = LEVEL.TIME_LIMIT;
        
        // Create timer event
        this.levelTimer = this.time.addEvent({
            delay: 1000, // Update every second
            callback: () => {
                this.levelTimeRemaining -= 1000;
                this.updateTimerDisplay();
                
                // Check if time ran out
                if (this.levelTimeRemaining <= 0) {
                    this.onTimeOut();
                }
            },
            loop: true
        });
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.levelTimeRemaining / 60000);
        const seconds = Math.floor((this.levelTimeRemaining % 60000) / 1000);
        
        // Change color when time is running out (< 30 seconds)
        const color = this.levelTimeRemaining < 30000 ? '#E71D36' : '#FFD700';
        this.timerText.setColor(color);
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    onTimeOut() {
        this.levelTimer.remove();
        this.scene.start('GameOverScene', { reason: 'Time\'s Up!' });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.physics.pause();
            this.levelTimer.paused = true;
            
            // Show pause overlay
            this.pauseOverlay = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000,
                0.7
            );
            this.pauseOverlay.setScrollFactor(0);
            
            this.pauseText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'PAUSED\n\nPress P to Resume',
                {
                    fontSize: '32px',
                    fill: '#00ff00',
                    fontFamily: 'Courier New',
                    align: 'center',
                    fontStyle: 'bold'
                }
            );
            this.pauseText.setOrigin(0.5);
            this.pauseText.setScrollFactor(0);
        } else {
            this.physics.resume();
            this.levelTimer.paused = false;
            
            // Remove pause overlay
            if (this.pauseOverlay) {
                this.pauseOverlay.destroy();
                this.pauseText.destroy();
            }
        }
    }

    update(time, delta) {
        if (this.isPaused || !this.player) {
            return;
        }

        // Player movement
        const isLeftDown = this.cursors.left.isDown || this.keys.a.isDown;
        const isRightDown = this.cursors.right.isDown || this.keys.d.isDown;
        const isJumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space) || 
                              Phaser.Input.Keyboard.JustDown(this.keys.w);

        if (isLeftDown) {
            this.player.moveLeft();
        } else if (isRightDown) {
            this.player.moveRight();
        } else {
            this.player.stop();
        }

        // Jump input
        if (isJumpPressed) {
            this.player.jump();
        }

        // Update HUD
        this.updateHUD();
    }
}

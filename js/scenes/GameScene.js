import { LEVEL, COLORS, PLAYER } from '../utils/constants.js';
import Player from '../entities/Player.js';
import Collectible from '../entities/Collectible.js';
import Bug from '../entities/Bug.js';
import MergeConflict from '../entities/MergeConflict.js';
import SecurityBoss from '../entities/SecurityBoss.js';
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

        // Fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Set world bounds
        this.physics.world.setBounds(0, 0, this.levelData.width, this.levelData.height);

        // Set background color based on theme
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];
        this.cameras.main.setBackgroundColor(themeColors.background);

        // Create decorative clouds
        this.createClouds();

        // Create platforms
        this.createPlatforms();

        // Create player
        this.createPlayer();

        // Create collectibles
        this.createCollectibles();

        // Create enemies
        this.createEnemies();

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

        // Show boss warning if this is a boss level
        if (this.levelData.isBossLevel && this.boss) {
            this.showBossWarning();
        }

        console.log(`Level ${this.currentLevelNumber} loaded:`, this.levelData.theme);
    }

    createClouds() {
        if (!this.levelData.clouds || this.levelData.clouds.length === 0) {
            return;
        }

        // Get theme colors for cloud styling
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];
        
        // Create clouds as decorative elements
        this.clouds = this.add.group();
        
        this.levelData.clouds.forEach(cloudData => {
            // Create cloud using graphics for soft, rounded appearance
            const cloudGraphics = this.add.graphics();
            
            // Draw multiple overlapping circles to create cloud shape
            cloudGraphics.fillStyle(0xFFFFFF, cloudData.opacity);
            
            const centerX = cloudData.x;
            const centerY = cloudData.y;
            const baseRadius = cloudData.height / 2;
            
            // Main cloud body (3 overlapping circles)
            cloudGraphics.fillCircle(centerX, centerY, baseRadius);
            cloudGraphics.fillCircle(centerX - baseRadius * 0.6, centerY, baseRadius * 0.8);
            cloudGraphics.fillCircle(centerX + baseRadius * 0.6, centerY, baseRadius * 0.8);
            
            // Add horizontal stretch
            cloudGraphics.fillEllipse(centerX, centerY, cloudData.width, cloudData.height * 0.6);
            
            // Set depth to appear behind platforms but in front of background
            cloudGraphics.setDepth(-1);
            
            // Store cloud data for parallax scrolling
            cloudGraphics.setData('parallaxSpeed', 0.3 + Math.random() * 0.3);
            cloudGraphics.setData('initialX', centerX);
            
            this.clouds.add(cloudGraphics);
        });
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

    createEnemies() {
        this.enemies = this.physics.add.group();
        this.boss = null;

        // Create enemies from level data
        this.levelData.enemies.forEach(enemyData => {
            let enemy;
            
            if (enemyData.type === 'security-boss') {
                // Create boss
                enemy = new SecurityBoss(
                    this,
                    enemyData.x,
                    enemyData.y
                );
                this.boss = enemy;
                
                // Create boss texture if needed
                SecurityBoss.createTexture(this);
                
                // Set player reference for boss chase behavior
                if (this.player) {
                    enemy.setPlayer(this.player);
                }
                
                // Create boss health bar
                this.createBossHealthBar();
                
                // Listen for boss events
                this.events.on('boss-health-changed', this.updateBossHealthBar, this);
                this.events.on('boss-defeated', this.handleBossDefeated, this);
                
            } else if (enemyData.type === 'bug') {
                enemy = new Bug(
                    this,
                    enemyData.x,
                    enemyData.y,
                    enemyData.patrolLeft,
                    enemyData.patrolRight
                );
            } else if (enemyData.type === 'merge-conflict') {
                enemy = new MergeConflict(
                    this,
                    enemyData.x,
                    enemyData.y,
                    enemyData.patrolLeft,
                    enemyData.patrolRight
                );
            }
            
            if (enemy) {
                this.enemies.add(enemy);
                
                // Setup collision with platforms
                this.physics.add.collider(enemy, this.platforms);
            }
        });

        // Setup player-enemy collision
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (!player || !enemy || !enemy.active) {
            return;
        }

        // Check if it's a boss enemy
        const isBoss = enemy.enemyType === 'security-boss';
        
        // Bosses are not stompable - they can only be damaged by attacks
        if (isBoss) {
            // Boss always damages player on contact
            enemy.dealDamage(player);
            
            // Screen shake on damage
            this.cameras.main.shake(200, 0.01);
            
            // Red flash overlay
            this.flashDamage();
            return;
        }

        // Check if player is stomping enemy (player is above and falling)
        const playerBottom = player.body.y + player.body.height;
        const enemyTop = enemy.body.y;
        const isPlayerAbove = playerBottom < enemyTop + 10;
        const isPlayerFalling = player.body.velocity.y > 0;

        if (isPlayerAbove && isPlayerFalling && enemy.isStompable) {
            // Player stomps enemy
            enemy.takeDamage(1);
            player.stompEnemy(enemy);
            
            // Add score for defeating enemy
            this.scoreManager.addScore(50);
        } else {
            // Enemy damages player
            enemy.dealDamage(player);
            
            // Screen shake on damage
            this.cameras.main.shake(200, 0.01);
            
            // Red flash overlay
            this.flashDamage();
        }
    }

    flashDamage() {
        // Create red overlay for damage feedback
        if (this.damageOverlay) {
            return; // Already flashing
        }

        this.damageOverlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0xFF0000,
            0.3
        );
        this.damageOverlay.setScrollFactor(0);
        this.damageOverlay.setDepth(1000);

        this.tweens.add({
            targets: this.damageOverlay,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                if (this.damageOverlay) {
                    this.damageOverlay.destroy();
                    this.damageOverlay = null;
                }
            }
        });
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

        // Fade out before transition
        this.cameras.main.fadeOut(500, 0, 0, 0);

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

    createBossHealthBar() {
        // Boss health bar container
        this.bossHealthBarBg = this.add.graphics();
        this.bossHealthBarBg.setScrollFactor(0);
        
        this.bossHealthBar = this.add.graphics();
        this.bossHealthBar.setScrollFactor(0);
        
        this.bossNameText = this.add.text(
            this.cameras.main.width / 2,
            70,
            'SECURITY BOSS',
            {
                fontSize: '24px',
                fill: '#8B00FF',
                fontFamily: 'Courier New',
                fontStyle: 'bold'
            }
        );
        this.bossNameText.setOrigin(0.5, 0);
        this.bossNameText.setScrollFactor(0);
        
        // Initial draw
        if (this.boss) {
            this.updateBossHealthBar(this.boss.health, this.boss.maxHealth);
        }
    }

    updateBossHealthBar(currentHealth, maxHealth) {
        if (!this.bossHealthBar || !this.bossHealthBarBg) return;
        
        const barWidth = 300;
        const barHeight = 20;
        const x = (this.cameras.main.width - barWidth) / 2;
        const y = 100;
        
        // Clear previous
        this.bossHealthBarBg.clear();
        this.bossHealthBar.clear();
        
        // Background
        this.bossHealthBarBg.fillStyle(0x000000, 0.8);
        this.bossHealthBarBg.fillRect(x, y, barWidth, barHeight);
        
        // Border
        this.bossHealthBarBg.lineStyle(2, 0x8B00FF, 1);
        this.bossHealthBarBg.strokeRect(x, y, barWidth, barHeight);
        
        // Health fill
        const healthPercent = Math.max(0, currentHealth / maxHealth);
        const healthWidth = barWidth * healthPercent;
        
        // Color gradient based on health
        let healthColor = 0x00ff00; // Green
        if (healthPercent < 0.5) {
            healthColor = 0xffff00; // Yellow
        }
        if (healthPercent < 0.25) {
            healthColor = 0xff0000; // Red
        }
        
        this.bossHealthBar.fillStyle(healthColor, 1);
        this.bossHealthBar.fillRect(x + 2, y + 2, healthWidth - 4, barHeight - 4);
    }

    handleBossDefeated() {
        // Remove boss health bar
        if (this.bossHealthBar) {
            this.bossHealthBar.destroy();
        }
        if (this.bossHealthBarBg) {
            this.bossHealthBarBg.destroy();
        }
        if (this.bossNameText) {
            this.bossNameText.destroy();
        }
        
        // Award bonus score
        this.scoreManager.addScore(1000);
        
        // Display victory message
        const victoryText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'BOSS DEFEATED!\n+1000 POINTS',
            {
                fontSize: '48px',
                fill: '#FFD700',
                fontFamily: 'Courier New',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        victoryText.setOrigin(0.5);
        victoryText.setScrollFactor(0);
        
        // Fade out victory message and proceed
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: victoryText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    victoryText.destroy();
                    // Level completion
                    this.completeLevel();
                }
            });
        });
    }

    enablePlayerAttack() {
        // Add attack input (Space bar when boss is present)
        if (!this.attackKey && this.boss) {
            this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }
    }

    handlePlayerAttack() {
        if (!this.boss || !this.boss.active || !this.player || !this.player.active) {
            return;
        }
        
        // Check if player is close enough to boss
        const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            this.boss.x,
            this.boss.y
        );
        
        if (distance < 80) {
            // Deal damage to boss
            this.boss.takeDamage(1);
            
            // Visual feedback - player attack animation
            this.tweens.add({
                targets: this.player,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                yoyo: true
            });
            
            // Knockback
            const direction = this.player.x < this.boss.x ? 1 : -1;
            this.player.body.setVelocityX(-direction * 200);
        }
    }

    showBossWarning() {
        // Create warning overlay
        const warningBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            600,
            200,
            0x000000,
            0.8
        );
        warningBg.setScrollFactor(0);
        warningBg.setDepth(1000);
        
        const warningText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 30,
            '⚠️ BOSS LEVEL ⚠️',
            {
                fontSize: '42px',
                fill: '#8B00FF',
                fontFamily: 'Courier New',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        warningText.setOrigin(0.5);
        warningText.setScrollFactor(0);
        warningText.setDepth(1001);
        
        const instructionText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 30,
            'Press E to attack the boss!\nBoss cannot be stomped!',
            {
                fontSize: '20px',
                fill: '#FFD700',
                fontFamily: 'Courier New',
                align: 'center'
            }
        );
        instructionText.setOrigin(0.5);
        instructionText.setScrollFactor(0);
        instructionText.setDepth(1001);
        
        // Flash animation
        this.tweens.add({
            targets: [warningText],
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: 5
        });
        
        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [warningBg, warningText, instructionText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    warningBg.destroy();
                    warningText.destroy();
                    instructionText.destroy();
                }
            });
        });
    }

    update(time, delta) {
        if (this.isPaused || !this.player) {
            return;
        }

        // Update cloud parallax effect
        if (this.clouds) {
            const cameraScrollX = this.cameras.main.scrollX;
            this.clouds.getChildren().forEach(cloud => {
                const parallaxSpeed = cloud.getData('parallaxSpeed');
                const initialX = cloud.getData('initialX');
                cloud.x = initialX - cameraScrollX * parallaxSpeed;
            });
        }

        // Player movement
        const isLeftDown = this.cursors.left.isDown || this.keys.a.isDown;
        const isRightDown = this.cursors.right.isDown || this.keys.d.isDown;
        const isJumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space) || 
                              Phaser.Input.Keyboard.JustDown(this.keys.w);

        // Check for attack input if boss is present
        if (this.boss && this.boss.active) {
            // Use E key for attack when boss is present (space is for jump)
            if (!this.attackKey) {
                this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                this.handlePlayerAttack();
            }
        }

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

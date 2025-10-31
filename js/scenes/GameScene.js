import { LEVEL, COLORS, PLAYER } from '../utils/constants.js';
import Player from '../entities/Player.js';
import Collectible from '../entities/Collectible.js';
import Bug from '../entities/Bug.js';
import MergeConflict from '../entities/MergeConflict.js';
import SecurityBoss from '../entities/SecurityBoss.js';
import ScoreManager from '../systems/ScoreManager.js';
import HealthManager from '../systems/HealthManager.js';

const ENEMY_IMPACT_COLORS = {
    'bug': COLORS.BUG,
    'merge-conflict': COLORS.MERGE_CONFLICT,
    'security-boss': COLORS.SECURITY_BOSS
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Initialize scene state
        this.currentLevelNumber = this.registry.get('currentLevel') || 1;
        this.isPaused = false;
        this.gameStartTime = Date.now();
        this.pauseKeyListener = null;
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

        // Create themed environmental backdrop
        this.createEnvironment();

        // Create platforms
        this.createPlatforms();

        // Create player
        this.createPlayer();

    // (Particle system removed for Phaser 3.60 compatibility)

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
        this.clouds = this.add.group();

        this.levelData.clouds.forEach(cloudData => {
            const g = this.add.graphics();
            const centerX = cloudData.x;
            const centerY = cloudData.y;
            const baseRadius = cloudData.height / 2;

            // Soft shadow first
            g.fillStyle(0x000000, cloudData.opacity * 0.15);
            g.fillEllipse(centerX + 8, centerY + 6, cloudData.width * 0.95, cloudData.height * 0.5);

            // Main fluffy body: draw a cluster of circles with slight horizontal jitter
            const puffCount = 5;
            for (let i = 0; i < puffCount; i++) {
                const offsetX = (i - (puffCount - 1) / 2) * baseRadius * 0.9 + Phaser.Math.Between(-4, 4);
                const radius = baseRadius * (0.85 + Math.random() * 0.25);
                g.fillStyle(0xffffff, cloudData.opacity * 0.9);
                g.fillCircle(centerX + offsetX, centerY + Phaser.Math.Between(-4, 4), radius);
            }

            // Light overlay for highlight
            g.fillStyle(0xffffff, cloudData.opacity * 0.5);
            g.fillEllipse(centerX, centerY - 4, cloudData.width * 0.9, cloudData.height * 0.4);

            // Slight bluish tint based on theme background (mix)
            g.fillStyle(0xE6F6FF, cloudData.opacity * 0.2);
            g.fillEllipse(centerX, centerY, cloudData.width * 0.75, cloudData.height * 0.35);

            g.setDepth(-1);
            g.setData('parallaxSpeed', 0.25 + Math.random() * 0.25);
            g.setData('initialX', centerX);
            this.clouds.add(g);
        });
    }

    createEnvironment() {
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];
        const landColor = themeColors.land || themeColors.platform || 0x3a2d2d;
        const landAccent = themeColors.landAccent || themeColors.accent || landColor;
        const baseY = this.levelData.height;
        const hillCount = Math.ceil(this.levelData.width / 260) + 2;
        const rng = new Phaser.Math.RandomDataGenerator([this.levelData.id || 0, this.currentLevelNumber]);

    const farLayer = this.add.graphics();
    farLayer.setDepth(-100);
        farLayer.setScrollFactor(0.25);
        farLayer.setAlpha(0.6);
        farLayer.fillStyle(landAccent, 1);
        for (let i = -1; i < hillCount; i++) {
            const hillWidth = rng.between(320, 460);
            const hillHeight = rng.between(160, 240);
            const centerX = i * 260 + rng.between(-60, 120);
            const centerY = baseY - 160 - rng.between(40, 120);
            farLayer.fillEllipse(centerX, centerY, hillWidth, hillHeight);
        }

    const midLayer = this.add.graphics();
    midLayer.setDepth(-90);
        midLayer.setScrollFactor(0.45);
        midLayer.setAlpha(0.75);
        midLayer.fillStyle(landColor, 1);
        for (let i = -1; i < hillCount; i++) {
            const ridgeWidth = rng.between(260, 340);
            const ridgeHeight = rng.between(120, 180);
            const baseX = i * 240 + rng.between(-40, 40);
            const topY = baseY - rng.between(120, 200);
            midLayer.fillTriangle(
                baseX - ridgeWidth / 2,
                baseY,
                baseX,
                topY,
                baseX + ridgeWidth / 2,
                baseY
            );
        }

    const foregroundLayer = this.add.graphics();
    foregroundLayer.setDepth(-80);
        foregroundLayer.setScrollFactor(0.8);
        foregroundLayer.setAlpha(0.85);
        foregroundLayer.fillStyle(landColor, 1);
        foregroundLayer.fillRect(0, baseY - 80, this.levelData.width, 160);
        foregroundLayer.fillStyle(landAccent, 0.35);
        const strataCount = 6;
        for (let i = 0; i < strataCount; i++) {
            const offsetY = baseY - 80 + i * 12;
            foregroundLayer.fillRect(0, offsetY, this.levelData.width, 4);
        }
        this.environmentLayers = [farLayer, midLayer, foregroundLayer];
        this.environmentLayers.forEach(layer => {
            if (layer && layer.depth !== undefined) {
                this.children.sendToBack(layer);
            }
        });
    }

    createPlatforms() {
        // Create platform group
        this.platforms = this.physics.add.staticGroup();

        // Get theme colors
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];

        // Create platforms from level data using textured tile sprites
        // Each logical platform may be wider than the base tile; we tile multiple static sprites for better visual texture.
        this.levelData.platforms.forEach(platformData => {
            const tileWidth = 64; // Width of generated texture
            const tilesNeeded = Math.ceil(platformData.width / tileWidth);
            for (let i = 0; i < tilesNeeded; i++) {
                const segmentX = platformData.x - platformData.width / 2 + (i * tileWidth) + tileWidth / 2;
                const segmentY = platformData.y;
                const sprite = this.add.image(segmentX, segmentY, 'platform-tile');
                sprite.setTint(themeColors.platform);
                // Convert to static body
                this.physics.add.existing(sprite, true);
                this.platforms.add(sprite);
            }
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

    // createEffects removed (Phaser 3.60: ParticleEmitterManager deprecated). Effects now done via manual sprites.

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
        const themeColors = COLORS.THEMES[this.levelData.theme] || COLORS.THEMES['dev-conference'];
        const impactColor = ENEMY_IMPACT_COLORS[enemy.enemyType] || themeColors.accent;
        
        // Bosses are not stompable - they can only be damaged by attacks
        if (isBoss) {
            // Boss always damages player on contact
            enemy.dealDamage(player);
            this.spawnEnemyImpact(player.x, player.y, impactColor, 18);
            
            // Screen shake on damage
            this.cameras.main.shake(200, 0.01);
            
            // Red flash overlay
            this.flashDamage();
            return;
        }

        const now = this.time.now;
        const stompCooldownUntil = enemy.getData('stompCooldownUntil') || 0;
        // Check if player is stomping enemy (player is above and falling)
        const playerBottom = player.body.y + player.body.height;
        const enemyTop = enemy.body.y;
        const isPlayerAbove = playerBottom <= enemyTop + 12;
        const isPlayerFalling = player.body.velocity.y > 0;

        if (isPlayerAbove && isPlayerFalling && enemy.isStompable) {
            // Player stomps enemy
            enemy.takeDamage(1);
            player.stompEnemy(enemy);
            enemy.setData('stompCooldownUntil', now + 250);
            if (typeof player.grantTemporaryInvincibility === 'function') {
                player.grantTemporaryInvincibility(250);
            }
            this.spawnEnemyImpact(enemy.x, enemy.y, impactColor, 22);
            
            // Add score for defeating enemy
            this.scoreManager.addScore(50);
            return;
        }

        if (now < stompCooldownUntil) {
            return;
        }

        // Enemy damages player
        enemy.dealDamage(player);
        this.spawnEnemyImpact(player.x, player.y + player.body.height * 0.3, themeColors.accent, 14);

        // Screen shake on damage
        this.cameras.main.shake(200, 0.01);

        // Red flash overlay
        this.flashDamage();
    }

    spawnEnemyImpact(x, y, tint, count) {
        const pieces = count || 12;
        const color = tint || 0xffffff;
        for (let i = 0; i < pieces; i++) {
            const angle = (Math.PI * 2 * i) / pieces + Phaser.Math.FloatBetween(-0.25, 0.25);
            const speed = Phaser.Math.Between(80, 260);
            const life = Phaser.Math.Between(200, 420);
            const scaleStart = Phaser.Math.FloatBetween(0.5, 1);
            const dx = Math.cos(angle) * speed * (life / 1000);
            const dy = Math.sin(angle) * speed * (life / 1000) * 0.6; // slight flatten

            // Use a lightweight Graphics -> texture once then reuse via image clones
            if (!this.textures.exists('impact-bit')) {
                const g = this.add.graphics();
                g.fillStyle(0xffffff, 1);
                g.fillCircle(4, 4, 4);
                g.generateTexture('impact-bit', 8, 8);
                g.destroy();
            }

            const sprite = this.add.image(x, y, 'impact-bit');
            sprite.setTint(color);
            sprite.setDepth(150);
            sprite.setScale(scaleStart);

            this.tweens.add({
                targets: sprite,
                x: x + dx,
                y: y + dy + Phaser.Math.Between(-10, 10),
                alpha: 0,
                scale: 0,
                rotation: Phaser.Math.FloatBetween(-Math.PI, Math.PI),
                ease: 'Cubic.Out',
                duration: life,
                onComplete: () => sprite.destroy()
            });
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
    this.hudGraphics.setDepth(1000);

        // Lives display
        this.livesText = this.add.text(20, 20, '', {
            fontSize: '20px',
            fill: '#FF6B6B',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.livesText.setScrollFactor(0);
        this.livesText.setDepth(1001);

        // Health display
        this.healthText = this.add.text(20, 50, '', {
            fontSize: '18px',
            fill: '#00ff00',
            fontFamily: 'Courier New'
        });
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(1001);

        // Score display
        this.scoreText = this.add.text(this.cameras.main.width - 20, 20, '', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1001);

        // Level display
        this.levelText = this.add.text(this.cameras.main.width - 20, 50, '', {
            fontSize: '18px',
            fill: '#4ECDC4',
            fontFamily: 'Courier New'
        });
        this.levelText.setOrigin(1, 0);
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(1001);

        // Timer display
        this.timerText = this.add.text(this.cameras.main.width / 2, 20, '', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.timerText.setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(1001);

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
        if (this.keys && this.pauseKeyListener && this.keys.p) {
            this.keys.p.off('down', this.pauseKeyListener);
        }

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
            r: this.input.keyboard.addKey('R'),
            i: this.input.keyboard.addKey('I')
        };

        // Pause key
        this.pauseKeyListener = () => {
            this.togglePause();
        };
        this.keys.p.on('down', this.pauseKeyListener);

        // Input debug toggle
        this.keys.i.on('down', () => {
            this.toggleInputDebug();
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
                    // Level completion (reuse standard goal logic)
                    this.completeLevelGoal();
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
    const justDown = (key) => key && Phaser.Input.Keyboard.JustDown(key);
    const isLeftDown = (this.cursors.left && this.cursors.left.isDown) || this.keys.a.isDown;
    const isRightDown = (this.cursors.right && this.cursors.right.isDown) || this.keys.d.isDown;
    const isJumpPressed = justDown(this.cursors.space) ||
                  justDown(this.cursors.up) ||
                  justDown(this.keys.space) ||
                  justDown(this.keys.w);

        // Check for attack input if boss is present
        if (this.boss && this.boss.active) {
            // Use E key for attack when boss is present (space is for jump)
            if (!this.attackKey) {
                this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            }
            
            if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
                const direction = this.player.x < this.boss.x ? 1 : -1;
                this.player.performKeyboardSwing(direction);
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

        // Update input debug overlay if active
        if (this.inputDebugText && this.inputDebugText.active) {
            this.inputDebugText.setText(
                [
                    'INPUT DEBUG',
                    `Left: ${isLeftDown}`,
                    `Right: ${isRightDown}`,
                    `Jump buf: ${isJumpPressed}`,
                    `VelocityX: ${Math.round(this.player.body.velocity.x)}`,
                    `OnFloor: ${this.player.body.onFloor()}`
                ].join('\n')
            );
        }

        // Update HUD
        this.updateHUD();
    }

    toggleInputDebug() {
        if (this.inputDebugText && this.inputDebugText.active) {
            this.inputDebugText.destroy();
            this.inputDebugText = null;
            return;
        }
        this.inputDebugText = this.add.text(10, this.cameras.main.height - 110, 'INPUT DEBUG', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New'
        });
        this.inputDebugText.setScrollFactor(0);
        this.inputDebugText.setDepth(2000);
    }

    // Removed ensureInputBindings auto-rebinding (not needed, caused potential confusion)
}

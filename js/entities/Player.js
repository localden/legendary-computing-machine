import { PLAYER, COLORS } from '../utils/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create a simple colored rectangle as player sprite
        const graphics = scene.add.graphics();
        graphics.fillStyle(COLORS.PLAYER);
        graphics.fillRect(0, 0, PLAYER.HITBOX.width, PLAYER.HITBOX.height);
        graphics.fillStyle(COLORS.PLAYER_ACCENT);
        graphics.fillRect(4, 4, 8, 8); // Head
        graphics.generateTexture('player', PLAYER.HITBOX.width, PLAYER.HITBOX.height);
        graphics.destroy();

        super(scene, x, y, 'player');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configure physics body
        this.body.setSize(PLAYER.HITBOX.width, PLAYER.HITBOX.height);
        this.body.setCollideWorldBounds(true);
        this.body.setMaxVelocity(PLAYER.SPEED, 1000);
        this.body.setDrag(800, 0);

        // Custom properties
        this.health = PLAYER.MAX_HEALTH;
        this.maxHealth = PLAYER.MAX_HEALTH;
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        this.lives = 3;
        this.activePowerups = [];
        
        // Movement state
        this.isFacingRight = true;
        this.isJumping = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.coyoteTime = 0;
        this.jumpBufferTime = 0;

        // Store initial spawn position
        this.spawnX = x;
        this.spawnY = y;

        // Attack state
        this.lastAttackTime = 0;
        this.attackCooldown = 300; // ms
        this.swingSprite = null;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Update timers
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= delta;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.clearTint();
            } else {
                // Flash effect
                this.setTint(Math.floor(time / 100) % 2 === 0 ? 0xffffff : COLORS.PLAYER);
            }
        }

        // Update coyote time
        if (!this.body.onFloor() && this.coyoteTime > 0) {
            this.coyoteTime -= delta;
        }

        // Update jump buffer
        if (this.jumpBufferTime > 0) {
            this.jumpBufferTime -= delta;
        }

        // Reset double jump when on floor
        if (this.body.onFloor()) {
            this.hasDoubleJumped = false;
            this.isJumping = false;
        }

        // Update active powerups
        this.updatePowerups(delta);
    }

    moveLeft() {
        this.body.setAccelerationX(-PLAYER.SPEED * 8);
        this.isFacingRight = false;
        this.setFlipX(true);
    }

    moveRight() {
        this.body.setAccelerationX(PLAYER.SPEED * 8);
        this.isFacingRight = true;
        this.setFlipX(false);
    }

    stop() {
        this.body.setAccelerationX(0);
    }

    jump() {
        if (this.canJump()) {
            this.body.setVelocityY(PLAYER.JUMP_VELOCITY);
            this.isJumping = true;
            this.coyoteTime = 0;
            this.jumpBufferTime = 0;
        } else if (this.canDoubleJump && !this.hasDoubleJumped && !this.body.onFloor()) {
            this.doubleJump();
        }
    }

    doubleJump() {
        this.body.setVelocityY(PLAYER.DOUBLE_JUMP_VELOCITY);
        this.hasDoubleJumped = true;
    }

    canJump() {
        return this.body.onFloor() || this.coyoteTime > 0;
    }

    setJumpBuffer() {
        this.jumpBufferTime = PLAYER.JUMP_BUFFER_TIME;
    }

    startCoyoteTime() {
        if (!this.body.onFloor()) {
            this.coyoteTime = PLAYER.COYOTE_TIME;
        }
    }

    stompEnemy(enemy) {
        // Small bounce upward after stomping enemy
        this.body.setVelocityY(-200);
    }

    takeDamage(amount = 1) {
        if (this.isInvincible) {
            return;
        }

        this.health -= amount;
        
        // Update registry
        this.scene.registry.set('health', Math.max(0, this.health));

        if (this.health <= 0) {
            this.die();
        } else {
            // Trigger invincibility
            this.grantTemporaryInvincibility(PLAYER.INVINCIBILITY_DURATION);
        }
    }

    die() {
        // Lose a life
        this.lives = this.scene.registry.get('lives') || 3;
        this.lives -= 1;
        this.scene.registry.set('lives', this.lives);

        if (this.lives > 0) {
            // Respawn
            this.respawn();
        } else {
            // Game over
            this.scene.scene.start('GameOverScene', { reason: 'All Lives Lost' });
        }
    }

    respawn() {
        // Reset position
        this.setPosition(this.spawnX, this.spawnY);
        this.body.setVelocity(0, 0);
        
        // Reset health
        this.health = this.maxHealth;
        this.scene.registry.set('health', this.health);
        
        // Grant temporary invincibility
        this.grantTemporaryInvincibility(PLAYER.INVINCIBILITY_DURATION * 2);
    }

    fallIntoPit() {
        // Called when player falls into abyss
        this.die();
    }

    activatePowerup(type, duration) {
        this.activePowerups.push({
            type: type,
            duration: duration,
            startTime: Date.now()
        });
    }

    updatePowerups(deltaTime) {
        // Update and remove expired powerups
        this.activePowerups = this.activePowerups.filter(powerup => {
            if (powerup.duration === 0) {
                return false; // Instant powerups are removed immediately
            }
            
            const elapsed = Date.now() - powerup.startTime;
            return elapsed < powerup.duration;
        });
    }

    grantTemporaryInvincibility(duration) {
        if (duration <= 0) {
            return;
        }

        this.isInvincible = true;
        this.invincibilityTimer = Math.max(this.invincibilityTimer, duration);
    }

    hasPowerup(type) {
        return this.activePowerups.some(p => p.type === type);
    }

    getPowerupTimeRemaining(type) {
        const powerup = this.activePowerups.find(p => p.type === type);
        if (!powerup) return 0;
        
        const elapsed = Date.now() - powerup.startTime;
        return Math.max(0, powerup.duration - elapsed);
    }

    canAttack() {
        return Date.now() - this.lastAttackTime >= this.attackCooldown;
    }

    performKeyboardSwing(direction = 1) {
        if (!this.canAttack()) return false;
        this.lastAttackTime = Date.now();

        // Create swing sprite if missing
        if (!this.swingSprite || !this.swingSprite.active) {
            this.swingSprite = this.scene.add.image(this.x, this.y, 'player-keyboard');
            this.swingSprite.setOrigin(0.1, 0.5);
            this.swingSprite.setDepth(500);
        }

        // Reset position relative to player each use
        this.swingSprite.setPosition(this.x + (direction * 12), this.y - 4);
        this.swingSprite.setFlipX(direction < 0);
        this.swingSprite.alpha = 1;
        this.swingSprite.rotation = direction > 0 ? -0.6 : 0.6;
        this.swingSprite.scale = 1;

        // Tween: quick arc then fade
        this.scene.tweens.add({
            targets: this.swingSprite,
            rotation: direction > 0 ? 0.8 : -0.8,
            y: this.swingSprite.y + 4,
            scale: 1.15,
            duration: 140,
            yoyo: true,
            ease: 'Quad.Out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.swingSprite,
                    alpha: 0,
                    duration: 120,
                    onComplete: () => {
                        // Keep sprite for reuse to avoid reallocation
                        this.swingSprite.alpha = 0;
                    }
                });
            }
        });
        return true;
    }
}

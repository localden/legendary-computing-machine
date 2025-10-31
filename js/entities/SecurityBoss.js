import Enemy from './Enemy.js';

export default class SecurityBoss extends Enemy {
    constructor(scene, x, y) {
        // Boss configuration
        const bossData = {
            type: 'security-boss',
            textureKey: 'security-boss',
            hitbox: { width: 48, height: 64 }, // Larger than regular enemies
            health: 10,
            speed: 80,
            damage: 2,
            color: 0x8B00FF, // Distinct purple color
            pattern: 'chase', // Chase pattern instead of patrol
            detectionRange: 400,
            stompable: false
        };

        super(scene, x, y, bossData);

        // Boss-specific properties
        this.attackCooldown = 3000; // 3 seconds between attacks
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.player = null;

        // Create a crown or special marker for the boss
        this.addBossVisuals();
    }

    static createTexture(scene) {
        if (scene.textures.exists('security-boss')) {
            return;
        }

        const graphics = scene.add.graphics();
        
        // Main body - larger and purple
        graphics.fillStyle(0x8B00FF);
        graphics.fillRect(0, 0, 48, 64);
        
        // Border for emphasis
        graphics.lineStyle(2, 0xFFFFFF, 0.8);
        graphics.strokeRect(1, 1, 46, 62);
        
        // Eyes
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillCircle(16, 20, 4);
        graphics.fillCircle(32, 20, 4);
        
        // Crown/badge on top
        graphics.fillStyle(0xFFD700);
        graphics.fillTriangle(12, 8, 24, 0, 36, 8);
        
        // Security badge
        graphics.fillStyle(0xC0C0C0);
        graphics.fillRect(16, 35, 16, 20);
        graphics.fillStyle(0xFF0000);
        graphics.fillCircle(24, 45, 3);
        
        graphics.generateTexture('security-boss', 48, 64);
        graphics.destroy();
    }

    addBossVisuals() {
        // Add a glowing effect to make boss more noticeable
        this.glowEffect = this.scene.add.graphics();
        this.updateGlowEffect();
        
        // Pulse animation for intimidation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    updateGlowEffect() {
        if (!this.glowEffect || !this.active) return;
        
        this.glowEffect.clear();
        this.glowEffect.lineStyle(3, 0x8B00FF, 0.3);
        this.glowEffect.strokeCircle(this.x, this.y, 35);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Update glow effect position
        this.updateGlowEffect();

        // Execute chase pattern
        if (this.player && this.movementPattern === 'chase') {
            this.chasePlayer(this.player);
        }

        // Check for special attack
        if (this.player && time - this.lastAttackTime > this.attackCooldown) {
            this.attemptSpecialAttack(time);
        }

        this.constrainToPlatform();
    }

    setPlayer(player) {
        this.player = player;
    }

    chasePlayer(player) {
        if (!player || !player.active) return;

        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance < this.detectionRange) {
            // Move toward player with boss speed
            if (player.x < this.x) {
                this.body.setVelocityX(-this.patrolSpeed);
                this.setFlipX(true);
                this.isFacingRight = false;
            } else {
                this.body.setVelocityX(this.patrolSpeed);
                this.setFlipX(false);
                this.isFacingRight = true;
            }

            // Jump if player is above
            if (player.y < this.y - 50 && this.body.onFloor()) {
                this.body.setVelocityY(-300);
            }
        } else {
            this.body.setVelocityX(0);
        }
    }

    constrainToPlatform() {
        // Keep boss from walking off last known platform bounds if available
        if (!this.body || !this.scene.platforms) return;
        // Find closest platform under/near boss (simple search)
        const platforms = this.scene.platforms.getChildren ? this.scene.platforms.getChildren() : [];
        let closest = null;
        let minDist = Infinity;
        platforms.forEach(p => {
            const dy = Math.abs(p.y - this.y);
            if (dy < 120) { // vertical proximity threshold
                const dist = Math.abs(p.x - this.x);
                if (dist < minDist) {
                    minDist = dist;
                    closest = p;
                }
            }
        });
        if (closest) {
            const halfWidth = (closest.displayWidth || closest.width || 64) / 2;
            const leftBound = closest.x - halfWidth + 10;
            const rightBound = closest.x + halfWidth - 10;
            if (this.x < leftBound) {
                this.x = leftBound;
                this.body.setVelocityX(Math.abs(this.body.velocity.x));
            } else if (this.x > rightBound) {
                this.x = rightBound;
                this.body.setVelocityX(-Math.abs(this.body.velocity.x));
            }
        }

        // Recover if fallen below level floor
        if (this.y > this.scene.levelData.height + 50) {
            // Respawn boss at initial spawn or closest platform
            const spawnY = (closest ? closest.y - 60 : this.scene.levelData.platforms[0].y - 60);
            const spawnX = (closest ? closest.x : this.scene.levelData.platforms[0].x);
            this.setPosition(spawnX, spawnY);
            this.body.setVelocity(0, 0);
        }
    }

    attemptSpecialAttack(currentTime) {
        if (!this.player || !this.player.active) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
        
        // Only attack if player is close enough
        if (distance < 150) {
            this.performSpecialAttack();
            this.lastAttackTime = currentTime;
        }
    }

    performSpecialAttack() {
        if (this.isAttacking) return;
        
        this.isAttacking = true;

        // Visual feedback for attack
        this.setTint(0xFF0000);
        
        // Create attack effect
        const attackRadius = 80;
        const attackGraphics = this.scene.add.graphics();
        attackGraphics.lineStyle(4, 0xFF0000, 0.8);
        attackGraphics.strokeCircle(this.x, this.y, attackRadius);
        
        // Fade out attack visual
        this.scene.tweens.add({
            targets: attackGraphics,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                attackGraphics.destroy();
            }
        });

        // Check if player is in range and deal damage
        if (this.player) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            if (distance < attackRadius) {
                this.dealDamage(this.player);
            }
        }

        // Reset tint and attack state
        this.scene.time.delayedCall(300, () => {
            this.clearTint();
            this.isAttacking = false;
        });
    }

    takeDamage(amount = 1) {
        this.health -= amount;

        // Flash white when hit (different from regular enemies)
        this.setTint(0xFFFFFF);
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });

        // Screen shake on boss hit
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(100, 0.005);
        }

        // Emit event for health bar update
        this.scene.events.emit('boss-health-changed', this.health, this.maxHealth);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Clean up glow effect
        if (this.glowEffect) {
            this.glowEffect.destroy();
        }

        // Stop all tweens
        this.scene.tweens.killTweensOf(this);

        // Emit boss defeated event
        this.scene.events.emit('boss-defeated');

        // Spectacular death animation
        this.scene.cameras.main.shake(500, 0.01);
        
        // Explosion effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.scene.add.graphics();
            particle.fillStyle(0x8B00FF);
            particle.fillCircle(0, 0, 8);
            particle.setPosition(this.x, this.y);
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 100,
                y: this.y + Math.sin(angle) * 100,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }

        // Fade out boss
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    destroy() {
        // Clean up glow effect
        if (this.glowEffect) {
            this.glowEffect.destroy();
            this.glowEffect = null;
        }
        
        super.destroy();
    }
}

import { COLORS } from '../utils/constants.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyData) {
        // Create texture dynamically based on enemy type
        if (!scene.textures.exists(enemyData.textureKey)) {
            Enemy.createTexture(scene, enemyData);
        }

        super(scene, x, y, enemyData.textureKey);

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configure physics body
        this.body.setSize(enemyData.hitbox.width, enemyData.hitbox.height);
        this.body.setCollideWorldBounds(true);

        // Enemy properties
        this.enemyType = enemyData.type;
        this.health = enemyData.health;
        this.maxHealth = enemyData.health;
        this.movementPattern = enemyData.pattern;
        this.patrolLeft = enemyData.patrolLeft || x - 50;
        this.patrolRight = enemyData.patrolRight || x + 50;
        this.patrolSpeed = enemyData.speed;
        this.detectionRange = enemyData.detectionRange || 0;
        this.damageAmount = enemyData.damage;
        this.isStompable = enemyData.stompable;
        this.isFacingRight = true;

        // Movement state
        this.movementDirection = 1; // 1 = right, -1 = left
    }

    static createTexture(scene, enemyData) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(enemyData.color);
        graphics.fillRect(0, 0, enemyData.hitbox.width, enemyData.hitbox.height);
        
        // Add some visual details
        graphics.fillStyle(0xFFFFFF, 0.3);
        graphics.fillCircle(enemyData.hitbox.width / 3, enemyData.hitbox.height / 3, 2);
        graphics.fillCircle(2 * enemyData.hitbox.width / 3, enemyData.hitbox.height / 3, 2);
        
        graphics.generateTexture(enemyData.textureKey, enemyData.hitbox.width, enemyData.hitbox.height);
        graphics.destroy();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Execute movement pattern
        if (this.movementPattern === 'patrol') {
            this.patrol();
        }
    }

    patrol() {
        // Move back and forth between patrol boundaries
        if (this.movementDirection > 0) {
            // Moving right
            this.body.setVelocityX(this.patrolSpeed);
            this.setFlipX(false);
            this.isFacingRight = true;

            if (this.x >= this.patrolRight) {
                this.movementDirection = -1;
            }
        } else {
            // Moving left
            this.body.setVelocityX(-this.patrolSpeed);
            this.setFlipX(true);
            this.isFacingRight = false;

            if (this.x <= this.patrolLeft) {
                this.movementDirection = 1;
            }
        }
    }

    chasePlayer(player) {
        if (!player) return;

        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance < this.detectionRange) {
            // Move toward player
            if (player.x < this.x) {
                this.body.setVelocityX(-this.patrolSpeed);
                this.setFlipX(true);
                this.isFacingRight = false;
            } else {
                this.body.setVelocityX(this.patrolSpeed);
                this.setFlipX(false);
                this.isFacingRight = true;
            }
        } else {
            this.body.setVelocityX(0);
        }
    }

    takeDamage(amount = 1) {
        this.health -= amount;

        // Flash red when hit
        this.setTint(0xFF0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 20,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    dealDamage(player) {
        if (player && player.takeDamage) {
            player.takeDamage(this.damageAmount);
        }
    }
}

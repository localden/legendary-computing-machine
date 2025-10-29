import { COLLECTIBLE, COLORS } from '../utils/constants.js';

export default class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'coffee-cup') {
        // Create collectible sprite
        const graphics = scene.add.graphics();
        graphics.fillStyle(COLORS.COFFEE_CUP);
        graphics.fillCircle(6, 6, 6);
        graphics.fillStyle(0xFFFFFF);
        graphics.fillRect(4, 2, 4, 3); // Steam effect
        graphics.generateTexture('coffee-cup', COLLECTIBLE.HITBOX.width, COLLECTIBLE.HITBOX.height);
        graphics.destroy();

        super(scene, x, y, 'coffee-cup');

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configure physics
        this.body.setSize(COLLECTIBLE.HITBOX.width, COLLECTIBLE.HITBOX.height);
        this.body.setAllowGravity(false);

        // Properties
        this.type = type;
        this.pointValue = COLLECTIBLE.COFFEE_CUP_POINTS;
        this.isCollected = false;

        // Add gentle hover animation
        scene.tweens.add({
            targets: this,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add sparkle effect
        scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    collect(player) {
        if (this.isCollected) {
            return;
        }

        this.isCollected = true;

        // Add score
        const currentScore = this.scene.registry.get('score') || 0;
        this.scene.registry.set('score', currentScore + this.pointValue);

        // Play collection effect
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });

        // Optional: play sound effect here
        // this.scene.sound.play('collect');
    }
}

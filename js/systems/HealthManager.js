import { PLAYER } from '../utils/constants.js';

export default class HealthManager {
    constructor(scene) {
        this.scene = scene;
        this.health = PLAYER.MAX_HEALTH;
        this.maxHealth = PLAYER.MAX_HEALTH;
        this.lives = 3;
    }

    takeDamage(amount = 1) {
        this.health -= amount;
        
        // Update registry
        this.scene.registry.set('health', Math.max(0, this.health));
        
        // Emit event
        this.scene.registry.events.emit('healthChanged', this.health);
        
        // Check if dead
        if (this.health <= 0) {
            return this.loseLife();
        }
        
        return false; // Not dead
    }

    heal(amount = 1) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.scene.registry.set('health', this.health);
        this.scene.registry.events.emit('healthChanged', this.health);
    }

    loseLife() {
        this.lives -= 1;
        this.scene.registry.set('lives', Math.max(0, this.lives));
        this.scene.registry.events.emit('livesChanged', this.lives);
        
        if (this.lives > 0) {
            // Reset health but keep lives
            this.health = this.maxHealth;
            this.scene.registry.set('health', this.health);
            return false; // Not game over
        }
        
        return true; // Game over
    }

    addLife() {
        this.lives += 1;
        this.scene.registry.set('lives', this.lives);
        this.scene.registry.events.emit('livesChanged', this.lives);
    }

    getHealth() {
        return this.scene.registry.get('health') || this.maxHealth;
    }

    getLives() {
        return this.scene.registry.get('lives') || 3;
    }

    reset() {
        this.health = this.maxHealth;
        this.lives = 3;
        this.scene.registry.set('health', this.health);
        this.scene.registry.set('lives', this.lives);
    }
}

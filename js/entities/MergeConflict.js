import Enemy from './Enemy.js';
import { ENEMIES, COLORS } from '../utils/constants.js';

export default class MergeConflict extends Enemy {
    constructor(scene, x, y, patrolLeft, patrolRight) {
        const enemyData = {
            type: 'merge-conflict',
            textureKey: 'merge-conflict',
            health: ENEMIES.MERGE_CONFLICT.health,
            speed: ENEMIES.MERGE_CONFLICT.speed,
            damage: ENEMIES.MERGE_CONFLICT.damage,
            pattern: 'jump',
            stompable: true,
            detectionRange: 0,
            color: COLORS.MERGE_CONFLICT,
            hitbox: ENEMIES.MERGE_CONFLICT.hitbox,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight
        };

        super(scene, x, y, enemyData);

        // Setup jump timer
        this.jumpTimer = scene.time.addEvent({
            delay: ENEMIES.MERGE_CONFLICT.jumpInterval,
            callback: () => this.jump(),
            loop: true
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Override patrol to also handle horizontal movement during jumps
        if (this.body.onFloor()) {
            this.patrol();
        }
    }

    jump() {
        if (this.body.onFloor()) {
            this.body.setVelocityY(-250);
        }
    }

    destroy(fromScene) {
        // Clean up timer
        if (this.jumpTimer) {
            this.jumpTimer.remove();
        }
        super.destroy(fromScene);
    }
}

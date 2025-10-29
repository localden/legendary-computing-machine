import Enemy from './Enemy.js';
import { ENEMIES, COLORS } from '../utils/constants.js';

export default class Bug extends Enemy {
    constructor(scene, x, y, patrolLeft, patrolRight) {
        const enemyData = {
            type: 'bug',
            textureKey: 'bug',
            health: ENEMIES.BUG.health,
            speed: ENEMIES.BUG.speed,
            damage: ENEMIES.BUG.damage,
            pattern: 'patrol',
            stompable: true,
            detectionRange: 0,
            color: COLORS.BUG,
            hitbox: ENEMIES.BUG.hitbox,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight
        };

        super(scene, x, y, enemyData);
    }
}

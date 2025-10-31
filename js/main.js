import { GAME_CONFIG } from './utils/constants.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false // Set to true for collision debugging
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        GameOverScene,
        VictoryScene
    ],
    pixelArt: true, // Crisp pixel graphics
    fps: {
        target: GAME_CONFIG.FPS,
        forceSetTimeOut: true
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Handle browser tab visibility - pause game when tab loses focus
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.scene.pause();
    } else {
        game.scene.resume();
    }
});

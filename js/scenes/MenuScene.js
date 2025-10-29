export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Title
        const title = this.add.text(centerX, centerY - 150, 'PROGRAMMER\nADVENTURE', {
            fontSize: '48px',
            fill: '#00ff00',
            fontFamily: 'Courier New',
            align: 'center',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(centerX, centerY - 50, 'Collect Coffee, Debug Bugs, Close PRs', {
            fontSize: '18px',
            fill: '#4ECDC4',
            fontFamily: 'Courier New',
            align: 'center'
        });
        subtitle.setOrigin(0.5);

        // Start button
        const startButton = this.add.text(centerX, centerY + 50, '[ PRESS SPACE TO START ]', {
            fontSize: '24px',
            fill: '#FF6B6B',
            fontFamily: 'Courier New'
        });
        startButton.setOrigin(0.5);

        // Animate start button
        this.tweens.add({
            targets: startButton,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // High scores display
        const highScores = this.registry.get('highScores') || [];
        if (highScores.length > 0) {
            const highScoreText = this.add.text(centerX, centerY + 120, `High Score: ${highScores[0].score}`, {
                fontSize: '16px',
                fill: '#FFD700',
                fontFamily: 'Courier New'
            });
            highScoreText.setOrigin(0.5);
        }

        // Controls info
        const controls = this.add.text(centerX, centerY + 180, 'Arrow Keys / WASD - Move\nSPACE - Jump\nP - Pause', {
            fontSize: '14px',
            fill: '#7F8C8D',
            fontFamily: 'Courier New',
            align: 'center'
        });
        controls.setOrigin(0.5);

        // Input handling
        this.input.keyboard.once('keydown-SPACE', () => {
            this.startGame();
        });
    }

    startGame() {
        // Reset game state
        this.registry.set('currentLevel', 1);
        this.registry.set('lives', 3);
        this.registry.set('health', 3);
        this.registry.set('score', 0);
        
        // Start the game
        this.scene.start('GameScene');
    }
}

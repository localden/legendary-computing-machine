export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create(data) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Game over title
        const title = this.add.text(centerX, centerY - 100, 'GAME OVER', {
            fontSize: '48px',
            fill: '#E71D36',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Final score
        const score = this.registry.get('score') || 0;
        const scoreText = this.add.text(centerX, centerY, `Final Score: ${score}`, {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Courier New'
        });
        scoreText.setOrigin(0.5);

        // Reason for game over (if provided)
        if (data && data.reason) {
            const reasonText = this.add.text(centerX, centerY + 50, data.reason, {
                fontSize: '18px',
                fill: '#FFD700',
                fontFamily: 'Courier New',
                align: 'center'
            });
            reasonText.setOrigin(0.5);
        }

        // Retry button
        const retryButton = this.add.text(centerX, centerY + 120, '[ PRESS R TO RETRY ]', {
            fontSize: '20px',
            fill: '#4ECDC4',
            fontFamily: 'Courier New'
        });
        retryButton.setOrigin(0.5);

        // Menu button
        const menuButton = this.add.text(centerX, centerY + 160, '[ PRESS M FOR MENU ]', {
            fontSize: '20px',
            fill: '#7F8C8D',
            fontFamily: 'Courier New'
        });
        menuButton.setOrigin(0.5);

        // Animate buttons
        this.tweens.add({
            targets: retryButton,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input handling
        this.input.keyboard.once('keydown-R', () => {
            this.retry();
        });

        this.input.keyboard.once('keydown-M', () => {
            this.goToMenu();
        });

        // Save high score
        this.saveHighScore(score);
    }

    retry() {
        // Reset to level 1
        this.registry.set('currentLevel', 1);
        this.registry.set('lives', 3);
        this.registry.set('health', 3);
        this.registry.set('score', 0);
        this.scene.start('GameScene');
    }

    goToMenu() {
        this.scene.start('MenuScene');
    }

    saveHighScore(score) {
        try {
            const highScores = this.registry.get('highScores') || [];
            const newEntry = {
                score: score,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            highScores.push(newEntry);
            highScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 10
            const topScores = highScores.slice(0, 10);
            
            this.registry.set('highScores', topScores);
            localStorage.setItem('programmerAdventure_highScores', JSON.stringify(topScores));
        } catch (error) {
            console.warn('Could not save high score:', error);
        }
    }
}

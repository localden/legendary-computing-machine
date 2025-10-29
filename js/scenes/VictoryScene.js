export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create(data) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Victory title
        const title = this.add.text(centerX, centerY - 120, 'VICTORY!', {
            fontSize: '56px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Congratulations message
        const message = this.add.text(centerX, centerY - 50, 'All 10 Levels Complete!', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Courier New'
        });
        message.setOrigin(0.5);

        // Final score
        const score = this.registry.get('score') || 0;
        const scoreText = this.add.text(centerX, centerY + 10, `Final Score: ${score}`, {
            fontSize: '28px',
            fill: '#4ECDC4',
            fontFamily: 'Courier New'
        });
        scoreText.setOrigin(0.5);

        // Total time (if provided)
        if (data && data.totalTime) {
            const minutes = Math.floor(data.totalTime / 60000);
            const seconds = Math.floor((data.totalTime % 60000) / 1000);
            const timeText = this.add.text(centerX, centerY + 50, `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
                fontSize: '20px',
                fill: '#FFD700',
                fontFamily: 'Courier New'
            });
            timeText.setOrigin(0.5);
        }

        // Menu button
        const menuButton = this.add.text(centerX, centerY + 120, '[ PRESS M FOR MENU ]', {
            fontSize: '20px',
            fill: '#FF6B6B',
            fontFamily: 'Courier New'
        });
        menuButton.setOrigin(0.5);

        // Play again button
        const playAgainButton = this.add.text(centerX, centerY + 160, '[ PRESS R TO PLAY AGAIN ]', {
            fontSize: '20px',
            fill: '#7F8C8D',
            fontFamily: 'Courier New'
        });
        playAgainButton.setOrigin(0.5);

        // Animate buttons
        this.tweens.add({
            targets: [menuButton, playAgainButton],
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Celebration particles (optional)
        this.createCelebrationEffect(centerX, centerY - 120);

        // Input handling
        this.input.keyboard.once('keydown-M', () => {
            this.scene.start('MenuScene');
        });

        this.input.keyboard.once('keydown-R', () => {
            this.registry.set('currentLevel', 1);
            this.registry.set('lives', 3);
            this.registry.set('health', 3);
            this.registry.set('score', 0);
            this.scene.start('GameScene');
        });

        // Save high score
        this.saveHighScore(score);
    }

    createCelebrationEffect(x, y) {
        // Simple star burst effect using graphics
        const colors = [0xFFD700, 0xFF6B6B, 0x4ECDC4, 0x00ff00];
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const distance = 100;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            const star = this.add.graphics();
            star.fillStyle(colors[i % colors.length], 1);
            star.fillCircle(x, y, 4);
            
            this.tweens.add({
                targets: star,
                x: endX,
                y: endY,
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        }
    }

    saveHighScore(score) {
        try {
            const highScores = this.registry.get('highScores') || [];
            const newEntry = {
                score: score,
                date: new Date().toISOString(),
                timestamp: Date.now(),
                completed: true
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

export default class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
    }

    addScore(points) {
        this.score += points;
        
        // Update registry
        const currentScore = this.scene.registry.get('score') || 0;
        this.scene.registry.set('score', currentScore + points);
        
        // Emit event for UI updates
        this.scene.registry.events.emit('scoreChanged', currentScore + points);
        
        return currentScore + points;
    }

    getScore() {
        return this.scene.registry.get('score') || 0;
    }

    resetScore() {
        this.score = 0;
        this.scene.registry.set('score', 0);
        this.scene.registry.events.emit('scoreChanged', 0);
    }

    saveHighScore() {
        try {
            const score = this.getScore();
            const highScores = this.loadHighScores();
            
            const newEntry = {
                score: score,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            highScores.push(newEntry);
            highScores.sort((a, b) => b.score - a.score);
            
            // Keep only top 10
            const topScores = highScores.slice(0, 10);
            
            this.scene.registry.set('highScores', topScores);
            localStorage.setItem('programmerAdventure_highScores', JSON.stringify(topScores));
            
            return topScores;
        } catch (error) {
            console.warn('Could not save high score:', error);
            return [];
        }
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('programmerAdventure_highScores');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Could not load high scores:', error);
            return [];
        }
    }

    isNewHighScore() {
        const currentScore = this.getScore();
        const highScores = this.loadHighScores();
        
        if (highScores.length < 10) return true;
        
        return currentScore > highScores[highScores.length - 1].score;
    }
}

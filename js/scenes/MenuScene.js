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

        // Debug level select hint
        const debugHint = this.add.text(centerX, centerY + 240, '[DEBUG] Press L to pick a level', {
            fontSize: '14px',
            fill: '#95A5A6',
            fontFamily: 'Courier New'
        });
        debugHint.setOrigin(0.5);

        // Level select menu setup
        this.levelSelectActive = false;
        this.levelSelectHandler = null;
        this.buildLevelSelectMenu(centerX, centerY);

        this.input.keyboard.on('keydown-L', () => {
            this.toggleLevelSelect();
        });

        // Input handling
        this.input.keyboard.once('keydown-SPACE', () => {
            this.startGame();
        });
    }

    startGame(levelNumber = 1) {
        if (this.levelSelectActive) {
            this.closeLevelSelect();
        }

        const levels = this.registry.get('levels') || [];
        const maxLevel = levels.length > 0 ? levels.length : 1;
        const targetLevel = Phaser.Math.Clamp(levelNumber, 1, maxLevel);

        // Reset game state
        this.registry.set('currentLevel', targetLevel);
        this.registry.set('lives', 3);
        this.registry.set('health', 3);
        this.registry.set('score', 0);
        
        // Start the game
        this.scene.start('GameScene');
    }

    buildLevelSelectMenu(centerX, centerY) {
        const menuWidth = 480;
        const menuHeight = 340;
        this.levelSelectContainer = this.add.container(centerX, centerY);
        this.levelSelectContainer.setDepth(1000);
        this.levelSelectContainer.setVisible(false);

        const background = this.add.rectangle(0, 0, menuWidth, menuHeight, 0x000000, 0.85);
        background.setStrokeStyle(2, 0x00ff00, 0.8);
        background.setInteractive();

        const title = this.add.text(0, -menuHeight / 2 + 40, 'DEBUG LEVEL SELECT', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'Courier New',
            fontStyle: 'bold',
            align: 'center'
        });
        title.setOrigin(0.5);

        const instructions = this.add.text(0, -menuHeight / 2 + 90, 'Click a level or press its number key.\nPress ESC to close.', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            align: 'center'
        });
        instructions.setOrigin(0.5);

        this.levelSelectContainer.add([background, title, instructions]);

        const levels = this.registry.get('levels') || [];
        const levelCount = levels.length > 0 ? levels.length : 10;
        const perRow = Math.min(5, levelCount);
        const spacingX = 160;
        const spacingY = 70;
        const rows = Math.ceil(levelCount / perRow);
        const startY = -((rows - 1) * spacingY) / 2;

        this.levelButtons = [];

        for (let i = 0; i < levelCount; i++) {
            const row = Math.floor(i / perRow);
            const col = i % perRow;
            const x = -((perRow - 1) * spacingX) / 2 + col * spacingX;
            const y = startY + row * spacingY;
            const levelNumber = i + 1;

            const button = this.add.text(x, y, `Level ${levelNumber}`, {
                fontSize: '18px',
                fill: '#FF6B6B',
                fontFamily: 'Courier New'
            });
            button.setOrigin(0.5);
            button.setInteractive({ useHandCursor: true });

            button.on('pointerover', () => {
                button.setStyle({ fill: '#00ff00' });
            });
            button.on('pointerout', () => {
                button.setStyle({ fill: '#FF6B6B' });
            });
            button.on('pointerup', () => {
                this.handleLevelChoice(levelNumber);
            });

            this.levelButtons.push(button);
            this.levelSelectContainer.add(button);
        }
    }

    toggleLevelSelect() {
        if (this.levelSelectActive) {
            this.closeLevelSelect();
        } else {
            this.openLevelSelect();
        }
    }

    openLevelSelect() {
        if (this.levelSelectActive) {
            return;
        }

        this.levelSelectActive = true;
        this.levelSelectContainer.setVisible(true);

        this.levelSelectHandler = (event) => {
            this.handleLevelSelectKey(event);
        };
        this.input.keyboard.on('keydown', this.levelSelectHandler, this);
    }

    closeLevelSelect() {
        if (!this.levelSelectActive) {
            return;
        }

        this.levelSelectActive = false;
        this.levelSelectContainer.setVisible(false);

        if (this.levelSelectHandler) {
            this.input.keyboard.off('keydown', this.levelSelectHandler, this);
            this.levelSelectHandler = null;
        }
    }

    handleLevelSelectKey(event) {
        const key = event.key;

        if (key === 'Escape') {
            this.closeLevelSelect();
            return;
        }

        if (!/^[0-9]$/.test(key)) {
            return;
        }

        const numericValue = parseInt(key, 10);
        if (numericValue === 0) {
            if (this.levelButtons.length >= 10) {
                this.handleLevelChoice(10);
            }
            return;
        }

        if (numericValue <= this.levelButtons.length) {
            this.handleLevelChoice(numericValue);
        }
    }

    handleLevelChoice(levelNumber) {
        this.startGame(levelNumber);
    }
}

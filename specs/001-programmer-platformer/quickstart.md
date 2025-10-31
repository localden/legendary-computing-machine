# Quickstart Guide: Programmer Adventure Platformer

**Feature**: 001-programmer-platformer  
**Framework**: Phaser.js 3  
**Date**: 2025-10-29

## Prerequisites

- **Web Browser**: Chrome, Firefox, Edge, or Safari (latest 2 major versions)
- **Text Editor**: VS Code, Sublime, or any code editor
- **Local Web Server**: Required for ES6 modules (options below)
- **No Build Tools**: Pure JavaScript, no npm/webpack required (optional)

## Project Structure

Create the following directory structure:

```
001-programmer-platformer/
├── index.html
├── css/
│   └── game.css
└── js/
    ├── main.js
    ├── scenes/
    │   ├── BootScene.js
    │   ├── MenuScene.js
    │   ├── GameScene.js
    │   ├── GameOverScene.js
    │   └── VictoryScene.js
    ├── entities/
    │   ├── Player.js
    │   ├── Enemy.js
    │   └── ... (other entity files)
    ├── systems/
    │   ├── LevelGenerator.js
    │   ├── ScoreManager.js
    │   └── HealthManager.js
    └── utils/
        └── constants.js
```

## Step 1: Create index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programmer Adventure</title>
    <link rel="stylesheet" href="css/game.css">
    
    <!-- Phaser 3 from CDN -->
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
</head>
<body>
    <div id="game-container"></div>
    
    <!-- Load game as ES6 module -->
    <script type="module" src="js/main.js"></script>
</body>
</html>
```

**Note**: Using Phaser CDN provides caching benefits. For offline development, download phaser.min.js locally.

## Step 2: Create css/game.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #1a1a2e;
    font-family: 'Courier New', monospace;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

#game-container {
    position: relative;
}

/* Phaser canvas will be injected here */
canvas {
    display: block;
    border: 2px solid #16213e;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

/* HUD overlay (optional - can also use Phaser text objects) */
.hud {
    position: absolute;
    top: 10px;
    width: 100%;
    color: #00ff00;
    font-size: 18px;
    pointer-events: none;
    z-index: 10;
}

.hud-left {
    position: absolute;
    left: 20px;
    top: 20px;
}

.hud-right {
    position: absolute;
    right: 20px;
    top: 20px;
    text-align: right;
}
```

## Step 3: Create js/utils/constants.js

```javascript
// Game constants
export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    GRAVITY: 800,
    FPS: 60
};

export const PLAYER = {
    SPEED: 160,
    JUMP_VELOCITY: -330,
    DOUBLE_JUMP_VELOCITY: -280,
    MAX_HEALTH: 3,
    HITBOX: { width: 16, height: 24 },
    INVINCIBILITY_DURATION: 1000,
    COYOTE_TIME: 100,
    JUMP_BUFFER_TIME: 100
};

export const ENEMIES = {
    BUG: {
        health: 1,
        speed: 40,
        damage: 1,
        hitbox: { width: 12, height: 12 }
    },
    MERGE_CONFLICT: {
        health: 2,
        speed: 60,
        damage: 1,
        jumpInterval: 2000,
        hitbox: { width: 16, height: 16 }
    },
    SECURITY_BOSS: {
        health: 10,
        speed: 80,
        damage: 2,
        detectionRange: 400,
        attackCooldown: 3000,
        hitbox: { width: 32, height: 48 }
    }
};

export const LEVEL = {
    WIDTH: 5000,
    HEIGHT: 600,
    TIME_LIMIT: 300000,  // 5 minutes in MS
    BOSS_LEVELS: [3, 6, 9]
};

export const POWERUPS = {
    INVINCIBILITY: { duration: 5000 },
    SPEED_BOOST: { duration: 10000, multiplier: 1.5 },
    DOUBLE_JUMP: { duration: 15000 },
    HEALTH_RESTORE: { duration: 0, amount: 1 },
    EXTRA_LIFE: { duration: 0, amount: 1 },
    SLOW_TIME: { duration: 8000, multiplier: 0.5 }
};

export const COLLECTIBLE = {
    COFFEE_CUP_POINTS: 10,
    HITBOX: { width: 12, height: 12 }
};

export const COLORS = {
    PLAYER: 0xFF6B6B,
    PLAYER_ACCENT: 0x4ECDC4,
    BUG: 0xFF9F1C,
    MERGE_CONFLICT: 0xE71D36,
    SECURITY_BOSS: 0x8B00FF,
    COFFEE_CUP: 0x6F4E37,
    PLATFORM: 0x4A4A4A,
    BACKGROUND: 0x1a1a2e
};
```

## Step 4: Create js/main.js

```javascript
// Import scenes
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

import { GAME_CONFIG } from './utils/constants.js';

// Phaser game configuration
const config = {
    type: Phaser.AUTO,  // Use WebGL if available, fall back to Canvas
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    pixelArt: true,  // Crisp pixel art rendering
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false  // Set to true for collision visualization
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        GameOverScene,
        VictoryScene
    ]
};

// Initialize game
const game = new Phaser.Game(config);

// Global error handling (optional)
window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
});
```

## Step 5: Create js/scenes/BootScene.js

```javascript
import { LEVEL } from '../utils/constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Display loading text
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading...',
            { fontSize: '32px', color: '#00ff00' }
        );
        loadingText.setOrigin(0.5);

        // If using sprite sheets (optional):
        // this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 24 });
        
        // For now, we're using Graphics API (no assets to load)
    }

    create() {
        // Generate all 10 levels procedurally
        console.log('Generating levels...');
        this.generateLevels();

        // Load high scores from LocalStorage
        this.loadHighScores();

        // Initialize global game state in Registry
        this.registry.set('currentLevel', 1);
        this.registry.set('lives', 3);
        this.registry.set('score', 0);
        this.registry.set('health', 3);
        this.registry.set('status', 'menu');

        // Start menu scene
        this.scene.start('MenuScene');
    }

    generateLevels() {
        // TODO: Implement full procedural generation (see LevelGenerator.js)
        // For now, create simple test level
        const testLevel = {
            id: 1,
            theme: 'dev-conference',
            width: LEVEL.WIDTH,
            height: LEVEL.HEIGHT,
            timeLimit: LEVEL.TIME_LIMIT,
            platforms: [
                // Ground platform
                { x: 0, y: 550, width: 5000, height: 50, type: 'ground' },
                // Test platforms
                { x: 200, y: 450, width: 150, height: 20, type: 'elevated' },
                { x: 400, y: 350, width: 150, height: 20, type: 'elevated' },
                { x: 600, y: 250, width: 150, height: 20, type: 'elevated' }
            ],
            enemies: [
                { type: 'bug', x: 300, y: 500, patrolLeft: 200, patrolRight: 400 }
            ],
            collectibles: [
                { x: 250, y: 400 },
                { x: 450, y: 300 },
                { x: 650, y: 200 }
            ],
            powerups: [
                { type: 'speed-boost', x: 500, y: 300 }
            ],
            closePRButton: { x: 4900, y: 500 },
            isBossLevel: false,
            difficulty: 1,
            seed: 'test-level-1',
            generatedAt: Date.now()
        };

        // Cache level in game registry
        this.cache.json.add('level-1', testLevel);
        console.log('Level 1 generated');
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('programmerAdventure:highScores');
            const highScores = stored ? JSON.parse(stored) : [];
            this.registry.set('highScores', highScores);
            this.registry.set('highScore', highScores[0]?.score || 0);
        } catch (error) {
            console.error('Failed to load high scores:', error);
            this.registry.set('highScores', []);
            this.registry.set('highScore', 0);
        }
    }
}
```

## Step 6: Create js/scenes/MenuScene.js

```javascript
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, height / 3, 'PROGRAMMER\nADVENTURE', {
            fontSize: '48px',
            color: '#00ff00',
            align: 'center',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Instructions
        const instructions = [
            'Arrow Keys or WASD - Move',
            'Space - Jump',
            'P - Pause',
            '',
            'Collect coffee cups!',
            'Defeat bugs!',
            'Press the Close PR button to win!',
            '',
            'Press SPACE to start'
        ];

        this.add.text(width / 2, height / 2 + 50, instructions.join('\n'), {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // High score
        const highScore = this.registry.get('highScore');
        this.add.text(width / 2, height - 50, `High Score: ${highScore}`, {
            fontSize: '20px',
            color: '#ffff00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Start game on spacebar
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene', { level: 1 });
        });
    }
}
```

## Step 7: Create js/scenes/GameScene.js (Minimal Bootstrap)

```javascript
import { GAME_CONFIG, PLAYER, COLORS } from '../utils/constants.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevelNumber = data.level || 1;
    }

    create() {
        const levelData = this.cache.json.get(`level-${this.currentLevelNumber}`);
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, levelData.width, levelData.height);

        // Create platforms (using Graphics API for now)
        this.platforms = this.physics.add.staticGroup();
        levelData.platforms.forEach(platform => {
            const graphics = this.add.graphics();
            graphics.fillStyle(COLORS.PLATFORM);
            graphics.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add physics body
            const body = this.platforms.create(
                platform.x + platform.width / 2,
                platform.y + platform.height / 2,
                null
            );
            body.setSize(platform.width, platform.height);
            body.refreshBody();
        });

        // Create player (using Graphics API for pixel-art style)
        this.player = this.physics.add.sprite(100, 500, null);
        this.player.setSize(PLAYER.HITBOX.width, PLAYER.HITBOX.height);
        this.player.setCollideWorldBounds(true);
        this.player.body.setMaxVelocity(PLAYER.SPEED, 1000);

        // Draw player as colored rectangle
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(COLORS.PLAYER);
        playerGraphics.fillRect(-8, -12, 16, 24);
        playerGraphics.fillStyle(COLORS.PLAYER_ACCENT);
        playerGraphics.fillRect(-4, -8, 8, 8);
        this.player.setData('graphics', playerGraphics);

        // Update graphics position in update loop
        
        // Collision
        this.physics.add.collider(this.player, this.platforms);

        // Camera follow player
        this.cameras.main.setBounds(0, 0, levelData.width, levelData.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            w: this.input.keyboard.addKey('W'),
            a: this.input.keyboard.addKey('A'),
            s: this.input.keyboard.addKey('S'),
            d: this.input.keyboard.addKey('D'),
            space: this.input.keyboard.addKey('SPACE')
        };

        // HUD
        this.createHUD();

        console.log('GameScene created');
    }

    update() {
        // Update player graphics position
        const graphics = this.player.getData('graphics');
        if (graphics) {
            graphics.x = this.player.x;
            graphics.y = this.player.y;
        }

        // Player movement
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            this.player.setVelocityX(-PLAYER.SPEED);
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            this.player.setVelocityX(PLAYER.SPEED);
        } else {
            this.player.setVelocityX(0);
        }

        // Jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            if (this.player.body.onFloor()) {
                this.player.setVelocityY(PLAYER.JUMP_VELOCITY);
            }
        }
    }

    createHUD() {
        // Create HUD text (fixed to camera)
        this.healthText = this.add.text(20, 20, 'Health: 3', {
            fontSize: '18px',
            color: '#00ff00',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);

        this.scoreText = this.add.text(700, 20, 'Score: 0', {
            fontSize: '18px',
            color: '#ffff00',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);

        this.livesText = this.add.text(20, 50, 'Lives: 3', {
            fontSize: '18px',
            color: '#ff6b6b',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);

        this.timerText = this.add.text(700, 50, 'Time: 5:00', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Courier New'
        }).setScrollFactor(0);
    }
}
```

## Running the Game

### Option 1: VS Code Live Server (Recommended)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Game opens at `http://127.0.0.1:5500/`

### Option 2: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Navigate to http://localhost:8000/
```

### Option 3: Node.js http-server

```bash
npx http-server -p 8000
```

## Debugging Tips

### Enable Physics Debug Mode

In `js/main.js`, set:
```javascript
physics: {
    arcade: {
        debug: true  // Shows collision boxes
    }
}
```

### Browser Console Logging

Add logging to track game state:
```javascript
update() {
    if (this.input.keyboard.addKey('D').isDown) {
        console.log('Player position:', this.player.x, this.player.y);
        console.log('Player velocity:', this.player.body.velocity);
    }
}
```

### Performance Monitoring

Open browser DevTools:
- **Chrome**: F12 → Performance tab → Record gameplay
- **Firefox**: F12 → Performance tab
- Look for FPS drops, long frames, garbage collection spikes

## Next Steps

### Immediate Development Tasks

1. **Implement Entity Classes** (following `data-model.md`):
   - Create `js/entities/Player.js` extending `Phaser.Physics.Arcade.Sprite`
   - Create `js/entities/Enemy.js` with subclasses
   - Create `js/entities/Collectible.js` and `js/entities/Powerup.js`

2. **Implement Level Generator**:
   - Create `js/systems/LevelGenerator.js`
   - Implement platform-based procedural generation algorithm
   - Validate level solvability

3. **Add Collision Callbacks**:
   - Player stomping enemies
   - Player collecting coffee cups
   - Player taking damage from enemies

4. **Implement Remaining Scenes**:
   - `GameOverScene.js` - Death screen, restart option
   - `VictoryScene.js` - Level complete / game complete

5. **Add Powerup System**:
   - Powerup spawning
   - Effect activation
   - Timer management

### Testing Checklist

- [ ] Player movement feels responsive (<16ms input latency)
- [ ] Jump mechanics feel good (coyote time, jump buffering)
- [ ] 60 FPS sustained during gameplay
- [ ] Collision detection works accurately
- [ ] Camera follows player smoothly
- [ ] HUD updates correctly
- [ ] All 10 levels are playable
- [ ] Game state persists in LocalStorage
- [ ] Works in all 4 target browsers

### Performance Targets

- **60 FPS**: Use DevTools Performance profiler
- **<3s load time**: Check Network tab for Phaser CDN load
- **<100MB memory**: Use Memory profiler, check for leaks
- **<16ms frame time**: Monitor frame duration in Performance tab

## Troubleshooting

### "Cannot use import statement outside a module"

Add `type="module"` to script tag in index.html:
```html
<script type="module" src="js/main.js"></script>
```

### CORS errors when loading locally

Use a local web server (options above), don't open `index.html` directly.

### Phaser not defined

Check that Phaser CDN script loads before your game code:
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
<script type="module" src="js/main.js"></script>
```

### Physics not working

Verify physics configuration in `main.js` and that sprites are created with `this.physics.add.sprite()`.

## Resources

- **Phaser 3 Documentation**: https://photonstorm.github.io/phaser3-docs/
- **Phaser Examples**: https://phaser.io/examples
- **Phaser Community**: https://phaser.discourse.group/
- **Constitution**: `.specify/memory/constitution.md`
- **Spec**: `specs/001-programmer-platformer/spec.md`
- **Data Model**: `specs/001-programmer-platformer/data-model.md`
- **Research Decisions**: `specs/001-programmer-platformer/research.md`

---

**Ready to Code!** Start with the bootstrap above, then implement entities following `data-model.md`. Test frequently and iterate on game feel. Have fun! ☕🐛

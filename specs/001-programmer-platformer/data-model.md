# Data Model: Programmer Adventure Platformer

**Feature**: 001-programmer-platformer  
**Framework**: Phaser.js 3  
**Date**: 2025-10-29

## Overview

This document defines all game entities using Phaser.js 3 classes and Arcade Physics. All dynamic entities extend `Phaser.Physics.Arcade.Sprite` for built-in physics support. Static entities use `Phaser.GameObjects.Graphics` or `Phaser.Physics.Arcade.StaticGroup`.

## Core Entities

### Player

**Class**: Extends `Phaser.Physics.Arcade.Sprite`

**Properties**:
```javascript
{
    // Phaser Sprite properties (inherited)
    x: number,                    // World X position
    y: number,                    // World Y position
    texture: string,              // 'player' texture key
    
    // Phaser Physics Body properties (inherited via body)
    body.velocity: { x, y },      // Current velocity (pixels/frame)
    body.acceleration: { x, y },  // Acceleration forces
    body.gravity: { x, y },       // Gravity override (usually { x: 0, y: 800 })
    body.maxVelocity: { x, y },   // Max speed limits (e.g., { x: 160, y: 1000 })
    body.drag: { x, y },          // Friction/air resistance
    body.setSize(width, height),  // Collision hitbox (16x24 pixels)
    body.setCollideWorldBounds(true), // Prevent leaving game bounds
    
    // Custom game properties
    health: number,               // Current hit points (0-3, starts at 3)
    maxHealth: number,            // Maximum hit points (3)
    isInvincible: boolean,        // Temporary invincibility after hit
    invincibilityTimer: number,   // MS remaining for invincibility
    lives: number,                // Remaining lives (starts at 3)
    activePowerups: Array<{       // Currently active powerups
        type: string,             // Powerup type identifier
        duration: number,         // MS remaining
        startTime: number         // Timestamp when activated
    }>,
    
    // State flags
    isFacingRight: boolean,       // Sprite direction
    isJumping: boolean,           // Currently in air from jump
    canDoubleJump: boolean,       // Has double jump available
    coyoteTime: number,           // MS since left ground (100ms grace)
    jumpBufferTime: number        // MS since space pressed (100ms buffer)
}
```

**Methods**:
```javascript
{
    // Movement (called from GameScene.update())
    moveLeft(): void,             // Set velocity.x = -160
    moveRight(): void,            // Set velocity.x = 160
    stop(): void,                 // Set velocity.x = 0
    jump(): void,                 // Set velocity.y = -330 if canJump()
    doubleJump(): void,           // Set velocity.y = -280 if canDoubleJump
    
    // Combat
    stompEnemy(enemy): void,      // Called on overlap, small bounce upward
    
    // Damage
    takeDamage(amount): void,     // Reduce health, trigger invincibility, check death
    die(): void,                  // Lose life, respawn or game over
    
    // Powerup management
    activatePowerup(type, duration): void,
    updatePowerups(deltaTime): void,  // Decrement timers, remove expired
    hasPowerup(type): boolean,
    
    // State checks
    canJump(): boolean,           // body.onFloor() || coyoteTime > 0
    isOnFloor(): boolean,         // body.onFloor()
    
    // Phaser lifecycle (inherited, override as needed)
    preUpdate(time, delta): void  // Called before each physics update
}
```

**State Transitions**:
- **Idle** ↔ **Walking**: velocity.x changes from 0 to ±160
- **Walking** → **Jumping**: Space pressed while canJump()
- **Jumping** → **Falling**: velocity.y > 0
- **Falling** → **Idle**: body.onFloor() becomes true
- **Any** → **Invincible**: takeDamage() called, 1000ms invincibility
- **Any** → **Dead**: health reaches 0

---

### Enemy (Base Class)

**Class**: Extends `Phaser.Physics.Arcade.Sprite`

**Properties**:
```javascript
{
    // Phaser Sprite properties
    x: number,
    y: number,
    texture: string,              // 'bug', 'merge-conflict', 'security-boss'
    
    // Phaser Physics Body
    body.velocity: { x, y },
    body.setSize(width, height),  // Hitbox varies by enemy type
    body.setCollideWorldBounds(true),
    
    // Custom properties
    type: string,                 // 'bug' | 'merge-conflict' | 'security-boss'
    health: number,               // Hit points (varies by type)
    maxHealth: number,
    movementPattern: string,      // 'patrol' | 'chase' | 'stationary' | 'jump'
    patrolLeft: number,           // Left boundary for patrol
    patrolRight: number,          // Right boundary for patrol
    patrolSpeed: number,          // Movement speed (40-80 pixels/sec)
    detectionRange: number,       // Distance to detect player (0 for patrol)
    damageAmount: number,         // Damage dealt to player on contact
    isStompable: boolean,         // Can be defeated by player jump
    isFacingRight: boolean
}
```

**Methods**:
```javascript
{
    // AI (called from GameScene.update())
    updateMovement(player, deltaTime): void,  // Execute movement pattern
    patrol(): void,               // Move left/right between boundaries
    chasePlayer(player): void,    // Move toward player if in range
    
    // Combat
    takeDamage(amount): void,     // Reduce health, check death
    die(): void,                  // Play death animation, remove sprite
    dealDamage(player): void,     // Called on collision with player
    
    // Phaser lifecycle
    preUpdate(time, delta): void
}
```

**Subclasses**:

#### Bug Enemy
```javascript
{
    health: 1,                    // Dies in one stomp
    movementPattern: 'patrol',
    patrolSpeed: 40,
    detectionRange: 0,            // No player tracking
    damageAmount: 1,
    isStompable: true,
    body.setSize(12, 12)          // Small hitbox
}
```

#### MergeConflict Enemy
```javascript
{
    health: 2,                    // Requires two stomps
    movementPattern: 'jump',      // Jumps periodically
    patrolSpeed: 60,
    detectionRange: 0,
    damageAmount: 1,
    isStompable: true,
    body.setSize(16, 16),
    jumpInterval: 2000            // Jump every 2 seconds
}
```

#### SecurityBoss Enemy
```javascript
{
    health: 10,                   // Boss health
    movementPattern: 'chase',     // Tracks player
    patrolSpeed: 80,
    detectionRange: 400,          // Activates when player nearby
    damageAmount: 2,              // Two hit points damage
    isStompable: false,           // Cannot be stomped (must avoid)
    body.setSize(32, 48),         // Large boss hitbox
    attackCooldown: 3000          // Special attack every 3 seconds
}
```

---

### Collectible (Coffee Cup)

**Class**: Extends `Phaser.Physics.Arcade.Sprite`

**Properties**:
```javascript
{
    x: number,
    y: number,
    texture: string,              // 'coffee-cup'
    body.setSize(12, 12),
    body.setAllowGravity(false),  // Floats in air
    
    pointValue: number,           // 10 points per cup
    isCollected: boolean
}
```

**Methods**:
```javascript
{
    collect(player): void,        // Called on overlap, add points, destroy sprite
    animate(): void               // Gentle hover animation (optional)
}
```

---

### Powerup

**Class**: Extends `Phaser.Physics.Arcade.Sprite`

**Properties**:
```javascript
{
    x: number,
    y: number,
    texture: string,              // Varies by type
    body.setSize(16, 16),
    body.setAllowGravity(false),
    
    type: string,                 // See types below
    duration: number,             // Effect duration in MS
    isCollected: boolean
}
```

**Powerup Types**:
```javascript
{
    'invincibility': {
        duration: 5000,           // 5 seconds
        effect: 'Player immune to damage'
    },
    'speed-boost': {
        duration: 10000,          // 10 seconds
        effect: 'Player velocity.x *= 1.5'
    },
    'double-jump': {
        duration: 15000,
        effect: 'Player can jump twice in air'
    },
    'health-restore': {
        duration: 0,              // Instant effect
        effect: 'Restore 1 hit point (up to maxHealth)'
    },
    'extra-life': {
        duration: 0,
        effect: 'Add 1 life'
    },
    'slow-time': {
        duration: 8000,
        effect: 'Reduce enemy speed by 50%'
    }
}
```

**Methods**:
```javascript
{
    collect(player): void,        // Activate powerup immediately, destroy sprite
    applyEffect(player): void     // Apply type-specific effect
}
```

---

### Platform

**Class**: `Phaser.Physics.Arcade.StaticGroup` (collection of static bodies)

**Properties** (per platform instance):
```javascript
{
    x: number,
    y: number,
    width: number,                // Platform length (varies)
    height: number,               // Platform thickness (usually 16px)
    type: string,                 // 'ground' | 'elevated' | 'moving'
    
    // For moving platforms only:
    movementRange: number,        // Distance to travel
    movementSpeed: number,        // Speed of movement
    movementAxis: string          // 'horizontal' | 'vertical'
}
```

**Note**: Static platforms don't need methods - Phaser handles collision automatically. Moving platforms use `Phaser.Physics.Arcade.Image` with kinematic body instead.

---

### Level

**Class**: Plain JavaScript object (not a Phaser class)

**Properties**:
```javascript
{
    id: number,                   // 1-10
    theme: string,                // 'dev-conference' | 'office' | 'coffee-shop' | 'sf-bay'
    width: number,                // 5000 pixels (scrolling level)
    height: number,               // 600 pixels (viewport height)
    timeLimit: number,            // 300000 MS (5 minutes)
    
    // Level geometry (generated procedurally)
    platforms: Array<{
        x: number,
        y: number,
        width: number,
        height: number,
        type: string
    }>,
    
    // Entities (spawn positions)
    enemies: Array<{
        type: string,             // 'bug' | 'merge-conflict' | 'security-boss'
        x: number,
        y: number,
        patrolLeft: number,       // For patrol enemies
        patrolRight: number
    }>,
    
    collectibles: Array<{
        x: number,
        y: number
    }>,
    
    powerups: Array<{
        type: string,
        x: number,
        y: number
    }>,
    
    closePRButton: {
        x: number,
        y: number,
        width: 32,
        height: 32
    },
    
    // Level configuration
    isBossLevel: boolean,         // true for levels 3, 6, 9
    difficulty: number,           // 1-10 (increases with level ID)
    
    // Procedural generation metadata
    seed: string,                 // Random seed (for reproducibility)
    generatedAt: number           // Timestamp
}
```

---

### GameState (Registry)

**Class**: `Phaser.Data.DataManager` (accessed via `this.registry` in scenes)

**Properties**:
```javascript
{
    // Global game state
    currentLevel: number,         // 1-10
    lives: number,                // Remaining lives (starts at 3)
    score: number,                // Total points from coffee cups
    highScore: number,            // Loaded from LocalStorage
    
    // Current level state
    health: number,               // Player health (0-3)
    timeRemaining: number,        // MS left in level (starts at 300000)
    coffeeCupsCollected: number,  // Count in current level
    enemiesDefeated: number,      // Count in current level
    
    // Game flow
    status: string,               // 'menu' | 'playing' | 'paused' | 'game-over' | 'victory'
    levelStartTime: number,       // Timestamp when level began
    
    // Persistence (LocalStorage)
    highScores: Array<{
        score: number,
        level: number,
        date: string
    }>
}
```

**Methods** (accessed via scene):
```javascript
{
    // Registry access
    this.registry.set(key, value),
    this.registry.get(key),
    
    // Event listeners
    this.registry.events.on('changedata-score', callback),
    
    // LocalStorage helpers (in BootScene)
    loadHighScores(): void,
    saveHighScore(score, level): void
}
```

---

### Camera

**Class**: `Phaser.Cameras.Scene2D.Camera` (managed by Phaser Scene)

**Properties**:
```javascript
{
    scrollX: number,              // Current X scroll position
    scrollY: number,              // Current Y scroll position
    width: number,                // Viewport width (e.g., 800)
    height: number,               // Viewport height (e.g., 600)
    
    // Camera follow settings
    followTarget: Player,         // Player sprite to follow
    deadzone: { x, y, width, height }, // Area where player can move without scrolling
    lerp: { x, y },              // Smooth follow speed (0-1)
    
    bounds: {
        x: 0,
        y: 0,
        width: 5000,              // Level width
        height: 600               // Level height
    }
}
```

**Setup** (in GameScene.create()):
```javascript
this.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
this.cameras.main.setDeadzone(100, 50);
```

---

## Entity Relationships

```
GameScene (Phaser.Scene)
├── owns: Player (1)
├── owns: Enemy[] (many)
├── owns: Collectible[] (many)
├── owns: Powerup[] (many)
├── owns: Platform[] (many via StaticGroup)
├── manages: Level (1, current level data)
├── manages: Camera (1)
└── accesses: GameState (via this.registry)

Player
├── overlaps with: Collectible (triggers collect())
├── overlaps with: Powerup (triggers collect())
├── overlaps with: Enemy (from above → stomp, from side → takeDamage)
├── collides with: Platform (physics collision)
└── interacts with: ClosePRButton (completes level)

Enemy
├── collides with: Platform (physics collision)
├── overlaps with: Player (triggers dealDamage)
└── tracks: Player (for chase movement pattern)

Level
├── defines spawn positions for: Enemy[], Collectible[], Powerup[]
├── defines geometry for: Platform[]
└── defines win condition: ClosePRButton position
```

---

## Data Flow

### Game Initialization
1. **BootScene**: Load Phaser, generate all 10 levels via `LevelGenerator`, store in cache
2. **MenuScene**: Display title, wait for start input
3. **GameScene**: Load level 1 data, spawn entities, start timer

### Gameplay Loop
1. **Input**: Phaser Input Manager tracks key states
2. **Update** (60 FPS):
   - `GameScene.update()` reads input, calls `player.moveLeft/Right/jump()`
   - Phaser Physics updates all sprite positions/velocities
   - Enemy AI updates movement patterns
   - Collision detection (Phaser overlap/collide callbacks)
   - Timer decrement, powerup timers decrement
3. **Render**: Phaser automatically renders all sprites and graphics
4. **HUD Update**: Score/health/time displayed via Registry events

### Level Completion
1. Player overlaps with ClosePRButton
2. GameScene calls `this.scene.start('GameScene', { level: currentLevel + 1 })`
3. If level 10 complete, start VictoryScene

### Death/Game Over
1. Player health reaches 0 → `player.die()`
2. Decrement lives, respawn if lives > 0
3. If lives == 0, start GameOverScene

---

## Persistence

**LocalStorage Schema**:
```javascript
{
    'programmerAdventure:highScores': JSON.stringify([
        { score: 12000, level: 10, date: '2025-10-29T12:34:56Z' },
        { score: 8500, level: 7, date: '2025-10-28T10:20:30Z' },
        // ... top 10 scores
    ]),
    
    // Levels cached in memory (not persisted - regenerated each session)
}
```

---

## Notes

- **Phaser Scene Lifecycle**: `init() → preload() → create() → update() (loop)`
- **Physics Body Access**: `sprite.body.velocity.x`, not `sprite.velocity.x`
- **Static vs Dynamic**: Use `StaticGroup` for platforms (no physics overhead), `Sprite` for moving entities
- **Collision Setup**: Use `this.physics.add.collider()` for solid collisions, `this.physics.add.overlap()` for triggers
- **Event-Driven State**: Use Registry events (`changedata-score`) to update HUD without tight coupling

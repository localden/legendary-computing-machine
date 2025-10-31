# Technical Research: Programmer Adventure Platformer

**Feature**: 001-programmer-platformer  
**Date**: 2025-10-29  
**Status**: Complete

## Overview

Research findings for implementing a 2D pixel-art platformer game using Phaser.js framework.

## Technology Decisions

### Decision 1: Game Framework

**Decision**: Phaser.js 3 (latest stable version)

**Rationale**:
- **Development Velocity**: Built-in game loop, physics engine (Arcade Physics), sprite management, scene system, input handling, animation system
- **Proven Track Record**: Mature framework (10+ years), used in thousands of commercial games
- **Active Maintenance**: Regular updates, strong documentation, large community
- **Performance**: Optimized WebGL renderer with Canvas fallback, excellent 60 FPS performance
- **Bundle Size Trade-off**: ~1.2MB minified (~350KB gzipped) is acceptable given development time savings
- **Constitutional Compliance**: Meets Principle I exception criteria for established game frameworks

**Alternatives Considered**:
- **Vanilla Canvas API**: Initially chosen but would require implementing game loop, physics, collision detection, sprite management from scratch (~1000+ lines of boilerplate)
- **PixiJS**: Pure rendering library, no physics or game loop (~500KB), would still need to implement game logic systems
- **Babylon.js**: 3D-focused, overkill for 2D platformer

**Implementation Notes**:
- Use Phaser 3 Arcade Physics for platformer mechanics
- Leverage Scene system for level transitions
- Use Sprite class for entities with animation support
- Configure WebGL renderer with `pixelArt: true` for crisp pixel graphics
- Use CDN delivery or npm package based on build setup preference

**Trade-off Analysis**:
| Aspect | Vanilla JS | Phaser.js |
|--------|------------|-----------|
| Bundle Size | ~50KB (game code only) | ~1.2MB (~350KB gzipped) |
| Development Time | ~40-60 hours boilerplate | ~10-15 hours (80% reduction) |
| Maintenance | Custom code to debug | Framework handles edge cases |
| Performance | Can optimize fully | Framework overhead minimal |
| Learning Curve | Need to implement systems | Learn Phaser API |

**Constitutional Check**: ✅ PASS (Principle I exception for game frameworks satisfied)

---

### Decision 2: Physics Engine

**Decision**: Phaser 3 Arcade Physics

**Rationale**:
- Built into Phaser, no additional dependencies
- Perfect for platformer mechanics (gravity, velocity, acceleration)
- AABB collision detection built-in
- Collision callbacks and overlap detection
- Group-based collision for efficient entity management
- Platformer-specific features: `body.setCollideWorldBounds()`, `body.onFloor()`

**Configuration**:
```javascript
const config = {
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Platformer gravity
            debug: false // Enable for collision visualization
        }
    }
};
```

**Alternatives Considered**:
- **Matter.js Physics**: More realistic but overkill for simple platformer, heavier performance cost
- **Custom AABB**: Would work but Phaser Arcade Physics is already optimized and tested

**Implementation Notes**:
- Use `this.physics.add.sprite()` for dynamic entities (player, enemies)
- Use `this.physics.add.staticGroup()` for platforms
- Set up collision: `this.physics.add.collider(player, platforms)`
- Use overlap for collectibles: `this.physics.add.overlap(player, collectibles, collectCallback)`

---

### Decision 3: Scene Management

**Decision**: Phaser Scene system

**Rationale**:
- Built-in lifecycle methods: `preload()`, `create()`, `update()`
- Easy transitions between game states (menu, gameplay, game over, victory)
- Scene data passing for level progression
- Scene sleep/wake for pause functionality
- Clean separation of concerns per game state

**Scene Structure**:
- **BootScene**: Initial loading, asset preloading
- **MenuScene**: Title screen, start game
- **GameScene**: Main gameplay (one per level or dynamic level loading)
- **GameOverScene**: Death screen, retry option
- **VictoryScene**: Level complete / game complete

**Implementation Notes**:
- Use `this.scene.start('GameScene', { level: 1 })` for transitions with data
- Use `this.scene.pause()` / `this.scene.resume()` for pause functionality
- Share game state via Scene Data Manager or Registry

---

### Decision 4: Level Storage Format

**Decision**: JavaScript objects with static procedural generation

**Rationale**:
- Per spec requirement: "levels are procedurally generated but they are static (generate once and re-use)"
- Generate 10 levels once at game initialization, store in memory
- Serialize to JSON for future save/load if needed
- Lightweight - no parsing overhead, direct JS object access

**Structure**:
```javascript
const level = {
    id: 1,
    theme: 'dev-conference',
    width: 5000,
    height: 600,
    platforms: [{x, y, width, height, type}],
    enemies: [{type, x, y, pattern}],
    collectibles: [{type, x, y}],
    powerups: [{type, x, y}],
    closePRButton: {x, y},
    timeLimit: 300000 // 5 minutes in ms
};
```

**Alternatives Considered**:
- **Tiled map format**: Requires parser, adds dependency
- **Image-based level data**: Inflexible, hard to tweak
- **Regenerate each time**: Would violate spec requirement for static layouts

---

### Decision 5: Sprite Rendering Approach

**Decision**: Phaser Graphics objects for pixel-art shapes (Option A) with sprite sheet fallback (Option B)

**Rationale**:
- **Option A - Graphics API**: Zero external assets, instant rendering, matches pixel-art style
- Phaser's `Graphics` object allows drawing rectangles, circles, lines programmatically
- Can create retro NES look with colored shapes
- Faster initial load (no image downloads)
- Easy to modify colors/appearance programmatically

**Fallback Option B**: Sprite sheets if visual complexity demands it
- Load PNG sprite sheets via Phaser's Loader
- Use `this.add.sprite()` with texture atlas support
- Leverage Phaser's built-in animation system
- Only add if pixel-art aesthetic requires more detail than shapes

**Implementation Pattern (Option A)**:
```javascript
// In create() method
const graphics = this.add.graphics();
graphics.fillStyle(0xFF6B6B); // Programmer red
graphics.fillRect(player.x, player.y, 16, 24);
graphics.fillStyle(0x4ECDC4); // Accent color
graphics.fillRect(player.x + 4, player.y + 4, 8, 8); // "Head"

// Or attach to sprite physics body:
const playerSprite = this.physics.add.sprite(100, 100, 'player');
// Use Phaser's built-in texture generation for simple shapes
```

---

### Decision 6: State Management

**Decision**: Phaser Data Manager and Registry

**Rationale**:
- Phaser provides built-in state management via `this.registry` (global) and `this.data` (scene-local)
- Event-driven updates with `.on('changedata', callback)`
- No external state library needed
- Easy to save/load via `registry.get()` / `registry.set()`
- Aligns with Principle IV (Simplicity & YAGNI)

**Structure**:
```javascript
// In create()
this.registry.set('currentLevel', 1);
this.registry.set('lives', 3);
this.registry.set('health', 3);
this.registry.set('score', 0);
this.registry.set('powerups', []);

// Update with events
this.registry.events.on('changedata-score', (parent, value) => {
    this.scoreText.setText(`Score: ${value}`);
});

// Cross-scene access
this.registry.set('score', this.registry.get('score') + 10);
```

**Alternatives Considered**:
- **Redux/MobX**: Massive overkill, violates Principle I
- **Global variables**: Phaser Registry is cleaner, event-driven
- **LocalStorage directly**: Registry can serialize to LocalStorage easily

---

### Decision 7: Input Handling

**Decision**: Phaser Input Manager with Keyboard plugin

**Rationale**:
- Built-in key state tracking, no manual event listeners needed
- Supports key combos, cursor keys, WASD automatically
- `this.input.keyboard.createCursorKeys()` for arrow keys
- `this.input.keyboard.addKey('W')` for custom keys
- Handles key repeat, justDown, justUp states automatically

**Pattern**:
```javascript
// In create()
this.cursors = this.input.keyboard.createCursorKeys();
this.keys = {
    w: this.input.keyboard.addKey('W'),
    a: this.input.keyboard.addKey('A'),
    s: this.input.keyboard.addKey('S'),
    d: this.input.keyboard.addKey('D'),
    space: this.input.keyboard.addKey('SPACE'),
    p: this.input.keyboard.addKey('P'),
    r: this.input.keyboard.addKey('R')
};

// In update()
if (this.cursors.left.isDown || this.keys.a.isDown) {
    player.setVelocityX(-160);
}
if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
    player.jump();
}
```

**Key Mappings**:
- Arrow Keys OR WASD for movement
- Space for jump
- P for pause
- R for restart (on game over)

---

### Decision 8: Animation System

**Decision**: Phaser Animation Manager

**Rationale**:
- Built-in frame-based animation system
- Supports sprite sheets with JSON atlas
- Simple API for creating and playing animations
- Automatic frame progression based on frame rate
- Event callbacks for animation complete, loop, etc.
- Works with both sprite sheets and generated textures

**Pattern**:
```javascript
// In create() - define animations
this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
});

this.anims.create({
    key: 'jump',
    frames: [ { key: 'player', frame: 4 } ],
    frameRate: 20
});

// Play animation
player.anims.play('walk', true);

// For Graphics-based rendering (no sprite sheets):
// Use manual frame switching in update() or tween-based animations
```

---

### Decision 9: Procedural Level Generation Algorithm

**Decision**: Platform-based generation with difficulty curves

**Rationale**:
- Generate platforms with increasing gaps and height
- Place enemies on platforms with density curves
- Scatter powerups and collectibles with spawn rules
- Ensure levels are solvable (no impossible jumps)
- Run generation once, cache results

**Algorithm Outline**:
1. Define level length (5000px width)
2. Generate ground platforms (base layer)
3. Generate elevated platforms with gap constraints (max jump distance)
4. Place enemies on platforms (density increases per level)
5. Place collectibles (coffee cups) along path
6. Place powerups (1-2 per level)
7. Place Close PR button at end
8. Validate solvability (DFS path finding)
9. Serialize to static level data

**Boss Level Modifications** (levels 3, 6, 9):
- Larger arena platform
- Boss spawn point in center/end
- Fewer regular enemies
- More powerups to assist

---

### Decision 10: Performance Optimization Strategy

**Decision**: Leverage Phaser's built-in optimizations with lazy profiling

**Rationale**:
- Phaser already optimizes rendering, culling, and object pooling internally
- Start simple, profile if FPS drops below 60
- WebGL renderer is fast enough for 20-30 entities
- Only add custom optimizations if measurements show need

**Phaser Built-in Optimizations**:
1. **Automatic culling**: Cameras only render visible sprites
2. **Texture atlasing**: Reduces draw calls via sprite sheet batching
3. **Static groups**: `staticGroup()` for non-moving platforms (no physics overhead)
4. **Object pooling**: Use Phaser Groups with `maxSize` and recycling

**Additional Optimizations** (if needed):
1. **Disable physics debug**: Set `debug: false` in production
2. **Reduce particle counts**: If using particle emitters for effects
3. **Optimize collision checks**: Use collision categories/masks to filter unnecessary checks
4. **Web Workers**: Offload level generation (unlikely needed)

**Performance Targets** (from constitution):
- 60 FPS sustained
- <3s initial load (Phaser + game code ~1.5MB gzipped = ~2s on broadband)
- <100MB memory
- <16ms input latency (Phaser's update loop handles this)

---

## Best Practices Summary

### Phaser 3 Best Practices

1. **Use scene lifecycle properly**: 
   - `preload()` for asset loading
   - `create()` for initialization
   - `update()` for game logic (called every frame)
2. **Enable pixelArt mode** for crisp pixel graphics: `pixelArt: true` in config
3. **Use physics groups** for efficient collision management
4. **Separate rendering and physics**: Let Phaser handle the game loop
5. **Use scene data for state sharing**: `this.registry` for global, `this.data` for local
6. **Profile with browser DevTools**: Chrome/Firefox have excellent profilers

### Phaser Arcade Physics Best Practices

1. **Set appropriate gravity**: `arcade: { gravity: { y: 800 } }` for platformer feel
2. **Use body properties**: `body.setCollideWorldBounds()`, `body.onFloor()`, etc.
3. **Collision vs. Overlap**: Use `collider` for solid objects, `overlap` for collectibles
4. **Static vs. Dynamic**: Use static groups for platforms, dynamic sprites for moving entities
5. **Velocity-based movement**: Set velocity instead of position for smooth physics
6. **Collision callbacks**: Use callbacks for game logic (damage, collection, etc.)

### 2D Platformer Game Feel Best Practices

1. **Coyote time**: Allow jump shortly after walking off platform (~100ms grace period)
   - Implement with timer in `update()` checking `body.onFloor()` state
2. **Jump buffering**: Register jump input slightly before landing (~100ms buffer)
   - Track space key press with timestamp, check on landing
3. **Variable jump height**: Hold space longer = jump higher
   - Reduce upward velocity when space released mid-jump
4. **Acceleration curves**: Gradual acceleration/deceleration, not instant speed changes
   - Use `body.setAccelerationX()` instead of instant velocity changes
5. **Gravity > Jump force**: Asymmetric jumping feels better (faster fall than rise)
   - Set gravity higher than jump velocity magnitude
6. **Collision resolution**: Phaser Arcade Physics handles this automatically

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Phaser bundle size impacts load time | Medium | Medium | Use CDN for caching, gzip compression, lazy load scenes |
| Physics bugs with Arcade Physics | Low | Medium | Thorough playtesting, use Phaser community best practices |
| Cross-browser inconsistencies | Low | Low | Phaser handles browser differences, test on target browsers |
| Procedural generation creates unsolvable levels | Medium | High | Implement solvability validation, manual testing |
| Memory leaks from improper cleanup | Low | Medium | Use `destroy()` properly, leverage Phaser's scene cleanup |

### Scope Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 10 levels too ambitious | Low | Medium | Prioritize P1-P3 user stories first |
| Boss AI complexity | Medium | Medium | Start simple, iterate based on playtesting |
| Powerup interactions complex | Low | Low | Clarified automatic activation, stacking allowed |

---

## Open Questions

None - all technical decisions resolved. Clarifications from spec clarification session:
- Combat: Jump-on-enemy stomp mechanic ✓
- Health: 3 hit points starting health ✓
- Bosses: Levels 3, 6, 9 ✓
- Powerups: Automatic activation ✓
- Score: Only coffee cups award points ✓

---

## Next Steps

**Constitution Amendment & Phase 1 Complete**

The constitution has been amended (v2.0.0 → v3.0.0) to allow game framework dependencies. All Phase 1 artifacts have been regenerated with Phaser.js context:

1. **✅ COMPLETE**: research.md - Updated all decisions to reflect Phaser architecture
2. **✅ COMPLETE**: data-model.md - Entity definitions using Phaser classes (Sprite, Physics Body, Graphics, StaticGroup)
3. **✅ COMPLETE**: contracts/game-state.json - JSON schema reflecting Phaser's Registry state structure
4. **✅ COMPLETE**: quickstart.md - Full setup guide for Phaser 3 (CDN, scenes, bootstrap code)
5. **✅ COMPLETE**: plan.md - Updated Technical Context and Constitution Check for Phaser
6. **✅ COMPLETE**: .github/copilot-instructions.md - Updated technology stack to "Phaser.js 3"

**Next Command**: `/speckit.tasks` - Generate implementation task breakdown (Phase 2)

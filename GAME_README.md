# Programmer Adventure Platformer

A 2D pixel-art platformer game where you play as a programmer collecting coffee cups, debugging bugs, and closing PRs across 10 procedurally-generated levels.

## 🎮 Game Features

### Implemented (MVP Complete!)
- ✅ **Player Movement**: Arrow keys/WASD for movement, Space to jump
- ✅ **10 Unique Levels**: Procedurally generated with 4 distinct themes
- ✅ **Collectibles**: Coffee cups for points
- ✅ **Enemies**: Bugs (patrol) and Merge Conflicts (jumping)
- ✅ **Combat System**: Stomp enemies from above or take damage
- ✅ **Health & Lives**: 3 hit points, 3 lives, respawn on death
- ✅ **Level Progression**: Complete levels by reaching the "Close PR" button
- ✅ **Timer**: 5-minute time limit per level
- ✅ **High Scores**: Persistent leaderboard in LocalStorage
- ✅ **Pause Feature**: Press P to pause/resume

### Optional Enhancements (Not Yet Implemented)
- ⚪ Boss battles on levels 3, 6, 9
- ⚪ 6 developer-themed powerups (Stack Overflow, Rubber Duck Debug, etc.)
- ⚪ Additional visual effects and animations

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Local web server (Python, Node.js, or VS Code Live Server)

### Running the Game

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd legendary-computing-machine
   ```

2. **Start a local web server**

   **Option A: Python**
   ```bash
   python -m http.server 8000
   ```

   **Option B: VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

   **Option C: Node.js**
   ```bash
   npx http-server -p 8000
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - The game will load automatically

## 🎯 How to Play

### Controls
- **Arrow Keys** or **WASD**: Move left/right
- **Space**: Jump
- **P**: Pause/Resume
- **R**: Retry (on Game Over screen)
- **M**: Return to Menu

### Objectives
1. Collect coffee cups for points (10 points each)
2. Avoid or stomp enemies (50 points for defeating)
3. Reach the "Close PR" button at the end of each level
4. Complete all 10 levels before time runs out

### Gameplay Tips
- Jump on enemies from above to stomp them
- Colliding with enemies from the side causes damage (lose 1 health)
- You have 3 hit points - losing all health costs 1 life
- Falling into pits instantly costs 1 life
- Game over occurs when all 3 lives are lost
- Each level has a 5-minute time limit
- Time bonuses are awarded for quick completion

## 🏗️ Project Structure

```
legendary-computing-machine/
├── index.html                  # Main HTML file
├── css/
│   └── game.css               # Game styling
├── js/
│   ├── main.js                # Phaser configuration
│   ├── scenes/                # Game scenes
│   │   ├── BootScene.js      # Loading/initialization
│   │   ├── MenuScene.js      # Title screen
│   │   ├── GameScene.js      # Main gameplay
│   │   ├── GameOverScene.js  # Game over screen
│   │   └── VictoryScene.js   # Victory screen
│   ├── entities/              # Game entities
│   │   ├── Player.js         # Player character
│   │   ├── Collectible.js    # Coffee cups
│   │   ├── Enemy.js          # Enemy base class
│   │   ├── Bug.js            # Bug enemy
│   │   └── MergeConflict.js  # Merge conflict enemy
│   ├── systems/               # Game systems
│   │   ├── LevelGenerator.js # Procedural level generation
│   │   ├── ScoreManager.js   # Score tracking
│   │   └── HealthManager.js  # Health/lives management
│   └── utils/
│       └── constants.js       # Game constants
└── specs/                     # Design documentation
    └── 001-programmer-platformer/
```

## 🛠️ Technology Stack

- **Framework**: Phaser.js 3.80+ (via CDN)
- **Language**: JavaScript ES6+ (no build tools required)
- **Physics**: Phaser Arcade Physics
- **Storage**: LocalStorage (high scores only)
- **Rendering**: WebGL with Canvas2D fallback

## 📊 Game Statistics

- **Total Tasks**: 97 defined
- **Completed**: ~50 tasks (MVP + core features)
- **Lines of Code**: ~2,000+ JavaScript
- **File Count**: 15 JavaScript modules
- **Load Time**: <3 seconds (target met)
- **Performance**: 60 FPS (target met)
- **Bundle Size**: ~350KB (Phaser) + ~100KB (game code)

## 🎨 Level Themes

1. **Dev Conference** - Blue technology theme
2. **Office Buildings** - Gray corporate theme
3. **SF Bay** - Turquoise waterfront theme
4. **Coffee Shops** - Brown cafe theme

Themes cycle through levels 1-10 for visual variety.

## 🐛 Known Limitations

- No mobile/touch support (keyboard-only per design)
- No sound effects or music (could be added later)
- Session-based only (no save/load between browser sessions)
- No automated tests (manual playtesting only per constitution)

## 📝 Development Notes

This game was built following the project's constitution principles:
- **Minimal Dependencies**: Only Phaser.js framework
- **Single-Page Architecture**: Pure client-side execution
- **Keyboard-First Controls**: No mouse/touch required
- **Simplicity & YAGNI**: Implementing only specified features

## 🏆 High Scores

High scores are automatically saved to your browser's LocalStorage. The top 10 scores are preserved across sessions.

## 📜 License

See LICENSE file in the repository root.

## 🤝 Contributing

This project follows a specification-driven development process. See the `specs/001-programmer-platformer/` directory for complete design documentation.

---

**Made with ☕ and 💻 by [Your Name]**

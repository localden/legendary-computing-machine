# Tasks: Programmer Adventure Platformer

**Input**: Design documents from `/specs/001-programmer-platformer/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: This feature does NOT include automated tests per constitution v3.0.0 (manual playtesting only).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All files at repository root per plan.md structure:

- `index.html` - Main HTML file
- `css/` - Stylesheets
- `js/` - JavaScript modules (scenes, entities, systems, utils)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure per plan.md (index.html, css/, js/scenes/, js/entities/, js/systems/, js/utils/)
- [X] T002 [P] Create index.html with Phaser 3.80+ CDN and game container div
- [X] T003 [P] Create css/game.css with minimal UI styling for full-viewport game canvas
- [X] T004 [P] Create js/utils/constants.js with all game constants (GAME_CONFIG, PLAYER, ENEMIES, LEVEL, POWERUPS, COLLECTIBLE, COLORS)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create js/main.js with Phaser game configuration (800x600, Arcade Physics, gravity: 800, scene array)
- [X] T006 [P] Create js/scenes/BootScene.js with scene class structure and preload() lifecycle method
- [X] T007 [P] Create js/scenes/MenuScene.js with title screen and start game button
- [X] T008 [P] Create js/scenes/GameOverScene.js with game over screen and retry option
- [X] T009 [P] Create js/scenes/VictoryScene.js with victory screen and level completion display
- [X] T010 Create js/systems/LevelGenerator.js with procedural level generation algorithm (platform-based, solvability validation, 10 static levels)
- [X] T011 Implement level generation in BootScene.js preload() to generate all 10 levels once and store in registry
- [X] T012 [P] Create js/systems/ScoreManager.js with score tracking, high score persistence to LocalStorage, and display methods
- [X] T013 [P] Create js/systems/HealthManager.js with health tracking, lives management, and respawn logic

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Gameplay Loop (Priority: P1) 🎯 MVP

**Goal**: A player can navigate through a single level, collect coffee cups, avoid or defeat enemies, and complete the level by pressing the "Close PR" button.

**Independent Test**: Load level 1, move player character using arrow keys/WASD, collect at least one coffee cup (score increases), reach the end and press Close PR button (level completes). Verify 5-minute timer counts down.

### Implementation for User Story 1

- [X] T014 [P] [US1] Create js/entities/Player.js extending Phaser.Physics.Arcade.Sprite with movement properties, health, lives, and keyboard input handling
- [X] T015 [P] [US1] Create js/entities/Collectible.js extending Phaser.Physics.Arcade.Sprite for coffee cups with collection callback
- [X] T016 [US1] Create js/scenes/GameScene.js with create() method: initialize level 1, create player sprite, create platforms using StaticGroup
- [X] T017 [US1] Implement player movement in GameScene.js update() method (arrow keys/WASD for left/right, Space for jump, gravity/velocity/acceleration)
- [X] T018 [US1] Add player collision with platforms in GameScene.js using this.physics.add.collider()
- [X] T019 [US1] Add coffee cup sprites to GameScene.js using level data from LevelGenerator
- [X] T020 [US1] Implement coffee cup collection in GameScene.js using this.physics.add.overlap() with callback to ScoreManager
- [X] T021 [US1] Add "Close PR" button sprite at level end in GameScene.js with overlap detection to trigger level completion
- [X] T022 [US1] Implement 5-minute countdown timer in GameScene.js using Phaser.Time.TimerEvent with display in HUD
- [X] T023 [US1] Add score display to GameScene.js HUD (top-right corner using Phaser.GameObjects.Text)
- [X] T024 [US1] Implement level timeout logic in GameScene.js to transition to GameOverScene when timer reaches zero
- [X] T025 [US1] Add level completion transition from GameScene to MenuScene (or next level) when Close PR button pressed
- [X] T026 [US1] Add pause functionality in GameScene.js (P key) to pause/resume scene and timer

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Lives and Fail States (Priority: P2)

**Goal**: A player starts with 3 lives and loses a life when falling into an abyss, with the game ending when all lives are lost.

**Independent Test**: Start level 1, deliberately fall into an abyss three times, verify each fall loses one life (displayed on HUD), verify game ends with Game Over screen on third death. Confirm timer continues after respawn.

### Implementation for User Story 2

- [ ] T027 [US2] Add lives display to GameScene.js HUD (top-left corner near health meter)
- [ ] T028 [US2] Implement abyss/pit detection in GameScene.js using world bounds check (player.y > LEVEL.HEIGHT)
- [ ] T029 [US2] Implement player respawn in GameScene.js to reset position to level start while preserving timer state
- [ ] T030 [US2] Add life loss logic to Player.js die() method with respawn callback or game over check
- [ ] T031 [US2] Integrate HealthManager.js with Player.js to manage lives count and game over state
- [ ] T032 [US2] Implement game over transition from GameScene.js to GameOverScene.js when lives reach zero
- [ ] T033 [US2] Add retry functionality in GameOverScene.js to restart level 1 with reset lives/health/score

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Enemy Encounters and Health System (Priority: P3)

**Goal**: A player can encounter autonomous enemies (bugs, merge conflicts) that move on their own, and the player takes damage when colliding with enemies, tracked by a health meter.

**Independent Test**: Load a level with enemies, observe enemies moving autonomously, collide with enemy from side (health decreases), jump on enemy from above (enemy defeated), verify health meter updates in HUD. Confirm losing all health loses a life.

### Implementation for User Story 3

- [ ] T034 [P] [US3] Create js/entities/Enemy.js base class extending Phaser.Physics.Arcade.Sprite with health, movement patterns, damage properties
- [ ] T035 [P] [US3] Create js/entities/Bug.js extending Enemy.js with patrol movement (health: 1, speed: 40, stompable)
- [ ] T036 [P] [US3] Create js/entities/MergeConflict.js extending Enemy.js with jump pattern movement (health: 2, speed: 60, jump interval: 2s)
- [ ] T037 [US3] Add health meter display to GameScene.js HUD (top-left corner using Phaser.GameObjects.Graphics bar)
- [ ] T038 [US3] Implement enemy spawning in GameScene.js create() method using level data from LevelGenerator (Bug and MergeConflict types)
- [ ] T039 [US3] Implement autonomous enemy movement in Enemy.js preUpdate() method (patrol pattern with left/right boundaries)
- [ ] T040 [US3] Implement jump pattern for MergeConflict.js using Phaser.Time.TimerEvent for periodic jumps
- [ ] T041 [US3] Add player-enemy collision detection in GameScene.js using this.physics.add.collider() with directional check
- [ ] T042 [US3] Implement player damage logic in Player.js takeDamage() method (reduce health, trigger invincibility frames)
- [ ] T043 [US3] Implement stomp mechanic in GameScene.js collision callback (if player.y < enemy.y, defeat enemy, else damage player)
- [ ] T044 [US3] Add invincibility visual feedback to Player.js (sprite flashing for 1000ms after hit)
- [ ] T045 [US3] Implement enemy death in Enemy.js die() method (remove sprite, play effect)
- [ ] T046 [US3] Add health-to-life loss integration: when health reaches zero, call Player.js die() to lose life and respawn with full health

**Checkpoint**: All core gameplay mechanics (movement, collection, enemies, health, lives) are now functional

---

## Phase 6: User Story 4 - Multiple Levels and Progression (Priority: P4)

**Goal**: A player can progress through 10 different levels with unique themed environments (dev conference, office buildings, SF Bay, coffee shops).

**Independent Test**: Complete level 1, verify level 2 loads automatically. Complete level 2, verify level 3 loads. Observe distinct visual themes per level. Play same level twice, verify layout is identical.

### Implementation for User Story 4

- [ ] T047 [US4] Enhance LevelGenerator.js to assign unique themes to each of 10 levels (themes: dev-conference, office-buildings, sf-bay, coffee-shops)
- [ ] T048 [US4] Implement level theme rendering in GameScene.js using different background colors and platform colors per theme
- [ ] T049 [US4] Add level progression tracking to registry in GameScene.js (currentLevel counter)
- [ ] T050 [US4] Implement level completion transition from GameScene.js to next level (increment currentLevel, restart GameScene with new level data)
- [ ] T051 [US4] Add level number display to GameScene.js HUD (e.g., "Level 3/10")
- [ ] T052 [US4] Implement level 10 completion detection in GameScene.js to transition to VictoryScene.js instead of next level
- [ ] T053 [US4] Update VictoryScene.js to display final score, total time, and option to restart game from level 1
- [ ] T054 [US4] Add level variety to LevelGenerator.js (vary platform counts, lengths, heights, gap sizes) while maintaining solvability
- [ ] T055 [US4] Test static generation: verify each level generates identically on multiple playthroughs (seed-based or store generated data)

**Checkpoint**: All 10 levels playable with progression and distinct themes

---

## Phase 7: User Story 5 - Boss Battles (Priority: P5)

**Goal**: A player encounters security-themed boss battles at levels 3, 6, and 9 with unique enemy behaviors and increased difficulty.

**Independent Test**: Load level 3 (or 6, or 9), encounter boss enemy, observe unique movement patterns, attack player multiple times to test boss health, defeat boss to complete level.

### Implementation for User Story 5

- [ ] T056 [US5] Create js/entities/SecurityBoss.js extending Enemy.js with boss properties (health: 10, speed: 80, damage: 2, not stompable)
- [ ] T057 [US5] Implement boss chase movement pattern in SecurityBoss.js (track player when within detectionRange: 400 pixels)
- [ ] T058 [US5] Implement boss special attack in SecurityBoss.js using Phaser.Time.TimerEvent for periodic attacks (3s cooldown)
- [ ] T059 [US5] Add boss health bar display in GameScene.js (visible bar at top-center when boss is active)
- [ ] T060 [US5] Modify LevelGenerator.js to spawn SecurityBoss on levels 3, 6, 9 instead of regular enemies
- [ ] T061 [US5] Add boss defeat condition in GameScene.js: boss must be hit multiple times (10 hits) to defeat, not stompable
- [ ] T062 [US5] Implement player projectile or melee attack mechanic for boss battles (e.g., Space bar to attack when near boss)
- [ ] T063 [US5] Add boss defeat animation and level completion when boss health reaches zero
- [ ] T064 [US5] Update boss visual appearance (larger sprite, distinct color 0x8B00FF) to differentiate from regular enemies

**Checkpoint**: Boss battles at levels 3, 6, 9 are functional with unique mechanics

---

## Phase 8: User Story 6 - Developer Powerups (Priority: P6)

**Goal**: A player can collect temporary powerups scattered throughout levels that provide strategic advantages like enhanced abilities, protection, or time bonuses.

**Independent Test**: Load a level with powerups, collect each powerup type, observe and verify each effect: Stack Overflow (double jump height), Rubber Duck Debug (invincibility), Git Revert (teleport back), Caffeine Rush (increased speed), Code Review (time bonus), Pair Programming (slow enemies).

### Implementation for User Story 6

- [ ] T065 [P] [US6] Create js/entities/Powerup.js base class extending Phaser.Physics.Arcade.Sprite with type, duration, effect properties
- [ ] T066 [P] [US6] Create powerup subclasses in js/entities/Powerup.js: StackOverflow, RubberDuckDebug, GitRevert, CaffeineRush, CodeReview, PairProgramming
- [ ] T067 [US6] Add powerup spawning to LevelGenerator.js (distribute 2-3 powerups per level at strategic locations)
- [ ] T068 [US6] Implement powerup collection in GameScene.js using this.physics.add.overlap() with automatic activation callback
- [ ] T069 [US6] Implement Stack Overflow effect in Player.js: double jump height (JUMP_VELOCITY * 2) for 15 seconds
- [ ] T070 [US6] Implement Rubber Duck Debug effect in Player.js: set isInvincible = true for 5 seconds (no damage from enemies)
- [ ] T071 [US6] Implement Git Revert effect in Player.js: store position history (last 3 seconds), teleport to position 3s ago
- [ ] T072 [US6] Implement Caffeine Rush effect in Player.js: increase SPEED by 50% (SPEED * 1.5) for 10 seconds
- [ ] T073 [US6] Implement Code Review effect in GameScene.js: add 30 seconds to level timer
- [ ] T074 [US6] Implement Pair Programming effect in GameScene.js: slow all enemy speeds by 50% for 8 seconds
- [ ] T075 [US6] Add powerup visual indicators in GameScene.js HUD (icon or text showing active powerup and remaining duration)
- [ ] T076 [US6] Implement powerup expiration in Player.js updatePowerups() method called from preUpdate() (decrement duration, remove expired)
- [ ] T077 [US6] Add powerup stacking logic in Player.js: allow multiple simultaneous powerups with independent timers
- [ ] T078 [US6] Add visual distinction for each powerup type (different colors/shapes in GameScene.js)

**Checkpoint**: All 6 powerup types are collectible and functional with visible effects

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T079 [P] Add coyote time (100ms grace period after leaving platform) to Player.js canJump() method
- [ ] T080 [P] Add jump buffer (100ms input buffer for jump presses) to Player.js input handling
- [ ] T081 [P] Implement camera follow in GameScene.js using this.cameras.main.startFollow(player)
- [ ] T082 [P] Add smooth camera lerp in GameScene.js for smoother scrolling (lerp: 0.1)
- [ ] T083 [P] Optimize rendering: use Phaser static groups for platforms to reduce draw calls
- [ ] T084 [P] Add visual polish: platform shadows, particle effects on jump/stomp, coffee cup sparkle animation
- [ ] T085 [P] Implement high score persistence in ScoreManager.js: save top 10 scores to LocalStorage with date/level
- [ ] T086 [P] Add high score display to MenuScene.js and VictoryScene.js
- [ ] T087 [P] Improve enemy patrol AI in Enemy.js: smooth direction changes, edge detection to prevent falling off platforms
- [ ] T088 [P] Add sprite animations: player walk cycle, enemy movement, powerup rotation/pulse effects using Phaser.GameObjects.Graphics transformations
- [ ] T089 [P] Implement world bounds padding in GameScene.js to prevent camera showing outside level boundaries
- [ ] T090 [P] Add visual feedback for damage: screen shake on hit, red flash overlay
- [ ] T091 [P] Add level transition effects in GameScene.js: fade in/out between levels
- [ ] T092 [P] Optimize level generation in LevelGenerator.js: cache generated levels in registry, reuse on replay
- [ ] T093 [P] Add browser tab visibility handling: pause game when tab loses focus
- [ ] T094 Performance optimization: profile with Phaser debug mode, ensure 60 FPS on target browsers
- [ ] T095 Cross-browser testing: verify game runs in Chrome, Firefox, Edge, Safari (latest 2 versions)
- [ ] T096 Accessibility: add keyboard focus indicators, ensure all controls are keyboard-accessible
- [ ] T097 Run quickstart.md validation: verify all setup steps work, game loads in <5s, 60 FPS maintained

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 player/scene but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds enemies to US1 gameplay, independently testable
- **User Story 4 (P4)**: Depends on US1 completion (needs level completion working) - Adds multi-level progression
- **User Story 5 (P5)**: Depends on US3 completion (needs enemy system working) - Adds boss enemy type
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Adds powerups to gameplay, independently testable

### Within Each User Story

- Models/entities before services/systems
- Systems before scene integration
- Core implementation before visual polish
- Story complete before moving to next priority

### Parallel Opportunities

#### Setup Phase (Phase 1)

- T002 (index.html), T003 (game.css), T004 (constants.js) can run in parallel

#### Foundational Phase (Phase 2)

- T006-T009 (all scene files) can run in parallel
- T012 (ScoreManager.js), T013 (HealthManager.js) can run in parallel

#### User Story 1 (Phase 3)

- T014 (Player.js) and T015 (Collectible.js) can run in parallel

#### User Story 3 (Phase 5)

- T034-T036 (Enemy.js, Bug.js, MergeConflict.js) can run in parallel

#### User Story 6 (Phase 8)

- T065-T066 (Powerup.js and subclasses) can run in parallel
- T069-T074 (all powerup effect implementations) can run in parallel after T065-T066

#### Polish Phase (Phase 9)

- Most polish tasks (T079-T093) can run in parallel as they affect different files/features

#### Cross-Story Parallelization

Once Foundational phase completes:

- **US1 + US6**: Can develop in parallel (different features, minimal overlap)
- **US3 + US6**: Can develop in parallel (enemies vs powerups)
- After US1 completes: US2, US3, US4 can proceed
- After US3 completes: US5 can proceed

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these tasks in parallel:
Task T014: "Create js/entities/Player.js extending Phaser.Physics.Arcade.Sprite"
Task T015: "Create js/entities/Collectible.js extending Phaser.Physics.Arcade.Sprite"

# Then proceed sequentially with scene integration:
Task T016: "Create js/scenes/GameScene.js with create() method"
Task T017: "Implement player movement in GameScene.js update() method"
# ... etc.
```

---

## Parallel Example: User Story 3

```bash
# Launch all enemy entity files together:
Task T034: "Create js/entities/Enemy.js base class"
Task T035: "Create js/entities/Bug.js extending Enemy.js"
Task T036: "Create js/entities/MergeConflict.js extending Enemy.js"

# Then proceed with integration into GameScene.js sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T014-T026)
4. **STOP and VALIDATE**: Test User Story 1 independently per quickstart.md
   - Load level 1 in browser
   - Test movement (arrow keys/WASD)
   - Collect coffee cups (score increases)
   - Reach Close PR button (level completes)
   - Verify 5-minute timer works
5. Deploy/demo MVP if ready

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Foundational → Foundation ready
2. **MVP** (Phase 3): User Story 1 → Test independently → Deploy/Demo (Playable single level!)
3. **Challenge** (Phase 4): User Story 2 → Test independently → Deploy/Demo (Lives/fail states add stakes)
4. **Combat** (Phase 5): User Story 3 → Test independently → Deploy/Demo (Enemies + health system)
5. **Content** (Phase 6): User Story 4 → Test independently → Deploy/Demo (10 levels with progression)
6. **Boss Battles** (Phase 7): User Story 5 → Test independently → Deploy/Demo (Boss encounters)
7. **Powerups** (Phase 8): User Story 6 → Test independently → Deploy/Demo (Strategic depth)
8. **Polish** (Phase 9): Polish & Cross-Cutting → Final release

Each increment adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done:**
   - Developer A: User Story 1 (Core Gameplay)
   - Developer B: User Story 6 (Powerups - independent)
   - Developer C: Setup Polish tasks that don't conflict (T079-T081)
3. **After User Story 1 completes:**
   - Developer A: User Story 2 (Lives/Fail States)
   - Developer B: User Story 3 (Enemies/Health)
   - Developer C: User Story 4 (Multiple Levels - depends on US1)
4. **After User Story 3 completes:**
   - Any developer: User Story 5 (Boss Battles - depends on US3)
5. **Stories complete and integrate independently**

---

## Task Summary

**Total Tasks**: 97

### By Phase

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKS all user stories)
- **Phase 3 (US1 - Core Gameplay)**: 13 tasks
- **Phase 4 (US2 - Lives/Fail)**: 7 tasks
- **Phase 5 (US3 - Enemies/Health)**: 13 tasks
- **Phase 6 (US4 - Multiple Levels)**: 9 tasks
- **Phase 7 (US5 - Boss Battles)**: 9 tasks
- **Phase 8 (US6 - Powerups)**: 14 tasks
- **Phase 9 (Polish)**: 19 tasks

### By User Story

- **US1 (Core Gameplay - P1)**: 13 tasks ⭐ MVP
- **US2 (Lives/Fail States - P2)**: 7 tasks
- **US3 (Enemies/Health - P3)**: 13 tasks
- **US4 (Multiple Levels - P4)**: 9 tasks
- **US5 (Boss Battles - P5)**: 9 tasks
- **US6 (Powerups - P6)**: 14 tasks

### Parallel Opportunities Identified

- **Setup phase**: 3 tasks can run in parallel
- **Foundational phase**: 6 tasks can run in parallel (within constraints)
- **Cross-story**: US1 + US6 can develop in parallel after Foundational
- **Within stories**: Entity creation tasks within US3, US6 can parallelize
- **Polish phase**: ~15 tasks can run in parallel

### MVP Scope (Recommended)

Complete **Phases 1-3 only** (26 tasks) for a minimal viable product:

- Full project setup
- Single playable level
- Player movement and controls
- Coffee cup collection
- Score tracking
- Level completion
- 5-minute timer
- Basic HUD

This delivers a complete, testable game experience that can be validated before adding complexity.

---

## Notes

- **[P]** tasks = different files, no dependencies within phase
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests per constitution v3.0.0 - manual playtesting only
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow quickstart.md for development environment setup
- Use Phaser 3 documentation for API reference
- Test in target browsers frequently (Chrome, Firefox, Edge, Safari)
- Profile performance to maintain 60 FPS target
- Keep bundle size under <3s load time goal (~350KB Phaser + ~100KB game code)

# Test Checklist: Programmer Adventure Platformer

**Date**: 2025-10-29
**Version**: MVP + Core Features
**Platform**: Desktop Browsers (Chrome, Firefox, Edge, Safari)

## 🚀 Setup Verification

- [ ] Local web server starts successfully on port 8000
- [ ] Navigate to `http://localhost:8000` loads the game
- [ ] Game loads in under 5 seconds
- [ ] No console errors on initial load
- [ ] Menu screen displays correctly

## 🎮 Core Gameplay (User Story 1)

### Player Movement
- [ ] Arrow Left/A key moves player left
- [ ] Arrow Right/D key moves player right
- [ ] Space bar makes player jump
- [ ] Player sprite flips direction when moving
- [ ] Player accelerates and decelerates smoothly
- [ ] Player collides with platforms correctly
- [ ] Player cannot move beyond screen/world bounds

### Jumping Mechanics
- [ ] Single jump works on ground
- [ ] Cannot jump while in air (no double jump without powerup)
- [ ] Coyote time allows jump shortly after leaving platform
- [ ] Jump buffer registers input pressed just before landing
- [ ] Jump height feels appropriate (~3-4 platform heights)

### Collectibles
- [ ] Coffee cups appear on platforms
- [ ] Coffee cups have hover animation
- [ ] Collecting coffee cup increases score by 10
- [ ] Coffee cup disappears after collection with animation
- [ ] Sparkle particle effect plays on collection
- [ ] Score updates in HUD immediately

### Level Completion
- [ ] "Close PR" button appears at end of level
- [ ] Button has glow/pulse animation
- [ ] Overlapping with button completes level
- [ ] Time bonus is awarded for remaining time
- [ ] Screen fades out before transition
- [ ] Next level loads automatically

### Timer System
- [ ] Timer starts at 5:00 (300 seconds)
- [ ] Timer counts down every second
- [ ] Timer display updates in HUD
- [ ] Timer turns red when < 30 seconds remain
- [ ] Game Over triggers when timer reaches 0:00
- [ ] Timer pauses when game is paused

### Pause Functionality
- [ ] Pressing P pauses the game
- [ ] Pause overlay appears with "PAUSED" text
- [ ] Game physics freeze during pause
- [ ] Timer stops during pause
- [ ] Pressing P again resumes game
- [ ] Pause overlay disappears on resume

### Camera
- [ ] Camera follows player smoothly
- [ ] Camera lerp creates smooth scrolling (not jerky)
- [ ] Camera stays within level bounds
- [ ] Camera doesn't show empty space beyond level

## 💔 Lives & Fail States (User Story 2)

### Lives System
- [ ] Player starts with 3 lives
- [ ] Lives display shows "Lives: 3" in HUD
- [ ] Lives count updates when life is lost

### Health System
- [ ] Player starts with 3 health (♥♥♥)
- [ ] Health meter displays correctly in HUD
- [ ] Health decreases when damaged
- [ ] Losing all health costs 1 life
- [ ] Health resets to full after respawn

### Pit Detection
- [ ] Falling below level boundary triggers death
- [ ] Player respawns at level start
- [ ] Life count decreases by 1
- [ ] Timer continues after respawn
- [ ] Score is preserved after respawn

### Game Over
- [ ] Game Over screen appears when all lives lost
- [ ] Final score is displayed
- [ ] Reason for game over shows (if applicable)
- [ ] Pressing R restarts from level 1
- [ ] Pressing M returns to menu
- [ ] Lives/health/score reset on restart

## 👾 Enemy System (User Story 3)

### Bug Enemy
- [ ] Bug enemies spawn on platforms
- [ ] Bugs patrol left and right within boundaries
- [ ] Bugs turn around at patrol boundaries
- [ ] Bugs flip sprite when changing direction
- [ ] Bugs are colored orange (0xFF9F1C)

### Merge Conflict Enemy
- [ ] Merge Conflicts spawn on platforms
- [ ] Merge Conflicts jump every 2 seconds
- [ ] Merge Conflicts patrol while on ground
- [ ] Merge Conflicts are colored red (0xE71D36)
- [ ] Jump height is appropriate

### Enemy Collision
- [ ] Colliding with enemy from side damages player
- [ ] Screen shakes when player takes damage
- [ ] Red flash overlay appears on damage
- [ ] Player becomes invincible for 1 second after hit
- [ ] Player sprite flashes during invincibility
- [ ] No damage taken during invincibility period

### Stomp Mechanic
- [ ] Jumping on enemy from above defeats enemy
- [ ] Enemy takes damage (health decreases)
- [ ] Bug dies in 1 stomp (health: 1)
- [ ] Merge Conflict dies in 2 stomps (health: 2)
- [ ] Player bounces upward after stomp
- [ ] 50 points awarded for defeating enemy
- [ ] Enemy fades out and is removed

### Health Integration
- [ ] Taking damage reduces health by 1
- [ ] Health meter updates immediately
- [ ] Reaching 0 health triggers death
- [ ] Death costs 1 life
- [ ] Player respawns with full health

## 🌍 Multiple Levels (User Story 4)

### Level Generation
- [ ] All 10 levels generate on boot
- [ ] Each level has unique layout
- [ ] Platforms vary in length, height, gap size
- [ ] Levels are solvable (can reach end)
- [ ] Same level generates identically on replay

### Level Themes
- [ ] Level 1: Dev Conference theme (blue)
- [ ] Level 2: Office Buildings theme (gray)
- [ ] Level 3: SF Bay theme (turquoise)
- [ ] Level 4: Coffee Shops theme (brown)
- [ ] Themes cycle through levels 5-10
- [ ] Background colors change per theme
- [ ] Platform colors change per theme

### Level Progression
- [ ] Level number displays in HUD (e.g., "Level 1/10")
- [ ] Completing level 1 loads level 2
- [ ] Completing level 2 loads level 3
- [ ] Score persists across levels
- [ ] Lives persist across levels
- [ ] Health persists across levels

### Victory Condition
- [ ] Completing level 10 triggers Victory Scene
- [ ] Victory screen shows "VICTORY!" message
- [ ] Final score is displayed
- [ ] Total time is displayed
- [ ] Celebration effect plays (particle burst)
- [ ] Pressing M returns to menu
- [ ] Pressing R restarts from level 1

## 🎨 Visual Polish

### Animations
- [ ] Coffee cups hover gently up and down
- [ ] Coffee cups fade in and out (sparkle)
- [ ] Collectibles float up when collected
- [ ] Collectibles scale up when collected
- [ ] "Close PR" button pulses/glows
- [ ] Particle burst on coffee cup collection
- [ ] Enemy death fade-out animation

### Screen Effects
- [ ] Screen shake on damage (200ms)
- [ ] Red flash overlay on damage (300ms fade)
- [ ] Fade in at level start (500ms)
- [ ] Fade out at level end (500ms)
- [ ] Smooth camera following

### HUD
- [ ] Lives display (top-left)
- [ ] Health meter with hearts (top-left)
- [ ] Score display (top-right)
- [ ] Level number display (top-right)
- [ ] Timer display (top-center)
- [ ] All text is readable and well-positioned

## 🏆 Scoring & Persistence

### Score System
- [ ] Coffee cup collection: +10 points
- [ ] Enemy defeat: +50 points
- [ ] Time bonus on level completion: +5 per second
- [ ] Score persists across levels
- [ ] Score resets on game over

### High Scores
- [ ] High scores save to LocalStorage
- [ ] Top 10 scores are preserved
- [ ] High score displays on menu
- [ ] High score displays on victory screen
- [ ] Scores persist across browser sessions
- [ ] New high scores are highlighted

## 🎛️ Controls & Input

### Keyboard Controls
- [ ] Arrow keys work for movement
- [ ] WASD works for movement
- [ ] Space bar works for jump
- [ ] W key works for jump
- [ ] P key pauses/resumes
- [ ] R key retries on game over
- [ ] M key returns to menu

### Input Responsiveness
- [ ] No input lag (<16ms)
- [ ] Multiple keys can be pressed simultaneously
- [ ] Key repeat works naturally
- [ ] No stuck keys

## ⚡ Performance

### Frame Rate
- [ ] Game runs at 60 FPS consistently
- [ ] No frame drops during gameplay
- [ ] No frame drops during level transitions
- [ ] No frame drops with many enemies on screen

### Load Times
- [ ] Initial load: <3 seconds
- [ ] Level transitions: <500ms
- [ ] No loading screens needed

### Memory
- [ ] Memory usage stays under 100MB
- [ ] No memory leaks after extended play
- [ ] Browser tab doesn't slow down

## 🌐 Cross-Browser Compatibility

### Chrome
- [ ] Game loads correctly
- [ ] All features work
- [ ] Performance is good (60 FPS)

### Firefox
- [ ] Game loads correctly
- [ ] All features work
- [ ] Performance is good (60 FPS)

### Edge
- [ ] Game loads correctly
- [ ] All features work
- [ ] Performance is good (60 FPS)

### Safari (Mac)
- [ ] Game loads correctly
- [ ] All features work
- [ ] Performance is good (60 FPS)

## 🐛 Edge Cases

### Boundary Conditions
- [ ] Can't walk through platforms
- [ ] Can't jump through platforms from below
- [ ] Can't fall through platforms
- [ ] World bounds prevent going off-screen

### Timing Issues
- [ ] Collecting item at same time as death handled correctly
- [ ] Multiple damage events don't stack
- [ ] Pause during animations works correctly
- [ ] Timer at 0 doesn't go negative

### State Management
- [ ] Retry after game over resets properly
- [ ] Return to menu clears game state
- [ ] Starting new game from menu works
- [ ] Refreshing browser resets everything

## 📱 Browser Tab Visibility

- [ ] Pausing browser tab pauses game
- [ ] Returning to tab resumes game
- [ ] Timer doesn't advance when tab hidden
- [ ] No glitches after tab restore

## ✅ Overall Quality

### Gameplay Feel
- [ ] Movement feels responsive and smooth
- [ ] Jumping feels satisfying
- [ ] Combat feels fair and skill-based
- [ ] Difficulty progression feels appropriate
- [ ] Game is fun to play!

### Polish Level
- [ ] No visual glitches or artifacts
- [ ] Consistent art style (pixel-art look)
- [ ] Good color scheme and contrast
- [ ] Clear visual feedback for actions

### User Experience
- [ ] Controls are intuitive
- [ ] Instructions are clear (menu screen)
- [ ] HUD information is readable
- [ ] Game objectives are clear
- [ ] Failure states are understandable

## 🔧 Debug Mode

- [ ] Set `debug: true` in main.js physics config
- [ ] Physics bodies are visible (green outlines)
- [ ] Collision boxes are accurate
- [ ] No bodies stuck or behaving strangely
- [ ] Return to `debug: false` for release

## 📊 Test Results Summary

**Test Date**: _______________
**Tester Name**: _______________
**Browser**: _______________
**Pass Rate**: _____ / _____ tests passed

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Suggestions for Improvement:
1. 
2. 
3. 

**Overall Assessment**: ⭐⭐⭐⭐⭐ (Rate 1-5 stars)

**Ready for Release**: [ ] YES  [ ] NO

---

## Notes

- This checklist covers the implemented MVP features (US1-US4 + Polish)
- Boss battles (US5) and Powerups (US6) are not included in this test
- Test systematically from top to bottom
- Mark each item with ✓ when verified working
- Document any issues found in the summary section
- Re-test after fixing any issues

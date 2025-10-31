import { LEVEL, ENEMIES } from '../utils/constants.js';

export default class LevelGenerator {
    constructor() {
        this.themes = ['dev-conference', 'office-buildings', 'sf-bay', 'coffee-shops'];
        this.seed = 12345; // Fixed seed for reproducible generation
    }

    generateAllLevels() {
        const levels = [];
        
        for (let i = 1; i <= 10; i++) {
            const level = this.generateLevel(i);
            levels.push(level);
        }
        
        return levels;
    }

    generateLevel(levelNumber) {
        // Assign theme cyclically
        const theme = this.themes[(levelNumber - 1) % this.themes.length];
        
        // Difficulty increases with level number
        const difficulty = levelNumber / 10;
        
        // Generate platforms
        const platforms = this.generatePlatforms(levelNumber, difficulty);
        
        // Generate enemies
        const enemies = this.generateEnemies(levelNumber, difficulty, platforms);
        
        // Generate collectibles (coffee cups)
        const collectibles = this.generateCollectibles(levelNumber, platforms);
        
        // Generate powerups
        const powerups = this.generatePowerups(levelNumber, platforms);
        
        // Generate decorative clouds
        const clouds = this.generateClouds(levelNumber, theme);
        
        // Close PR button position (at the end)
        const closePRButton = {
            x: LEVEL.WIDTH - 100,
            y: platforms[platforms.length - 1].y - 50
        };
        
        return {
            id: levelNumber,
            theme: theme,
            width: LEVEL.WIDTH,
            height: LEVEL.HEIGHT,
            platforms: platforms,
            enemies: enemies,
            collectibles: collectibles,
            powerups: powerups,
            clouds: clouds,
            closePRButton: closePRButton,
            timeLimit: LEVEL.TIME_LIMIT,
            isBossLevel: LEVEL.BOSS_LEVELS.includes(levelNumber)
        };
    }

    generatePlatforms(levelNumber, difficulty) {
        const platforms = [];
        
    // Player jump physics calculation
    // With JUMP_VELOCITY = -380 and GRAVITY = 800:
    // Approx max jump height ≈ 83 px
    // Safe horizontal reach at speed 160 ≈ 210 px (allow margin)
    const MAX_JUMP_HEIGHT = 85;
    const MAX_JUMP_DISTANCE = 200; // Conservative margin below theoretical
        
        // Ground platform (start)
        platforms.push({
            x: 200,
            y: 550,
            width: 300,
            height: 20,
            type: 'ground'
        });
        
        // Calculate platform parameters based on difficulty
    const numPlatforms = 15 + Math.floor(difficulty * 10); // 15-25 platforms
    // Make early levels more forgiving: smaller gaps. Later levels gradually increase.
    const baseMinGap = 30; // Further reduced for denser early layout
    const baseMaxGap = MAX_JUMP_DISTANCE - 90; // Keep generous margin
    const minGap = baseMinGap + difficulty * 12; // 30 -> ~42 across difficulty
    const maxGap = baseMaxGap + difficulty * 8; // Slight increase with difficulty
    // Adjust vertical range to keep early platforms more reachable
    const minHeight = 350; // Raise baseline so player doesn't need large upward jumps immediately
    const maxHeight = 520; // Slightly tighter vertical band
        
    // Track right edge of last platform instead of arbitrary currentX for consistent gap measurement
    let lastPlatformRightEdge = platforms[0].x + platforms[0].width / 2; // starting ground platform center treated as base
    let currentY = platforms[0].y; // start from ground level then adjust
    let firstGapApplied = false;
        
        for (let i = 0; i < numPlatforms; i++) {
            // Random gap and height variation
            const gap = minGap + this.random() * (maxGap - minGap);
            const heightChange = (this.random() - 0.5) * 80; // Reduced for smoother progression
            const platformWidth = 80 + this.random() * 120; // 80-200 width
            
            // For first elevated platform, force a smaller gap for guaranteed reach
            const effectiveGap = !firstGapApplied ? Math.min(gap, minGap + 10) : gap;
            // Calculate new platform center based on right edge of previous platform
            const newCenterX = lastPlatformRightEdge + effectiveGap + platformWidth / 2;
            const newX = newCenterX;
            let newY = currentY + heightChange;
            
            // Ensure height change is within jump capability
            if (newY < currentY - MAX_JUMP_HEIGHT) {
                newY = currentY - MAX_JUMP_HEIGHT + 10; // +10 for margin
            }
            if (newY > currentY + MAX_JUMP_HEIGHT) {
                newY = currentY + MAX_JUMP_HEIGHT - 10; // -10 for margin
            }
            
            // Keep within bounds
            newY = Math.max(minHeight, Math.min(maxHeight, newY));
            
            // Ensure platforms are within level bounds
            if (newX < LEVEL.WIDTH - 300) {
                platforms.push({
                    x: newX,
                    y: newY,
                    width: platformWidth,
                    height: 20,
                    type: 'elevated'
                });
                // Update tracking values
                lastPlatformRightEdge = newX + platformWidth / 2;
                currentY = newY;
                firstGapApplied = true;
            }
        }

        // Ensure a safe approach to the Close PR area by filling any large gaps
        const finalPlatformX = LEVEL.WIDTH - 200;
        const finalPlatformY = 500;
        const finalPlatformWidth = 300;
        const finalPlatformLeftEdge = finalPlatformX - finalPlatformWidth / 2;
        const safeApproachGap = MAX_JUMP_DISTANCE - 20;
        let approachRightEdge = lastPlatformRightEdge;
        let approachY = currentY;

        while (approachRightEdge + safeApproachGap < finalPlatformLeftEdge) {
            const remaining = finalPlatformLeftEdge - (approachRightEdge + safeApproachGap);
            const bridgeWidth = Math.max(140, Math.min(220, remaining + 80));
            approachY = Math.min(finalPlatformY, Math.max(minHeight, approachY + 15));
            const bridgeCenterX = approachRightEdge + safeApproachGap + bridgeWidth / 2;

            platforms.push({
                x: bridgeCenterX,
                y: approachY,
                width: bridgeWidth,
                height: 20,
                type: 'bridge'
            });

            approachRightEdge = bridgeCenterX + bridgeWidth / 2;
        }

        lastPlatformRightEdge = approachRightEdge;
        currentY = approachY;

        // Final platform (for Close PR button)
        platforms.push({
            x: finalPlatformX,
            y: finalPlatformY,
            width: finalPlatformWidth,
            height: 20,
            type: 'ground'
        });
        
        return platforms;
    }

    generateEnemies(levelNumber, difficulty, platforms) {
        const enemies = [];
        
        // Boss levels have special enemy spawn
        if (LEVEL.BOSS_LEVELS.includes(levelNumber)) {
            // Spawn boss at mid-level
            const bossPlatform = platforms[Math.floor(platforms.length / 2)];
            enemies.push({
                type: 'security-boss',
                x: bossPlatform.x + bossPlatform.width / 2,
                y: bossPlatform.y - 60,
                pattern: 'chase'
            });
            return enemies;
        }
        
        // Regular enemy spawn
        let numEnemies = 3 + Math.floor(difficulty * 5); // 3-8 enemies
        // Guarantee at least 2 enemies on level 1 for engagement
        if (levelNumber === 1) {
            numEnemies = Math.max(numEnemies, 2);
        }
        
        // Skip first and last few platforms (safe zones)
        const safeZoneStart = 2;
        const safeZoneEnd = platforms.length - 3;
        const spawnablePlatforms = platforms.slice(safeZoneStart, safeZoneEnd);
        
        for (let i = 0; i < numEnemies && i < spawnablePlatforms.length; i++) {
            const platform = spawnablePlatforms[Math.floor(i * spawnablePlatforms.length / numEnemies)];

            // Choose enemy type based on level
            let enemyType = 'bug';
            if (levelNumber >= 4 && this.random() > 0.5) {
                enemyType = 'merge-conflict';
            }

            const halfW = platform.width / 2;
            enemies.push({
                type: enemyType,
                x: platform.x, // center of platform
                y: platform.y - 22,
                pattern: enemyType === 'bug' ? 'patrol' : 'jump',
                patrolLeft: platform.x - halfW + 5,
                patrolRight: platform.x + halfW - 5
            });
        }
        
        return enemies;
    }

    generateCollectibles(levelNumber, platforms) {
        const collectibles = [];
        
        // Reduced coffee cup density: ~35% chance per eligible platform (skip first/last)
        for (let i = 1; i < platforms.length - 1; i++) {
            if (this.random() < 0.35) {
                const platform = platforms[i];
                const cupOffset = platform.height / 2 + 36;
                collectibles.push({
                    type: 'coffee-cup',
                    x: platform.x,
                    y: platform.y - cupOffset
                });
            }
        }
        
        return collectibles;
    }

    generatePowerups(levelNumber, platforms) {
        const powerups = [];
        
        // 2-3 powerups per level
        const numPowerups = 2 + Math.floor(this.random() * 2);
        const powerupTypes = [
            'stack-overflow',
            'rubber-duck-debug',
            'git-revert',
            'caffeine-rush',
            'code-review',
            'pair-programming'
        ];
        
        // Place powerups on random platforms (avoid first and last)
        const safeZone = 3;
        const spawnablePlatforms = platforms.slice(safeZone, platforms.length - safeZone);
        
        for (let i = 0; i < numPowerups && i < spawnablePlatforms.length; i++) {
            const platform = spawnablePlatforms[Math.floor(i * spawnablePlatforms.length / numPowerups)];
            const powerupType = powerupTypes[Math.floor(this.random() * powerupTypes.length)];
            
            powerups.push({
                type: powerupType,
                x: platform.x + platform.width / 2,
                y: platform.y - 40
            });
        }
        
        return powerups;
    }

    generateClouds(levelNumber, theme) {
        const clouds = [];
        const numClouds = theme === 'sf-bay' ? 15 : 8;
        for (let i = 0; i < numClouds; i++) {
            const x = (LEVEL.WIDTH / numClouds) * i + this.random() * 300;
            const y = 50 + this.random() * 150;
            const width = 60 + this.random() * 80;
            const height = 30 + this.random() * 30;
            const opacity = 0.15 + this.random() * 0.25;
            clouds.push({ x, y, width, height, opacity });
        }
        return clouds;
    }

    // Simple seeded random number generator for reproducibility
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

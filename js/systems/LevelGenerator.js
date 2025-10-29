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
        // With JUMP_VELOCITY = -330 and GRAVITY = 800:
        // Max jump height ≈ 68 pixels
        // Max horizontal distance at speed 160 ≈ 200 pixels
        const MAX_JUMP_HEIGHT = 70;
        const MAX_JUMP_DISTANCE = 180; // Conservative to ensure reachability
        
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
        const minGap = 60 + difficulty * 20; // Gap increases with difficulty but stays jumpable
        const maxGap = MAX_JUMP_DISTANCE - 40; // Leave margin for safety
        const minHeight = 200; // Lower bound for visibility
        const maxHeight = 500; // Keep platforms from being too high
        
        let currentX = 500;
        let currentY = 500;
        
        for (let i = 0; i < numPlatforms; i++) {
            // Random gap and height variation
            const gap = minGap + this.random() * (maxGap - minGap);
            const heightChange = (this.random() - 0.5) * 80; // Reduced for smoother progression
            const platformWidth = 80 + this.random() * 120; // 80-200 width
            
            // Calculate new position
            const newX = currentX + gap + platformWidth;
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
                
                currentX = newX;
                currentY = newY;
            }
        }
        
        // Final platform (for Close PR button)
        platforms.push({
            x: LEVEL.WIDTH - 200,
            y: 500,
            width: 300,
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
        const numEnemies = 3 + Math.floor(difficulty * 5); // 3-8 enemies
        
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
            
            enemies.push({
                type: enemyType,
                x: platform.x + platform.width / 2,
                y: platform.y - 20,
                pattern: enemyType === 'bug' ? 'patrol' : 'jump',
                patrolLeft: platform.x,
                patrolRight: platform.x + platform.width
            });
        }
        
        return enemies;
    }

    generateCollectibles(levelNumber, platforms) {
        const collectibles = [];
        
        // Place coffee cups on most platforms
        const numCollectibles = Math.floor(platforms.length * 0.6); // 60% of platforms
        
        for (let i = 1; i < platforms.length - 1; i++) {
            if (this.random() < 0.6) {
                const platform = platforms[i];
                collectibles.push({
                    type: 'coffee-cup',
                    x: platform.x + platform.width / 2,
                    y: platform.y - 30
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
        
        // More clouds for SF Bay theme
        const numClouds = theme === 'sf-bay' ? 15 : 8;
        
        // Distribute clouds across the level
        for (let i = 0; i < numClouds; i++) {
            const x = (LEVEL.WIDTH / numClouds) * i + this.random() * 300;
            const y = 50 + this.random() * 150; // Upper portion of screen
            const width = 60 + this.random() * 80; // 60-140 width
            const height = 30 + this.random() * 30; // 30-60 height
            const opacity = 0.15 + this.random() * 0.25; // 0.15-0.4 opacity
            
            clouds.push({
                x: x,
                y: y,
                width: width,
                height: height,
                opacity: opacity
            });
        }
        
        return clouds;
    }

    // Simple seeded random number generator for reproducibility
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

// Game constants
export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    GRAVITY: 800,
    FPS: 60
};

export const PLAYER = {
    SPEED: 160,
    // Increased jump height for more forgiving platform reach
    JUMP_VELOCITY: -380,
    DOUBLE_JUMP_VELOCITY: -340,
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
    STACK_OVERFLOW: { duration: 15000 },        // Double jump height
    RUBBER_DUCK_DEBUG: { duration: 5000 },      // Invincibility
    GIT_REVERT: { duration: 0 },                // Teleport back 3s
    CAFFEINE_RUSH: { duration: 10000, multiplier: 1.5 }, // Speed boost
    CODE_REVIEW: { duration: 0, timeBonus: 30000 },      // +30s time
    PAIR_PROGRAMMING: { duration: 8000, multiplier: 0.5 } // Slow enemies
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
    BACKGROUND: 0x1a1a2e,
    
    // Theme colors for different level environments
    THEMES: {
        'dev-conference': {
            background: 0x2C3E50,
            platform: 0x34495E,
            accent: 0x3498DB
        },
        'office-buildings': {
            background: 0x2C2C2C,
            platform: 0x4A4A4A,
            accent: 0x7F8C8D
        },
        'sf-bay': {
            background: 0x1ABC9C,
            platform: 0x16A085,
            accent: 0xF39C12
        },
        'coffee-shops': {
            background: 0x6F4E37,
            platform: 0x8B4513,
            accent: 0xCD853F
        }
    }
};

// XP System Constants and Calculations

const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,      // 1-10
    4700, 5700, 6800, 8000, 9300, 10700, 12200, 13800, 15500, 17300, // 11-20
    19200, 21200, 23300, 25500, 27800, 30200, 32700, 35300, 38000, 40800, // 21-30
];

const XP_REWARDS = {
    WIN: 150,
    LOSS: 30,
    CARD_PLAYED: 2,
    UNO_CALL: 20,
    CATCH_UNO: 25,
    SPECIAL_CARD: 5,
    WILD_CARD: 8,
    PERFECT_WIN: 50,    // Win without drawing extra cards
    TEAM_WIN: 120,
};

function calculateLevel(xp) {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    return level;
}

function getXpForNextLevel(level) {
    if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + level * 500;
    return LEVEL_THRESHOLDS[level];
}

function calculateMatchXp(isWinner, cardsPlayed, unoCalls, catchUnos, specialCards, wildCards) {
    let xp = isWinner ? XP_REWARDS.WIN : XP_REWARDS.LOSS;
    xp += cardsPlayed * XP_REWARDS.CARD_PLAYED;
    xp += unoCalls * XP_REWARDS.UNO_CALL;
    xp += catchUnos * XP_REWARDS.CATCH_UNO;
    xp += specialCards * XP_REWARDS.SPECIAL_CARD;
    xp += wildCards * XP_REWARDS.WILD_CARD;
    return xp;
}

module.exports = {
    LEVEL_THRESHOLDS,
    XP_REWARDS,
    calculateLevel,
    getXpForNextLevel,
    calculateMatchXp,
};

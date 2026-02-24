const { COLORS } = require('./deck');

/**
 * Validates whether a card can be played on top of the current discard pile card.
 */
function isValidPlay(card, topCard, currentColor, gameState) {
    // Wild cards can always be played
    if (card.type === 'wild') return true;

    // Match color (including wild-chosen color)
    if (card.color === currentColor) return true;

    // Match value/number
    if (card.value === topCard.value) return true;

    return false;
}

/**
 * Check if a +2 can stack on another +2 (stacking mode)
 */
function canStackDraw2(card, topCard, stackingEnabled) {
    if (!stackingEnabled) return false;
    return card.value === 'draw2' && topCard.value === 'draw2';
}

/**
 * Check if a +4 can stack on another +4 (stacking mode)
 */
function canStackDraw4(card, topCard, stackingEnabled) {
    if (!stackingEnabled) return false;
    return card.value === 'wild_draw4' && topCard.value === 'wild_draw4';
}

/**
 * Apply card effects and return state mutations
 */
function applyCardEffect(card, gameState) {
    const effects = {
        skipNext: false,
        reverseDirection: false,
        drawCards: 0,
        newColor: null,
    };

    switch (card.value) {
        case 'skip':
            effects.skipNext = true;
            break;
        case 'reverse':
            effects.reverseDirection = true;
            break;
        case 'draw2':
            if (gameState.stackingEnabled && gameState.drawStack > 0) {
                effects.drawCards = 0; // Stacking continues
                gameState.drawStack += 2;
            } else if (gameState.stackingEnabled) {
                gameState.drawStack = 2;
            } else {
                effects.drawCards = 2;
                effects.skipNext = true;
            }
            break;
        case 'wild':
            // Color selected by player, handled externally
            break;
        case 'wild_draw4':
            if (gameState.stackingEnabled && gameState.drawStack > 0) {
                gameState.drawStack += 4;
            } else if (gameState.stackingEnabled) {
                gameState.drawStack = 4;
            } else {
                effects.drawCards = 4;
                effects.skipNext = true;
            }
            break;
    }

    return effects;
}

/**
 * Check if player has any valid cards to play
 */
function hasValidPlay(hand, topCard, currentColor, gameState) {
    return hand.some(card => {
        if (gameState.stackingEnabled && gameState.drawStack > 0) {
            if (topCard.value === 'draw2') return canStackDraw2(card, topCard, true);
            if (topCard.value === 'wild_draw4') return canStackDraw4(card, topCard, true);
        }
        return isValidPlay(card, topCard, currentColor, gameState);
    });
}

/**
 * Get all valid cards from hand
 */
function getValidCards(hand, topCard, currentColor, gameState) {
    return hand.filter(card => {
        if (gameState.stackingEnabled && gameState.drawStack > 0) {
            if (topCard.value === 'draw2') return canStackDraw2(card, topCard, true);
            if (topCard.value === 'wild_draw4') return canStackDraw4(card, topCard, true);
        }
        return isValidPlay(card, topCard, currentColor, gameState);
    });
}

/**
 * Calculate score of remaining hand (for end-game scoring)
 */
function calculateHandScore(hand) {
    return hand.reduce((score, card) => {
        if (card.type === 'number') return score + parseInt(card.value);
        if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') return score + 20;
        if (card.type === 'wild') return score + 50;
        return score;
    }, 0);
}

module.exports = {
    isValidPlay,
    canStackDraw2,
    canStackDraw4,
    applyCardEffect,
    hasValidPlay,
    getValidCards,
    calculateHandScore,
};

const { getValidCards, calculateHandScore } = require('./rules');
const { COLORS } = require('./deck');

/**
 * AI Bot Player — 3 difficulty levels
 * Returns the card to play (or null to draw) and chosen color for wilds
 */
function getAiMove(hand, topCard, currentColor, gameState, difficulty = 'medium') {
    const validCards = getValidCards(hand, topCard, currentColor, gameState);

    if (validCards.length === 0) return { action: 'draw' };

    let chosenCard;

    switch (difficulty) {
        case 'easy':
            chosenCard = easyStrategy(validCards);
            break;
        case 'hard':
            chosenCard = hardStrategy(validCards, hand, topCard, currentColor, gameState);
            break;
        case 'medium':
        default:
            chosenCard = mediumStrategy(validCards, hand);
            break;
    }

    const chosenColor = chosenCard.type === 'wild' ? pickColor(hand, difficulty) : null;

    return {
        action: 'play',
        card: chosenCard,
        chosenColor,
    };
}

/**
 * Easy: Pick a random valid card
 */
function easyStrategy(validCards) {
    return validCards[Math.floor(Math.random() * validCards.length)];
}

/**
 * Medium: Prioritize action cards, avoid playing wild cards early
 */
function mediumStrategy(validCards, hand) {
    // Play non-wild cards first
    const nonWild = validCards.filter(c => c.type !== 'wild');
    if (nonWild.length > 0) {
        // Prefer action cards
        const actionCards = nonWild.filter(c => c.type === 'action');
        if (actionCards.length > 0) return actionCards[0];
        // Then number cards, prefer higher values
        const sorted = [...nonWild].sort((a, b) => {
            const aVal = parseInt(a.value) || 0;
            const bVal = parseInt(b.value) || 0;
            return bVal - aVal;
        });
        return sorted[0];
    }
    return validCards[0];
}

/**
 * Hard: Strategic play — track colors, save wilds, stack when possible
 */
function hardStrategy(validCards, hand, topCard, currentColor, gameState) {
    // Count colors in hand to determine dominant color
    const colorCounts = {};
    for (const c of hand) {
        if (c.color !== 'wild') {
            colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
        }
    }
    const dominantColor = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    // If stacking is active, always stack if possible
    if (gameState.drawStack > 0) {
        const stackable = validCards.filter(c =>
            c.value === 'draw2' || c.value === 'wild_draw4'
        );
        if (stackable.length > 0) return stackable[0];
    }

    // Save wild cards if we have other options
    const nonWild = validCards.filter(c => c.type !== 'wild');
    if (nonWild.length > 0) {
        // Prefer cards that match our dominant color
        const dominantCards = nonWild.filter(c => c.color === dominantColor);
        if (dominantCards.length > 0) {
            // Prefer action cards from dominant color
            const actionDominant = dominantCards.filter(c => c.type === 'action');
            if (actionDominant.length > 0) return actionDominant[0];
            return dominantCards[0];
        }
        // Play action cards from other colors
        const actionCards = nonWild.filter(c => c.type === 'action');
        if (actionCards.length > 0) return actionCards[0];
        return nonWild[0];
    }

    // Must play wild — prefer regular wild over draw4
    const regularWild = validCards.find(c => c.value === 'wild');
    return regularWild || validCards[0];
}

/**
 * Pick a color based on hand composition
 */
function pickColor(hand, difficulty) {
    if (difficulty === 'easy') {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };
    for (const c of hand) {
        if (c.color in colorCounts) {
            colorCounts[c.color]++;
        }
    }

    // Pick color with most cards in hand
    return Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Should the AI call UNO?
 */
function shouldCallUno(hand) {
    return hand.length <= 2;
}

module.exports = { getAiMove, shouldCallUno };

const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
const WILD_TYPES = ['wild', 'wild_draw4'];

/**
 * Generates a standard 108-card UNO deck
 * - One 0 per color (4 cards)
 * - Two of each 1-9, skip, reverse, draw2 per color (96 cards)
 * - Four wild cards (4 cards)
 * - Four wild draw 4 cards (4 cards)
 */
function createDeck() {
    const deck = [];
    let id = 0;

    for (const color of COLORS) {
        // One zero per color
        deck.push({ id: id++, color, value: '0', type: 'number' });

        // Two of each 1-9 and action cards per color
        for (let i = 0; i < 2; i++) {
            for (const value of VALUES.slice(1)) {
                const type = ['skip', 'reverse', 'draw2'].includes(value) ? 'action' : 'number';
                deck.push({ id: id++, color, value, type });
            }
        }
    }

    // Wild cards
    for (let i = 0; i < 4; i++) {
        deck.push({ id: id++, color: 'wild', value: 'wild', type: 'wild' });
        deck.push({ id: id++, color: 'wild', value: 'wild_draw4', type: 'wild' });
    }

    return deck;
}

/**
 * Fisher-Yates shuffle — unbiased O(n) shuffle
 */
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = { createDeck, shuffleDeck, COLORS, VALUES, WILD_TYPES };

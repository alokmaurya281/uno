const { createDeck, shuffleDeck, COLORS } = require('./deck');
const { isValidPlay, applyCardEffect, hasValidPlay, getValidCards, calculateHandScore, canStackDraw2, canStackDraw4 } = require('./rules');

const CARDS_PER_PLAYER = 7;

/**
 * Create a new game state from room info
 */
function createGameState(players, options = {}) {
    const deck = shuffleDeck(createDeck());
    const hands = {};
    const playerStats = {};
    let deckIndex = 0;

    // Deal 7 cards to each player
    for (const player of players) {
        hands[player.id] = [];
        playerStats[player.id] = {
            cardsPlayed: 0,
            unoCalls: 0,
            catchUnos: 0,
            specialCards: 0,
            wildCards: 0,
            drawnCards: 0,
        };
        for (let i = 0; i < CARDS_PER_PLAYER; i++) {
            hands[player.id].push(deck[deckIndex++]);
        }
    }

    // Find first non-wild card for discard pile
    let startCard = deck[deckIndex++];
    while (startCard.type === 'wild') {
        deck.push(startCard);
        startCard = deck[deckIndex++];
    }

    const state = {
        players: players.map((p, i) => ({
            id: p.id,
            username: p.username,
            isBot: p.isBot || false,
            botDifficulty: p.botDifficulty || null,
            connected: true,
            cardCount: CARDS_PER_PLAYER,
        })),
        hands,
        drawPile: deck.slice(deckIndex),
        discardPile: [startCard],
        currentPlayerIndex: 0,
        direction: 1,  // 1 = clockwise, -1 = counter-clockwise
        currentColor: startCard.color,
        stackingEnabled: options.stackingEnabled || false,
        teamMode: options.teamMode || false,
        teams: options.teams || null,
        drawStack: 0,
        turnTimer: options.turnTimer || 30,
        turnStartTime: Date.now(),
        unoCalledBy: {},  // playerId -> true if called UNO
        playerStats,
        winner: null,
        gameOver: false,
        mode: options.mode || 'classic',
        startedAt: Date.now(),
    };

    // Apply first card effects (skip, reverse, draw2)
    if (startCard.value === 'skip') {
        state.currentPlayerIndex = getNextPlayerIndex(state);
    } else if (startCard.value === 'reverse') {
        state.direction *= -1;
        if (state.players.length === 2) {
            state.currentPlayerIndex = getNextPlayerIndex(state);
        }
    } else if (startCard.value === 'draw2') {
        const firstPlayer = state.players[0];
        drawCards(state, firstPlayer.id, 2);
        state.currentPlayerIndex = getNextPlayerIndex(state);
    }

    state.turnStartTime = Date.now();
    return state;
}

/**
 * Get next player index considering direction
 */
function getNextPlayerIndex(state) {
    const count = state.players.length;
    return ((state.currentPlayerIndex + state.direction) % count + count) % count;
}

/**
 * Draw cards from draw pile, reshuffle discard if needed
 */
function drawCards(state, playerId, count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
        if (state.drawPile.length === 0) {
            // Reshuffle discard pile except top card
            const topCard = state.discardPile.pop();
            state.drawPile = shuffleDeck(state.discardPile.map(c => {
                if (c.type === 'wild') c.color = 'wild';
                return c;
            }));
            state.discardPile = [topCard];
        }
        if (state.drawPile.length > 0) {
            const card = state.drawPile.pop();
            state.hands[playerId].push(card);
            drawn.push(card);
        }
    }
    // Update card count
    const player = state.players.find(p => p.id === playerId);
    if (player) player.cardCount = state.hands[playerId].length;
    if (state.playerStats[playerId]) state.playerStats[playerId].drawnCards += drawn.length;
    return drawn;
}

/**
 * Play a card from a player's hand
 */
function playCard(state, playerId, cardId, chosenColor) {
    const hand = state.hands[playerId];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = hand[cardIndex];
    const topCard = state.discardPile[state.discardPile.length - 1];

    // Validate stacking
    if (state.stackingEnabled && state.drawStack > 0) {
        if (topCard.value === 'draw2' && !canStackDraw2(card, topCard, true)) {
            return { success: false, error: 'Must stack +2 or draw cards' };
        }
        if (topCard.value === 'wild_draw4' && !canStackDraw4(card, topCard, true)) {
            return { success: false, error: 'Must stack +4 or draw cards' };
        }
    } else if (!isValidPlay(card, topCard, state.currentColor, state)) {
        return { success: false, error: 'Invalid play' };
    }

    // Remove card from hand
    hand.splice(cardIndex, 1);
    const player = state.players.find(p => p.id === playerId);
    if (player) player.cardCount = hand.length;

    // Set color for wild cards
    if (card.type === 'wild') {
        if (!chosenColor || !COLORS.includes(chosenColor)) {
            return { success: false, error: 'Must choose a color for wild card' };
        }
        card.color = chosenColor;
        state.currentColor = chosenColor;
        state.playerStats[playerId].wildCards++;
    } else {
        state.currentColor = card.color;
    }

    // Place on discard pile
    state.discardPile.push(card);
    state.playerStats[playerId].cardsPlayed++;
    if (card.type === 'action') state.playerStats[playerId].specialCards++;

    // Reset UNO call tracking for this player
    delete state.unoCalledBy[playerId];

    // Apply card effects
    const effects = applyCardEffect(card, state);

    if (effects.reverseDirection) {
        state.direction *= -1;
        if (state.players.length === 2) {
            effects.skipNext = true;
        }
    }

    // Check for win
    if (hand.length === 0) {
        state.winner = playerId;
        state.gameOver = true;
        return { success: true, card, effects, gameOver: true };
    }

    // Advance turn
    state.currentPlayerIndex = getNextPlayerIndex(state);

    if (effects.skipNext) {
        // Skip next player
        if (effects.drawCards > 0 && !state.stackingEnabled) {
            const skippedId = state.players[state.currentPlayerIndex].id;
            drawCards(state, skippedId, effects.drawCards);
        }
        state.currentPlayerIndex = getNextPlayerIndex(state);
    }

    state.turnStartTime = Date.now();
    return { success: true, card, effects, gameOver: false };
}

/**
 * Handle a player drawing a card (when they can't or don't want to play)
 */
function handleDrawCard(state, playerId) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
        return { success: false, error: 'Not your turn' };
    }

    // If there's a pending draw stack, player must draw all
    if (state.stackingEnabled && state.drawStack > 0) {
        const drawn = drawCards(state, playerId, state.drawStack);
        state.drawStack = 0;
        state.currentPlayerIndex = getNextPlayerIndex(state);
        state.turnStartTime = Date.now();
        return { success: true, drawnCards: drawn, count: drawn.length };
    }

    // Normal draw: draw 1 card
    const drawn = drawCards(state, playerId, 1);

    // Check if drawn card can be played
    const topCard = state.discardPile[state.discardPile.length - 1];
    const canPlay = drawn.length > 0 && isValidPlay(drawn[0], topCard, state.currentColor, state);

    if (!canPlay) {
        state.currentPlayerIndex = getNextPlayerIndex(state);
        state.turnStartTime = Date.now();
    }

    return { success: true, drawnCards: drawn, count: drawn.length, canPlayDrawn: canPlay };
}

/**
 * Handle UNO call
 */
function callUno(state, playerId) {
    const hand = state.hands[playerId];
    if (hand && hand.length <= 2) {
        state.unoCalledBy[playerId] = true;
        state.playerStats[playerId].unoCalls++;
        return { success: true };
    }
    return { success: false, error: 'Can only call UNO with 1-2 cards' };
}

/**
 * Catch a player who didn't call UNO (they have 1 card and haven't called)
 */
function catchUno(state, catcherId, targetId) {
    const targetHand = state.hands[targetId];
    if (!targetHand || targetHand.length !== 1) {
        return { success: false, error: 'Target does not have exactly 1 card' };
    }
    if (state.unoCalledBy[targetId]) {
        return { success: false, error: 'Player already called UNO' };
    }
    // Penalty: draw 2 cards
    const drawn = drawCards(state, targetId, 2);
    state.playerStats[catcherId].catchUnos++;
    return { success: true, penaltyCards: drawn.length };
}

/**
 * Get sanitized game state visible to a specific player
 */
function getPlayerView(state, playerId) {
    const view = {
        players: state.players.map(p => ({
            ...p,
            hand: p.id === playerId ? state.hands[p.id] : undefined,
            cardCount: state.hands[p.id] ? state.hands[p.id].length : 0,
        })),
        discardPile: state.discardPile.slice(-5),
        topCard: state.discardPile[state.discardPile.length - 1],
        drawPileCount: state.drawPile.length,
        currentPlayerIndex: state.currentPlayerIndex,
        currentPlayerId: state.players[state.currentPlayerIndex]?.id,
        direction: state.direction,
        currentColor: state.currentColor,
        myHand: state.hands[playerId] || [],
        stackingEnabled: state.stackingEnabled,
        drawStack: state.drawStack,
        turnTimer: state.turnTimer,
        turnStartTime: state.turnStartTime,
        unoCalledBy: state.unoCalledBy,
        winner: state.winner,
        gameOver: state.gameOver,
        mode: state.mode,
        teamMode: state.teamMode,
        teams: state.teams,
    };
    return view;
}

/**
 * Handle turn timeout — auto-draw
 */
function handleTurnTimeout(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return null;

    if (state.stackingEnabled && state.drawStack > 0) {
        drawCards(state, currentPlayer.id, state.drawStack);
        state.drawStack = 0;
    } else {
        drawCards(state, currentPlayer.id, 1);
    }
    state.currentPlayerIndex = getNextPlayerIndex(state);
    state.turnStartTime = Date.now();
    return currentPlayer.id;
}

/**
 * Check for team win (all members of a team have 0 cards)
 */
function checkTeamWin(state) {
    if (!state.teamMode || !state.teams) return null;
    for (const [teamName, memberIds] of Object.entries(state.teams)) {
        const allOut = memberIds.every(id => state.hands[id] && state.hands[id].length === 0);
        if (allOut) return teamName;
    }
    return null;
}

module.exports = {
    createGameState,
    getNextPlayerIndex,
    drawCards,
    playCard,
    handleDrawCard,
    callUno,
    catchUno,
    getPlayerView,
    handleTurnTimeout,
    checkTeamWin,
};

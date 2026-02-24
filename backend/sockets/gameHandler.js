const { createGameState, playCard, handleDrawCard, callUno, catchUno, getPlayerView, handleTurnTimeout, drawCards } = require('../gameEngine/gameState');
const { getAiMove, shouldCallUno } = require('../gameEngine/aiPlayer');
const { calculateHandScore, getValidCards } = require('../gameEngine/rules');
const { calculateMatchXp } = require('../utils/xpSystem');
const playerService = require('../services/playerService');
const matchService = require('../services/matchService');
const { getRoom, rooms } = require('./roomHandler');

// Active game states
const activeGames = new Map();
// Turn timers
const turnTimers = new Map();
// Socket-to-player mapping for reconnection
const playerSockets = new Map();

function setupGameHandler(io) {
    io.on('connection', (socket) => {
        // --- ROOM EVENTS ---
        const roomHandler = require('./roomHandler');

        socket.on('createRoom', (data, callback) => {
            const room = roomHandler.createRoom({
                ...data,
                hostId: socket.id,
                hostUsername: data.username,
            });
            socket.join(room.id);
            playerSockets.set(socket.id, { roomId: room.id, username: data.username });
            callback({ success: true, room });
            io.emit('roomsUpdated', roomHandler.getPublicRooms());
        });

        socket.on('joinRoom', (data, callback) => {
            const result = roomHandler.joinRoom(data.roomId, socket.id, data.username, data.password);
            if (result.error) return callback({ success: false, error: result.error });
            socket.join(data.roomId);
            playerSockets.set(socket.id, { roomId: data.roomId, username: data.username });
            callback({ success: true, room: result.room });
            io.to(data.roomId).emit('roomUpdated', result.room);
            io.emit('roomsUpdated', roomHandler.getPublicRooms());
        });

        socket.on('leaveRoom', (data) => {
            const roomId = data?.roomId || playerSockets.get(socket.id)?.roomId;
            if (!roomId) return;
            const result = roomHandler.leaveRoom(roomId, socket.id);
            socket.leave(roomId);
            playerSockets.delete(socket.id);
            if (!result.deleted) {
                io.to(roomId).emit('roomUpdated', result.room);
            }
            io.emit('roomsUpdated', roomHandler.getPublicRooms());
        });

        socket.on('getRooms', (callback) => {
            if (typeof callback === 'function') callback(roomHandler.getPublicRooms());
        });

        socket.on('updateRoomSettings', (data) => {
            const room = roomHandler.updateRoomSettings(data.roomId, data.settings);
            if (room) io.to(data.roomId).emit('roomUpdated', room);
        });

        socket.on('addBot', (data, callback) => {
            const result = roomHandler.addBot(data.roomId, data.difficulty);
            if (result.error) return callback?.({ success: false, error: result.error });
            io.to(data.roomId).emit('roomUpdated', result.room);
            callback?.({ success: true });
        });

        socket.on('removeBot', (data, callback) => {
            const result = roomHandler.removeBot(data.roomId, data.botId);
            if (result.error) return callback?.({ success: false, error: result.error });
            io.to(data.roomId).emit('roomUpdated', result.room);
            callback?.({ success: true });
        });

        // --- GAME EVENTS ---
        socket.on('startGame', (data, callback) => {
            const room = getRoom(data.roomId);
            if (!room) return callback?.({ success: false, error: 'Room not found' });
            if (room.hostId !== socket.id) return callback?.({ success: false, error: 'Only host can start' });
            if (room.players.length < 2) return callback?.({ success: false, error: 'Need at least 2 players' });

            room.status = 'playing';

            // Setup teams if team mode
            let teams = null;
            if (room.settings.teamMode && room.players.length >= 4) {
                teams = {};
                const teamSize = Math.floor(room.players.length / 2);
                teams['Team A'] = room.players.slice(0, teamSize).map(p => p.id);
                teams['Team B'] = room.players.slice(teamSize, teamSize * 2).map(p => p.id);
            }

            const gameState = createGameState(room.players, {
                stackingEnabled: room.settings.stackingEnabled,
                teamMode: room.settings.teamMode,
                teams,
                turnTimer: room.settings.turnTimer,
                mode: room.settings.stackingEnabled ? 'stacking' : 'classic',
            });

            activeGames.set(data.roomId, gameState);
            room.gameState = gameState;

            // Send personalized views to each player
            broadcastGameState(io, data.roomId, gameState);
            callback?.({ success: true });

            // Start turn timer
            startTurnTimer(io, data.roomId);

            // If first player is a bot, trigger AI move
            checkAndPlayBot(io, data.roomId);
        });

        socket.on('playCard', (data, callback) => {
            const gameState = activeGames.get(data.roomId);
            if (!gameState) return callback?.({ success: false, error: 'No active game' });

            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            if (currentPlayer.id !== socket.id) return callback?.({ success: false, error: 'Not your turn' });

            const result = playCard(gameState, socket.id, data.cardId, data.chosenColor);
            if (!result.success) return callback?.({ success: false, error: result.error });

            callback?.({ success: true, card: result.card });

            broadcastGameState(io, data.roomId, gameState);

            if (result.gameOver) {
                handleGameOver(io, data.roomId, gameState);
            } else {
                resetTurnTimer(io, data.roomId);
                checkAndPlayBot(io, data.roomId);
            }
        });

        socket.on('drawCard', (data, callback) => {
            const gameState = activeGames.get(data.roomId);
            if (!gameState) return callback?.({ success: false, error: 'No active game' });

            const result = handleDrawCard(gameState, socket.id);
            if (!result.success) return callback?.({ success: false, error: result.error });

            callback?.({ success: true, drawnCards: result.drawnCards, canPlayDrawn: result.canPlayDrawn });

            broadcastGameState(io, data.roomId, gameState);

            if (!result.canPlayDrawn) {
                resetTurnTimer(io, data.roomId);
                checkAndPlayBot(io, data.roomId);
            }
        });

        socket.on('callUNO', (data, callback) => {
            const gameState = activeGames.get(data.roomId);
            if (!gameState) return callback?.({ success: false, error: 'No active game' });

            const result = callUno(gameState, socket.id);
            callback?.({ success: result.success, error: result.error });

            if (result.success) {
                io.to(data.roomId).emit('unoCall', {
                    playerId: socket.id,
                    username: gameState.players.find(p => p.id === socket.id)?.username,
                });
                broadcastGameState(io, data.roomId, gameState);
            }
        });

        socket.on('catchUNO', (data, callback) => {
            const gameState = activeGames.get(data.roomId);
            if (!gameState) return callback?.({ success: false, error: 'No active game' });

            const result = catchUno(gameState, socket.id, data.targetId);
            callback?.({ success: result.success, error: result.error });

            if (result.success) {
                io.to(data.roomId).emit('unoCaught', {
                    catcherId: socket.id,
                    targetId: data.targetId,
                    penaltyCards: result.penaltyCards,
                });
                broadcastGameState(io, data.roomId, gameState);
            }
        });

        // --- CHAT ---
        socket.on('chatMessage', (data) => {
            const playerInfo = playerSockets.get(socket.id);
            if (!playerInfo) return;
            io.to(data.roomId || playerInfo.roomId).emit('chatMessage', {
                id: Date.now(),
                username: playerInfo.username,
                message: data.message,
                timestamp: Date.now(),
            });
        });

        socket.on('emojiReaction', (data) => {
            const playerInfo = playerSockets.get(socket.id);
            if (!playerInfo) return;
            io.to(data.roomId || playerInfo.roomId).emit('emojiReaction', {
                username: playerInfo.username,
                emoji: data.emoji,
                playerId: socket.id,
            });
        });

        // --- RECONNECTION ---
        socket.on('reconnectPlayer', (data, callback) => {
            const { roomId, username } = data;
            const room = getRoom(roomId);
            if (!room) return callback?.({ success: false, error: 'Room not found' });

            const player = room.players.find(p => p.username === username && !p.isBot);
            if (!player) return callback?.({ success: false, error: 'Player not found in room' });

            // Update socket mapping
            const oldSocketId = player.id;
            player.id = socket.id;
            player.connected = true;

            // Update game state references
            const gameState = activeGames.get(roomId);
            if (gameState) {
                const gsPlayer = gameState.players.find(p => p.id === oldSocketId);
                if (gsPlayer) gsPlayer.id = socket.id;
                if (gameState.hands[oldSocketId]) {
                    gameState.hands[socket.id] = gameState.hands[oldSocketId];
                    delete gameState.hands[oldSocketId];
                }
                if (gameState.playerStats[oldSocketId]) {
                    gameState.playerStats[socket.id] = gameState.playerStats[oldSocketId];
                    delete gameState.playerStats[oldSocketId];
                }
                if (gameState.unoCalledBy[oldSocketId]) {
                    gameState.unoCalledBy[socket.id] = true;
                    delete gameState.unoCalledBy[oldSocketId];
                }
            }

            if (room.hostId === oldSocketId) room.hostId = socket.id;

            socket.join(roomId);
            playerSockets.set(socket.id, { roomId, username });

            callback?.({
                success: true,
                room,
                gameState: gameState ? getPlayerView(gameState, socket.id) : null,
            });

            io.to(roomId).emit('playerReconnected', { username });
        });

        // --- DISCONNECT ---
        socket.on('disconnect', () => {
            const playerInfo = playerSockets.get(socket.id);
            if (!playerInfo) return;

            const room = getRoom(playerInfo.roomId);
            if (!room) {
                playerSockets.delete(socket.id);
                return;
            }

            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                player.connected = false;
                io.to(playerInfo.roomId).emit('playerDisconnected', {
                    username: playerInfo.username,
                    playerId: socket.id,
                });
            }

            // Don't remove from room immediately (allow reconnect)
            // Only clean up after 60 seconds
            setTimeout(() => {
                const currentRoom = getRoom(playerInfo.roomId);
                if (!currentRoom) return;
                const currentPlayer = currentRoom.players.find(p => p.id === socket.id);
                if (currentPlayer && !currentPlayer.connected) {
                    const result = require('./roomHandler').leaveRoom(playerInfo.roomId, socket.id);
                    if (!result.deleted) {
                        io.to(playerInfo.roomId).emit('roomUpdated', result.room);
                    }
                    io.emit('roomsUpdated', require('./roomHandler').getPublicRooms());
                }
                playerSockets.delete(socket.id);
            }, 60000);
        });
    });
}

/**
 * Broadcast game state to all players (each gets their own view)
 */
function broadcastGameState(io, roomId, gameState) {
    const room = getRoom(roomId);
    if (!room) return;

    for (const player of room.players) {
        if (player.isBot) continue;
        const view = getPlayerView(gameState, player.id);
        io.to(player.id).emit('gameStateUpdate', view);
    }
}

/**
 * Start turn timer
 */
function startTurnTimer(io, roomId) {
    clearTurnTimer(roomId);
    const gameState = activeGames.get(roomId);
    if (!gameState || gameState.gameOver) return;

    const timer = setTimeout(() => {
        const gs = activeGames.get(roomId);
        if (!gs || gs.gameOver) return;
        const timedOutPlayer = handleTurnTimeout(gs);
        if (timedOutPlayer) {
            io.to(roomId).emit('turnTimeout', { playerId: timedOutPlayer });
            broadcastGameState(io, roomId, gs);
            startTurnTimer(io, roomId);
            checkAndPlayBot(io, roomId);
        }
    }, (gameState.turnTimer || 30) * 1000);

    turnTimers.set(roomId, timer);
}

function resetTurnTimer(io, roomId) {
    startTurnTimer(io, roomId);
}

function clearTurnTimer(roomId) {
    const timer = turnTimers.get(roomId);
    if (timer) {
        clearTimeout(timer);
        turnTimers.delete(roomId);
    }
}

/**
 * Check if current player is a bot and play
 */
function checkAndPlayBot(io, roomId) {
    const gameState = activeGames.get(roomId);
    if (!gameState || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.isBot) return;

    // AI thinking delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
        const gs = activeGames.get(roomId);
        if (!gs || gs.gameOver) return;
        const cp = gs.players[gs.currentPlayerIndex];
        if (!cp || cp.id !== currentPlayer.id) return;

        const hand = gs.hands[currentPlayer.id];
        const topCard = gs.discardPile[gs.discardPile.length - 1];
        const difficulty = currentPlayer.botDifficulty || 'medium';

        const move = getAiMove(hand, topCard, gs.currentColor, gs, difficulty);

        if (move.action === 'draw') {
            const result = handleDrawCard(gs, currentPlayer.id);
            if (result.canPlayDrawn) {
                // Try to play the drawn card
                const drawnCard = result.drawnCards[0];
                const topAfterDraw = gs.discardPile[gs.discardPile.length - 1];
                const moveAfterDraw = getAiMove([drawnCard], topAfterDraw, gs.currentColor, gs, difficulty);
                if (moveAfterDraw.action === 'play') {
                    const playResult = playCard(gs, currentPlayer.id, moveAfterDraw.card.id, moveAfterDraw.chosenColor);
                    if (playResult.gameOver) {
                        broadcastGameState(io, roomId, gs);
                        handleGameOver(io, roomId, gs);
                        return;
                    }
                }
            }
        } else {
            // UNO call
            if (shouldCallUno(hand)) {
                callUno(gs, currentPlayer.id);
                io.to(roomId).emit('unoCall', { playerId: currentPlayer.id, username: currentPlayer.username });
            }

            const result = playCard(gs, currentPlayer.id, move.card.id, move.chosenColor);
            if (result.gameOver) {
                broadcastGameState(io, roomId, gs);
                handleGameOver(io, roomId, gs);
                return;
            }
        }

        broadcastGameState(io, roomId, gs);
        resetTurnTimer(io, roomId);
        // Chain bot turns
        checkAndPlayBot(io, roomId);
    }, delay);
}

/**
 * Handle game over — update stats, record match
 */
function handleGameOver(io, roomId, gameState) {
    clearTurnTimer(roomId);

    const winner = gameState.players.find(p => p.id === gameState.winner);
    const duration = Math.round((Date.now() - gameState.startedAt) / 1000);

    // Calculate scores and XP
    const playerScores = gameState.players.map(p => {
        const hand = gameState.hands[p.id] || [];
        const score = calculateHandScore(hand);
        const stats = gameState.playerStats[p.id] || {};
        const isWinner = p.id === gameState.winner;
        const xp = calculateMatchXp(
            isWinner,
            stats.cardsPlayed || 0,
            stats.unoCalls || 0,
            stats.catchUnos || 0,
            stats.specialCards || 0,
            stats.wildCards || 0
        );

        return {
            playerId: p.id,
            playerName: p.username,
            score,
            cardsPlayed: stats.cardsPlayed || 0,
            isWinner,
            xp,
            isBot: p.isBot,
        };
    });

    // Update database for human players
    const updatedPlayers = [];
    for (const ps of playerScores) {
        if (!ps.isBot) {
            try {
                const updated = playerService.updateStats(ps.playerName, ps.isWinner, ps.xp);
                updatedPlayers.push(updated);
            } catch (e) {
                console.error('Failed to update player stats:', e.message);
            }
        }
    }

    // Record match
    try {
        matchService.recordMatch(
            roomId,
            winner?.username || 'Unknown',
            gameState.mode,
            gameState.players.length,
            duration,
            playerScores.map(ps => ({
                playerName: ps.playerName,
                score: ps.score,
                cardsPlayed: ps.cardsPlayed,
            }))
        );
    } catch (e) {
        console.error('Failed to record match:', e.message);
    }

    io.to(roomId).emit('gameOver', {
        winner: winner ? { id: winner.id, username: winner.username } : null,
        scores: playerScores,
        duration,
        updatedPlayers,
    });

    // Clean up game state
    const room = getRoom(roomId);
    if (room) {
        room.status = 'waiting';
        room.gameState = null;
        // Reset player ready status
        room.players.forEach(p => { p.ready = false; });
        io.to(roomId).emit('roomUpdated', room);
    }
    activeGames.delete(roomId);
}

module.exports = { setupGameHandler, activeGames, playerSockets };

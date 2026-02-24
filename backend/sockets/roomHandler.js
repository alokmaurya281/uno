const { v4: uuidv4 } = require('uuid');

// In-memory room storage
const rooms = new Map();

const BOT_NAMES = ['RoboUno', 'CardBot', 'UnoAI', 'DigitalDave', 'CyberSue', 'BotBilly', 'AutoAnna', 'MechMike'];

function createRoom(data) {
    const { roomName, isPublic, password, hostId, hostUsername } = data;
    const roomId = uuidv4().slice(0, 8).toUpperCase();
    const room = {
        id: roomId,
        name: roomName || `${hostUsername}'s Room`,
        isPublic: isPublic !== false,
        password: password || null,
        hostId,
        players: [{
            id: hostId,
            username: hostUsername,
            isBot: false,
            ready: false,
            connected: true,
        }],
        settings: {
            stackingEnabled: false,
            teamMode: false,
            turnTimer: 30,
            maxPlayers: 10,
        },
        status: 'waiting', // waiting, playing, finished
        gameState: null,
        createdAt: Date.now(),
    };
    rooms.set(roomId, room);
    return room;
}

function joinRoom(roomId, playerId, username, password) {
    const room = rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.status !== 'waiting') return { error: 'Game already in progress' };
    if (room.players.length >= room.settings.maxPlayers) return { error: 'Room is full' };
    if (room.password && room.password !== password) return { error: 'Incorrect password' };

    const existing = room.players.find(p => p.id === playerId);
    if (existing) {
        existing.connected = true;
        return { room };
    }

    room.players.push({
        id: playerId,
        username,
        isBot: false,
        ready: false,
        connected: true,
    });
    return { room };
}

function leaveRoom(roomId, playerId) {
    const room = rooms.get(roomId);
    if (!room) return { error: 'Room not found' };

    room.players = room.players.filter(p => p.id !== playerId);

    if (room.players.length === 0) {
        rooms.delete(roomId);
        return { deleted: true };
    }

    // Transfer host if needed
    if (room.hostId === playerId) {
        const humanPlayers = room.players.filter(p => !p.isBot);
        if (humanPlayers.length > 0) {
            room.hostId = humanPlayers[0].id;
        }
    }

    return { room };
}

function addBot(roomId, difficulty = 'medium') {
    const room = rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    if (room.players.length >= room.settings.maxPlayers) return { error: 'Room is full' };

    const botName = BOT_NAMES[room.players.filter(p => p.isBot).length % BOT_NAMES.length];
    const botId = `bot-${uuidv4().slice(0, 6)}`;

    room.players.push({
        id: botId,
        username: `${botName} (${difficulty})`,
        isBot: true,
        botDifficulty: difficulty,
        ready: true,
        connected: true,
    });

    return { room, botId };
}

function removeBot(roomId, botId) {
    const room = rooms.get(roomId);
    if (!room) return { error: 'Room not found' };
    room.players = room.players.filter(p => p.id !== botId);
    return { room };
}

function getPublicRooms() {
    const publicRooms = [];
    for (const [id, room] of rooms) {
        if (room.isPublic && room.status === 'waiting') {
            publicRooms.push({
                id: room.id,
                name: room.name,
                playerCount: room.players.length,
                maxPlayers: room.settings.maxPlayers,
                hasPassword: !!room.password,
                hostUsername: room.players.find(p => p.id === room.hostId)?.username,
                settings: room.settings,
            });
        }
    }
    return publicRooms;
}

function getRoom(roomId) {
    return rooms.get(roomId);
}

function updateRoomSettings(roomId, settings) {
    const room = rooms.get(roomId);
    if (!room) return null;
    room.settings = { ...room.settings, ...settings };
    return room;
}

module.exports = {
    rooms,
    createRoom,
    joinRoom,
    leaveRoom,
    addBot,
    removeBot,
    getPublicRooms,
    getRoom,
    updateRoomSettings,
};

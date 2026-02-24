const db = require('../db/database');
const { calculateLevel, getXpForNextLevel } = require('../utils/xpSystem');

const playerService = {
    /**
     * Find or create player by username
     */
    findOrCreate(username) {
        let player = db.prepare('SELECT * FROM players WHERE username = ?').get(username);
        if (!player) {
            const info = db.prepare('INSERT INTO players (username) VALUES (?)').run(username);
            player = db.prepare('SELECT * FROM players WHERE id = ?').get(info.lastInsertRowid);
        }
        return player;
    },

    /**
     * Get player by ID
     */
    getById(id) {
        return db.prepare('SELECT * FROM players WHERE id = ?').get(id);
    },

    /**
     * Get player by username
     */
    getByUsername(username) {
        return db.prepare('SELECT * FROM players WHERE username = ?').get(username);
    },

    /**
     * Update player stats after a game
     */
    updateStats(username, isWinner, xpGained) {
        const player = this.findOrCreate(username);
        const newXp = player.xp + xpGained;
        const newLevel = calculateLevel(newXp);

        db.prepare(`
      UPDATE players SET
        total_games = total_games + 1,
        total_wins = total_wins + ?,
        xp = ?,
        level = ?
      WHERE username = ?
    `).run(isWinner ? 1 : 0, newXp, newLevel, username);

        return {
            ...player,
            total_games: player.total_games + 1,
            total_wins: player.total_wins + (isWinner ? 1 : 0),
            xp: newXp,
            level: newLevel,
            xpGained,
            leveledUp: newLevel > player.level,
            xpForNextLevel: getXpForNextLevel(newLevel),
        };
    },

    /**
     * Get leaderboard (top players by XP)
     */
    getLeaderboard(limit = 50) {
        return db.prepare(`
      SELECT id, username, total_games, total_wins, xp, level, created_at
      FROM players
      ORDER BY xp DESC
      LIMIT ?
    `).all(limit);
    },

    /**
     * Get player stats with rank
     */
    getPlayerStats(username) {
        const player = this.getByUsername(username);
        if (!player) return null;

        const rank = db.prepare(`
      SELECT COUNT(*) + 1 as rank FROM players WHERE xp > ?
    `).get(player.xp);

        return {
            ...player,
            rank: rank.rank,
            xpForNextLevel: getXpForNextLevel(player.level),
            winRate: player.total_games > 0
                ? Math.round((player.total_wins / player.total_games) * 100)
                : 0,
        };
    },
};

module.exports = playerService;

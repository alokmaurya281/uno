const db = require('../db/database');

const matchService = {
    /**
     * Record a completed match
     */
    recordMatch(roomId, winner, mode, playersCount, durationSeconds, playerScores) {
        const info = db.prepare(`
      INSERT INTO matches (room_id, winner, mode, players_count, duration_seconds)
      VALUES (?, ?, ?, ?, ?)
    `).run(roomId, winner, mode, playersCount, durationSeconds);

        const matchId = info.lastInsertRowid;

        const insertPlayer = db.prepare(`
      INSERT INTO match_players (match_id, player_name, score, cards_played)
      VALUES (?, ?, ?, ?)
    `);

        const insertAll = db.transaction((scores) => {
            for (const ps of scores) {
                insertPlayer.run(matchId, ps.playerName, ps.score, ps.cardsPlayed);
            }
        });

        insertAll(playerScores);
        return matchId;
    },

    /**
     * Get recent matches
     */
    getRecentMatches(limit = 20) {
        const matches = db.prepare(`
      SELECT * FROM matches ORDER BY created_at DESC LIMIT ?
    `).all(limit);

        return matches.map(m => ({
            ...m,
            players: db.prepare(`
        SELECT * FROM match_players WHERE match_id = ?
      `).all(m.id),
        }));
    },

    /**
     * Get match by ID
     */
    getMatchById(id) {
        const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
        if (!match) return null;
        match.players = db.prepare('SELECT * FROM match_players WHERE match_id = ?').all(id);
        return match;
    },

    /**
     * Get match history for a player
     */
    getPlayerHistory(username, limit = 20) {
        return db.prepare(`
      SELECT m.*, mp.score, mp.cards_played
      FROM matches m
      JOIN match_players mp ON mp.match_id = m.id
      WHERE mp.player_name = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(username, limit);
    },
};

module.exports = matchService;

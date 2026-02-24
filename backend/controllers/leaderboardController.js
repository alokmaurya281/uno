const express = require('express');
const playerService = require('../services/playerService');
const router = express.Router();

// GET /api/leaderboard
router.get('/leaderboard', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = playerService.getLeaderboard(limit);
        res.json({ success: true, data: leaderboard });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/players/:username/stats
router.get('/players/:username/stats', (req, res) => {
    try {
        const stats = playerService.getPlayerStats(req.params.username);
        if (!stats) return res.status(404).json({ success: false, error: 'Player not found' });
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/players — register/fetch player
router.post('/players', (req, res) => {
    try {
        const { username } = req.body;
        if (!username || username.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Username must be at least 2 characters' });
        }
        const player = playerService.findOrCreate(username.trim());
        const stats = playerService.getPlayerStats(username.trim());
        res.json({ success: true, data: stats || player });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

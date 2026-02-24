const express = require('express');
const matchService = require('../services/matchService');
const router = express.Router();

// GET /api/matches
router.get('/matches', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const matches = matchService.getRecentMatches(limit);
        res.json({ success: true, data: matches });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/matches/:id
router.get('/matches/:id', (req, res) => {
    try {
        const match = matchService.getMatchById(parseInt(req.params.id));
        if (!match) return res.status(404).json({ success: false, error: 'Match not found' });
        res.json({ success: true, data: match });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/players/:username/history
router.get('/players/:username/history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const history = matchService.getPlayerHistory(req.params.username, limit);
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

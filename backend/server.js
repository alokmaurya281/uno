const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Initialize database (creates tables on import)
require('./db/database');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

const io = new Server(server, {
    cors: {
        origin: isProduction ? '*' : FRONTEND_URL,
        methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Middleware
app.use(cors({ origin: isProduction ? '*' : FRONTEND_URL }));
app.use(express.json());

// REST Routes
app.use('/api', require('./controllers/leaderboardController'));
app.use('/api', require('./controllers/historyController'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Socket.io setup
const { setupGameHandler } = require('./sockets/gameHandler');
setupGameHandler(io);

// ---- Serve frontend (production) ----
const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

server.listen(PORT, () => {
    console.log(`🎮 UNO Server running on port ${PORT}`);
    console.log(`📁 Serving frontend from: ${distPath}`);
});

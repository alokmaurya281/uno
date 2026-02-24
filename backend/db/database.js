const Database = require('better-sqlite3');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const dbPath = process.env.DB_PATH
  ? path.resolve(ROOT, process.env.DB_PATH)
  : path.join(__dirname, 'uno.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    winner TEXT,
    mode TEXT DEFAULT 'classic',
    players_count INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS match_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    cards_played INTEGER DEFAULT 0,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
  CREATE INDEX IF NOT EXISTS idx_players_xp ON players(xp DESC);
  CREATE INDEX IF NOT EXISTS idx_matches_room ON matches(room_id);
  CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
`);

module.exports = db;

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('./database');

const samplePlayers = [
    { username: 'ProGamer42', total_games: 150, total_wins: 89, xp: 4500, level: 12 },
    { username: 'CardShark', total_games: 200, total_wins: 134, xp: 6700, level: 18 },
    { username: 'UnoMaster', total_games: 95, total_wins: 45, xp: 2300, level: 7 },
    { username: 'WildCard99', total_games: 300, total_wins: 198, xp: 9800, level: 25 },
    { username: 'SkipQueen', total_games: 75, total_wins: 38, xp: 1800, level: 5 },
    { username: 'ReverseKing', total_games: 180, total_wins: 110, xp: 5500, level: 15 },
    { username: 'DrawFourLord', total_games: 120, total_wins: 72, xp: 3600, level: 10 },
    { username: 'NeonNinja', total_games: 250, total_wins: 165, xp: 8200, level: 22 },
    { username: 'StackAttack', total_games: 60, total_wins: 25, xp: 1200, level: 4 },
    { username: 'ColorBlitz', total_games: 110, total_wins: 55, xp: 2800, level: 8 },
];

const insertPlayer = db.prepare(`
  INSERT OR IGNORE INTO players (username, total_games, total_wins, xp, level)
  VALUES (@username, @total_games, @total_wins, @xp, @level)
`);

const insertMany = db.transaction((players) => {
    for (const p of players) insertPlayer.run(p);
});

try {
    insertMany(samplePlayers);
    console.log(`✅ Seeded ${samplePlayers.length} sample players`);

    // Add sample matches
    const insertMatch = db.prepare(`
    INSERT INTO matches (room_id, winner, mode, players_count, duration_seconds)
    VALUES (?, ?, ?, ?, ?)
  `);
    const insertMatchPlayer = db.prepare(`
    INSERT INTO match_players (match_id, player_name, score, cards_played)
    VALUES (?, ?, ?, ?)
  `);

    const matchTx = db.transaction(() => {
        for (let i = 0; i < 5; i++) {
            const p1 = samplePlayers[i];
            const p2 = samplePlayers[i + 5];
            const info = insertMatch.run(`SEED-${i}`, p1.username, 'classic', 2, 180 + i * 60);
            insertMatchPlayer.run(info.lastInsertRowid, p1.username, 500 - i * 50, 15 + i);
            insertMatchPlayer.run(info.lastInsertRowid, p2.username, 300 + i * 30, 12 + i);
        }
    });
    matchTx();
    console.log('✅ Seeded 5 sample matches');
} catch (err) {
    console.error('Seed error:', err.message);
}

process.exit(0);

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LeaderboardPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [tab, setTab] = useState('leaderboard');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/leaderboard?limit=50')
            .then(r => r.json())
            .then(d => { if (d.success) setPlayers(d.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
        fetch('/api/matches?limit=20')
            .then(r => r.json())
            .then(d => { if (d.success) setMatches(d.data); })
            .catch(() => { });
    }, []);

    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-animated p-3 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3"
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">🏆 Rankings</h1>
                        <p className="text-[var(--text-secondary)] mt-0.5 text-xs sm:text-sm">Top UNO players worldwide</p>
                    </div>
                    <button className="btn-secondary px-3 py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto"
                        onClick={() => navigate('/lobby')}>← Back to Lobby</button>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all ${tab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTab('leaderboard')}>Leaderboard</button>
                    <button className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all ${tab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTab('history')}>Match History</button>
                </div>

                {tab === 'leaderboard' && (
                    <div className="space-y-2 sm:space-y-3">
                        {loading && <div className="text-center text-[var(--text-secondary)] py-12 text-sm">Loading...</div>}
                        {players.map((player, i) => (
                            <motion.div key={player.id}
                                className={`glass rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2 ${i < 3 ? 'neon-border' : ''}`}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}>
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <span className="text-lg sm:text-2xl w-7 sm:w-10 text-center flex-shrink-0">
                                        {medals[i] || <span className="text-xs sm:text-sm text-[var(--text-secondary)]">#{i + 1}</span>}
                                    </span>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center font-bold text-sm sm:text-lg flex-shrink-0">
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-xs sm:text-sm truncate">{player.username}</p>
                                        <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Lv. {player.level}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm flex-shrink-0">
                                    <div className="text-center hidden sm:block">
                                        <p className="text-[var(--neon-green)] font-bold">{player.total_wins}</p>
                                        <p className="text-[var(--text-secondary)] text-[10px]">Wins</p>
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <p>{player.total_games}</p>
                                        <p className="text-[var(--text-secondary)] text-[10px]">Games</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[var(--neon-yellow)] font-bold">{player.xp.toLocaleString()}</p>
                                        <p className="text-[var(--text-secondary)] text-[10px]">XP</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {!loading && players.length === 0 && (
                            <div className="text-center py-12 text-[var(--text-secondary)] text-sm">No players yet. Be the first! 🎮</div>
                        )}
                    </div>
                )}

                {tab === 'history' && (
                    <div className="space-y-2 sm:space-y-3">
                        {matches.map((match, i) => (
                            <motion.div key={match.id} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">#{match.id}</span>
                                    <span className="text-[10px] text-[var(--text-secondary)]">{new Date(match.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="text-[var(--neon-green)] font-bold text-xs sm:text-sm">🏆 {match.winner}</span>
                                        <span className="text-[var(--text-secondary)] text-[10px] sm:text-xs ml-1 sm:ml-2">
                                            {match.mode} • {match.players_count}p
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0">
                                        {Math.floor(match.duration_seconds / 60)}m{match.duration_seconds % 60}s
                                    </span>
                                </div>
                                {match.players && (
                                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                        {match.players.map(p => (
                                            <span key={p.id} className="text-[10px] bg-[var(--bg-card)] px-1.5 py-0.5 rounded">
                                                {p.player_name}: {p.score}pts
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {matches.length === 0 && (
                            <div className="text-center py-12 text-[var(--text-secondary)] text-sm">No matches yet 🎴</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

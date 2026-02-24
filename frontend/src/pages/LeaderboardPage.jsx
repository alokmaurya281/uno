import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('leaderboard');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/leaderboard?limit=50')
            .then((r) => r.json())
            .then((d) => { if (d.success) setPlayers(d.data); })
            .catch(() => { })
            .finally(() => setLoading(false));

        fetch('/api/matches?limit=20')
            .then((r) => r.json())
            .then((d) => { if (d.success) setMatches(d.data); })
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-[100dvh] bg-gradient-animated p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">

                {/* ---- Header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold neon-text">🏆 Rankings</h1>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Top UNO players</p>
                    </div>
                    <button className="btn-secondary py-2 px-5 w-full sm:w-auto" onClick={() => navigate('/lobby')}>
                        ← Back to Lobby
                    </button>
                </div>

                {/* ---- Tabs ---- */}
                <div className="flex gap-2 mb-5">
                    {['leaderboard', 'history'].map((t) => (
                        <button key={t}
                            className={`flex-1 sm:flex-none py-2 px-5 text-sm font-semibold capitalize ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTab(t)}>
                            {t === 'leaderboard' ? 'Leaderboard' : 'Match History'}
                        </button>
                    ))}
                </div>

                {/* ---- Leaderboard ---- */}
                {tab === 'leaderboard' && (
                    <div className="space-y-2">
                        {loading && <p className="text-center text-[var(--text-secondary)] py-12 text-sm">Loading…</p>}

                        {players.map((player, i) => (
                            <motion.div key={player.id}
                                className={`glass p-3.5 flex items-center justify-between gap-2 ${i < 3 ? 'neon-border' : ''}`}
                                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-lg w-8 text-center flex-shrink-0">
                                        {MEDALS[i] || <span className="text-xs text-[var(--text-secondary)]">#{i + 1}</span>}
                                    </span>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{player.username}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">Lv. {player.level}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 flex-shrink-0 text-sm">
                                    <div className="text-center hidden sm:block">
                                        <p className="text-[var(--neon-green)] font-bold">{player.total_wins}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">Wins</p>
                                    </div>
                                    <div className="text-center hidden md:block">
                                        <p>{player.total_games}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">Games</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[var(--neon-yellow)] font-bold">{player.xp.toLocaleString()}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]">XP</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {!loading && !players.length && (
                            <p className="text-center py-12 text-[var(--text-secondary)]">No players yet 🎮</p>
                        )}
                    </div>
                )}

                {/* ---- History ---- */}
                {tab === 'history' && (
                    <div className="space-y-2">
                        {matches.map((m, i) => (
                            <motion.div key={m.id} className="glass p-3.5"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">#{m.id}</span>
                                    <span className="text-[10px] text-[var(--text-secondary)]">{new Date(m.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="text-[var(--neon-green)] font-bold text-sm">🏆 {m.winner}</span>
                                        <span className="text-[var(--text-secondary)] text-xs ml-2">{m.mode} · {m.players_count}p</span>
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0">
                                        {Math.floor(m.duration_seconds / 60)}m {m.duration_seconds % 60}s
                                    </span>
                                </div>
                                {m.players && (
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                        {m.players.map((p) => (
                                            <span key={p.id} className="text-[10px] bg-[var(--bg-card)] px-1.5 py-0.5 rounded">
                                                {p.player_name}: {p.score}pts
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {!matches.length && <p className="text-center py-12 text-[var(--text-secondary)]">No matches yet 🎴</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

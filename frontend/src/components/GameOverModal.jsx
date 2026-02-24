import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function GameOverModal({ data, roomId }) {
    const navigate = useNavigate();
    if (!data) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <motion.div
                    className="glass-strong p-6 sm:p-8 w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl safe-bottom"
                    initial={{ y: 80 }} animate={{ y: 0 }}
                >
                    {/* Winner */}
                    <div className="text-center mb-5">
                        <motion.div className="text-5xl mb-2"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: 2 }}>
                            🏆
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl font-bold neon-text">{data.winner?.username || 'Game'} Wins!</h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {Math.floor(data.duration / 60)}m {data.duration % 60}s
                        </p>
                    </div>

                    {/* Scores */}
                    <div className="space-y-1.5 mb-5">
                        {data.scores?.sort((a, b) => b.xp - a.xp).map((ps, i) => (
                            <motion.div
                                key={ps.playerId || i}
                                className={`glass p-3 flex items-center justify-between ${ps.isWinner ? 'neon-border' : ''}`}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.08 * i }}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-bold w-5">#{i + 1}</span>
                                    <span className="text-sm font-semibold truncate">{ps.playerName}</span>
                                    {ps.isBot && <span className="text-[9px]">🤖</span>}
                                </div>
                                <span className="text-[var(--neon-green)] font-bold text-sm flex-shrink-0">+{ps.xp} XP</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Level up */}
                    {data.updatedPlayers?.filter(p => p.leveledUp).map(p => (
                        <motion.p key={p.username} className="text-center text-[var(--neon-yellow)] font-bold mb-3 text-sm"
                            animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 3, duration: 0.5 }}>
                            ⬆️ Level Up! Lv. {p.level}
                        </motion.p>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button className="btn-primary flex-1 py-3 rounded-xl text-sm"
                            onClick={() => navigate(`/room/${roomId}`)}>Play Again</button>
                        <button className="btn-secondary flex-1 py-3 rounded-xl text-sm"
                            onClick={() => navigate('/lobby')}>Lobby</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

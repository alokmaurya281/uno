import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function GameOverModal({ data, roomId }) {
    const navigate = useNavigate();
    if (!data) return null;

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="glass-strong rounded-t-2xl sm:rounded-3xl p-5 sm:p-8 w-full sm:max-w-lg max-h-[85vh] overflow-y-auto safe-bottom"
                    initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                    {/* Winner */}
                    <div className="text-center mb-4 sm:mb-6">
                        <motion.div className="text-4xl sm:text-6xl mb-2"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: 2 }}>🏆</motion.div>
                        <h2 className="text-xl sm:text-3xl font-bold neon-text">{data.winner?.username || 'Game'} Wins!</h2>
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
                            Duration: {Math.floor(data.duration / 60)}m {data.duration % 60}s
                        </p>
                    </div>

                    {/* Scores */}
                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                        {data.scores?.sort((a, b) => b.xp - a.xp).map((ps, i) => (
                            <motion.div key={ps.playerId || i}
                                className={`glass rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center justify-between ${ps.isWinner ? 'neon-border' : ''}`}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm sm:text-lg font-bold w-5 sm:w-6">#{i + 1}</span>
                                    <span className="font-semibold text-xs sm:text-sm truncate max-w-[100px]">{ps.playerName}</span>
                                    {ps.isBot && <span className="text-[9px] text-[var(--text-secondary)]">🤖</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs sm:text-sm">
                                    <span className="text-[var(--text-secondary)] hidden sm:inline">{ps.cardsPlayed} cards</span>
                                    <span className="text-[var(--neon-green)] font-bold">+{ps.xp} XP</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Level up */}
                    {data.updatedPlayers?.filter(p => p.leveledUp).map(p => (
                        <motion.div key={p.username} className="text-center mb-3"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <motion.div className="text-[var(--neon-yellow)] text-sm sm:text-lg font-bold"
                                animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 3, duration: 0.5 }}>
                                ⬆️ Level Up! Level {p.level}
                            </motion.div>
                        </motion.div>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-2 sm:gap-3">
                        <button className="btn-primary flex-1 py-2.5 sm:py-3 rounded-xl text-sm"
                            onClick={() => navigate(`/room/${roomId}`)}>Play Again</button>
                        <button className="btn-secondary flex-1 py-2.5 sm:py-3 rounded-xl text-sm"
                            onClick={() => navigate('/lobby')}>Lobby</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

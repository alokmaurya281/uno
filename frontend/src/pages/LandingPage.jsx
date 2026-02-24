import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

const floatingCards = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][i % 4],
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 8,
    size: 20 + Math.random() * 30,
}));

export default function LandingPage() {
    const navigate = useNavigate();
    const username = useUserStore(s => s.username);

    const handlePlay = () => navigate(username ? '/lobby' : '/username');

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-animated flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Floating card particles */}
            {floatingCards.map(card => (
                <motion.div
                    key={card.id}
                    className="absolute rounded-lg opacity-15 pointer-events-none"
                    style={{
                        width: card.size,
                        height: card.size * 1.4,
                        background: card.color,
                        left: `${card.x}%`,
                        bottom: '-10%',
                    }}
                    animate={{
                        y: [0, -1200],
                        rotate: [0, 360],
                        opacity: [0, 0.15, 0.15, 0],
                    }}
                    transition={{
                        duration: card.duration,
                        delay: card.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}

            {/* Main content */}
            <motion.div
                className="z-10 text-center w-full max-w-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Logo */}
                <motion.div
                    className="mb-6 md:mb-8"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff3b5c] via-[#ffe14d] to-[#00d4ff]">
                            UNO
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mt-1 tracking-[0.25em] uppercase font-medium">
                        Multiplayer Arena
                    </p>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    className="text-sm sm:text-base text-[var(--text-secondary)] mb-8 md:mb-10 max-w-sm mx-auto px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Real-time card battles with friends. Play Classic, Stacking, or Team modes.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-3 items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-2xl w-full sm:w-auto"
                        onClick={handlePlay}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        🎮 Play Now
                    </motion.button>
                    <motion.button
                        className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-2xl w-full sm:w-auto"
                        onClick={() => navigate('/leaderboard')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        🏆 Leaderboard
                    </motion.button>
                </motion.div>

                {/* Features row */}
                <motion.div
                    className="grid grid-cols-3 gap-3 sm:gap-5 mt-10 sm:mt-14 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    {[
                        { icon: '⚡', label: 'Real-time' },
                        { icon: '🤖', label: 'AI Bots' },
                        { icon: '👥', label: '2-10 Players' },
                    ].map((feat, i) => (
                        <div key={i} className="glass rounded-xl p-3 sm:p-4 text-center">
                            <div className="text-2xl sm:text-3xl mb-1">{feat.icon}</div>
                            <div className="text-xs sm:text-sm text-[var(--text-secondary)]">{feat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}

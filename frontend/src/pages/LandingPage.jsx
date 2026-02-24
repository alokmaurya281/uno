import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][i % 4],
    x: 10 + Math.random() * 80,
    delay: Math.random() * 4,
    dur: 12 + Math.random() * 6,
    size: 18 + Math.random() * 22,
}));

export default function LandingPage() {
    const navigate = useNavigate();
    const username = useUserStore((s) => s.username);

    return (
        <div className="min-h-[100dvh] bg-gradient-animated flex flex-col items-center justify-center relative overflow-hidden px-5 py-10">
            {/* Floating particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-lg opacity-10 pointer-events-none"
                    style={{ width: p.size, height: p.size * 1.4, background: p.color, left: `${p.x}%`, bottom: '-5%' }}
                    animate={{ y: [0, -1100], rotate: [0, 360], opacity: [0, 0.12, 0.12, 0] }}
                    transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
                />
            ))}

            {/* Content */}
            <motion.div
                className="relative z-10 text-center w-full max-w-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                {/* Logo */}
                <motion.h1
                    className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none mb-2"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--neon-red)] via-[var(--neon-yellow)] to-[var(--neon-blue)]">
                        UNO
                    </span>
                </motion.h1>

                <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-[var(--text-secondary)] font-medium mb-8">
                    Multiplayer Arena
                </p>

                <p className="text-sm text-[var(--text-secondary)] mb-10 max-w-xs mx-auto leading-relaxed">
                    Real-time card battles with friends. Classic, Stacking & Team modes with AI bots.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                    <motion.button
                        className="btn-primary text-base px-10 py-3.5 rounded-2xl w-full sm:w-auto"
                        onClick={() => navigate(username ? '/lobby' : '/username')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        🎮 Play Now
                    </motion.button>
                    <motion.button
                        className="btn-secondary text-base px-8 py-3.5 rounded-2xl w-full sm:w-auto"
                        onClick={() => navigate('/leaderboard')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        🏆 Leaderboard
                    </motion.button>
                </div>

                {/* Feature badges */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                    {[
                        { icon: '⚡', label: 'Real-time' },
                        { icon: '🤖', label: 'AI Bots' },
                        { icon: '👥', label: '2–10 Players' },
                    ].map((f) => (
                        <div key={f.label} className="glass p-3 text-center">
                            <div className="text-2xl mb-1">{f.icon}</div>
                            <div className="text-[11px] sm:text-xs text-[var(--text-secondary)]">{f.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

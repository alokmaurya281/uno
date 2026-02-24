import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

const AVATARS = ['🦊', '🐱', '🐼', '🦁', '🐸', '🐵', '🦄', '🐺', '🐲', '🦅', '🐙', '🦋'];

export default function UsernamePage() {
    const [input, setInput] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const setUsername = useUserStore(s => s.setUsername);
    const setPlayerData = useUserStore(s => s.setPlayerData);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = input.trim();
        if (name.length < 2) return setError('Username must be at least 2 characters');
        if (name.length > 20) return setError('Username must be 20 characters or less');

        setLoading(true);
        try {
            const res = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: name }),
            });
            const data = await res.json();
            if (data.success) {
                setUsername(name);
                setPlayerData(data.data);
                navigate('/lobby');
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch {
            setUsername(name);
            navigate('/lobby');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-animated flex items-center justify-center p-4">
            <motion.div
                className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-10 w-full max-w-sm sm:max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h2
                    className="text-2xl sm:text-3xl font-bold text-center mb-1 neon-text"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                >
                    Choose Your Identity
                </motion.h2>
                <p className="text-center text-[var(--text-secondary)] mb-6 text-sm sm:text-base">
                    Pick a name and avatar to enter the arena
                </p>

                {/* Avatar Selector */}
                <div className="mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <motion.div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full glass flex items-center justify-center text-4xl sm:text-5xl neon-border"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {selectedAvatar}
                        </motion.div>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-xs mx-auto">
                        {AVATARS.map((avatar) => (
                            <motion.button
                                key={avatar}
                                className={`aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all
                  ${selectedAvatar === avatar
                                        ? 'glass neon-border ring-2 ring-[var(--neon-blue)]'
                                        : 'bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                                onClick={() => setSelectedAvatar(avatar)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {avatar}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        className="input-neon text-center text-base sm:text-lg mb-2"
                        placeholder="Enter your username..."
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setError(''); }}
                        maxLength={20}
                        autoFocus
                    />
                    {error && (
                        <motion.p className="text-[var(--neon-red)] text-xs sm:text-sm text-center mb-3"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {error}
                        </motion.p>
                    )}
                    <motion.button
                        type="submit"
                        className="btn-primary w-full mt-3 text-base sm:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl"
                        disabled={loading || input.trim().length < 2}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? '...' : '🎯 Enter Arena'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

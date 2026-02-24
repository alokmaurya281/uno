import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

const AVATARS = ['🦊', '🐱', '🐼', '🦁', '🐸', '🐵', '🦄', '🐺', '🐲', '🦅', '🐙', '🦋'];

export default function UsernamePage() {
    const [input, setInput] = useState('');
    const [avatar, setAvatar] = useState(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const setUsername = useUserStore((s) => s.setUsername);
    const setPlayerData = useUserStore((s) => s.setPlayerData);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = input.trim();
        if (name.length < 2) return setError('Min 2 characters');
        if (name.length > 20) return setError('Max 20 characters');
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
                setError(data.error || 'Failed');
            }
        } catch {
            // offline — skip API
            setUsername(name);
            navigate('/lobby');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-animated flex items-center justify-center p-5">
            <motion.div
                className="glass-strong p-7 sm:p-10 w-full max-w-sm"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
            >
                {/* Header */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center neon-text mb-1">
                    Choose Your Identity
                </h2>
                <p className="text-center text-[var(--text-secondary)] text-sm mb-7">
                    Pick a name and avatar
                </p>

                {/* Selected avatar */}
                <div className="flex justify-center mb-4">
                    <motion.div
                        className="w-20 h-20 rounded-full glass neon-border flex items-center justify-center text-4xl"
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    >
                        {avatar}
                    </motion.div>
                </div>

                {/* Avatar grid */}
                <div className="grid grid-cols-6 gap-2 mb-7 max-w-[264px] mx-auto">
                    {AVATARS.map((a) => (
                        <motion.button
                            key={a}
                            type="button"
                            className={`aspect-square rounded-lg flex items-center justify-center text-xl transition-all
                ${avatar === a ? 'neon-border bg-[var(--bg-glass)]' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)]'}`}
                            onClick={() => setAvatar(a)}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.92 }}
                        >
                            {a}
                        </motion.button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        className="input-neon text-center"
                        placeholder="Enter your username..."
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setError(''); }}
                        maxLength={20}
                        autoFocus
                    />

                    {error && (
                        <motion.p
                            className="text-[var(--neon-red)] text-xs text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        className="btn-primary w-full py-3 rounded-xl text-base"
                        disabled={loading || input.trim().length < 2}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {loading ? 'Joining...' : '🎯 Enter Arena'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import useUserStore from '../store/userStore';
import useLobbyStore from '../store/lobbyStore';

export default function LobbyPage() {
    const { emit, on, connected } = useSocket();
    const navigate = useNavigate();
    const username = useUserStore((s) => s.username);
    const { rooms, setRooms, setCurrentRoom } = useLobbyStore();

    const [showCreate, setShowCreate] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!connected) return;
        emit('getRooms', (list) => setRooms(list));
        const unsub = on('roomsUpdated', (list) => setRooms(list));
        return unsub;
    }, [connected, emit, on, setRooms]);

    const handleCreate = useCallback(() => {
        emit('createRoom', {
            roomName: roomName || `${username}'s Room`,
            isPublic,
            password: isPublic ? null : password,
            username,
        }, (res) => {
            if (res.success) { setCurrentRoom(res.room); navigate(`/room/${res.room.id}`); }
        });
    }, [emit, roomName, isPublic, password, username, navigate, setCurrentRoom]);

    const handleJoin = useCallback((roomId, pwd) => {
        emit('joinRoom', { roomId, username, password: pwd }, (res) => {
            if (res.success) { setCurrentRoom(res.room); navigate(`/room/${res.room.id}`); }
        });
    }, [emit, username, navigate, setCurrentRoom]);

    return (
        <div className="min-h-[100dvh] bg-gradient-animated p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">

                {/* ---- Header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold neon-text">Game Lobby</h1>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                            Welcome, <span className="text-[var(--neon-blue)] font-medium">{username}</span>
                            {connected
                                ? <span className="ml-2 text-[var(--neon-green)]">● Online</span>
                                : <span className="ml-2 text-[var(--neon-red)]">● Connecting</span>}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary py-2 px-4 flex-1 sm:flex-none" onClick={() => navigate('/leaderboard')}>
                            🏆 Rankings
                        </button>
                        <button className="btn-primary py-2 px-4 flex-1 sm:flex-none" onClick={() => setShowCreate(true)}>
                            + Create Room
                        </button>
                    </div>
                </div>

                {/* ---- Join by code ---- */}
                <div className="glass p-3 flex gap-2 mb-6">
                    <input
                        className="input-neon flex-1"
                        placeholder="Enter room code..."
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={8}
                    />
                    <button
                        className="btn-primary px-5"
                        onClick={() => joinCode.trim().length >= 4 && handleJoin(joinCode.trim())}
                    >
                        Join
                    </button>
                </div>

                {/* ---- Room list ---- */}
                <div className="space-y-2">
                    {rooms.length === 0 && (
                        <div className="glass p-10 text-center">
                            <div className="text-4xl mb-3">🎴</div>
                            <p className="text-[var(--text-secondary)]">No rooms yet — create one!</p>
                        </div>
                    )}

                    {rooms.map((room, i) => (
                        <motion.div
                            key={room.id}
                            className="glass p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-[var(--neon-blue)]/30 transition-colors"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => {
                                if (room.hasPassword) { setSelectedRoom(room); setShowPwdModal(true); }
                                else handleJoin(room.id);
                            }}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-base font-bold flex-shrink-0">
                                    {room.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{room.name}</p>
                                    <p className="text-xs text-[var(--text-secondary)] truncate">
                                        {room.hostUsername} · {room.hasPassword ? '🔒 Private' : '🌐 Public'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-[var(--neon-green)] font-mono text-sm font-semibold">
                                    {room.playerCount}/{room.maxPlayers}
                                </span>
                                <span className="hidden sm:block font-mono text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-0.5 rounded">
                                    {room.id}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ---- Create Room Modal ---- */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            className="glass-strong p-6 sm:p-8 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl safe-bottom"
                            initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold neon-text mb-5">Create Room</h2>

                            <div className="space-y-4">
                                <input
                                    className="input-neon"
                                    placeholder="Room name (optional)"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                />

                                <div className="flex gap-2">
                                    <button
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${isPublic ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setIsPublic(true)}
                                    >
                                        🌐 Public
                                    </button>
                                    <button
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${!isPublic ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setIsPublic(false)}
                                    >
                                        🔒 Private
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {!isPublic && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <input
                                                className="input-neon"
                                                placeholder="Room password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button className="btn-primary w-full py-3 rounded-xl text-base" onClick={handleCreate}>
                                    🚀 Create & Join
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- Password Modal ---- */}
            <AnimatePresence>
                {showPwdModal && selectedRoom && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowPwdModal(false)}
                    >
                        <motion.div
                            className="glass-strong p-6 sm:p-8 w-full sm:max-w-xs rounded-t-2xl sm:rounded-2xl safe-bottom"
                            initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Enter Password</h3>
                            <input
                                className="input-neon mb-4"
                                type="password"
                                placeholder="Room password"
                                value={joinPassword}
                                onChange={(e) => setJoinPassword(e.target.value)}
                                autoFocus
                            />
                            <button
                                className="btn-primary w-full py-3 rounded-xl"
                                onClick={() => { handleJoin(selectedRoom.id, joinPassword); setShowPwdModal(false); }}
                            >
                                Join Room
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

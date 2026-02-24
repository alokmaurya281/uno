import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import useUserStore from '../store/userStore';
import useLobbyStore from '../store/lobbyStore';

export default function LobbyPage() {
    const { emit, on, connected } = useSocket();
    const navigate = useNavigate();
    const username = useUserStore(s => s.username);
    const { rooms, setRooms, setCurrentRoom } = useLobbyStore();
    const [showCreate, setShowCreate] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!connected) return;
        emit('getRooms', (roomList) => setRooms(roomList));
        const unsub = on('roomsUpdated', (roomList) => setRooms(roomList));
        return unsub;
    }, [connected, emit, on, setRooms]);

    const handleCreate = useCallback(() => {
        emit('createRoom', {
            roomName: roomName || `${username}'s Room`,
            isPublic,
            password: isPublic ? null : password,
            username,
        }, (res) => {
            if (res.success) {
                setCurrentRoom(res.room);
                navigate(`/room/${res.room.id}`);
            } else setError(res.error);
        });
    }, [emit, roomName, isPublic, password, username, navigate, setCurrentRoom]);

    const handleJoin = useCallback((roomId, pwd) => {
        emit('joinRoom', { roomId, username, password: pwd }, (res) => {
            if (res.success) {
                setCurrentRoom(res.room);
                navigate(`/room/${res.room.id}`);
            } else setError(res.error);
        });
    }, [emit, username, navigate, setCurrentRoom]);

    const handleJoinByCode = () => {
        const code = joinCode.trim().toUpperCase();
        if (code.length < 4) return;
        handleJoin(code);
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-animated p-3 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-text">Game Lobby</h1>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                            Welcome, <span className="text-[var(--neon-blue)]">{username}</span>
                            {connected
                                ? <span className="ml-2 text-[var(--neon-green)]">● Online</span>
                                : <span className="ml-2 text-[var(--neon-red)]">● Connecting...</span>
                            }
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="btn-secondary flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm"
                            onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
                        <button className="btn-primary flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs sm:text-sm"
                            onClick={() => setShowCreate(true)}>+ Create Room</button>
                    </div>
                </motion.div>

                {/* Join by code */}
                <motion.div
                    className="glass rounded-xl sm:rounded-2xl p-3 mb-4 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <input
                        className="input-neon flex-1 text-sm sm:text-base"
                        placeholder="Enter room code..."
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={8}
                    />
                    <button className="btn-primary px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm" onClick={handleJoinByCode}>
                        Join
                    </button>
                </motion.div>

                {error && (
                    <motion.p className="text-[var(--neon-red)] text-center text-sm mb-3"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>
                )}

                {/* Rooms list */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {rooms.length === 0 && (
                            <motion.div className="glass rounded-2xl p-8 sm:p-12 text-center"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="text-4xl sm:text-5xl mb-3">🎴</div>
                                <p className="text-base sm:text-xl text-[var(--text-secondary)]">No rooms available</p>
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">Create one to start playing!</p>
                            </motion.div>
                        )}
                        {rooms.map((room, i) => (
                            <motion.div
                                key={room.id}
                                className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between hover:border-[var(--neon-blue)] border border-transparent transition-all cursor-pointer gap-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => room.hasPassword ? (setSelectedRoom(room), setShowJoinModal(true)) : handleJoin(room.id)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-base sm:text-lg font-bold flex-shrink-0">
                                        {room.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base truncate">{room.name}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">
                                            Host: {room.hostUsername} • {room.hasPassword ? '🔒' : '🌐'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                    <span className="text-[var(--neon-green)] font-mono text-sm">
                                        {room.playerCount}/{room.maxPlayers}
                                    </span>
                                    <span className="hidden sm:inline bg-[var(--bg-card)] px-2 py-0.5 rounded-lg text-xs font-mono">
                                        {room.id}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Room Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            className="glass-strong rounded-t-2xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-md safe-bottom"
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-xl sm:text-2xl font-bold mb-5 neon-text">Create Room</h2>
                            <div className="space-y-3">
                                <input className="input-neon" placeholder="Room name (optional)" value={roomName}
                                    onChange={e => setRoomName(e.target.value)} />
                                <div className="flex gap-2">
                                    <button className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${isPublic ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setIsPublic(true)}>🌐 Public</button>
                                    <button className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${!isPublic ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setIsPublic(false)}>🔒 Private</button>
                                </div>
                                {!isPublic && (
                                    <motion.input className="input-neon" placeholder="Room password" type="password"
                                        value={password} onChange={e => setPassword(e.target.value)}
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} />
                                )}
                                <button className="btn-primary w-full py-3 rounded-xl text-base" onClick={handleCreate}>
                                    🚀 Create & Join
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Password Modal */}
            <AnimatePresence>
                {showJoinModal && selectedRoom && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowJoinModal(false)}
                    >
                        <motion.div
                            className="glass-strong rounded-t-2xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-sm safe-bottom"
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Enter Password</h3>
                            <input className="input-neon mb-4" type="password" placeholder="Room password"
                                value={joinPassword} onChange={e => setJoinPassword(e.target.value)} autoFocus />
                            <button className="btn-primary w-full py-3 rounded-xl"
                                onClick={() => { handleJoin(selectedRoom.id, joinPassword); setShowJoinModal(false); }}>
                                Join Room
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

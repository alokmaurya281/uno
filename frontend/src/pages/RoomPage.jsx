import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket, getSocket } from '../hooks/useSocket';
import useUserStore from '../store/userStore';
import useLobbyStore from '../store/lobbyStore';

export default function RoomPage() {
    const { roomId } = useParams();
    const { emit, on, connected } = useSocket();
    const navigate = useNavigate();
    const username = useUserStore(s => s.username);
    const { currentRoom, setCurrentRoom } = useLobbyStore();
    const [settings, setSettings] = useState({ stackingEnabled: false, teamMode: false, turnTimer: 30 });
    const [botDifficulty, setBotDifficulty] = useState('medium');

    const isHost = currentRoom?.hostId === getSocket().id;

    useEffect(() => {
        if (!connected) return;
        const unsub1 = on('roomUpdated', (room) => { setCurrentRoom(room); setSettings(room.settings); });
        const unsub2 = on('gameStateUpdate', () => navigate(`/game/${roomId}`));
        if (!currentRoom) {
            emit('reconnectPlayer', { roomId, username }, (res) => {
                if (res.success) { setCurrentRoom(res.room); if (res.gameState) navigate(`/game/${roomId}`); }
                else navigate('/lobby');
            });
        }
        return () => { unsub1(); unsub2(); };
    }, [connected, roomId, on, emit, navigate, username, currentRoom, setCurrentRoom]);

    const handleStartGame = () => emit('startGame', { roomId }, (res) => { if (!res.success) alert(res.error); });
    const handleLeave = () => { emit('leaveRoom', { roomId }); setCurrentRoom(null); navigate('/lobby'); };
    const handleSettingChange = (key, value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        emit('updateRoomSettings', { roomId, settings: updated });
    };
    const handleAddBot = () => emit('addBot', { roomId, difficulty: botDifficulty }, (res) => { if (!res?.success) alert(res?.error); });
    const handleRemoveBot = (botId) => emit('removeBot', { roomId, botId });

    if (!currentRoom) {
        return (
            <div className="min-h-screen min-h-[100dvh] bg-gradient-animated flex items-center justify-center">
                <div className="text-base text-[var(--text-secondary)]">Connecting to room...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-animated p-3 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3"
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{currentRoom.name}</h1>
                        <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1 text-sm">
                            Code: <span className="font-mono text-[var(--neon-blue)] bg-[var(--bg-card)] px-2 py-0.5 rounded-lg text-base sm:text-lg select-all">{roomId}</span>
                        </p>
                    </div>
                    <button className="btn-danger px-3 py-2 rounded-lg text-sm w-full sm:w-auto" onClick={handleLeave}>Leave Room</button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Players */}
                    <motion.div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-base sm:text-lg font-semibold mb-3">
                            Players ({currentRoom.players.length}/{currentRoom.settings.maxPlayers})
                        </h2>
                        <div className="space-y-2">
                            {currentRoom.players.map((player, i) => (
                                <motion.div key={player.id}
                                    className="glass rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2"
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}>
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-sm sm:text-lg font-bold flex-shrink-0">
                                            {player.isBot ? '🤖' : player.username[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-semibold text-sm truncate block">{player.username}</span>
                                            <div className="flex gap-1 items-center">
                                                {player.id === currentRoom.hostId && <span className="text-[var(--neon-yellow)] text-[10px]">👑 Host</span>}
                                                {player.isBot && <span className="text-[10px] text-[var(--text-secondary)]">Bot</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!player.connected && !player.isBot && <span className="text-[var(--neon-red)] text-[10px]">Offline</span>}
                                        {player.isBot && isHost && (
                                            <button className="text-[var(--neon-red)] text-xs hover:underline" onClick={() => handleRemoveBot(player.id)}>Remove</button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Add Bot */}
                        {isHost && currentRoom.players.length < currentRoom.settings.maxPlayers && (
                            <div className="mt-3 flex gap-2">
                                <select className="input-neon flex-1 text-sm py-2" value={botDifficulty}
                                    onChange={e => setBotDifficulty(e.target.value)}>
                                    <option value="easy">Easy Bot</option>
                                    <option value="medium">Medium Bot</option>
                                    <option value="hard">Hard Bot</option>
                                </select>
                                <button className="btn-secondary px-3 rounded-lg text-sm" onClick={handleAddBot}>+ Bot</button>
                            </div>
                        )}
                    </motion.div>

                    {/* Settings */}
                    <motion.div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-base sm:text-lg font-semibold mb-3">Game Settings</h2>
                        <div className="space-y-4">
                            {/* Stacking */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-sm">Stacking Mode</p>
                                    <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">Stack +2 on +2, +4 on +4</p>
                                </div>
                                <div className={`toggle-track ${settings.stackingEnabled ? 'active' : 'inactive'}`}
                                    onClick={() => isHost && handleSettingChange('stackingEnabled', !settings.stackingEnabled)}>
                                    <div className={`toggle-thumb ${settings.stackingEnabled ? 'on' : 'off'}`} />
                                </div>
                            </div>

                            {/* Team Mode */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-sm">Team Mode</p>
                                    <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">2v2 or 3v3 (4+ players)</p>
                                </div>
                                <div className={`toggle-track ${settings.teamMode ? 'active' : 'inactive'}`}
                                    onClick={() => isHost && handleSettingChange('teamMode', !settings.teamMode)}>
                                    <div className={`toggle-thumb ${settings.teamMode ? 'on' : 'off'}`} />
                                </div>
                            </div>

                            {/* Timer */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-sm">Turn Timer</p>
                                    <span className="text-[var(--neon-blue)] font-mono text-sm">{settings.turnTimer}s</span>
                                </div>
                                <input type="range" min="15" max="60" value={settings.turnTimer}
                                    onChange={e => isHost && handleSettingChange('turnTimer', parseInt(e.target.value))}
                                    disabled={!isHost} className="w-full accent-[var(--neon-blue)]" />
                            </div>
                        </div>

                        {isHost ? (
                            <motion.button className="btn-primary w-full py-3 rounded-xl text-base mt-6"
                                onClick={handleStartGame} disabled={currentRoom.players.length < 2}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                {currentRoom.players.length < 2 ? 'Need 2+ Players' : '🎮 Start Game'}
                            </motion.button>
                        ) : (
                            <div className="mt-6 text-center text-[var(--text-secondary)] text-sm">
                                Waiting for host to start...
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

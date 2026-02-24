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
    const username = useUserStore((s) => s.username);
    const { currentRoom, setCurrentRoom } = useLobbyStore();
    const [settings, setSettings] = useState({ stackingEnabled: false, teamMode: false, turnTimer: 30 });
    const [botDiff, setBotDiff] = useState('medium');

    const isHost = currentRoom?.hostId === getSocket().id;

    useEffect(() => {
        if (!connected) return;
        const u1 = on('roomUpdated', (room) => { setCurrentRoom(room); setSettings(room.settings); });
        const u2 = on('gameStateUpdate', () => navigate(`/game/${roomId}`));
        if (!currentRoom) {
            emit('reconnectPlayer', { roomId, username }, (res) => {
                if (res.success) { setCurrentRoom(res.room); if (res.gameState) navigate(`/game/${roomId}`); }
                else navigate('/lobby');
            });
        }
        return () => { u1(); u2(); };
    }, [connected, roomId, on, emit, navigate, username, currentRoom, setCurrentRoom]);

    const toggle = (key) => {
        if (!isHost) return;
        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated);
        emit('updateRoomSettings', { roomId, settings: updated });
    };

    const setTimer = (val) => {
        if (!isHost) return;
        const updated = { ...settings, turnTimer: val };
        setSettings(updated);
        emit('updateRoomSettings', { roomId, settings: updated });
    };

    if (!currentRoom) {
        return (
            <div className="min-h-[100dvh] bg-gradient-animated flex items-center justify-center">
                <p className="text-[var(--text-secondary)]">Connecting to room…</p>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gradient-animated p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">

                {/* ---- Header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold truncate">{currentRoom.name}</h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Code: <span className="font-mono text-[var(--neon-blue)] bg-[var(--bg-card)] px-2.5 py-0.5 rounded-lg text-base select-all">{roomId}</span>
                        </p>
                    </div>
                    <button className="btn-danger py-2 px-5 w-full sm:w-auto" onClick={() => { emit('leaveRoom', { roomId }); setCurrentRoom(null); navigate('/lobby'); }}>
                        Leave Room
                    </button>
                </div>

                {/* ---- Two-column ---- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Players panel */}
                    <div className="glass p-5">
                        <h2 className="text-base font-semibold mb-4">
                            Players ({currentRoom.players.length}/{currentRoom.settings.maxPlayers})
                        </h2>

                        <div className="space-y-2">
                            {currentRoom.players.map((player, i) => (
                                <motion.div
                                    key={player.id}
                                    className="glass p-3 flex items-center justify-between gap-2"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {player.isBot ? '🤖' : player.username[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">{player.username}</p>
                                            <div className="flex gap-1.5 items-center text-[10px]">
                                                {player.id === currentRoom.hostId && <span className="text-[var(--neon-yellow)]">👑 Host</span>}
                                                {player.isBot && <span className="text-[var(--text-secondary)]">Bot</span>}
                                                {!player.connected && !player.isBot && <span className="text-[var(--neon-red)]">Offline</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {player.isBot && isHost && (
                                        <button className="text-[var(--neon-red)] text-xs hover:underline flex-shrink-0"
                                            onClick={() => emit('removeBot', { roomId, botId: player.id })}>
                                            Remove
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Add bot */}
                        {isHost && currentRoom.players.length < currentRoom.settings.maxPlayers && (
                            <div className="flex gap-2 mt-4">
                                <select className="input-neon flex-1" value={botDiff} onChange={(e) => setBotDiff(e.target.value)}>
                                    <option value="easy">Easy Bot</option>
                                    <option value="medium">Medium Bot</option>
                                    <option value="hard">Hard Bot</option>
                                </select>
                                <button className="btn-secondary px-4" onClick={() => emit('addBot', { roomId, difficulty: botDiff })}>
                                    + Bot
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Settings panel */}
                    <div className="glass p-5">
                        <h2 className="text-base font-semibold mb-4">Game Settings</h2>

                        <div className="space-y-5">
                            {/* Stacking */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">Stacking Mode</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Stack +2 on +2, +4 on +4</p>
                                </div>
                                <button
                                    className={`toggle ${settings.stackingEnabled ? 'on' : 'off'}`}
                                    onClick={() => toggle('stackingEnabled')}
                                    disabled={!isHost}
                                />
                            </div>

                            {/* Team Mode */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium">Team Mode</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">2v2 or 3v3 (4+ players)</p>
                                </div>
                                <button
                                    className={`toggle ${settings.teamMode ? 'on' : 'off'}`}
                                    onClick={() => toggle('teamMode')}
                                    disabled={!isHost}
                                />
                            </div>

                            {/* Timer */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Turn Timer</p>
                                    <span className="text-[var(--neon-blue)] font-mono text-sm font-semibold">{settings.turnTimer}s</span>
                                </div>
                                <input
                                    type="range" min="15" max="60"
                                    value={settings.turnTimer}
                                    onChange={(e) => setTimer(parseInt(e.target.value))}
                                    disabled={!isHost}
                                    className="w-full accent-[var(--neon-blue)]"
                                />
                            </div>
                        </div>

                        {/* Start / Waiting */}
                        <div className="mt-8">
                            {isHost ? (
                                <motion.button
                                    className="btn-primary w-full py-3.5 rounded-xl text-base"
                                    onClick={() => emit('startGame', { roomId }, (r) => { if (!r.success) alert(r.error); })}
                                    disabled={currentRoom.players.length < 2}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {currentRoom.players.length < 2 ? 'Need 2+ Players' : '🎮 Start Game'}
                                </motion.button>
                            ) : (
                                <p className="text-center text-[var(--text-secondary)] text-sm">Waiting for host to start…</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

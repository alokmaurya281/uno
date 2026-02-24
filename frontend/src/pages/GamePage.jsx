import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket, getSocket } from '../hooks/useSocket';
import useGameStore from '../store/gameStore';
import useUserStore from '../store/userStore';
import useLobbyStore from '../store/lobbyStore';
import PlayerHand from '../components/PlayerHand';
import GameBoard from '../components/GameBoard';
import PlayerAvatar from '../components/PlayerAvatar';
import ColorPicker from '../components/ColorPicker';
import GameOverModal from '../components/GameOverModal';
import ChatPanel from '../components/ChatPanel';

export default function GamePage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { emit, on, connected } = useSocket();
    const username = useUserStore((s) => s.username);
    const setCurrentRoom = useLobbyStore((s) => s.setCurrentRoom);
    const {
        myHand, topCard, currentColor, currentPlayerId, players,
        drawPileCount, direction, drawStack, chatMessages,
        showColorPicker, pendingCard, gameOverData,
        setGameState, addChatMessage, setShowColorPicker, setPendingCard,
        setGameOverData, clearGame,
    } = useGameStore();

    const [emojis, setEmojis] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const socketId = getSocket().id;
    const isMyTurn = currentPlayerId === socketId;
    const opponents = players.filter((p) => p.id !== socketId);

    /* ---- Socket events ---- */
    useEffect(() => {
        if (!connected) return;
        const u1 = on('gameStateUpdate', (gs) => setGameState(gs));
        const u2 = on('gameOver', (d) => setGameOverData(d));
        const u3 = on('chatMessage', (m) => addChatMessage(m));
        const u4 = on('emojiReaction', (d) => {
            const id = Date.now() + Math.random();
            setEmojis((p) => [...p, { ...d, id }]);
            setTimeout(() => setEmojis((p) => p.filter((e) => e.id !== id)), 2000);
        });
        const u5 = on('unoCall', (d) =>
            addChatMessage({ id: Date.now(), username: 'System', message: `${d.username} called UNO!`, timestamp: Date.now() }));
        const u6 = on('unoCaught', (d) => {
            const c = players.find((p) => p.id === d.catcherId)?.username || 'Someone';
            const t = players.find((p) => p.id === d.targetId)?.username || 'Someone';
            addChatMessage({ id: Date.now(), username: 'System', message: `${c} caught ${t}! +${d.penaltyCards} cards`, timestamp: Date.now() });
        });
        const u7 = on('roomUpdated', (room) => {
            setCurrentRoom(room);
            if (room.status === 'waiting') { clearGame(); navigate(`/room/${roomId}`); }
        });
        if (!myHand.length) {
            emit('reconnectPlayer', { roomId, username }, (res) => {
                if (res.success && res.gameState) { setGameState(res.gameState); if (res.room) setCurrentRoom(res.room); }
                else navigate('/lobby');
            });
        }
        return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); };
    }, [connected]);

    /* ---- Turn timer ---- */
    useEffect(() => {
        const gs = useGameStore.getState();
        if (!gs.turnStartTime) return;
        const iv = setInterval(() => {
            const remaining = Math.max(0, (gs.turnTimer || 30) - (Date.now() - gs.turnStartTime) / 1000);
            setTimeLeft(Math.ceil(remaining));
        }, 500);
        return () => clearInterval(iv);
    }, [currentPlayerId]);

    /* ---- Handlers ---- */
    const playCard = useCallback((card) => {
        if (!isMyTurn) return;
        if (card.type === 'wild') { setPendingCard(card); setShowColorPicker(true); return; }
        emit('playCard', { roomId, cardId: card.id });
    }, [isMyTurn, emit, roomId]);

    const pickColor = useCallback((color) => {
        setShowColorPicker(false);
        if (pendingCard) emit('playCard', { roomId, cardId: pendingCard.id, chosenColor: color });
        setPendingCard(null);
    }, [pendingCard, emit, roomId]);

    const draw = useCallback(() => { if (isMyTurn) emit('drawCard', { roomId }); }, [isMyTurn, emit, roomId]);
    const callUno = useCallback(() => emit('callUNO', { roomId }), [emit, roomId]);
    const catchUno = useCallback((id) => emit('catchUNO', { roomId, targetId: id }), [emit, roomId]);

    return (
        <div className="h-[100dvh] bg-gradient-animated flex flex-col overflow-hidden md:pr-72">

            {/* ---- Top bar ---- */}
            <div className="glass !rounded-none px-3 py-2 flex items-center justify-between shrink-0 z-20 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <button className="btn-secondary px-2.5 py-1 text-[11px]"
                        onClick={() => { emit('leaveRoom', { roomId }); navigate('/lobby'); }}>
                        ← Exit
                    </button>
                    <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline truncate">
                        Room <span className="font-mono text-[var(--neon-blue)]">{roomId}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`font-mono text-sm font-bold ${timeLeft <= 5 ? 'text-[var(--neon-red)]' : 'text-[var(--neon-green)]'}`}>
                        ⏱ {timeLeft}s
                    </span>
                    {myHand.length <= 2 && (
                        <motion.button className="btn-danger px-3 py-1 text-xs font-bold"
                            onClick={callUno}
                            animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            UNO!
                        </motion.button>
                    )}
                </div>
            </div>

            {/* ---- Opponents ---- */}
            <div className="flex items-start justify-center gap-3 sm:gap-4 px-3 py-2.5 shrink-0 flex-wrap z-10 overflow-x-auto">
                {opponents.map((p) => (
                    <div key={p.id} className="relative flex-shrink-0">
                        <PlayerAvatar player={p} isCurrentTurn={p.id === currentPlayerId} isMe={false} />
                        {p.cardCount === 1 && (
                            <motion.button
                                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-[var(--neon-red)] text-white text-[8px] px-1.5 py-0.5 rounded-full"
                                onClick={() => catchUno(p.id)}
                                initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.2 }}>
                                Catch!
                            </motion.button>
                        )}
                    </div>
                ))}
            </div>

            {/* ---- Emoji overlay ---- */}
            <AnimatePresence>
                {emojis.map((r) => (
                    <motion.div key={r.id} className="absolute text-4xl pointer-events-none z-50"
                        style={{ left: '50%', top: '35%' }}
                        initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0, y: -80 }}
                        exit={{ opacity: 0 }} transition={{ duration: 1.5 }}>
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ---- Board ---- */}
            <div className="flex-1 flex items-center justify-center z-10 min-h-0">
                <GameBoard topCard={topCard} currentColor={currentColor} direction={direction}
                    drawPileCount={drawPileCount} drawStack={drawStack} onDraw={draw} isMyTurn={isMyTurn} />
            </div>

            {/* ---- Turn indicator ---- */}
            <AnimatePresence>
                {isMyTurn && (
                    <motion.p className="text-center text-[var(--neon-green)] font-bold text-xs shrink-0 pb-1"
                        initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}>
                        Your Turn!
                    </motion.p>
                )}
            </AnimatePresence>

            {/* ---- Hand ---- */}
            <div className="shrink-0 z-20">
                <PlayerHand cards={myHand} onCardClick={playCard} isMyTurn={isMyTurn}
                    currentColor={currentColor} topCard={topCard} drawStack={drawStack} />
            </div>

            {/* Overlays */}
            <ColorPicker show={showColorPicker} onSelect={pickColor} />
            <GameOverModal data={gameOverData} roomId={roomId} />
            <ChatPanel messages={chatMessages}
                onSendMessage={(m) => emit('chatMessage', { roomId, message: m })}
                onSendEmoji={(e) => emit('emojiReaction', { roomId, emoji: e })}
                username={username} />
        </div>
    );
}

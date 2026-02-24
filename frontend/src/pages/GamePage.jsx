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
    const username = useUserStore(s => s.username);
    const setCurrentRoom = useLobbyStore(s => s.setCurrentRoom);
    const {
        myHand, topCard, currentColor, currentPlayerId, players,
        drawPileCount, direction, drawStack, chatMessages,
        showColorPicker, pendingCard, gameOverData,
        setGameState, addChatMessage, setShowColorPicker, setPendingCard,
        setGameOverData, clearGame,
    } = useGameStore();

    const [emojiReactions, setEmojiReactions] = useState([]);
    const [turnTimeLeft, setTurnTimeLeft] = useState(30);
    const socketId = getSocket().id;
    const isMyTurn = currentPlayerId === socketId;

    // Socket events
    useEffect(() => {
        if (!connected) return;
        const unsub1 = on('gameStateUpdate', (gs) => setGameState(gs));
        const unsub2 = on('gameOver', (data) => setGameOverData(data));
        const unsub3 = on('chatMessage', (msg) => addChatMessage(msg));
        const unsub4 = on('emojiReaction', (data) => {
            const id = Date.now() + Math.random();
            setEmojiReactions(prev => [...prev, { ...data, id }]);
            setTimeout(() => setEmojiReactions(prev => prev.filter(e => e.id !== id)), 2000);
        });
        const unsub5 = on('unoCall', (data) => {
            addChatMessage({ id: Date.now(), username: 'System', message: `${data.username} called UNO!`, timestamp: Date.now() });
        });
        const unsub6 = on('unoCaught', (data) => {
            const catcher = players.find(p => p.id === data.catcherId)?.username || 'Someone';
            const target = players.find(p => p.id === data.targetId)?.username || 'Someone';
            addChatMessage({ id: Date.now(), username: 'System', message: `${catcher} caught ${target}! +${data.penaltyCards} penalty cards`, timestamp: Date.now() });
        });
        const unsub7 = on('roomUpdated', (room) => {
            setCurrentRoom(room);
            if (room.status === 'waiting') { clearGame(); navigate(`/room/${roomId}`); }
        });
        if (!myHand.length) {
            emit('reconnectPlayer', { roomId, username }, (res) => {
                if (res.success && res.gameState) { setGameState(res.gameState); if (res.room) setCurrentRoom(res.room); }
                else navigate('/lobby');
            });
        }
        return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7(); };
    }, [connected]);

    // Turn timer
    useEffect(() => {
        const gs = useGameStore.getState();
        if (!gs.turnStartTime) return;
        const interval = setInterval(() => {
            const elapsed = (Date.now() - gs.turnStartTime) / 1000;
            setTurnTimeLeft(Math.max(0, Math.ceil((gs.turnTimer || 30) - elapsed)));
        }, 500);
        return () => clearInterval(interval);
    }, [currentPlayerId]);

    const handleCardClick = useCallback((card) => {
        if (!isMyTurn) return;
        if (card.type === 'wild') { setPendingCard(card); setShowColorPicker(true); return; }
        emit('playCard', { roomId, cardId: card.id }, (res) => { if (!res.success) console.warn(res.error); });
    }, [isMyTurn, emit, roomId, setPendingCard, setShowColorPicker]);

    const handleColorSelect = useCallback((color) => {
        setShowColorPicker(false);
        if (!pendingCard) return;
        emit('playCard', { roomId, cardId: pendingCard.id, chosenColor: color }, () => { });
        setPendingCard(null);
    }, [pendingCard, emit, roomId, setPendingCard, setShowColorPicker]);

    const handleDraw = useCallback(() => {
        if (!isMyTurn) return;
        emit('drawCard', { roomId }, () => { });
    }, [isMyTurn, emit, roomId]);

    const handleCallUno = useCallback(() => {
        emit('callUNO', { roomId }, () => { });
    }, [emit, roomId]);

    const handleCatchUno = useCallback((targetId) => {
        emit('catchUNO', { roomId, targetId }, () => { });
    }, [emit, roomId]);

    const opponents = players.filter(p => p.id !== socketId);

    return (
        <div className="h-screen h-[100dvh] bg-gradient-animated flex flex-col overflow-hidden md:pr-72 lg:pr-80">
            {/* Top bar */}
            <div className="glass px-2 sm:px-3 py-2 flex items-center justify-between shrink-0 z-20 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <button className="btn-secondary px-2 py-1 rounded-lg text-[10px] sm:text-xs flex-shrink-0"
                        onClick={() => { emit('leaveRoom', { roomId }); navigate('/lobby'); }}>
                        ← Exit
                    </button>
                    <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] hidden sm:inline truncate">
                        Room: <span className="font-mono text-[var(--neon-blue)]">{roomId}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className={`font-mono text-sm sm:text-base font-bold ${turnTimeLeft <= 5 ? 'text-[var(--neon-red)]' : 'text-[var(--neon-green)]'}`}>
                        ⏱{turnTimeLeft}s
                    </div>
                    {myHand.length <= 2 && (
                        <motion.button className="btn-danger px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold"
                            onClick={handleCallUno}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            UNO!
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Opponents - scrollable row */}
            <div className="flex items-start justify-center gap-2 sm:gap-3 md:gap-5 px-2 sm:px-4 py-2 sm:py-3 shrink-0 flex-wrap z-10 overflow-x-auto">
                {opponents.map(player => (
                    <div key={player.id} className="relative flex-shrink-0">
                        <PlayerAvatar player={player} isCurrentTurn={player.id === currentPlayerId} isMe={false} />
                        {player.cardCount === 1 && (
                            <motion.button
                                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-[var(--neon-red)] text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
                                onClick={() => handleCatchUno(player.id)}
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                whileHover={{ scale: 1.2 }}>
                                Catch!
                            </motion.button>
                        )}
                    </div>
                ))}
            </div>

            {/* Emoji reactions */}
            <AnimatePresence>
                {emojiReactions.map(r => (
                    <motion.div key={r.id} className="absolute text-3xl sm:text-5xl pointer-events-none z-50"
                        style={{ left: '50%', top: '40%' }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0, y: -100 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}>
                        {r.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Game board center */}
            <div className="flex-1 flex items-center justify-center z-10 min-h-0">
                <GameBoard
                    topCard={topCard} currentColor={currentColor} direction={direction}
                    drawPileCount={drawPileCount} drawStack={drawStack}
                    onDraw={handleDraw} isMyTurn={isMyTurn}
                />
            </div>

            {/* Turn indicator */}
            <AnimatePresence>
                {isMyTurn && (
                    <motion.div className="text-center text-[var(--neon-green)] font-bold text-xs sm:text-sm shrink-0 pb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}>
                        Your Turn!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* My hand */}
            <div className="shrink-0 z-20">
                <PlayerHand
                    cards={myHand} onCardClick={handleCardClick} isMyTurn={isMyTurn}
                    currentColor={currentColor} topCard={topCard} drawStack={drawStack}
                />
            </div>

            <ColorPicker show={showColorPicker} onSelect={handleColorSelect} />
            <GameOverModal data={gameOverData} roomId={roomId} />
            <ChatPanel messages={chatMessages} onSendMessage={msg => emit('chatMessage', { roomId, message: msg })}
                onSendEmoji={emoji => emit('emojiReaction', { roomId, emoji })} username={username} />
        </div>
    );
}

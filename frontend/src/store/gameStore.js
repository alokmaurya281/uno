import { create } from 'zustand';

const useGameStore = create((set, get) => ({
    gameState: null,
    myHand: [],
    topCard: null,
    currentColor: null,
    currentPlayerId: null,
    players: [],
    drawPileCount: 0,
    direction: 1,
    drawStack: 0,
    winner: null,
    gameOver: false,
    turnTimer: 30,
    turnStartTime: null,
    chatMessages: [],
    showColorPicker: false,
    pendingCard: null,
    gameOverData: null,

    setGameState: (gs) => set({
        gameState: gs,
        myHand: gs.myHand || [],
        topCard: gs.topCard,
        currentColor: gs.currentColor,
        currentPlayerId: gs.currentPlayerId,
        players: gs.players || [],
        drawPileCount: gs.drawPileCount,
        direction: gs.direction,
        drawStack: gs.drawStack,
        winner: gs.winner,
        gameOver: gs.gameOver,
        turnTimer: gs.turnTimer,
        turnStartTime: gs.turnStartTime,
    }),

    addChatMessage: (msg) => set(state => ({
        chatMessages: [...state.chatMessages.slice(-100), msg],
    })),

    setShowColorPicker: (show) => set({ showColorPicker: show }),
    setPendingCard: (card) => set({ pendingCard: card }),
    setGameOverData: (data) => set({ gameOverData: data }),

    clearGame: () => set({
        gameState: null,
        myHand: [],
        topCard: null,
        currentColor: null,
        currentPlayerId: null,
        players: [],
        drawPileCount: 0,
        direction: 1,
        drawStack: 0,
        winner: null,
        gameOver: false,
        chatMessages: [],
        showColorPicker: false,
        pendingCard: null,
        gameOverData: null,
    }),
}));

export default useGameStore;

import { create } from 'zustand';

const useLobbyStore = create((set) => ({
    rooms: [],
    currentRoom: null,

    setRooms: (rooms) => set({ rooms }),
    setCurrentRoom: (room) => set({ currentRoom: room }),

    clearRoom: () => set({ currentRoom: null }),
}));

export default useLobbyStore;

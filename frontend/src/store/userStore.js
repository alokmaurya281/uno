import { create } from 'zustand';

const useUserStore = create((set, get) => ({
    username: localStorage.getItem('uno_username') || '',
    playerData: null,

    setUsername: (username) => {
        localStorage.setItem('uno_username', username);
        set({ username });
    },

    setPlayerData: (data) => set({ playerData: data }),

    clearUser: () => {
        localStorage.removeItem('uno_username');
        set({ username: '', playerData: null });
    },
}));

export default useUserStore;

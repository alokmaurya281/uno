import { io } from 'socket.io-client';
import { useEffect, useRef, useState, useCallback } from 'react';

// In production the frontend is served from the same server, so connect to same origin.
// In dev, Vite proxies /socket.io so we also connect to same origin (window.location).
const SOCKET_URL = import.meta.env.VITE_API_URL || undefined; // undefined = same origin

let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            transports: ['websocket', 'polling'],
        });
    }
    return socket;
}

export function useSocket() {
    const socketRef = useRef(getSocket());
    const [connected, setConnected] = useState(socketRef.current.connected);

    useEffect(() => {
        const s = socketRef.current;
        if (!s.connected) s.connect();

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
        };
    }, []);

    const emit = useCallback((event, data, callback) => {
        socketRef.current.emit(event, data, callback);
    }, []);

    const on = useCallback((event, handler) => {
        socketRef.current.on(event, handler);
        return () => socketRef.current.off(event, handler);
    }, []);

    const off = useCallback((event, handler) => {
        socketRef.current.off(event, handler);
    }, []);

    return { socket: socketRef.current, connected, emit, on, off };
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['😂', '😡', '😭', '🔥', '👏', '💀', '🎉', '😈'];

export default function ChatPanel({ messages, onSendMessage, onSendEmoji, username }) {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const send = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input.trim());
        setInput('');
    };

    return (
        <>
            {/* Toggle (mobile) */}
            <button
                className="fixed bottom-14 right-3 md:hidden z-40 w-10 h-10 rounded-full btn-primary shadow-lg flex items-center justify-center text-lg"
                onClick={() => setOpen(!open)}
            >
                💬
            </button>

            {/* Backdrop (mobile) */}
            {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}

            {/* Panel */}
            <div
                className={`fixed z-40 flex flex-col glass-strong
          bottom-0 left-0 right-0 h-[50vh] rounded-t-2xl
          md:top-0 md:right-0 md:left-auto md:bottom-0 md:h-full md:w-72 md:rounded-none
          transition-transform duration-300
          ${open ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}
            >
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-sm font-semibold">Chat</h3>
                    <button className="md:hidden text-base" onClick={() => setOpen(false)}>✕</button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div key={msg.id}
                                className={msg.username === username ? 'text-right' : ''}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-[10px] text-[var(--text-secondary)] mb-0.5">{msg.username}</p>
                                <div className={`inline-block rounded-lg px-2.5 py-1.5 text-xs max-w-[180px] break-words
                  ${msg.username === username ? 'bg-[var(--neon-blue)]/15' : 'bg-[var(--bg-card)]'}`}>
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {messages.length === 0 && (
                        <p className="text-center text-[var(--text-secondary)] text-xs py-8">No messages yet</p>
                    )}
                </div>

                {/* Emojis */}
                <div className="px-3 py-1.5 border-t border-white/8 flex justify-center gap-1 flex-shrink-0">
                    {EMOJIS.map((e) => (
                        <button key={e} className="text-base hover:scale-125 transition-transform p-0.5"
                            onClick={() => onSendEmoji(e)}>{e}</button>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={send} className="p-2.5 border-t border-white/8 flex gap-2 flex-shrink-0 safe-bottom">
                    <input className="input-neon flex-1 py-1.5 text-xs" placeholder="Type..."
                        value={input} onChange={(e) => setInput(e.target.value)} maxLength={200} />
                    <button type="submit" className="btn-primary px-3 py-1.5 text-xs">Send</button>
                </form>
            </div>
        </>
    );
}

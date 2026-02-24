import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['😂', '😡', '😭', '🔥', '👏', '💀', '🎉', '😈'];

export default function ChatPanel({ messages, onSendMessage, onSendEmoji, username }) {
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input.trim());
        setInput('');
    };

    return (
        <>
            {/* Toggle button */}
            <button
                className="fixed bottom-16 right-3 sm:bottom-4 sm:right-4 md:hidden z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full btn-primary flex items-center justify-center text-lg shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                💬
            </button>

            {/* Backdrop on mobile */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Chat panel */}
            <div
                className={`fixed z-40 flex flex-col
          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0 h-[55vh] rounded-t-2xl
          /* Desktop: side panel */
          md:top-0 md:right-0 md:left-auto md:bottom-0 md:h-full md:w-72 lg:w-80 md:rounded-none
          glass-strong
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:translate-x-0'}
        `}
            >
                {/* Header */}
                <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                    <h3 className="font-semibold text-sm">Chat</h3>
                    <button className="md:hidden text-base p-1" onClick={() => setIsOpen(false)}>✕</button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div key={msg.id}
                                className={msg.username === username ? 'text-right' : ''}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <span className="text-[10px] text-[var(--text-secondary)]">{msg.username}</span>
                                <div className={`inline-block rounded-lg px-2.5 py-1.5 text-xs sm:text-sm max-w-[200px] break-words
                  ${msg.username === username ? 'bg-[var(--neon-blue)]/20 ml-auto' : 'bg-[var(--bg-card)]'}`}>
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {messages.length === 0 && (
                        <div className="text-center text-[var(--text-secondary)] text-xs py-6">No messages yet</div>
                    )}
                </div>

                {/* Emoji bar */}
                <div className="px-2 py-1.5 border-t border-white/10 flex gap-0.5 justify-center flex-shrink-0">
                    {EMOJIS.map(emoji => (
                        <button key={emoji} className="text-base sm:text-lg hover:scale-125 transition-transform p-0.5"
                            onClick={() => onSendEmoji(emoji)}>
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-2 border-t border-white/10 flex gap-2 flex-shrink-0 safe-bottom">
                    <input className="input-neon flex-1 py-1.5 text-xs sm:text-sm" placeholder="Type..."
                        value={input} onChange={e => setInput(e.target.value)} maxLength={200} />
                    <button type="submit" className="btn-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm">Send</button>
                </form>
            </div>
        </>
    );
}

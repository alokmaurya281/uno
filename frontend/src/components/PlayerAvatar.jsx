import { motion } from 'framer-motion';

export default function PlayerAvatar({ player, isCurrentTurn, isMe }) {
    return (
        <motion.div className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div
                className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold
          ${isCurrentTurn ? 'active-turn' : 'border-2 border-transparent'}
          ${!player.connected && !player.isBot ? 'opacity-30' : ''}
          ${player.isBot ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)]'}
        `}
                animate={isCurrentTurn ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {player.isBot ? '🤖' : player.username?.[0]?.toUpperCase()}
            </motion.div>
            <span className={`text-[10px] sm:text-xs font-medium truncate max-w-[56px] sm:max-w-[70px] leading-tight
        ${isMe ? 'text-[var(--neon-green)]' : 'text-[var(--text-secondary)]'}`}>
                {isMe ? 'You' : player.username}
            </span>
            <div className="flex items-center gap-0.5">
                <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)]">{player.cardCount ?? 0}</span>
                {player.cardCount === 1 && (
                    <motion.span className="text-[var(--neon-red)] text-[9px] sm:text-[10px] font-bold"
                        animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        UNO!
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
}

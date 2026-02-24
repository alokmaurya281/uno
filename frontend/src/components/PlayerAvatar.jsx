import { motion } from 'framer-motion';

export default function PlayerAvatar({ player, isCurrentTurn, isMe }) {
    return (
        <div className="flex flex-col items-center gap-0.5 w-14 sm:w-16">
            <motion.div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base font-bold
          ${isCurrentTurn ? 'active-turn' : 'border-2 border-white/10'}
          ${!player.connected && !player.isBot ? 'opacity-25' : ''}
          ${player.isBot ? 'bg-gradient-to-br from-gray-600 to-gray-700' : 'bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)]'}`}
                animate={isCurrentTurn ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {player.isBot ? '🤖' : player.username?.[0]?.toUpperCase()}
            </motion.div>

            <p className={`text-[10px] sm:text-xs font-medium truncate w-full text-center leading-tight
        ${isMe ? 'text-[var(--neon-green)]' : 'text-[var(--text-secondary)]'}`}>
                {isMe ? 'You' : player.username}
            </p>

            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px]">
                <span className="text-[var(--text-secondary)]">{player.cardCount ?? 0}</span>
                {player.cardCount === 1 && (
                    <motion.span className="text-[var(--neon-red)] font-bold"
                        animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        UNO!
                    </motion.span>
                )}
            </div>
        </div>
    );
}

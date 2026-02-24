import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

const DIR = { 1: '↻', '-1': '↺' };
const CLR = { red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-400' };

export default function GameBoard({ topCard, currentColor, direction, drawPileCount, drawStack, onDraw, isMyTurn }) {
    return (
        <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-14 py-4">
            {/* Draw pile */}
            <motion.div
                className="relative flex-shrink-0 cursor-pointer"
                onClick={isMyTurn ? onDraw : undefined}
                whileHover={isMyTurn ? { scale: 1.04 } : {}}
                whileTap={isMyTurn ? { scale: 0.96 } : {}}
            >
                <Card faceDown />
                <span className="absolute -bottom-1 -right-1 bg-[var(--bg-card)] neon-border rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                    {drawPileCount}
                </span>
                {isMyTurn && (
                    <motion.div
                        className="absolute inset-0 rounded-[var(--radius-sm)] pointer-events-none"
                        animate={{ boxShadow: ['0 0 4px rgba(0,255,136,0.15)', '0 0 18px rgba(0,255,136,0.4)', '0 0 4px rgba(0,255,136,0.15)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.div>

            {/* Center info */}
            <div className="flex flex-col items-center gap-2">
                <motion.span
                    className="text-xl sm:text-2xl text-[var(--neon-blue)]"
                    animate={{ rotate: direction === 1 ? 360 : -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    {DIR[direction] || '↻'}
                </motion.span>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${CLR[currentColor] || 'bg-gray-500'} shadow-lg`} />
                <AnimatePresence>
                    {drawStack > 0 && (
                        <motion.span
                            className="bg-[var(--neon-red)] text-white px-2 py-0.5 rounded-full text-[10px] font-bold"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        >
                            +{drawStack}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Discard pile */}
            <div className="relative flex-shrink-0">
                <AnimatePresence mode="popLayout">
                    {topCard && (
                        <motion.div
                            key={topCard.id}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        >
                            <Card card={topCard} disabled />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

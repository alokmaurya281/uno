import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';

const DIRECTION_ICONS = { 1: '↻', '-1': '↺' };
const COLOR_INDICATOR = {
    red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-400',
};

export default function GameBoard({ topCard, currentColor, direction, drawPileCount, drawStack, onDraw, isMyTurn }) {
    return (
        <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-14 py-3 sm:py-6">
            {/* Draw Pile */}
            <motion.div
                className="relative cursor-pointer flex-shrink-0"
                onClick={isMyTurn ? onDraw : undefined}
                whileHover={isMyTurn ? { scale: 1.05 } : {}}
                whileTap={isMyTurn ? { scale: 0.95 } : {}}
            >
                <Card faceDown />
                <div className="absolute -bottom-1.5 -right-1.5 bg-[var(--bg-card)] rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs font-bold neon-border">
                    {drawPileCount}
                </div>
                {isMyTurn && (
                    <motion.div
                        className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none"
                        animate={{ boxShadow: ['0 0 5px rgba(0,255,136,0.2)', '0 0 20px rgba(0,255,136,0.5)', '0 0 5px rgba(0,255,136,0.2)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.div>

            {/* Center info */}
            <div className="flex flex-col items-center gap-2">
                <motion.div
                    className="text-xl sm:text-2xl md:text-3xl text-[var(--neon-blue)]"
                    animate={{ rotate: direction === 1 ? 360 : -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    {DIRECTION_ICONS[direction] || '↻'}
                </motion.div>
                <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full ${COLOR_INDICATOR[currentColor] || 'bg-gray-500'} shadow-lg`} />
                <AnimatePresence>
                    {drawStack > 0 && (
                        <motion.div className="bg-[var(--neon-red)] text-white px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            +{drawStack}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Discard Pile */}
            <div className="relative flex-shrink-0">
                <AnimatePresence mode="popLayout">
                    {topCard && (
                        <motion.div key={topCard.id}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                            <Card card={topCard} disabled />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

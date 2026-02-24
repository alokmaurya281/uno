import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
    { name: 'red', bg: 'bg-red-500', shadow: 'shadow-red-500/40' },
    { name: 'blue', bg: 'bg-blue-500', shadow: 'shadow-blue-500/40' },
    { name: 'green', bg: 'bg-green-500', shadow: 'shadow-green-500/40' },
    { name: 'yellow', bg: 'bg-yellow-400', shadow: 'shadow-yellow-400/40' },
];

export default function ColorPicker({ show, onSelect }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-xs w-full"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <h3 className="text-base sm:text-xl font-bold text-center mb-4 sm:mb-6 neon-text">Choose a Color</h3>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {COLORS.map(color => (
                                <motion.button
                                    key={color.name}
                                    className={`aspect-square rounded-xl sm:rounded-2xl ${color.bg} shadow-lg ${color.shadow}
                    flex items-center justify-center text-white font-bold text-sm sm:text-base capitalize`}
                                    onClick={() => onSelect(color.name)}
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {color.name}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

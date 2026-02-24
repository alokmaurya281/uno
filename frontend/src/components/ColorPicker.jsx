import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
    { name: 'red', cls: 'bg-red-500 shadow-red-500/30' },
    { name: 'blue', cls: 'bg-blue-500 shadow-blue-500/30' },
    { name: 'green', cls: 'bg-green-500 shadow-green-500/30' },
    { name: 'yellow', cls: 'bg-yellow-400 shadow-yellow-400/30' },
];

export default function ColorPicker({ show, onSelect }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="glass-strong p-6 sm:p-8 w-full max-w-[240px]"
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    >
                        <h3 className="text-base sm:text-lg font-bold text-center neon-text mb-5">Choose Color</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {COLORS.map((c) => (
                                <motion.button
                                    key={c.name}
                                    className={`aspect-square rounded-xl ${c.cls} shadow-lg flex items-center justify-center text-white font-bold text-sm capitalize`}
                                    onClick={() => onSelect(c.name)}
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {c.name}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

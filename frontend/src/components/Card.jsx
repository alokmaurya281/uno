import { motion } from 'framer-motion';

const CARD_SYMBOLS = {
    skip: '⊘', reverse: '⟲', draw2: '+2', wild: '★', wild_draw4: '+4',
};

const COLOR_MAP = {
    red: 'card-red', blue: 'card-blue', green: 'card-green', yellow: 'card-yellow', wild: 'card-wild',
};

export default function Card({ card, onClick, disabled, small, faceDown, style, className = '' }) {
    const w = small ? 'w-[var(--card-width)]' : 'w-[var(--card-width)]';
    const h = small ? 'h-[var(--card-height)]' : 'h-[var(--card-height)]';

    if (faceDown) {
        return (
            <motion.div
                className={`${w} ${h} rounded-lg sm:rounded-xl flex items-center justify-center font-bold cursor-default select-none shadow-lg ${className}`}
                style={{
                    background: 'linear-gradient(135deg, #1a1f2e 0%, #252b3d 100%)',
                    border: '2px solid rgba(255,255,255,0.08)',
                    ...style,
                }}
            >
                <span className="text-base sm:text-xl opacity-20">🎴</span>
            </motion.div>
        );
    }

    const display = CARD_SYMBOLS[card.value] || card.value;
    const colorClass = COLOR_MAP[card.type === 'wild' ? 'wild' : card.color] || 'card-wild';

    return (
        <motion.div
            className={`${colorClass} ${w} ${h} rounded-lg sm:rounded-xl flex flex-col items-center justify-between font-bold cursor-pointer select-none shadow-lg
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-xl'}
        ${className}`}
            style={{
                border: '2px solid rgba(255,255,255,0.25)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                padding: '3px',
                ...style,
            }}
            onClick={disabled ? undefined : onClick}
            whileHover={!disabled ? { y: -10, scale: 1.06, zIndex: 50 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            layout
        >
            <span className="text-[8px] sm:text-[10px] self-start ml-0.5 text-white/70 leading-none">
                {display}
            </span>
            <span className="text-lg sm:text-2xl md:text-3xl text-white font-black leading-none">
                {display}
            </span>
            <span className="text-[8px] sm:text-[10px] self-end mr-0.5 text-white/70 rotate-180 leading-none">
                {display}
            </span>
        </motion.div>
    );
}

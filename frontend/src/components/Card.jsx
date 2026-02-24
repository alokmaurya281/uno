import { motion } from 'framer-motion';

const SYMBOLS = { skip: '⊘', reverse: '⟲', draw2: '+2', wild: '★', wild_draw4: '+4' };
const COLORS = { red: 'card-red', blue: 'card-blue', green: 'card-green', yellow: 'card-yellow', wild: 'card-wild' };

export default function Card({ card, onClick, disabled, faceDown, style, className = '' }) {
    if (faceDown) {
        return (
            <div
                className={`w-[var(--card-w)] h-[var(--card-h)] rounded-[var(--radius-sm)] flex items-center justify-center shadow-md select-none ${className}`}
                style={{ background: 'linear-gradient(135deg, #1a1f2e, #252b3d)', border: '2px solid rgba(255,255,255,0.06)', ...style }}
            >
                <span className="text-lg opacity-15">🎴</span>
            </div>
        );
    }

    const label = SYMBOLS[card.value] || card.value;
    const colorCls = COLORS[card.type === 'wild' ? 'wild' : card.color] || 'card-wild';

    return (
        <motion.div
            className={`w-[var(--card-w)] h-[var(--card-h)] rounded-[var(--radius-sm)] flex flex-col items-center justify-between p-[3px] font-bold select-none shadow-md
        ${colorCls}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
            style={{ border: '2px solid rgba(255,255,255,0.2)', textShadow: '1px 1px 2px rgba(0,0,0,0.4)', ...style }}
            onClick={disabled ? undefined : onClick}
            whileHover={!disabled ? { y: -10, scale: 1.06, zIndex: 50 } : {}}
            whileTap={!disabled ? { scale: 0.94 } : {}}
            layout
        >
            <span className="text-[7px] sm:text-[9px] self-start ml-0.5 text-white/60 leading-none">{label}</span>
            <span className="text-base sm:text-2xl text-white font-black leading-none">{label}</span>
            <span className="text-[7px] sm:text-[9px] self-end mr-0.5 text-white/60 rotate-180 leading-none">{label}</span>
        </motion.div>
    );
}

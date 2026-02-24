import { motion } from 'framer-motion';
import Card from './Card';

export default function PlayerHand({ cards, onCardClick, isMyTurn, currentColor, topCard, drawStack }) {
    const canPlay = (c) => {
        if (!isMyTurn) return false;
        if (drawStack > 0) {
            if (topCard?.value === 'draw2') return c.value === 'draw2';
            if (topCard?.value === 'wild_draw4') return c.value === 'wild_draw4';
            return false;
        }
        if (c.type === 'wild') return true;
        if (c.color === currentColor) return true;
        if (c.value === topCard?.value) return true;
        return false;
    };

    // Overlap gets tighter as hand grows: -16 base, shrinks to -24 max
    const overlap = Math.max(-24, -16 + (cards.length > 7 ? -(cards.length - 7) * 1.5 : 0));

    return (
        <div
            className="flex items-end justify-center px-2 sm:px-4 pb-3 sm:pb-4 pt-1 overflow-x-auto safe-bottom"
            style={{ minHeight: 'calc(var(--card-h) + 24px)' }}
        >
            <div className="flex items-end" style={{ gap: `${overlap}px` }}>
                {cards.map((card, i) => {
                    const mid = (cards.length - 1) / 2;
                    const yOff = Math.abs(i - mid) * 1.5;
                    const playable = canPlay(card);

                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 36 }}
                            animate={{ opacity: 1, y: -yOff, transition: { delay: i * 0.02 } }}
                            style={{ zIndex: i }}
                        >
                            <Card
                                card={card}
                                onClick={() => onCardClick(card)}
                                disabled={!playable}
                                className={playable ? 'ring-1 ring-[var(--neon-green)]/40' : ''}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

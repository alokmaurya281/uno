import { motion } from 'framer-motion';
import Card from './Card';

export default function PlayerHand({ cards, onCardClick, isMyTurn, currentColor, topCard, drawStack }) {
    const canPlay = (card) => {
        if (!isMyTurn) return false;
        if (drawStack > 0) {
            if (topCard?.value === 'draw2') return card.value === 'draw2';
            if (topCard?.value === 'wild_draw4') return card.value === 'wild_draw4';
            return false;
        }
        if (card.type === 'wild') return true;
        if (card.color === currentColor) return true;
        if (card.value === topCard?.value) return true;
        return false;
    };

    // Responsive overlap: tighter on mobile, more cards visible
    const getOverlap = () => {
        if (typeof window === 'undefined') return -15;
        const isMobile = window.innerWidth < 640;
        const baseOverlap = isMobile ? -22 : -18;
        const perCard = isMobile ? 1.5 : 2;
        return Math.max(baseOverlap, -40 + cards.length * perCard);
    };

    return (
        <div className="flex items-end justify-center px-1 sm:px-4 pb-2 sm:pb-4 pt-1 overflow-x-auto overflow-y-visible safe-bottom"
            style={{ minHeight: 'calc(var(--card-height) + 30px)' }}>
            <div className="flex items-end" style={{ gap: `${getOverlap()}px` }}>
                {cards.map((card, i) => {
                    const mid = (cards.length - 1) / 2;
                    const offset = i - mid;
                    const yOffset = Math.abs(offset) * 1.5;
                    const playable = canPlay(card);

                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{
                                opacity: 1,
                                y: -yOffset,
                                transition: { delay: i * 0.02 },
                            }}
                            style={{ zIndex: i }}
                        >
                            <Card
                                card={card}
                                onClick={() => onCardClick(card)}
                                disabled={!playable}
                                className={playable ? 'ring-1 sm:ring-2 ring-[var(--neon-green)]/40' : ''}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

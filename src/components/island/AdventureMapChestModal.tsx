import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ConfettiBurst } from '../motion/ConfettiBurst';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { AdventureMapChestSprite } from './AdventureMapChestSprite';

type Props = {
  open: boolean;
  rewardLabel?: string;
  onClose: () => void;
};

export function AdventureMapChestModal({
  open,
  rewardLabel = '+50 XP de exploración',
  onClose,
}: Props) {
  const { reduceMotion, spring } = useMotionSafe();
  const [playChest, setPlayChest] = useState(false);

  useEffect(() => {
    if (open) {
      setPlayChest(true);
    } else {
      setPlayChest(false);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="fixed inset-0 z-[60] bg-atenas-ink/40"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            className="fixed left-1/2 top-1/2 z-[70] w-[min(90vw,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-elevated text-center border border-amber-200"
            initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
            transition={spring}
          >
            <ConfettiBurst className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" />
            <div className="flex justify-center mb-3">
              <AdventureMapChestSprite
                closed={false}
                playOpen={playChest}
                className="scale-125"
              />
            </div>
            <h3 className="text-xl font-bold text-atenas-ink mb-1">¡Tesoro encontrado!</h3>
            <p className="text-atenas-gold font-bold text-lg mb-4">{rewardLabel}</p>
            <button type="button" onClick={onClose} className="btn-primary w-full min-h-touch">
              ¡Genial!
            </button>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { nivelDesdeXp } from '../../lib/gamificacion';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';

type Props = {
  open: boolean;
  xpTotal: number;
  xpGanado?: number;
  onClose: () => void;
};

export function LevelUpModal({ open, xpTotal, xpGanado = 200, onClose }: Props) {
  const { reduceMotion, spring, stagger } = useMotionSafe();
  const nivel = nivelDesdeXp(xpTotal);

  const container = {
    hidden: { opacity: reduceMotion ? 1 : 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: reduceMotion ? 0 : 0.1 },
    },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: spring,
    },
  };

  return (
    <AnimatedOverlay
      open={open}
      onClose={onClose}
      panelClassName="max-w-sm"
      labelledBy="level-up-title"
    >
      <div className="rounded-3xl bg-gradient-to-b from-atenas-sidebar to-[#001a40] text-white p-8 text-center shadow-elevated border border-white/10">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <Trophy className="w-12 h-12 mx-auto text-atenas-gold mb-4" aria-hidden />
          </motion.div>
          <motion.p variants={item} className="text-sm uppercase tracking-widest text-blue-200 mb-2">
            ¡Subiste de nivel!
          </motion.p>
          <motion.h2 id="level-up-title" variants={item} className="text-4xl font-bold text-atenas-gold mb-1">
            Nivel {nivel.nivel}
          </motion.h2>
          <motion.p variants={item} className="text-lg font-semibold mb-6">
            {nivel.nombre}
          </motion.p>

          <motion.ul
            variants={item}
            className="space-y-2 text-sm text-left bg-white/10 rounded-2xl p-4 mb-6"
          >
            <li className="flex justify-between">
              <span>XP ganado</span>
              <span className="font-bold text-atenas-gold">+{xpGanado}</span>
            </li>
            <li className="flex justify-between">
              <span>Nuevo logro</span>
              <span className="font-semibold">Explorador experto</span>
            </li>
          </motion.ul>

          <motion.div variants={item}>
            <button type="button" onClick={onClose} className="btn-atenas-gold w-full">
              Continuar
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedOverlay>
  );
}

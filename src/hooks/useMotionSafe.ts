import { useReducedMotion } from 'framer-motion';
import type { Transition } from 'framer-motion';

export function useMotionSafe() {
  const reduceMotion = useReducedMotion() === true;

  const spring: Transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 320, damping: 28, mass: 0.85 };

  const fade: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] };

  const quick: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

  const stagger = reduceMotion ? 0 : 0.08;

  return { reduceMotion, spring, fade, quick, stagger };
}

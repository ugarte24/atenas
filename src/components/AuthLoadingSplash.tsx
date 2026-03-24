import { motion, useReducedMotion } from 'framer-motion';
import { ClassicalBackdrop } from './ClassicalBackdrop';

/**
 * Pantalla de carga de sesión (splash): entrada con resorte y pulso suave en el logo.
 * Respeta prefers-reduced-motion.
 */
export function AuthLoadingSplash() {
  const reduceMotion = useReducedMotion();
  const soft = reduceMotion === true;

  const cardTransition = soft
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 28, mass: 0.85 };

  return (
    <div className="relative isolate min-h-screen min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center gap-4 px-4">
      <ClassicalBackdrop />
      <motion.div
        className="relative z-10 card p-8 text-center max-w-sm shadow-lg"
        initial={soft ? false : { opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={cardTransition}
      >
        <motion.h1
          className="atenas-logo"
          initial={soft ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            soft
              ? { duration: 0 }
              : { delay: 0.06, type: 'spring', stiffness: 400, damping: 30 }
          }
        >
          ATENAS
        </motion.h1>
        <motion.div
          className="mx-auto mt-2 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-[#d6b98c]/75 to-transparent"
          aria-hidden
          initial={soft ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={
            soft
              ? { duration: 0 }
              : { delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ transformOrigin: 'center' }}
        />
        <motion.p
          className="atenas-subtitle mt-2"
          initial={soft ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: soft ? 0 : 0.14, duration: soft ? 0 : 0.35 }}
        >
          Ciencias Sociales · 6.º Primaria
        </motion.p>
        <p className="text-slate-500 text-sm mt-4 flex justify-center items-center gap-0.5" role="status" aria-live="polite">
          <span>Cargando</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="font-semibold translate-y-px"
              aria-hidden
              animate={soft ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }}
              transition={
                soft
                  ? { duration: 0 }
                  : { duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }
              }
            >
              .
            </motion.span>
          ))}
        </p>
      </motion.div>
    </div>
  );
}

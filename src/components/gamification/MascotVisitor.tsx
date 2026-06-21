import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useMascotVisitorContext } from '../../contexts/MascotVisitorContext';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { MascotLottie } from '../MascotLottie';
import { cn } from '../ui/cn';

export function MascotVisitor() {
  const { profile } = useAuthContext();
  const { visible, message, dismiss, onPointerEnter, onPointerLeave } = useMascotVisitorContext();
  const { reduceMotion, spring } = useMotionSafe();

  if (profile?.role !== 'estudiante') return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="mascot-visitor"
          role="status"
          aria-live="polite"
          className={cn(
            'fixed z-40 max-w-[min(20rem,calc(100vw-2rem))]',
            'bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] right-4',
            'lg:bottom-6 lg:right-6'
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          transition={spring}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
        >
          <div className="relative flex gap-3 items-end rounded-2xl border border-atenas-mist-border bg-white shadow-elevated p-3 pr-10">
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-atenas-muted hover:bg-atenas-mist hover:text-atenas-ink"
              aria-label="Cerrar consejo"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
            <MascotLottie variant="idle" loop className="w-14 h-14 shrink-0" />
            <p className="text-sm text-atenas-ink leading-snug pb-0.5 min-w-0">{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

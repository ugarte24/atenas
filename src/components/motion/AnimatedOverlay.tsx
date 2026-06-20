import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { cn } from '../ui/cn';

type Props = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  labelledBy?: string;
};

export function AnimatedOverlay({
  open,
  onClose,
  children,
  className,
  panelClassName,
  labelledBy,
}: Props) {
  const { reduceMotion, spring } = useMotionSafe();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      prev?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4 bg-atenas-sidebar/80 backdrop-blur-sm',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className={cn('w-full max-w-sm outline-none', panelClassName)}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: 8 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

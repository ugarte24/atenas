import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { cn } from '../ui/cn';

type Props = {
  stars: 0 | 1 | 2 | 3;
  className?: string;
};

export function AdventureMapNodeStars({ stars, className }: Props) {
  const { reduceMotion } = useMotionSafe();

  return (
    <div className={cn('flex items-center gap-0.5 mt-1', className)} aria-hidden>
      {[0, 1, 2].map((i) => {
        const filled = i < stars;
        return (
          <motion.div
            key={i}
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { delay: i * 0.08, type: 'spring', stiffness: 400 }}
          >
            <Star
              className={cn(
                'w-3.5 h-3.5 sm:w-4 sm:h-4',
                filled ? 'text-amber-400 fill-amber-400 drop-shadow' : 'text-white/40 fill-transparent'
              )}
              strokeWidth={2}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

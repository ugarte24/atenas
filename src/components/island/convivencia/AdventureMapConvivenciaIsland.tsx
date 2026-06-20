import { useState } from 'react';
import { motion } from 'framer-motion';
import { ADVENTURE_MAP_ASSETS } from '../../../lib/adventureMapAssets';
import { CONVIVENCIA_ISLAND } from '../../../lib/convivenciaMapLayout';
import { useMotionSafe } from '../../../hooks/useMotionSafe';
import { AdventureMapConvivenciaFallback } from './AdventureMapConvivenciaFallback';
import { cn } from '../../ui/cn';

type Props = { className?: string };

/**
 * Isla Convivencia premium: WebP ilustrado pintado + fallback SVG si falla la carga.
 */
export function AdventureMapConvivenciaIsland({ className }: Props) {
  const { reduceMotion } = useMotionSafe();
  const [webpFailed, setWebpFailed] = useState(false);
  const webpSrc = ADVENTURE_MAP_ASSETS.islandWebp(1);
  const fullBleed = CONVIVENCIA_ISLAND.paintedArt;

  if (webpFailed) {
    return (
      <div
        className={cn(
          'absolute inset-0 flex items-start justify-center',
          fullBleed ? 'pt-0' : 'pt-[6%]',
          className
        )}
        aria-hidden
      >
        <div
          className={cn(
            'relative drop-shadow-[0_16px_32px_rgba(0,45,98,0.35)]',
            fullBleed ? 'h-full w-full' : 'h-[88%]'
          )}
          style={fullBleed ? undefined : { width: `${CONVIVENCIA_ISLAND.widthPct * 100}%` }}
        >
          <AdventureMapConvivenciaFallback className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('absolute inset-0', className)} aria-hidden>
      <motion.div
        className="relative h-full w-full"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {!fullBleed && (
          <div
            className="absolute -bottom-[2%] left-1/2 -translate-x-1/2 w-[92%] h-[4%] rounded-[50%] bg-sky-950/25 blur-md"
            aria-hidden
          />
        )}
        <img
          src={webpSrc}
          alt=""
          draggable={false}
          decoding="async"
          className={cn(
            'h-full w-full',
            fullBleed
              ? 'object-cover object-center'
              : 'object-contain object-center drop-shadow-[0_12px_28px_rgba(0,45,98,0.3)]'
          )}
          onError={() => setWebpFailed(true)}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 mix-blend-soft-light"
          aria-hidden
        />
      </motion.div>
    </div>
  );
}

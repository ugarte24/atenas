import { ADVENTURE_MAP_ASSETS, CHEST_SPRITE } from '../../lib/adventureMapAssets';
import { IsometricChest } from './AdventureMapIslandIllustration';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { cn } from '../ui/cn';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export type ChestAnimFrame = 0 | 1 | 2;

type Props = {
  closed: boolean;
  playOpen?: boolean;
  className?: string;
  onOpenComplete?: () => void;
};

const FRAME_MS = 180;
const DISPLAY = 64;

export function AdventureMapChestSprite({ closed, playOpen, className, onOpenComplete }: Props) {
  const { reduceMotion } = useMotionSafe();
  const [frame, setFrame] = useState<ChestAnimFrame>(closed ? 0 : 2);
  const [webpFailed, setWebpFailed] = useState(false);

  useEffect(() => {
    if (!playOpen || reduceMotion) {
      setFrame(closed ? 0 : 2);
      if (playOpen && reduceMotion) onOpenComplete?.();
      return;
    }
    setFrame(0);
    const t1 = window.setTimeout(() => setFrame(1), FRAME_MS);
    const t2 = window.setTimeout(() => {
      setFrame(2);
      onOpenComplete?.();
    }, FRAME_MS * 2);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [playOpen, closed, reduceMotion, onOpenComplete]);

  useEffect(() => {
    if (!playOpen) setFrame(closed ? 0 : 2);
  }, [closed, playOpen]);

  const displayFrame = closed && !playOpen ? 0 : frame;

  if (webpFailed) {
    return (
      <svg viewBox="-24 -20 48 44" className={cn('w-16 h-16 drop-shadow-lg', className)} aria-hidden>
        <IsometricChest closed={displayFrame === 0} />
      </svg>
    );
  }

  const scale = DISPLAY / CHEST_SPRITE.frameWidth;

  return (
    <div className={cn('relative', className)} style={{ width: DISPLAY, height: DISPLAY }} aria-hidden>
      <div
        className="absolute inset-0 bg-no-repeat drop-shadow-lg"
        style={{
          backgroundImage: `url(${ADVENTURE_MAP_ASSETS.chestSpriteWebp})`,
          backgroundSize: `${CHEST_SPRITE.frameWidth * CHEST_SPRITE.frameCount * scale}px ${CHEST_SPRITE.frameHeight * scale}px`,
          backgroundPosition: `-${displayFrame * CHEST_SPRITE.frameWidth * scale}px 0`,
        }}
      />
      <img
        src={ADVENTURE_MAP_ASSETS.chestSpriteWebp}
        alt=""
        className="sr-only"
        onError={() => setWebpFailed(true)}
      />
      {playOpen && !reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-amber-300/50 blur-md -z-10"
          initial={{ scale: 0.8, opacity: 0.9 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, delay: FRAME_MS / 1000 }}
        />
      )}
    </div>
  );
}

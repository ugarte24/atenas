import { lazy, Suspense } from 'react';
import { useReducedMotion } from 'framer-motion';

const CelebrateBurst = lazy(() => import('./MascotLottieCelebrate'));
const MascotIdle = lazy(() => import('./MascotLottieIdle'));

type Props = {
  variant?: 'celebrate' | 'idle';
  loop?: boolean;
  className?: string;
};

export function MascotLottie({ variant = 'idle', loop, className }: Props) {
  const reduceMotion = useReducedMotion() === true;
  const fallback = (
    <img src="/mascot-owl.svg" alt="" className={className} aria-hidden />
  );

  if (reduceMotion) return fallback;

  const shouldLoop = loop ?? variant === 'idle';

  return (
    <Suspense fallback={fallback}>
      {variant === 'celebrate' ? (
        <CelebrateBurst className={className} loop={shouldLoop} />
      ) : (
        <MascotIdle className={className} loop={shouldLoop} />
      )}
    </Suspense>
  );
}

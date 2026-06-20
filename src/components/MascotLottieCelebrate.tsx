import { cn } from './ui/cn';
import { Lottie } from '../lib/lottieReact';
import celebrateBurst from '../assets/lottie/celebrate-burst.json';

type Props = { className?: string; loop?: boolean };

export default function MascotLottieCelebrate({ className, loop = false }: Props) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden', className)} aria-hidden>
      <Lottie
        animationData={celebrateBurst}
        loop={loop}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

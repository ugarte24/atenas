import { cn } from './ui/cn';
import { Lottie } from '../lib/lottieReact';
import mascotIdle from '../assets/lottie/mascot-idle.json';

type Props = { className?: string; loop?: boolean };

export default function MascotLottieIdle({ className, loop = true }: Props) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden', className)} aria-hidden>
      <Lottie animationData={mascotIdle} loop={loop} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

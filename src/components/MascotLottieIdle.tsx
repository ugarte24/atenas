import Lottie from 'lottie-react';
import mascotIdle from '../assets/lottie/mascot-idle.json';

type Props = { className?: string; loop?: boolean };

export default function MascotLottieIdle({ className, loop = true }: Props) {
  return <Lottie animationData={mascotIdle} loop={loop} className={className} />;
}

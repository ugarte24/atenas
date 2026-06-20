import Lottie from 'lottie-react';
import celebrateBurst from '../assets/lottie/celebrate-burst.json';

type Props = { className?: string; loop?: boolean };

export default function MascotLottieCelebrate({ className, loop = false }: Props) {
  return <Lottie animationData={celebrateBurst} loop={loop} className={className} />;
}

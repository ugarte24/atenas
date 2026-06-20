import { Lottie } from '../lib/lottieReact';
import splashFaviconLoop from '../assets/lottie/splash-favicon.json';

type Props = { className?: string };

/** Lottie del favicon (carga en chunk aparte). */
export default function SplashLottieFavicon({ className }: Props) {
  return <Lottie animationData={splashFaviconLoop} loop className={className} />;
}

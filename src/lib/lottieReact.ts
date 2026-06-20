import type { LottieComponentProps } from 'lottie-react';
import type { FC } from 'react';
import LottieImport from 'lottie-react';

/** Vite 8 / ESM: el default a veces llega anidado como `{ default: Component }`. */
function resolveLottieComponent(mod: unknown): FC<LottieComponentProps> {
  if (typeof mod === 'function') return mod as FC<LottieComponentProps>;
  const nested = (mod as { default?: unknown } | null)?.default;
  if (typeof nested === 'function') return nested as FC<LottieComponentProps>;
  throw new Error('No se pudo cargar el componente Lottie.');
}

export const Lottie = resolveLottieComponent(LottieImport);

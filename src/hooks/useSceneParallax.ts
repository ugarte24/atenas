import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { useMotionSafe } from './useMotionSafe';

export type SceneParallax = {
  skyY: ReturnType<typeof useTransform<number, string>>;
  farY: ReturnType<typeof useTransform<number, string>>;
  midY: ReturnType<typeof useTransform<number, string>>;
  fgY: ReturnType<typeof useTransform<number, string>>;
  reduceMotion: boolean;
};

/** Parallax vertical en 4 capas al hacer scroll por cada escena. */
export function useSceneParallax(
  sceneRef: React.RefObject<HTMLElement | null>
): SceneParallax {
  const { reduceMotion } = useMotionSafe();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  });

  const skyY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const farY = useTransform(scrollYProgress, [0, 1], ['-4%', '10%']);
  const midY = useTransform(scrollYProgress, [0, 1], ['-2%', '14%']);
  const fgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return { skyY, farY, midY, fgY, reduceMotion };
}

export function useSceneRef() {
  return useRef<HTMLElement>(null);
}

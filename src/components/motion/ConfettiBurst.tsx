import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '../../hooks/useMotionSafe';

const COLORS = ['#d4a853', '#28a745', '#1e3a5f', '#f59e0b', '#60a5fa', '#f472b6'];

type Particle = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  size: number;
  driftX: number;
  driftY: number;
};

type Props = {
  active?: boolean;
  durationMs?: number;
  className?: string;
};

export function ConfettiBurst({ active = true, durationMs = 1500, className }: Props) {
  const { reduceMotion } = useMotionSafe();
  const [visible, setVisible] = useState(active);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 30 + Math.random() * 20,
      rotate: Math.random() * 360,
      color: COLORS[i % COLORS.length]!,
      size: 6 + Math.random() * 6,
      driftX: (Math.random() - 0.5) * 120,
      driftY: 40 + Math.random() * 80,
    }));
  }, []);

  useEffect(() => {
    if (!active || reduceMotion) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs, reduceMotion]);

  if (reduceMotion || !visible) return null;

  return (
    <div
      className={className ?? 'pointer-events-none absolute inset-0 overflow-hidden z-0'}
      aria-hidden
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: p.rotate, scale: 1 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.driftX,
            y: p.driftY,
            rotate: p.rotate + 180,
            scale: [1, 0.8],
          }}
          transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

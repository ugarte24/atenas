import { ConfettiBurst } from '../motion/ConfettiBurst';

type Props = {
  active: boolean;
  className?: string;
};

export function AdventureMapCompletionBurst({ active, className }: Props) {
  if (!active) return null;
  return <ConfettiBurst active className={className} durationMs={1800} />;
}

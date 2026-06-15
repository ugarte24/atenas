import { cn } from './cn';

type Props = {
  className?: string;
  lines?: number;
};

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-atenas-mist', className)}
      aria-hidden
    />
  );
}

export function SkeletonLines({ lines = 3, className }: Props) {
  return (
    <div className={cn('space-y-3', className)} aria-busy aria-label="Cargando">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4" aria-busy aria-label="Cargando">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

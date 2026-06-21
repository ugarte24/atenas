import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

type Props = {
  children: ReactNode;
  className?: string;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
};

export function AdventureMapCanvas({ children, className, canvasRef }: Props) {
  return (
    <div
      className={cn(
        'relative w-full max-w-2xl mx-auto rounded-3xl overflow-y-auto overflow-x-hidden',
        'border-2 border-sky-300/70 ring-4 ring-sky-100/90 shadow-elevated',
        'min-h-[70vh] max-h-[85vh] scrollbar-nav-hide overscroll-y-contain touch-pan-y',
        className
      )}
    >
      <div ref={canvasRef} className="relative flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}

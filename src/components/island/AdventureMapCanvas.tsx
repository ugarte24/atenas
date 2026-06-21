import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

type Props = {
  children: ReactNode;
  className?: string;
  /** Contenedor con overflow-y (scroll del mapa) */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Contenido interno (nodos y mundos) */
  contentRef?: React.RefObject<HTMLDivElement | null>;
};

export function AdventureMapCanvas({ children, className, scrollRef, contentRef }: Props) {
  return (
    <div
      ref={scrollRef}
      style={{ WebkitOverflowScrolling: 'touch' }}
      className={cn(
        'relative w-full max-w-2xl mx-auto rounded-3xl overflow-y-auto overflow-x-hidden',
        'border-2 border-sky-300/70 ring-4 ring-sky-100/90 shadow-elevated',
        'min-h-[70vh] max-h-[85vh] scrollbar-nav-hide overscroll-y-contain touch-pan-y',
        className
      )}
    >
      <div ref={contentRef} className="relative flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}

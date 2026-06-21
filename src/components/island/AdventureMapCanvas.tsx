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
        'relative z-0 w-full max-w-2xl mx-auto rounded-3xl overflow-x-hidden',
        'border-2 border-sky-300/70 ring-4 ring-sky-100/90 shadow-elevated',
        'touch-pan-y scrollbar-nav-hide',
        /* Móvil: el mapa crece con la página → scroll continuo fuera del mapa */
        'max-lg:overflow-visible max-lg:min-h-0 max-lg:max-h-none',
        /* Desktop: caja con scroll interno */
        'lg:overflow-y-auto lg:min-h-[70vh] lg:max-h-[85vh] lg:overscroll-y-contain',
        className
      )}
    >
      <div ref={contentRef} className="relative flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}

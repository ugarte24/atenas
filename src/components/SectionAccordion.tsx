import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './ui/cn';

type Props = {
  title: string;
  description?: string;
  step?: number;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

/** Sección colapsable para móvil (Teoría, Actividades, etc.) */
export function SectionAccordion({
  title,
  description,
  step,
  defaultOpen = true,
  children,
  className,
}: Props) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        'group mb-6 rounded-2xl border border-atenas-mist-border bg-white shadow-card overflow-hidden',
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 border-b border-transparent group-open:border-atenas-mist-border bg-atenas-page/50 hover:bg-atenas-mist/40 transition-colors [&::-webkit-details-marker]:hidden">
        {step != null && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-atenas-ink text-white text-sm font-bold"
            aria-hidden
          >
            {step}
          </span>
        )}
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-base sm:text-lg font-bold text-atenas-ink">{title}</h2>
          {description && (
            <p className="text-xs sm:text-sm text-atenas-muted mt-0.5">{description}</p>
          )}
        </div>
        <ChevronDown
          className="w-5 h-5 text-atenas-muted shrink-0 mt-1 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="p-5 sm:p-6">{children}</div>
    </details>
  );
}

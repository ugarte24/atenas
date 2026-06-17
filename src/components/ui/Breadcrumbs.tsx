import { Link } from 'react-router-dom';
import { cn } from './cn';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn('text-xs text-atenas-text-muted flex flex-wrap items-center gap-1', className)}
      aria-label="Ruta"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1 min-w-0">
            {i > 0 && (
              <span className="text-atenas-mist-border select-none" aria-hidden>
                ›
              </span>
            )}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-atenas-ink font-medium truncate max-w-[10rem] sm:max-w-none">
                {item.label}
              </Link>
            ) : (
              <span
                className={cn('truncate max-w-[12rem] sm:max-w-none', isLast && 'text-atenas-ink font-semibold')}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

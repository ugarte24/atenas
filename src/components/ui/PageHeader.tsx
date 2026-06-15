import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from './cn';

export type BreadcrumbItem = { label: string; to?: string };

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: Props) {
  return (
    <header className={cn('mb-6 sm:mb-8 border-b border-atenas-mist-border pb-5', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-xs text-atenas-muted mb-2">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 opacity-60" aria-hidden />}
              {item.to ? (
                <Link to={item.to} className="hover:text-atenas-ink font-medium transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-atenas-muted-strong font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-atenas-muted mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="text-page-title font-bold text-atenas-ink leading-tight">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-atenas-muted mt-2 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

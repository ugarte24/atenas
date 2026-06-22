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
  /** Icono en recuadro junto al título (variante hero). */
  icon?: ReactNode;
  /** Línea meta bajo la descripción (variante hero). */
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
  variant?: 'default' | 'hero';
};

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  icon,
  meta,
  actions,
  className,
  variant = 'default',
}: Props) {
  const isHero = variant === 'hero';

  const breadcrumbNav =
    breadcrumbs && breadcrumbs.length > 0 ? (
      <nav
        aria-label="Ruta"
        className={cn(
          'flex flex-wrap items-center gap-1 text-xs mb-3',
          isHero ? 'text-white/65' : 'text-atenas-muted mb-2'
        )}
      >
        {breadcrumbs.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 shrink-0 opacity-60" aria-hidden />}
            {item.to ? (
              <Link
                to={item.to}
                className={cn(
                  'font-medium transition-colors',
                  isHero ? 'hover:text-white' : 'hover:text-atenas-ink'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn('font-medium', isHero ? 'text-white/90' : 'text-atenas-muted-strong')}>
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    ) : null;

  const titleBlock = (
    <div className="min-w-0 flex-1">
      {eyebrow && !breadcrumbs?.length && (
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-wide mb-1',
            isHero ? 'text-white/70' : 'text-atenas-muted'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          'text-page-title font-bold leading-tight',
          isHero ? 'text-white' : 'text-atenas-ink'
        )}
      >
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            'text-sm sm:text-base mt-2 max-w-2xl leading-relaxed',
            isHero ? 'text-white/80' : 'text-atenas-muted'
          )}
        >
          {description}
        </p>
      )}
      {meta && isHero && (
        <div className="text-xs sm:text-sm text-white/70 mt-3 font-medium">{meta}</div>
      )}
    </div>
  );

  const actionsBlock = actions && (
    <div className={cn('flex flex-col sm:flex-row flex-wrap gap-2 shrink-0 w-full sm:w-auto')}>
      {actions}
    </div>
  );

  if (isHero) {
    return (
      <header
        className={cn(
          'mb-6 rounded-2xl border border-atenas-mist-border shadow-card overflow-hidden',
          className
        )}
      >
        <div className="bg-atenas-sidebar text-white p-5 sm:p-6">
          {breadcrumbNav}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              {icon && (
                <div
                  className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white"
                  aria-hidden
                >
                  {icon}
                </div>
              )}
              {titleBlock}
            </div>
            {actionsBlock}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn('mb-6 sm:mb-8 border-b border-atenas-mist-border pb-5', className)}>
      {breadcrumbNav}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <div
              className="shrink-0 w-11 h-11 rounded-xl bg-atenas-blue/10 text-atenas-blue flex items-center justify-center"
              aria-hidden
            >
              {icon}
            </div>
          )}
          {titleBlock}
        </div>
        {actionsBlock}
      </div>
    </header>
  );
}

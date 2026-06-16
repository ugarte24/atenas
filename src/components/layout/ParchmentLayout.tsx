import { cn } from '../ui/cn';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  footer?: React.ReactNode;
  className?: string;
};

export function ParchmentLayout({
  children,
  title,
  subtitle,
  step,
  totalSteps,
  footer,
  className,
}: Props) {
  return (
    <div className={cn('min-h-[60vh] rounded-3xl parchment-bg border border-amber-200/60 shadow-elevated overflow-hidden', className)}>
      {(title || step != null) && (
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-amber-200/40">
          {step != null && totalSteps != null && (
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/70 mb-1">
              Paso {step} de {totalSteps}
            </p>
          )}
          {title && <h1 className="text-xl sm:text-2xl font-bold text-amber-950">{title}</h1>}
          {subtitle && <p className="text-sm text-amber-900/80 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-5 sm:px-8 py-6">{children}</div>
      {footer && (
        <div className="px-5 sm:px-8 py-4 border-t border-amber-200/40 bg-amber-100/30">{footer}</div>
      )}
    </div>
  );
}

export function ParchmentFooter({
  step,
  totalSteps,
  progress,
}: {
  step?: number;
  totalSteps?: number;
  progress?: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <img src="/mascot-owl.svg" alt="" className="w-10 h-10 shrink-0 hidden sm:block" aria-hidden />
      <div className="flex-1 min-w-0">
        {step != null && totalSteps != null && (
          <p className="text-xs font-semibold text-amber-900 mb-1.5">
            {step} / {totalSteps}
          </p>
        )}
        {progress != null && (
          <div className="h-2 rounded-full bg-amber-200/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-atenas-success transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

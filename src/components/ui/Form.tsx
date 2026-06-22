import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type PanelProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function FormPanel({ children, className, ...props }: PanelProps) {
  return (
    <div className={cn('form-panel', className)} {...props}>
      {children}
    </div>
  );
}

type HeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  titleId?: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
};

export function FormHeader({ title, titleId, description, icon, badge, actions, className, ...props }: HeaderProps) {
  return (
    <div className={cn('form-panel-header', className)} {...props}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="shrink-0 w-11 h-11 rounded-xl bg-atenas-blue text-white flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={titleId} className="text-base sm:text-lg font-bold text-atenas-ink leading-snug">{title}</h2>
            {badge}
          </div>
          {description && <p className="text-sm text-atenas-muted mt-1 leading-relaxed">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function FormBody({ children, className, ...props }: PanelProps) {
  return (
    <div className={cn('form-panel-body', className)} {...props}>
      {children}
    </div>
  );
}

type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
  boxed?: boolean;
  children: ReactNode;
};

export function FormSection({ title, description, boxed, children, className, ...props }: SectionProps) {
  const content = (
    <>
      {(title || description) && (
        <div>
          {title && <h3 className="form-section-title">{title}</h3>}
          {description && <p className="field-hint mt-1">{description}</p>}
        </div>
      )}
      {children}
    </>
  );

  if (boxed) {
    return (
      <section className={cn('form-section-box', className)} {...props}>
        {content}
      </section>
    );
  }

  return (
    <section className={cn('form-section', className)} {...props}>
      {content}
    </section>
  );
}

export function FormGrid({ children, className, ...props }: PanelProps) {
  return (
    <div className={cn('form-grid', className)} {...props}>
      {children}
    </div>
  );
}

export function FormFooter({ children, className, ...props }: PanelProps) {
  return (
    <div className={cn('form-panel-footer', className)} {...props}>
      {children}
    </div>
  );
}

type FormProps = FormHTMLAttributes<HTMLFormElement> & { children: ReactNode };

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn('flex flex-col', className)} {...props}>
      {children}
    </form>
  );
}

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { FormHeader } from './Form';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function FormModal({ open, onClose, title, description, icon, children }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-atenas-ink/55 min-h-full w-full cursor-default border-0 backdrop-blur-[2px]"
        aria-label="Cerrar ventana"
        onClick={onClose}
      />
      <div
        className="relative form-panel w-full sm:max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col z-10 shadow-elevated rounded-t-3xl sm:rounded-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <FormHeader
          title={title}
          titleId={titleId}
          description={description}
          icon={icon}
          actions={
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="table-action-btn shrink-0"
              aria-label="Cerrar"
            >
              <X aria-hidden />
            </button>
          }
        />
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}

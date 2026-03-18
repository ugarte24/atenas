import { useEffect, useRef } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function DocentePreviewModal({ title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 min-h-full w-full cursor-default border-0"
        aria-label="Cerrar vista previa"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col z-10 outline-none border border-slate-200"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 shrink-0">
          <h2 id="preview-modal-title" className="text-base font-bold text-slate-900 truncate pr-2">
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm shrink-0"
          >
            Cerrar
          </button>
        </div>
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 text-sm text-amber-950 shrink-0">
          <strong>Vista previa:</strong> igual que verá el estudiante. Aquí{' '}
          <strong>no se guardan</strong> intentos ni notas.
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

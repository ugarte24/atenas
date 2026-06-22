import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Printer, X } from 'lucide-react';
import { downloadCertificadoPdf } from '../../lib/certificadoPdf';
import { buildCertificadoHtmlBlobUrl } from '../../lib/certificadoVentana';
import type { CertificadoParams } from '../../lib/certificadoPrintHtml';
import { cn } from '../ui/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  params: CertificadoParams | null;
};

export function CertificadoPreviewModal({ open, onClose, params }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!open || !params) {
      setBlobUrl(null);
      return;
    }
    let cancelled = false;
    setLoadingPreview(true);
    void buildCertificadoHtmlBlobUrl(params).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      setBlobUrl(url);
      setLoadingPreview(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, params]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !params) return null;

  async function handleDownload() {
    if (!params) return;
    setPdfLoading(true);
    try {
      await downloadCertificadoPdf(params);
    } catch (e) {
      console.error(e);
      window.alert('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setPdfLoading(false);
    }
  }

  function handlePrint() {
    iframeRef.current?.contentWindow?.focus();
    iframeRef.current?.contentWindow?.print();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#323639]"
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa del certificado"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#323639] px-3 py-2 sm:px-4 pt-safe">
        <p className="min-w-0 truncate text-sm font-medium text-white/90">
          Certificado · {params.tituloUnidad}
        </p>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={pdfLoading || loadingPreview}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/90',
              'hover:bg-white/10 transition-colors min-h-touch min-w-touch justify-center',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
            title="Descargar PDF"
          >
            {pdfLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <Download className="w-4 h-4" aria-hidden />
            )}
            <span className="hidden sm:inline">Descargar PDF</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={loadingPreview}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors min-h-touch min-w-touch justify-center disabled:opacity-50"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 transition-colors min-h-touch min-w-touch"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-3 sm:p-6 pb-safe">
        {loadingPreview || !blobUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/80">
            <Loader2 className="w-8 h-8 animate-spin" aria-hidden />
            <p className="text-sm">Preparando certificado…</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={blobUrl}
            title="Certificado de progreso"
            className="w-full max-w-[1056px] aspect-[11/8.5] bg-white shadow-2xl border-0 rounded-sm"
          />
        )}
      </div>
    </div>
  );
}

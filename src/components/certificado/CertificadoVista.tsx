import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Printer } from 'lucide-react';
import { downloadCertificadoPdf } from '../../lib/certificadoPdf';
import { buildCertificadoHtmlBlobUrl } from '../../lib/certificadoVentana';
import { loadCertificadoPreviewParams } from '../../lib/certificadoStorage';
import type { CertificadoParams } from '../../lib/certificadoPrintHtml';
import { CERT_LETTER_H_PX, CERT_LETTER_W_PX } from '../../lib/certificadoDimensions';
import { cn } from '../ui/cn';

export default function CertificadoVista() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [params, setParams] = useState<CertificadoParams | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const stored = loadCertificadoPreviewParams();
    setParams(stored);
    if (!stored) {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    if (!params) return;
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
  }, [params]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

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

  if (!params && !loadingPreview) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#323639] px-4 text-center">
        <p className="text-white/90 text-sm max-w-md">
          No hay certificado para mostrar. Cierra esta pestaña y vuelve a abrir el certificado desde
          la plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#323639]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#323639] px-3 py-2 sm:px-4 pt-safe">
        <p className="min-w-0 truncate text-sm font-medium text-white/90">
          Certificado · {params?.tituloUnidad ?? 'ATENAS'}
        </p>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={pdfLoading || loadingPreview || !params}
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
            disabled={loadingPreview || !blobUrl}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors min-h-touch min-w-touch justify-center disabled:opacity-50"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">Imprimir</span>
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
            className="bg-white shadow-2xl border-0 rounded-sm"
            style={{
              width: CERT_LETTER_W_PX,
              height: CERT_LETTER_H_PX,
              maxWidth: '100%',
              aspectRatio: '11 / 8.5',
            }}
          />
        )}
      </div>
    </div>
  );
}

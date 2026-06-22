import {
  buildCertificadoPrintDocument,
  resolveCertificadoAthenaFaceUrl,
  resolveCertificadoEmblemaUrl,
  type CertificadoParams,
} from './certificadoPrintHtml';
import { generarCertificadoQrDataUrl } from './certificadoQr';
import { saveCertificadoPreviewParams } from './certificadoStorage';
import { certificadoVistaUrl } from './certificadoUrls';

async function fetchImageAsDataUrl(url: string): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(new Error('read'));
      fr.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export async function prepareCertificadoParams(
  params: CertificadoParams
): Promise<CertificadoParams> {
  const [emblemaData, athenaData, qrDataUrl] = await Promise.all([
    fetchImageAsDataUrl(params.emblemaUrl ?? resolveCertificadoEmblemaUrl()),
    fetchImageAsDataUrl(params.athenaFaceUrl ?? resolveCertificadoAthenaFaceUrl()),
    params.certificadoId ? generarCertificadoQrDataUrl(params.certificadoId) : Promise.resolve(undefined),
  ]);

  return {
    ...params,
    emblemaUrl: emblemaData ?? params.emblemaUrl ?? resolveCertificadoEmblemaUrl(),
    athenaFaceUrl: athenaData ?? params.athenaFaceUrl ?? resolveCertificadoAthenaFaceUrl(),
    qrDataUrl: qrDataUrl ?? params.qrDataUrl,
  };
}

export async function buildCertificadoHtmlBlobUrl(params: CertificadoParams): Promise<string> {
  const ready = await prepareCertificadoParams(params);
  const html = buildCertificadoPrintDocument(ready, {
    variant: 'print',
    autoPrint: false,
  });
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Reserva una pestaña en el mismo gesto del clic (antes de cualquier await).
 * Los navegadores bloquean window.open si ocurre después de operaciones async.
 */
export function reservarVentanaCertificado(): Window | null {
  const win = window.open('about:blank', '_blank');
  if (win && !win.closed) {
    try {
      win.document.title = 'Certificado · ATENAS';
      win.document.body.innerHTML =
        '<p style="font-family:system-ui,sans-serif;text-align:center;margin-top:2rem;color:#555">Preparando certificado…</p>';
    } catch {
      /* about:blank — mismo origen */
    }
  }
  return win;
}

/**
 * Abre el certificado en una nueva pestaña con barra Imprimir / Descargar PDF.
 * Si el popup fue bloqueado, abre en la misma pestaña como respaldo.
 */
export function openCertificadoEnVentana(
  params: CertificadoParams,
  ventanaReservada?: Window | null
): void {
  saveCertificadoPreviewParams(params);
  const url = certificadoVistaUrl();

  if (ventanaReservada && !ventanaReservada.closed) {
    ventanaReservada.location.href = url;
    ventanaReservada.focus();
    return;
  }

  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (win) {
    win.focus();
    return;
  }

  window.location.assign(url);
}

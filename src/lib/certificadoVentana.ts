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
 * Abre el certificado en una nueva pestaña con barra Imprimir / Descargar PDF.
 */
export async function openCertificadoEnVentana(params: CertificadoParams): Promise<void> {
  const ready = await prepareCertificadoParams(params);
  saveCertificadoPreviewParams(ready);

  const url = certificadoVistaUrl();
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    throw new Error('Permite ventanas emergentes para ver el certificado.');
  }
  win.focus();
}

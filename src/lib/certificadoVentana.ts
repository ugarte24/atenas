import {
  buildCertificadoPrintDocument,
  resolveCertificadoEmblemaUrl,
  type CertificadoParams,
} from './certificadoPrintHtml';

async function fetchEmblemaAsDataUrl(): Promise<string | undefined> {
  const url = resolveCertificadoEmblemaUrl();
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

/**
 * Abre el certificado en una nueva pestaña (HTML).
 * Blob URL evita pestaña en blanco con noopener + document.write.
 */
export async function openCertificadoEnVentana(params: CertificadoParams): Promise<void> {
  const emblemaData = await fetchEmblemaAsDataUrl();
  const html = buildCertificadoPrintDocument(
    {
      ...params,
      emblemaUrl: emblemaData ?? params.emblemaUrl ?? resolveCertificadoEmblemaUrl(),
    },
    {
      variant: 'print',
      autoPrint: false,
    }
  );

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      throw new Error('Permite ventanas emergentes para ver el certificado.');
    }
    win.focus();
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

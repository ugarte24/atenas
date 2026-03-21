import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  buildCertificadoPrintDocument,
  resolveCertificadoEmblemaUrl,
  type CertificadoParams,
} from './certificadoPrintHtml';

function safeFileNameSegment(s: string, maxLen: number): string {
  const n = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen);
  return n || 'x';
}

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
 * PDF en **carta horizontal** (letter landscape), una página.
 * Incrusta el emblema como data URL para html2canvas.
 */
export async function downloadCertificadoPdf(params: CertificadoParams): Promise<void> {
  const emblemaData = await fetchEmblemaAsDataUrl();
  const html = buildCertificadoPrintDocument(
    {
      ...params,
      emblemaUrl: emblemaData ?? params.emblemaUrl ?? resolveCertificadoEmblemaUrl(),
    },
    {
      variant: 'pdf',
      autoPrint: false,
    }
  );

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Certificado PDF');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:1056px;height:816px;border:0;opacity:0;pointer-events:none';

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('No se pudo preparar el certificado para PDF.');
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    const done = () => resolve();
    iframe.addEventListener('load', done, { once: true });
    setTimeout(done, 250);
  });

  try {
    await doc.fonts.ready;
  } catch {
    /* ignore */
  }
  await new Promise((r) => setTimeout(r, 400));

  const cert = doc.querySelector('.cert') as HTMLElement | null;
  if (!cert) {
    document.body.removeChild(iframe);
    throw new Error('Certificado: no se encontró el contenido.');
  }

  const imgs = Array.from(doc.images);
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((res) => {
          if (img.complete) {
            res();
            return;
          }
          img.onload = () => res();
          img.onerror = () => res();
        })
    )
  );

  const canvas = await html2canvas(cert, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#fffdf9',
    windowWidth: 1056,
    windowHeight: 816,
    imageTimeout: 20000,
  });

  document.body.removeChild(iframe);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter',
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = Math.min(maxW / imgW, maxH / imgH);
  const dw = imgW * ratio;
  const dh = imgH * ratio;
  const x = (pageW - dw) / 2;
  const y = (pageH - dh) / 2;

  const imgData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imgData, 'PNG', x, y, dw, dh);

  const name = safeFileNameSegment(params.nombreEstudiante.trim() || 'Estudiante', 32);
  const unidad = safeFileNameSegment(params.tituloUnidad.trim() || 'Unidad', 28);
  pdf.save(`Certificado-ATENAS-${name}-${unidad}.pdf`);
}

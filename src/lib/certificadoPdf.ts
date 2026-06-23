import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  buildCertificadoPrintDocument,
  type CertificadoParams,
} from './certificadoPrintHtml';
import { prepareCertificadoParams, reservarVentanaCertificado } from './certificadoVentana';
import { CERT_LETTER_H_PX, CERT_LETTER_W_PX } from './certificadoDimensions';

export {
  openCertificadoEnVentana,
  prepareCertificadoParams,
  buildCertificadoHtmlBlobUrl,
  reservarVentanaCertificado,
} from './certificadoVentana';

function safeFileNameSegment(s: string, maxLen: number): string {
  const n = s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen);
  return n || 'x';
}

function certificadoPdfFileName(params: CertificadoParams): string {
  const name = safeFileNameSegment(params.nombreEstudiante.trim() || 'Estudiante', 32);
  const unidad = safeFileNameSegment(params.tituloUnidad.trim() || 'Unidad', 28);
  return `Certificado-ATENAS-${name}-${unidad}.pdf`;
}

/**
 * Genera el PDF en memoria (carta horizontal, una página).
 */
export async function buildCertificadoPdfBlob(params: CertificadoParams): Promise<Blob> {
  const ready = await prepareCertificadoParams(params);
  const html = buildCertificadoPrintDocument(ready, {
    variant: 'pdf',
    autoPrint: false,
  });

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Certificado PDF');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    `position:fixed;left:-10000px;top:0;width:${CERT_LETTER_W_PX}px;height:${CERT_LETTER_H_PX}px;border:0;pointer-events:none`;

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
  await new Promise((r) => setTimeout(r, 600));

  const htmlEl = doc.documentElement;
  htmlEl.style.width = `${CERT_LETTER_W_PX}px`;
  htmlEl.style.height = `${CERT_LETTER_H_PX}px`;
  htmlEl.style.overflow = 'hidden';
  doc.body.style.margin = '0';
  doc.body.style.padding = '0';
  doc.body.style.overflow = 'hidden';

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
    backgroundColor: '#fdfbf4',
    width: CERT_LETTER_W_PX,
    height: CERT_LETTER_H_PX,
    windowWidth: CERT_LETTER_W_PX,
    windowHeight: CERT_LETTER_H_PX,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 20000,
    foreignObjectRendering: false,
  });

  document.body.removeChild(iframe);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter',
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);

  return pdf.output('blob');
}

/**
 * Abre el certificado como PDF en una nueva pestaña.
 * Reserva la pestaña en el clic síncrono con `reservarVentanaCertificado()`.
 */
export async function openCertificadoPdfEnVentana(
  params: CertificadoParams,
  ventanaReservada?: Window | null
): Promise<void> {
  let ventana = ventanaReservada ?? null;

  if (ventana && !ventana.closed) {
    try {
      ventana.document.body.innerHTML =
        '<p style="font-family:system-ui,sans-serif;text-align:center;margin-top:2rem;color:#555">Generando PDF del certificado…</p>';
    } catch {
      /* mismo origen */
    }
  } else {
    ventana = reservarVentanaCertificado();
  }

  try {
    const blob = await buildCertificadoPdfBlob(params);
    const url = URL.createObjectURL(blob);

    if (ventana && !ventana.closed) {
      ventana.location.href = url;
      ventana.focus();
    } else {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        URL.revokeObjectURL(url);
        throw new Error('popup_blocked');
      }
      win.focus();
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  } catch (e) {
    ventana?.close();
    throw e;
  }
}

/** Descarga el PDF al dispositivo. */
export async function downloadCertificadoPdf(params: CertificadoParams): Promise<void> {
  const blob = await buildCertificadoPdfBlob(params);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = certificadoPdfFileName(params);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

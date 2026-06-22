import QRCode from 'qrcode';

/** Genera QR como data URL para incrustar en el HTML del certificado. */
export async function generarCertificadoQrDataUrl(certificadoId: string): Promise<string | undefined> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const text = origin
    ? `${origin}/certificados?id=${encodeURIComponent(certificadoId)}`
    : `ATENAS · ${certificadoId}`;
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 96,
      color: { dark: '#141c2c', light: '#ffffff' },
    });
  } catch {
    return undefined;
  }
}

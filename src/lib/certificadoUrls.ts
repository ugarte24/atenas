import { getAppPathPrefix } from './deployBaseUrl';

/** URL pública de verificación para QR del certificado. */
export function certificadoVerificacionUrl(certificadoId: string): string {
  if (typeof window === 'undefined') return certificadoId;
  const origin = window.location.origin;
  const prefix = getAppPathPrefix();
  const segment = `/verificar-certificado/${encodeURIComponent(certificadoId)}`;
  const path = prefix === '/' ? segment : `${prefix}${segment}`;
  return `${origin}${path}`;
}

/** URL de la vista del certificado en nueva pestaña. */
export function certificadoVistaUrl(): string {
  if (typeof window === 'undefined') return '/certificado/vista';
  const origin = window.location.origin;
  const prefix = getAppPathPrefix();
  const segment = '/certificado/vista';
  const path = prefix === '/' ? segment : `${prefix}${segment}`;
  return `${origin}${path}`;
}

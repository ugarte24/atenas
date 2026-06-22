import type { CertificadoParams } from './certificadoPrintHtml';

export const CERTIFICADO_PREVIEW_STORAGE_KEY = 'atenas-cert-preview';

export function saveCertificadoPreviewParams(params: CertificadoParams): void {
  sessionStorage.setItem(CERTIFICADO_PREVIEW_STORAGE_KEY, JSON.stringify(params));
}

export function loadCertificadoPreviewParams(): CertificadoParams | null {
  try {
    const raw = sessionStorage.getItem(CERTIFICADO_PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CertificadoParams;
  } catch {
    return null;
  }
}

export function clearCertificadoPreviewParams(): void {
  sessionStorage.removeItem(CERTIFICADO_PREVIEW_STORAGE_KEY);
}

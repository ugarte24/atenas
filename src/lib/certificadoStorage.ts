import type { CertificadoParams } from './certificadoPrintHtml';

export const CERTIFICADO_PREVIEW_STORAGE_KEY = 'atenas-cert-preview';

/** Solo metadatos serializables (sin data URLs grandes). */
function toStorableCertificadoParams(params: CertificadoParams): CertificadoParams {
  return {
    nombreEstudiante: params.nombreEstudiante,
    tituloUnidad: params.tituloUnidad,
    porcentajeUnidad: params.porcentajeUnidad,
    umbralCertificado: params.umbralCertificado,
    certificadoId: params.certificadoId,
    actividadesCompletadas: params.actividadesCompletadas,
    actividadesTotal: params.actividadesTotal,
    evaluacionesAprobadas: params.evaluacionesAprobadas,
    evaluacionesTotal: params.evaluacionesTotal,
    tiempoEstudioSegundos: params.tiempoEstudioSegundos,
  };
}

/**
 * Guarda params para la pestaña de vista. Usa localStorage porque sessionStorage
 * no se comparte entre la pestaña origen y la nueva pestaña.
 */
export function saveCertificadoPreviewParams(params: CertificadoParams): void {
  const payload = JSON.stringify(toStorableCertificadoParams(params));
  try {
    localStorage.setItem(CERTIFICADO_PREVIEW_STORAGE_KEY, payload);
  } catch (e) {
    console.warn('No se pudo guardar vista previa del certificado:', e);
  }
}

export function loadCertificadoPreviewParams(): CertificadoParams | null {
  try {
    const raw =
      localStorage.getItem(CERTIFICADO_PREVIEW_STORAGE_KEY) ??
      sessionStorage.getItem(CERTIFICADO_PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CertificadoParams;
  } catch {
    return null;
  }
}

export function clearCertificadoPreviewParams(): void {
  localStorage.removeItem(CERTIFICADO_PREVIEW_STORAGE_KEY);
  sessionStorage.removeItem(CERTIFICADO_PREVIEW_STORAGE_KEY);
}

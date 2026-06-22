/** ID legible y determinista para un certificado de unidad. */
export function generarCertificadoId(userId: string, unidadId: string): string {
  const year = new Date().getFullYear();
  let h = 5381;
  for (const c of `${userId}:${unidadId}`) {
    h = (h * 33) ^ c.charCodeAt(0);
  }
  const num = (Math.abs(h) % 999_999) + 1;
  return `AT-${year}-${String(num).padStart(6, '0')}`;
}

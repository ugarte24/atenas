/** Formato legible para certificados impresos (ej. «18 horas»). */
export function formatTiempoCertificado(totalSegundos: number): string {
  if (totalSegundos < 60) return '—';
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  if (horas > 0) return minutos >= 30 ? `${horas + 1} horas` : `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  if (minutos > 0) return `${minutos} min`;
  return '—';
}

/** Formatea segundos como "Xh Ym" o "Ym" */
export function formatTiempoEstudio(totalSegundos: number): string {
  if (totalSegundos <= 0) return '0 min';
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  if (horas > 0 && minutos > 0) return `${horas}h ${minutos}m`;
  if (horas > 0) return `${horas}h`;
  if (minutos > 0) return `${minutos} min`;
  return '< 1 min';
}

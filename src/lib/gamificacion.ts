/** XP: actividades, evaluaciones y calificaciones */
export function calcularXp(params: {
  actividadesCompletadas: number;
  evaluacionesCompletadas: number;
  sumaPuntuacionAct: number;
  sumaPuntuacionEval: number;
}): number {
  const { actividadesCompletadas, evaluacionesCompletadas, sumaPuntuacionAct, sumaPuntuacionEval } =
    params;
  return (
    actividadesCompletadas * 18 +
    evaluacionesCompletadas * 45 +
    Math.round(sumaPuntuacionAct * 0.4) +
    Math.round(sumaPuntuacionEval * 0.6)
  );
}

const UMBRALES_NIVEL = [0, 80, 200, 380, 600, 880, 1200, 1600, 2100, 2700, 3400, 4200, 5200, 6400, 7800];

export function nivelDesdeXp(xp: number): {
  nivel: number;
  nombre: string;
  xpEnNivel: number;
  xpParaSiguiente: number | null;
  progresoEnNivel: number;
} {
  const nombres = [
    'Novato',
    'Aprendiz',
    'Explorador',
    'Estudiante',
    'Dedicado',
    'Constante',
    'Avanzado',
    'Experto',
    'Maestro',
    'Élite',
    'Leyenda',
    'Campeón',
    'Virtuoso',
    'Sabio',
    'Atenea',
  ];
  let nivel = 1;
  for (let i = UMBRALES_NIVEL.length - 1; i >= 0; i--) {
    if (xp >= UMBRALES_NIVEL[i]!) {
      nivel = i + 1;
      break;
    }
  }
  nivel = Math.min(nivel, nombres.length);
  const base = UMBRALES_NIVEL[nivel - 1] ?? 0;
  const siguiente = UMBRALES_NIVEL[nivel] ?? null;
  const xpEnNivel = xp - base;
  const xpParaSiguiente = siguiente != null ? siguiente - base : null;
  const progresoEnNivel =
    xpParaSiguiente != null && xpParaSiguiente > 0
      ? Math.min(100, Math.round((xpEnNivel / xpParaSiguiente) * 100))
      : 100;
  return {
    nivel,
    nombre: nombres[nivel - 1] ?? 'Atenea',
    xpEnNivel,
    xpParaSiguiente,
    progresoEnNivel,
  };
}

/** Fechas UTC YYYY-MM-DD con actividad */
export function diasConActividad(timestampsIso: string[]): Set<string> {
  const d = new Set<string>();
  for (const iso of timestampsIso) {
    if (!iso) continue;
    const day = iso.slice(0, 10);
    d.add(day);
  }
  return d;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function restarUnDia(ymd: string): string {
  const [y, m, da] = ymd.split('-').map(Number);
  const dt = new Date(y!, m! - 1, da!);
  dt.setDate(dt.getDate() - 1);
  return toYmd(dt);
}

/**
 * Racha: días consecutivos desde el último día con actividad (hoy o ayer).
 * Si hoy no hay actividad pero ayer sí, la racha sigue pero está "en riesgo".
 */
export function calcularRachaActual(dias: Set<string>, hoy: Date = new Date()): number {
  const hoyStr = toYmd(hoy);
  const ayer = restarUnDia(hoyStr);
  let cursor = dias.has(hoyStr) ? hoyStr : dias.has(ayer) ? ayer : '';
  if (!cursor) return 0;
  let streak = 0;
  while (dias.has(cursor)) {
    streak++;
    cursor = restarUnDia(cursor);
  }
  return streak;
}

export function hoyTieneActividad(dias: Set<string>, hoy: Date = new Date()): boolean {
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const da = String(hoy.getDate()).padStart(2, '0');
  return dias.has(`${y}-${m}-${da}`);
}

export type LogroGamificacion = { id: string; titulo: string; descripcion: string };

export function construirLogros(params: {
  actividadesCompletadas: number;
  evaluacionesCompletadas: number;
  aprobadas: number;
  maxEval: number;
  primeraEvalAprobada: boolean;
  diasDistintosUltimos7: number;
  racha: number;
}): LogroGamificacion[] {
  const out: LogroGamificacion[] = [];
  if (params.actividadesCompletadas >= 1) {
    out.push({
      id: 'primera_actividad',
      titulo: 'Primera actividad',
      descripcion: 'Completaste tu primera actividad.',
    });
  }
  if (params.primeraEvalAprobada) {
    out.push({
      id: 'primera_eval_aprobada',
      titulo: 'Primera evaluación aprobada',
      descripcion: 'Aprobaste tu primera evaluación.',
    });
  }
  if (params.actividadesCompletadas >= 5) {
    out.push({
      id: 'explorador',
      titulo: 'Explorador de actividades',
      descripcion: 'Completaste al menos 5 actividades.',
    });
  }
  if (params.evaluacionesCompletadas >= 3) {
    out.push({
      id: 'evaluador_constante',
      titulo: 'Evaluador constante',
      descripcion: 'Realizaste 3 o más evaluaciones.',
    });
  }
  if (params.maxEval >= 90) {
    out.push({
      id: 'excelente',
      titulo: 'Excelente en evaluaciones',
      descripcion: 'Obtuviste al menos un 90% en una evaluación.',
    });
  }
  if (params.aprobadas >= 3) {
    out.push({
      id: 'aprobado_tres',
      titulo: '¡Buen progreso!',
      descripcion: 'Aprobaste al menos 3 evaluaciones.',
    });
  }
  if (params.diasDistintosUltimos7 >= 7) {
    out.push({
      id: 'semana_completa',
      titulo: 'Semana completa de estudio',
      descripcion: 'Tuviste actividad los 7 últimos días.',
    });
  }
  if (params.racha >= 7) {
    out.push({
      id: 'racha_7',
      titulo: 'Racha de fuego',
      descripcion: '7 días seguidos practicando.',
    });
  }
  return out;
}

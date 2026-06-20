export type MascotTipReason =
  | 'generic'
  | 'racha_en_riesgo'
  | 'post_actividad'
  | 'post_evaluacion_aprobada'
  | 'explorar_unidades'
  | 'timer';

const GENERIC_TIPS = [
  '¡Sigue explorando! Cada tema suma a tu aventura.',
  'Puedes tomar notas en la pestaña Notas de cada lección.',
  'Revisa tus misiones diarias para ganar más XP.',
  'Las actividades te ayudan a practicar lo aprendido.',
  '¿Ya viste los recursos del tema? Hay mapas y vídeos.',
  'Tu racha crece cuando practicas varios días seguidos.',
  'Explora las unidades en orden para desbloquear islas.',
  'El foro del tema es ideal para preguntar dudas.',
];

const CONTEXTUAL: Record<Exclude<MascotTipReason, 'generic' | 'timer'>, string[]> = {
  racha_en_riesgo: [
    '¡No pierdas tu racha! Practica un poco hoy.',
    'Tu racha está en juego. ¿Un tema rápido antes de irte?',
  ],
  post_actividad: [
    '¡Buen trabajo en la actividad! Sigue así.',
    'Actividad completada. ¿Lista la evaluación del tema?',
  ],
  post_evaluacion_aprobada: [
    '¡Aprobaste! Eres un experto en este tema.',
    'Evaluación superada. ¡Sigue con la siguiente lección!',
  ],
  explorar_unidades: [
    'Hay más temas por descubrir. ¡Entra a Unidades!',
    'Cada unidad tiene actividades y evaluaciones nuevas.',
  ],
};

const STORAGE_LAST_TIP = 'atenas_mascot_last_tip';
const STORAGE_LAST_SHOWN = 'atenas_mascot_last_shown';
const STORAGE_RACHA_SHOWN = 'atenas_mascot_racha_shown';

function pickFromPool(pool: string[], avoid?: string | null): string {
  const filtered = avoid ? pool.filter((t) => t !== avoid) : pool;
  const list = filtered.length > 0 ? filtered : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pickMascotTip(reason: MascotTipReason, avoidRepeat = true): string {
  const last = avoidRepeat ? sessionStorage.getItem(STORAGE_LAST_TIP) : null;
  let message: string;

  if (reason === 'generic' || reason === 'timer') {
    message = pickFromPool(GENERIC_TIPS, last);
  } else {
    message = pickFromPool(CONTEXTUAL[reason], last);
  }

  try {
    sessionStorage.setItem(STORAGE_LAST_TIP, message);
  } catch {
    /* ignore */
  }
  return message;
}

export function getLastShownAt(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_LAST_SHOWN);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function markShownNow(): void {
  try {
    sessionStorage.setItem(STORAGE_LAST_SHOWN, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function wasRachaTipShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_RACHA_SHOWN) === '1';
  } catch {
    return false;
  }
}

export function markRachaTipShown(): void {
  try {
    sessionStorage.setItem(STORAGE_RACHA_SHOWN, '1');
  } catch {
    /* ignore */
  }
}

export const MASCOT_MIN_INTERVAL_MS = 10 * 60 * 1000;
export const MASCOT_EVENT_COOLDOWN_MS = 2 * 60 * 1000;
export const MASCOT_AUTO_DISMISS_MS = 8000;
export const MASCOT_FIRST_SHOW_MS = 45 * 1000;
export const MASCOT_TIMER_INTERVAL_MS = 10 * 60 * 1000;

export function isMascotRouteBlocked(pathname: string): boolean {
  return (
    pathname.startsWith('/actividades/') ||
    pathname.startsWith('/evaluaciones/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/docente') ||
    pathname.startsWith('/admin')
  );
}

export function isMascotStudentWelcomeRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/unidades' || pathname.startsWith('/perfil');
}

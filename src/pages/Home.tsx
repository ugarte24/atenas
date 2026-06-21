import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Star,
  BookOpen,
  Flame,
  ChevronRight,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesDiarias } from '../hooks/useMisionesDiarias';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { useEstudianteDashboard } from '../hooks/useEstudianteDashboard';
import { useUnidades } from '../hooks/useUnidades';
import { useAdventureMapProgress } from '../hooks/useAdventureMapProgress';
import { nivelDesdeXp } from '../lib/gamificacion';
import { cn } from '../components/ui/cn';
import { STUDENT_HOME_QUICK_LINKS } from '../constants/studentNav';
import { Alert } from '../components/ui/Alert';
import { buildUnidadesMapHref } from '../lib/adventureMapDeepLinks';

function findNextTema(
  unidades: ReturnType<typeof useEstudianteDashboard>['unidades']
) {
  for (const u of unidades) {
    const tema = u.temas.find((t) => t.totalItems > 0 && t.porcentaje < 100);
    if (tema) {
      return {
        unidadId: u.unidadId,
        unidadTitulo: u.titulo,
        temaId: tema.temaId,
        temaTitulo: tema.titulo,
      };
    }
  }
  return null;
}

export default function Home() {
  const { profile, user } = useAuthContext();
  const { unidades } = useUnidades();
  const { misiones: diarias, loading: loadingDiarias } = useMisionesDiarias();
  const { puntos, racha, porcentajeGlobal, loading: loadingGam } = useGamificacionEstudiante();
  const dashboard = useEstudianteDashboard(profile?.role === 'estudiante');
  const mapNav = useAdventureMapProgress(unidades, user?.id, profile?.role === 'estudiante');

  const isStudent = profile?.role === 'estudiante';
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);

  const nextTema = useMemo(() => findNextTema(dashboard.unidades), [dashboard.unidades]);

  const diariasPendientes = useMemo(
    () => diarias.filter((d) => d.total > 0 && d.progreso < d.total).length,
    [diarias]
  );

  if (!isStudent) return null;

  const continueHref = nextTema
    ? `/temas/${nextTema.temaId}`
    : mapNav.nextUnitId
      ? `/unidades/${mapNav.nextUnitId}`
      : buildUnidadesMapHref(mapNav.activeWorldId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="hidden lg:flex flex-wrap items-center justify-end gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="atenas-sidebar-panel flex items-center gap-2 rounded-2xl pl-2 pr-4 py-1.5 shadow-soft">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-atenas-gold text-atenas-ink font-bold text-lg">
              {loadingGam ? '–' : nivel.nivel}
            </span>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wide sidebar-muted font-semibold">Nivel</p>
              <p className="text-xs font-bold text-white leading-tight">{nivel.nombre}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-atenas-mist-border px-3 py-2 shadow-card flex items-center gap-1.5">
            <Star className="w-4 h-4 text-atenas-gold fill-atenas-gold" aria-hidden />
            <span className="text-sm font-bold text-atenas-ink tabular-nums">
              {loadingGam ? '–' : puntos.toLocaleString('es')} XP
            </span>
          </div>
        </div>
      </div>

      {dashboard.rachaEnRiesgo && (
        <Alert tone="warning" className="mb-5 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold text-sm">¡Tu racha está en riesgo!</p>
            <p className="text-sm mt-0.5">
              Llevas {dashboard.racha} días seguidos. Completa una actividad hoy para mantenerla.
            </p>
          </div>
        </Alert>
      )}

      <section className="mb-6 rounded-3xl border border-atenas-mist-border bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-atenas-muted">Continuar</p>
        <h2 className="text-lg font-bold text-atenas-ink mt-1 leading-snug">
          {nextTema
            ? nextTema.temaTitulo
            : mapNav.nextUnit
              ? mapNav.nextUnit.title
              : 'Explora el archipiélago'}
        </h2>
        {nextTema && (
          <p className="text-sm text-atenas-muted mt-1">{nextTema.unidadTitulo}</p>
        )}
        <Link
          to={continueHref}
          className="mt-4 btn-success inline-flex w-full items-center justify-center gap-2 min-h-touch font-bold"
        >
          {nextTema ? 'Seguir aprendiendo' : 'Ir al mapa'}
          <ChevronRight className="w-5 h-5" aria-hidden />
        </Link>
      </section>

      <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="hidden sm:block rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
          <p className="text-xs font-semibold text-atenas-muted flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" aria-hidden /> Racha
          </p>
          <p className="text-2xl font-bold text-atenas-ink mt-1">{loadingGam ? '–' : `${racha} d`}</p>
        </div>
        <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
          <p className="text-xs font-semibold text-atenas-muted flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-sky-600" aria-hidden /> Progreso general
          </p>
          <p className="text-2xl font-bold text-atenas-ink mt-1">
            {loadingGam ? '–' : `${porcentajeGlobal}%`}
          </p>
        </div>
      </section>

      {!loadingDiarias && diarias.length > 0 && (
        <section className="mb-6 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-atenas-ink flex items-center gap-2">
              <Target className="w-4 h-4" aria-hidden />
              Misiones diarias
            </h3>
            <Link to="/misiones" className="text-xs font-semibold text-atenas-ink underline underline-offset-2">
              Ver todas
            </Link>
          </div>
          {diariasPendientes > 0 ? (
            <p className="text-sm text-atenas-muted">
              Tienes {diariasPendientes} objetivo{diariasPendientes === 1 ? '' : 's'} pendiente
              {diariasPendientes === 1 ? '' : 's'} hoy.
            </p>
          ) : (
            <p className="text-sm text-emerald-700 font-medium">¡Objetivos diarios al día!</p>
          )}
        </section>
      )}

      <section className="mb-8 grid grid-cols-3 gap-3">
        {STUDENT_HOME_QUICK_LINKS.map(
          ({ to, label, icon: Icon, homeQuickLinkColor, homeQuickLinkLabel, comingSoon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card card-hover min-h-[100px] justify-center text-center',
                comingSoon && 'opacity-90'
              )}
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-white bg-gradient-to-br shadow-md',
                  homeQuickLinkColor
                )}
              >
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="text-xs font-bold text-atenas-ink leading-tight">
                {homeQuickLinkLabel ?? label}
              </span>
            </Link>
          )
        )}
      </section>
    </div>
  );
}

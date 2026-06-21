import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Star,
  BookOpen,
  Flame,
  MapPin,
  ChevronRight,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { useMisionesDiarias } from '../hooks/useMisionesDiarias';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { useEstudianteDashboard } from '../hooks/useEstudianteDashboard';
import { useUnidades } from '../hooks/useUnidades';
import { useAdventureMapProgress } from '../hooks/useAdventureMapProgress';
import { nivelDesdeXp } from '../lib/gamificacion';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../components/ui/cn';
import { STUDENT_HOME_QUICK_LINKS } from '../constants/studentNav';
import { Alert } from '../components/ui/Alert';

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
  const { misiones } = useMisionesAlumno();
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
      : '/unidades';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-end gap-3 mb-5">
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
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link to={continueHref} className="btn-success inline-flex items-center justify-center gap-2 min-h-touch font-bold flex-1">
            {nextTema ? 'Seguir aprendiendo' : 'Ir al mapa'}
            <ChevronRight className="w-5 h-5" aria-hidden />
          </Link>
          <Link
            to="/unidades"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-atenas-mist-border px-4 py-3 text-sm font-semibold text-atenas-ink hover:bg-atenas-mist min-h-touch"
          >
            <MapPin className="w-4 h-4" aria-hidden />
            Mapa del Abya Yala
          </Link>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
          <p className="text-xs font-semibold text-atenas-muted flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" aria-hidden /> Racha
          </p>
          <p className="text-2xl font-bold text-atenas-ink mt-1">{loadingGam ? '–' : `${racha} d`}</p>
        </div>
        <div className="rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card">
          <p className="text-xs font-semibold text-atenas-muted flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-sky-600" aria-hidden /> Progreso
          </p>
          <p className="text-2xl font-bold text-atenas-ink mt-1">
            {loadingGam ? '–' : `${porcentajeGlobal}%`}
          </p>
        </div>
      </section>

      <div className="mb-6">
        <ProgressBar value={porcentajeGlobal} label="Progreso general" showPercent size="md" tone="success" />
      </div>

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

      <section className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STUDENT_HOME_QUICK_LINKS.filter((l) => l.to !== '/unidades').map(
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

      <section
        aria-label="Acceso al mapa de aventura"
        className="relative rounded-3xl overflow-hidden border border-sky-200/60 shadow-elevated bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 p-6 text-white"
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5" aria-hidden />
          Mapa del Abya Yala
        </h2>
        <p className="text-sm text-white/90 mt-2 max-w-md">
          Recorre Convivencia, Territorio e Historia con ilustraciones premium, nodos de progreso y
          cofres con recompensas.
        </p>
        <p className="text-xs text-white/80 mt-2">
          {misiones.filter((m) => m.totalPasos > 0 && m.pasosCompletados >= m.totalPasos).length} de{' '}
          {Math.min(3, misiones.length)} mundos completados
        </p>
        <Link
          to="/unidades"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white text-atenas-ink px-5 py-3 text-sm font-bold min-h-touch shadow-md hover:bg-white/95"
        >
          Abrir mapa de aventura
          <ChevronRight className="w-5 h-5" aria-hidden />
        </Link>
      </section>
    </div>
  );
}

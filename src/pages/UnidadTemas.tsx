import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Lock, Play, BookOpen } from 'lucide-react';
import { useUnidad } from '../hooks/useUnidad';
import { useTemas } from '../hooks/useTemas';
import { useAuthContext } from '../contexts/AuthContext';
import { usuarioCumplePrerequisitoTema } from '../lib/prerequisitoTema';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { UnidadHero } from '../components/UnidadHero';
import { UnidadMediaBlock } from '../components/UnidadMediaBlock';
import { UnidadIntroExtended } from '../components/UnidadIntroExtended';
import { resolveAccentColor } from '../lib/unidadVisual';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useUnidadContenidoAgregado } from '../hooks/useUnidadContenidoAgregado';
import { SkeletonLines } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { cn } from '../components/ui/cn';
import { openCertificadoEnVentana } from '../lib/certificadoVentana';

type UnidadTab = 'temas' | 'recursos' | 'actividades' | 'evaluaciones';

export default function UnidadTemas() {
  const { unidadId } = useParams<{ unidadId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<UnidadTab>('temas');
  const { user, profile } = useAuthContext();
  const nombreEstudiante = profile?.full_name ?? 'Estudiante';
  const { unidad, loading: loadingUnidad } = useUnidad(unidadId ?? null);
  const { temas, loading } = useTemas(unidadId ?? null);
  const [bloqueoTema, setBloqueoTema] = useState<Record<string, boolean>>({});
  const [pctUnidad, setPctUnidad] = useState<number | null>(null);
  const [certPdfLoading, setCertPdfLoading] = useState(false);

  const temaIds = useMemo(() => temas.map((t) => t.id), [temas]);
  const esEstudiante = profile?.role === 'estudiante';
  const { recursos, actividades, evaluaciones, loading: loadingAgregado } = useUnidadContenidoAgregado(
    unidadId ?? null,
    temaIds,
    temas.map((t) => ({ id: t.id, title: t.title, prerequisito_tema_id: t.prerequisito_tema_id ?? null })),
    bloqueoTema,
    user?.id,
    esEstudiante
  );

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante' || !temas.length) {
      setBloqueoTema({});
      return;
    }
    let cancel = false;
    void (async () => {
      const next: Record<string, boolean> = {};
      for (const t of temas) {
        if (!t.prerequisito_tema_id) next[t.id] = false;
        else {
          const ok = await usuarioCumplePrerequisitoTema(user.id, t.prerequisito_tema_id);
          if (cancel) return;
          next[t.id] = !ok;
        }
      }
      if (!cancel) setBloqueoTema(next);
    })();
    return () => {
      cancel = true;
    };
  }, [user, profile?.role, temas]);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante' || !unidadId) {
      setPctUnidad(null);
      return;
    }
    let c = false;
    progresoPorcentajeUnidad(user.id, unidadId).then((p) => {
      if (!c) setPctUnidad(p);
    });
    return () => {
      c = true;
    };
  }, [user, profile?.role, unidadId, temas.length]);

  if (loadingUnidad || !unidad) {
    return <SkeletonLines lines={4} />;
  }

  const umbralCert = unidad.certificado_umbral_pct;
  const mostrarCert =
    profile?.role === 'estudiante' &&
    umbralCert != null &&
    umbralCert > 0 &&
    pctUnidad != null &&
    pctUnidad >= umbralCert;

  const accent = resolveAccentColor(unidad.accent_color);
  const heroIndex = unidad.orden ?? 0;
  const isla = islaDesdeOrdenUnidadSafe(unidad.orden, heroIndex);
  const tituloUnidad = tituloUnidadConOrden(unidad.orden ?? 0, unidad.title, heroIndex);

  return (
    <div>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Unidades', to: '/unidades' },
          { label: tituloUnidad },
        ]}
      />

      <button
        type="button"
        onClick={() => navigate('/unidades')}
        className="text-sm font-semibold mb-4 min-h-touch flex items-center rounded-xl px-3 -ml-2 transition-colors text-atenas-ink hover:bg-atenas-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2"
      >
        ← Volver a unidades
      </button>

      <UnidadHero unidad={unidad} listIndex={heroIndex}>
        <p className="relative text-white/90 text-xs font-semibold uppercase tracking-wide mt-2">
          {isla.label}
        </p>
        {profile?.role === 'estudiante' && pctUnidad != null && (
          <p className="relative text-white/95 text-sm mt-3 font-medium">
            Tu progreso en la unidad: <strong>{pctUnidad}%</strong>
          </p>
        )}
      </UnidadHero>

      <UnidadMediaBlock coverVideoUrl={unidad.cover_video_url} className="mb-8" />

      <UnidadIntroExtended text={unidad.intro_extended} />

      <div
        className="flex gap-1 overflow-x-auto scrollbar-nav-hide border-b border-atenas-mist-border mb-6 -mx-1 px-1"
        role="tablist"
        aria-label="Secciones de la unidad"
      >
        {(
          [
            { id: 'temas' as const, label: 'Temas' },
            { id: 'recursos' as const, label: 'Recursos' },
            { id: 'actividades' as const, label: 'Actividades' },
            { id: 'evaluaciones' as const, label: 'Evaluaciones' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'page-tab',
              tab === id ? 'page-tab--active' : 'page-tab--inactive'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'recursos' && (
        loadingAgregado ? (
          <SkeletonLines lines={4} />
        ) : recursos.length === 0 ? (
          <EmptyState icon={<BookOpen className="w-8 h-8" />} title="Sin recursos" description="Aún no hay recursos en los temas de esta unidad." />
        ) : (
          <ul className="space-y-3 list-none m-0 p-0 mb-6">
            {recursos.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/temas/${r.temaId}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card hover:shadow-card-hover min-h-touch"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-atenas-muted uppercase">{r.temaTitulo}</p>
                    <p className="font-bold text-atenas-ink truncate">{r.title ?? r.tipo}</p>
                  </div>
                  <Badge tone="default">{r.tipo}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'actividades' && (
        loadingAgregado ? (
          <SkeletonLines lines={4} />
        ) : actividades.length === 0 ? (
          <EmptyState icon={<BookOpen className="w-8 h-8" />} title="Sin actividades" description="Tu docente publicará actividades en los temas." />
        ) : (
          <ul className="space-y-3 list-none m-0 p-0 mb-6">
            {actividades.map((a) => (
              <li key={a.id}>
                {a.bloqueada ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-atenas-mist-border bg-atenas-mist/80 p-4 opacity-95">
                    <Lock className="w-5 h-5 text-atenas-muted shrink-0" />
                    <div>
                      <p className="text-xs text-atenas-muted">{a.temaTitulo}</p>
                      <p className="font-bold text-atenas-muted-strong">{a.title}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/actividades/${a.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card hover:shadow-card-hover min-h-touch"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-atenas-muted uppercase">{a.temaTitulo}</p>
                      <p className="font-bold text-atenas-ink truncate">{a.title}</p>
                    </div>
                    <Badge tone={a.completada ? 'success' : 'gold'}>
                      {a.completada ? 'Hecha' : 'Pendiente'}
                    </Badge>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'evaluaciones' && (
        loadingAgregado ? (
          <SkeletonLines lines={4} />
        ) : evaluaciones.length === 0 ? (
          <EmptyState icon={<BookOpen className="w-8 h-8" />} title="Sin evaluaciones" description="Tu docente publicará evaluaciones en los temas." />
        ) : (
          <ul className="space-y-3 list-none m-0 p-0 mb-6">
            {evaluaciones.map((e) => (
              <li key={e.id}>
                {e.bloqueada ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-atenas-mist-border bg-atenas-mist/80 p-4 opacity-95">
                    <Lock className="w-5 h-5 text-atenas-muted shrink-0" />
                    <div>
                      <p className="text-xs text-atenas-muted">{e.temaTitulo}</p>
                      <p className="font-bold text-atenas-muted-strong">{e.title}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/evaluaciones/${e.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-atenas-mist-border bg-white p-4 shadow-card hover:shadow-card-hover min-h-touch"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-atenas-muted uppercase">{e.temaTitulo}</p>
                      <p className="font-bold text-atenas-ink truncate">{e.title}</p>
                    </div>
                    <Badge tone={e.completada ? 'success' : 'gold'}>
                      {e.completada ? 'Hecha' : 'Pendiente'}
                    </Badge>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )
      )}

      {tab === 'temas' && mostrarCert && (
        <div className="mb-6">
          <Button disabled={certPdfLoading} onClick={async () => {
              setCertPdfLoading(true);
              try {
                await openCertificadoEnVentana({
                  nombreEstudiante: nombreEstudiante,
                  tituloUnidad: unidad.title,
                  porcentajeUnidad: pctUnidad ?? 0,
                  umbralCertificado: umbralCert ?? 0,
                });
              } catch (e) {
                console.error(e);
                window.alert('No se pudo abrir el certificado. Intenta de nuevo en unos segundos.');
              } finally {
                setCertPdfLoading(false);
              }
            }}
          >
            {certPdfLoading ? 'Abriendo…' : 'Ver certificado'}
          </Button>
        </div>
      )}

      {tab === 'temas' && loading ? (
        <SkeletonLines lines={5} />
      ) : tab === 'temas' ? (
        <ul className="space-y-3 list-none m-0 p-0">
          {temas.map((t, i) => {
            const bloqueado = bloqueoTema[t.id] === true;
            return (
              <li key={t.id}>
                {bloqueado ? (
                  <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-atenas-mist-border bg-atenas-mist/80 opacity-95" aria-disabled="true">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-400 text-white">
                      <Lock className="w-5 h-5" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-atenas-muted uppercase">Tema {i + 1}</span>
                      <h2 className="text-lg font-bold text-atenas-muted-strong">{t.title}</h2>
                      <p className="text-sm text-atenas-muted mt-1">Completa el tema anterior para desbloquear.</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/temas/${t.id}`}
                    className="flex items-center gap-4 p-5 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink min-h-touch border-2 border-atenas-mist-border bg-white shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg" style={{ backgroundColor: accent }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-atenas-ink">{t.title}</h2>
                    </div>
                    <Play className="w-5 h-5 text-atenas-success shrink-0" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {tab === 'temas' && temas.length === 0 && !loading && (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="Sin temas"
          description="Aún no hay temas en esta unidad. Tu docente los publicará pronto."
        />
      )}
    </div>
  );
}

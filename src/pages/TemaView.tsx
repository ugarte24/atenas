import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Maximize2 } from 'lucide-react';
import { useTema } from '../hooks/useTema';
import { useUnidad } from '../hooks/useUnidad';
import { useTemas } from '../hooks/useTemas';
import { useRecursos } from '../hooks/useRecursos';
import { useActividades } from '../hooks/useActividades';
import { useEvaluaciones } from '../hooks/useEvaluaciones';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usuarioCumplePrerequisitoTema } from '../lib/prerequisitoTema';
import { TemaMensajes } from '../components/TemaMensajes';
import { MicroQuizCard } from '../components/MicroQuizCard';
import { useTiempoEstudio } from '../hooks/useTiempoEstudio';
import { SkeletonLines } from '../components/ui/Skeleton';
import { LessonTabs, type LessonTab } from '../components/lesson/LessonTabs';
import { LessonSectionNav, type SectionItem } from '../components/lesson/LessonSectionNav';
import { TimelineSection } from '../components/lesson/TimelineSection';
import { LessonNotesWidget } from '../components/lesson/LessonNotesWidget';
import { LessonMapWidget } from '../components/lesson/LessonMapWidget';
import { LessonForumWidget } from '../components/lesson/LessonForumWidget';
import { RecursoItem, ResourcesSplitView } from '../components/lesson';
import { MascotTip } from '../components/gamification/MascotTip';
import { cn } from '../components/ui/cn';

type ProgresoTema = { total: number; completadas: number };

function normalizeTemaContent(raw: string | null | undefined): string {
  if (!raw) return '';
  if (!raw.toLowerCase().includes('<p')) return raw;

  return raw
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<\/?p>/gi, '')
    .trimEnd();
}

export default function TemaView() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthContext();
  const esEstudiante = profile?.role === 'estudiante';
  const { tema, loading: loadingTema } = useTema(temaId ?? null);
  const { unidad } = useUnidad(tema?.unidad_id ?? null);
  const { temas: temasUnidad } = useTemas(tema?.unidad_id ?? null);

  const [tab, setTab] = useState<LessonTab>('contenido');
  const [readingMode, setReadingMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<ProgresoTema | null>(null);
  const [loadingProgreso, setLoadingProgreso] = useState(false);
  const [prereqOk, setPrereqOk] = useState(true);
  const [prereqResolved, setPrereqResolved] = useState(false);

  const temaIdContenido = (() => {
    if (!temaId || !tema) return null;
    if (!tema.prerequisito_tema_id) return temaId;
    if (prereqResolved && prereqOk) return temaId;
    return null;
  })();

  const { recursos, loading: loadingRecursos } = useRecursos(temaIdContenido);
  const { actividades, loading: loadingActividades } = useActividades(temaIdContenido);
  const { evaluaciones, loading: loadingEvaluaciones } = useEvaluaciones(temaIdContenido);

  useTiempoEstudio(temaIdContenido);

  const microQuizEvaluacion =
    !loadingEvaluaciones && Array.isArray(evaluaciones)
      ? evaluaciones.find((e) => e.publicada && e.es_micro_quiz === true)
      : null;

  const recursosVideo = useMemo(() => recursos.filter((r) => r.tipo === 'video'), [recursos]);
  const recursosTeoria = useMemo(
    () => recursos.filter((r) => r.tipo === 'imagen' || r.tipo === 'mapa' || r.tipo === 'texto'),
    [recursos]
  );
  const recursosPdf = useMemo(() => recursos.filter((r) => r.tipo === 'pdf'), [recursos]);
  const recursosAudio = useMemo(() => recursos.filter((r) => r.tipo === 'audio'), [recursos]);

  const hasTheoryBlock = !!(tema?.content || recursosTeoria.length > 0 || recursosPdf.length > 0);
  const hasVideoBlock = recursosVideo.length > 0 || recursosAudio.length > 0;
  const hasActividades = actividades.filter((a) => a.publicada).length > 0;
  const hasEvaluaciones =
    evaluaciones.filter((e) =>
      esEstudiante ? e.publicada && e.es_micro_quiz !== true : e.publicada
    ).length > 0;

  const sections = useMemo(() => {
    const list: SectionItem[] = [];
    let step = 0;
    if (hasTheoryBlock) list.push({ id: 'teoria', step: ++step, title: 'Introducción y teoría' });
    if (recursosTeoria.length >= 2)
      list.push({ id: 'timeline', step: ++step, title: 'Hechos importantes' });
    if (hasVideoBlock) list.push({ id: 'video', step: ++step, title: 'Video y audio' });
    if (hasActividades) list.push({ id: 'actividades', step: ++step, title: 'Actividades' });
    if (hasEvaluaciones) list.push({ id: 'evaluacion', step: ++step, title: 'Evaluación' });
    return list;
  }, [hasTheoryBlock, recursosTeoria.length, hasVideoBlock, hasActividades, hasEvaluaciones]);

  useEffect(() => {
    if (sections.length && !activeSection) setActiveSection(sections[0]!.id);
  }, [sections, activeSection]);

  const temaIndex = temasUnidad.findIndex((t) => t.id === temaId);
  const prevTema = temaIndex > 0 ? temasUnidad[temaIndex - 1] : null;
  const nextTema = temaIndex >= 0 && temaIndex < temasUnidad.length - 1 ? temasUnidad[temaIndex + 1] : null;

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    setTab('contenido');
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function calcularProgreso() {
      if (!temaId || !user) {
        setProgreso(null);
        return;
      }
      try {
        setLoadingProgreso(true);
        const [actsRes, evalsRes] = await Promise.all([
          supabase.from('actividades').select('id').eq('tema_id', temaId).eq('publicada', true),
          supabase.from('evaluaciones').select('id').eq('tema_id', temaId).eq('publicada', true),
        ]);
        if (cancelled) return;
        const actividadIds = (actsRes.data ?? []).map((a: { id: string }) => a.id);
        const evaluacionIds = (evalsRes.data ?? []).map((e: { id: string }) => e.id);
        const total = actividadIds.length + evaluacionIds.length;
        if (!total) {
          setProgreso(null);
          return;
        }
        const [intActRes, intEvalRes] = await Promise.all([
          actividadIds.length
            ? supabase.from('actividad_intentos').select('actividad_id').eq('user_id', user.id).in('actividad_id', actividadIds)
            : Promise.resolve({ data: [] }),
          evaluacionIds.length
            ? supabase.from('evaluacion_intentos').select('evaluacion_id').eq('user_id', user.id).in('evaluacion_id', evaluacionIds)
            : Promise.resolve({ data: [] }),
        ]);
        if (cancelled) return;
        const completadas =
          new Set(((intActRes.data ?? []) as { actividad_id: string }[]).map((i) => i.actividad_id)).size +
          new Set(((intEvalRes.data ?? []) as { evaluacion_id: string }[]).map((i) => i.evaluacion_id)).size;
        setProgreso({ total, completadas });
      } catch {
        if (!cancelled) setProgreso(null);
      } finally {
        if (!cancelled) setLoadingProgreso(false);
      }
    }
    void calcularProgreso();
    return () => {
      cancelled = true;
    };
  }, [temaId, user]);

  useEffect(() => {
    if (!user || !tema?.prerequisito_tema_id) {
      setPrereqOk(true);
      setPrereqResolved(true);
      return;
    }
    let c = false;
    setPrereqResolved(false);
    usuarioCumplePrerequisitoTema(user.id, tema.prerequisito_tema_id).then((ok) => {
      if (!c) {
        setPrereqOk(ok);
        setPrereqResolved(true);
      }
    });
    return () => {
      c = true;
    };
  }, [user, tema?.prerequisito_tema_id, tema?.id]);

  if (loadingTema || !tema) return <SkeletonLines lines={5} />;
  if (authLoading || !profile) return <p className="text-atenas-muted text-lg">Cargando perfil...</p>;
  if (tema.prerequisito_tema_id && !prereqResolved) {
    return <p className="text-atenas-muted-strong">Comprobando acceso al tema…</p>;
  }
  if (!prereqOk && tema.prerequisito_tema_id) {
    return (
      <div className="max-w-lg">
        <button type="button" onClick={() => navigate(`/unidades/${tema.unidad_id}`)} className="text-sm font-medium mb-4 min-h-touch text-atenas-ink hover:text-atenas-blue">
          ← Volver a la unidad
        </button>
        <div className="card p-6 border-2 border-amber-300 bg-amber-50">
          <h1 className="text-xl font-bold text-amber-950">Tema bloqueado</h1>
          <p className="text-amber-900 mt-2">Completa el tema anterior antes de continuar.</p>
        </div>
      </div>
    );
  }

  const showStudentLayout = esEstudiante;
  const normalizedTemaContent = normalizeTemaContent(tema.content);

  return (
    <div className={cn(readingMode && 'reading-mode', '-mx-4 sm:-mx-6 px-4 sm:px-6')}>
      {/* Header */}
      <header className="mb-5">
        <nav className="text-xs text-atenas-muted mb-2 flex flex-wrap items-center gap-1" aria-label="Ruta">
          <Link to="/unidades" className="hover:text-atenas-ink font-medium">Unidades</Link>
          <span aria-hidden>/</span>
          {unidad && (
            <>
              <Link to={`/unidades/${unidad.id}`} className="hover:text-atenas-ink font-medium truncate max-w-[140px]">
                {unidad.title}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span className="text-atenas-ink font-semibold truncate">{tema.title}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-atenas-ink">{tema.title}</h1>
            {unidad && <p className="text-sm text-atenas-muted mt-0.5">{unidad.title}</p>}
          </div>
          {showStudentLayout && (
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-2 text-sm text-atenas-muted-strong cursor-pointer min-h-touch">
                <input
                  type="checkbox"
                  checked={readingMode}
                  onChange={(e) => setReadingMode(e.target.checked)}
                  className="rounded border-atenas-mist-border"
                />
                Modo lectura
              </label>
              <button type="button" className="p-2 rounded-xl text-atenas-muted hover:bg-white/80 min-h-touch" aria-label="Pantalla completa" onClick={() => document.documentElement.requestFullscreen?.()}>
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {progreso && (
          <div className="mt-4 rounded-xl bg-white/80 border border-atenas-mist-border px-4 py-2 flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-atenas-blue shrink-0" aria-hidden />
            <div className="flex-1">
              <div className="h-2 rounded-full bg-atenas-mist overflow-hidden">
                <div
                  className="h-full bg-atenas-success rounded-full transition-all"
                  style={{ width: `${Math.round((progreso.completadas / progreso.total) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-atenas-ink tabular-nums shrink-0">
              {loadingProgreso ? '…' : `${progreso.completadas}/${progreso.total}`}
            </span>
          </div>
        )}
      </header>

      {microQuizEvaluacion && microQuizEvaluacion.micro_ubicacion === 'inicio' && esEstudiante && (
        <div className="mb-6">
          <MicroQuizCard evaluacion={microQuizEvaluacion} defaultCollapsed />
        </div>
      )}

      {showStudentLayout ? (
        <>
          <LessonTabs active={tab} onChange={setTab} />

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[11rem_minmax(0,1fr)_17rem] xl:grid-cols-[12rem_minmax(0,1fr)_18rem] gap-5 lg:gap-6">
            {tab === 'contenido' && (
              <aside className="hidden lg:block">
                <LessonSectionNav sections={sections} activeId={activeSection} onSelect={scrollToSection} />
              </aside>
            )}

            <div className="min-w-0 space-y-6">
              {tab === 'contenido' && (
                <>
                  {hasTheoryBlock && (
                    <section id="section-teoria" className="rounded-2xl bg-white border border-atenas-mist-border p-5 sm:p-6 shadow-card scroll-mt-4">
                      <h2 className="text-lg font-bold text-atenas-ink mb-4">Introducción</h2>
                      {tema.content && (
                        <div className="whitespace-pre-wrap text-atenas-muted-strong leading-relaxed text-base mb-6">
                          {normalizedTemaContent}
                        </div>
                      )}
                      {loadingRecursos && !tema.content ? (
                        <p className="text-atenas-muted">Cargando…</p>
                      ) : (
                        <ul className="space-y-4 list-none m-0 p-0">
                          {recursosTeoria.map((r) => (
                            <RecursoItem key={r.id} r={r} />
                          ))}
                          {recursosPdf.map((r) => (
                            <RecursoItem key={r.id} r={r} />
                          ))}
                        </ul>
                      )}
                    </section>
                  )}

                  {recursosTeoria.length >= 2 && (
                    <div id="section-timeline" className="scroll-mt-4">
                      <TimelineSection recursos={recursosTeoria} />
                    </div>
                  )}

                  {hasVideoBlock && (
                    <section id="section-video" className="rounded-2xl bg-white border border-atenas-mist-border p-5 shadow-card scroll-mt-4">
                      <h2 className="text-lg font-bold text-atenas-ink mb-4">Video y audio</h2>
                      <ul className="space-y-4 list-none m-0 p-0">
                        {recursosVideo.map((r) => (
                          <RecursoItem key={r.id} r={r} />
                        ))}
                        {recursosAudio.map((r) => (
                          <RecursoItem key={r.id} r={r} />
                        ))}
                      </ul>
                    </section>
                  )}

                  {hasActividades && (
                    <section id="section-actividades" className="scroll-mt-4">
                      <h2 className="text-lg font-bold text-atenas-ink mb-3">Actividades</h2>
                      <ul className="space-y-3 list-none m-0 p-0">
                        {actividades.filter((a) => a.publicada).map((a) => (
                          <li key={a.id}>
                            <Link to={`/actividades/${a.id}`} className="block p-4 rounded-xl border border-atenas-mist-border bg-white shadow-card card-hover">
                              <span className="text-xs font-semibold uppercase text-atenas-blue">{a.tipo.replace(/_/g, ' ')}</span>
                              <h3 className="font-bold text-atenas-ink mt-1">{a.title}</h3>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {hasEvaluaciones && (
                    <section id="section-evaluacion" className="scroll-mt-4">
                      <h2 className="text-lg font-bold text-atenas-ink mb-3">Evaluación</h2>
                      <ul className="space-y-3 list-none m-0 p-0">
                        {(esEstudiante ? evaluaciones.filter((e) => e.publicada && e.es_micro_quiz !== true) : evaluaciones.filter((e) => e.publicada)).map((e) => (
                          <li key={e.id}>
                            <Link to={`/evaluaciones/${e.id}`} className="block p-4 rounded-xl border border-atenas-mist-border bg-white shadow-card card-hover">
                              <span className="text-xs font-semibold uppercase text-atenas-ink">Cuestionario</span>
                              <h3 className="font-bold text-atenas-ink mt-1">{e.title}</h3>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <MascotTip>Lee con atención cada sección y completa las actividades para ganar XP.</MascotTip>
                </>
              )}

              {tab === 'recursos' && (
                loadingRecursos ? (
                  <p className="text-atenas-muted">Cargando recursos…</p>
                ) : (
                  <ResourcesSplitView recursos={recursos} />
                )
              )}

              {tab === 'actividades' && (
                <section>
                  {loadingActividades ? (
                    <p className="text-atenas-muted">Cargando…</p>
                  ) : !hasActividades && !hasEvaluaciones ? (
                    <p className="text-atenas-muted">No hay actividades publicadas.</p>
                  ) : (
                    <ul className="space-y-3 list-none m-0 p-0">
                      {actividades.filter((a) => a.publicada).map((a) => (
                        <li key={a.id}>
                          <Link to={`/actividades/${a.id}`} className="block p-4 rounded-xl border bg-white shadow-card card-hover">
                            <h3 className="font-bold text-atenas-ink">{a.title}</h3>
                          </Link>
                        </li>
                      ))}
                      {(esEstudiante ? evaluaciones.filter((e) => e.publicada && e.es_micro_quiz !== true) : evaluaciones.filter((e) => e.publicada)).map((e) => (
                        <li key={e.id}>
                          <Link to={`/evaluaciones/${e.id}`} className="block p-4 rounded-xl border bg-white shadow-card card-hover">
                            <h3 className="font-bold text-atenas-ink">{e.title}</h3>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {tab === 'notas' && <LessonNotesWidget temaId={tema.id} />}
            </div>

            <aside className="lesson-widgets space-y-4 hidden lg:block">
              <LessonNotesWidget temaId={tema.id} compact />
              <LessonMapWidget recursos={recursos} />
              <LessonForumWidget temaId={tema.id} compact />
            </aside>
          </div>

          {/* Footer nav temas */}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-atenas-mist-border pt-6">
            {prevTema ? (
              <button
                type="button"
                onClick={() => navigate(`/temas/${prevTema.id}`)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
                Anterior
              </button>
            ) : (
              <span />
            )}
            {temasUnidad.length > 0 && (
              <p className="text-sm text-atenas-muted font-medium">
                Tema {temaIndex + 1} / {temasUnidad.length}
              </p>
            )}
            {nextTema ? (
              <button
                type="button"
                onClick={() => navigate(`/temas/${nextTema.id}`)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
            ) : (
              <button type="button" onClick={() => navigate(`/unidades/${tema.unidad_id}`)} className="btn-primary text-sm">
                Volver a unidad
              </button>
            )}
          </footer>
        </>
      ) : (
        /* Vista docente/admin simplificada */
        <div className="space-y-6">
          {tema.content && (
            <div className="card p-6 whitespace-pre-wrap">{normalizedTemaContent}</div>
          )}
          <ResourcesSplitView recursos={recursos} />
          <TemaMensajes temaId={tema.id} />
        </div>
      )}

      {microQuizEvaluacion && microQuizEvaluacion.micro_ubicacion !== 'inicio' && esEstudiante && (
        <div className="mt-8">
          <MicroQuizCard evaluacion={microQuizEvaluacion} defaultCollapsed />
        </div>
      )}
    </div>
  );
}

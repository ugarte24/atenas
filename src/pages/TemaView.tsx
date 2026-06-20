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
import { EvaluacionTemaCard } from '../components/EvaluacionTemaCard';
import { useResumenEvaluacionesUsuario } from '../hooks/useResumenEvaluacionesUsuario';
import { useTiempoEstudio } from '../hooks/useTiempoEstudio';
import { SkeletonLines } from '../components/ui/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { LessonTabs, type LessonTab } from '../components/lesson/LessonTabs';
import { LessonSectionNav, type SectionItem } from '../components/lesson/LessonSectionNav';
import { TimelineSection } from '../components/lesson/TimelineSection';
import { LessonNotesWidget } from '../components/lesson/LessonNotesWidget';
import { LessonMapWidget } from '../components/lesson/LessonMapWidget';
import { LessonForumWidget } from '../components/lesson/LessonForumWidget';
import { RecursoItem, ResourcesSplitView } from '../components/lesson';
import { MascotTip } from '../components/gamification/MascotTip';
import { cn } from '../components/ui/cn';
import { normalizeHtmlExternalImages } from '../lib/externalImageUrl';

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

function temaContentEsHtml(raw: string): boolean {
  return /<h[1-6]|<ul|<ol|<blockquote|<strong/i.test(raw);
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
  const evaluacionesListadas = useMemo(
    () =>
      evaluaciones.filter((e) =>
        esEstudiante ? e.publicada && e.es_micro_quiz !== true : e.publicada
      ),
    [evaluaciones, esEstudiante]
  );

  const hasEvaluaciones = evaluacionesListadas.length > 0;

  const evaluacionIds = useMemo(
    () => evaluacionesListadas.map((e) => e.id),
    [evaluacionesListadas]
  );

  const { porId: resumenEvaluaciones, loading: loadingResumenEval } = useResumenEvaluacionesUsuario(
    evaluacionIds,
    esEstudiante ? user?.id : undefined
  );

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
    setActiveSection(null);
  }, [temaId]);

  useEffect(() => {
    if (!sections.length) {
      setActiveSection(null);
      return;
    }
    if (!activeSection || !sections.some((s) => s.id === activeSection)) {
      setActiveSection(sections[0]!.id);
    }
  }, [sections, activeSection]);

  const temaIndex = temasUnidad.findIndex((t) => t.id === temaId);
  const prevTema = temaIndex > 0 ? temasUnidad[temaIndex - 1] : null;
  const nextTema = temaIndex >= 0 && temaIndex < temasUnidad.length - 1 ? temasUnidad[temaIndex + 1] : null;

  const selectSection = useCallback((id: string) => {
    setActiveSection(id);
    setTab('contenido');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openForumTab = useCallback(() => {
    setTab('foro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const temaContentHtml = useMemo(() => {
    const content = tema?.content;
    if (!content || !temaContentEsHtml(content)) return null;
    return normalizeHtmlExternalImages(content);
  }, [tema?.content]);

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
        <Card padding="md" className="border-2 border-amber-300 bg-amber-50">
          <h1 className="text-xl font-bold text-amber-950">Tema bloqueado</h1>
          <p className="text-amber-900 mt-2">Completa el tema anterior antes de continuar.</p>
        </Card>
      </div>
    );
  }

  const showStudentLayout = esEstudiante;
  const normalizedTemaContent = normalizeTemaContent(tema.content);

  return (
    <div className={cn(readingMode && 'reading-mode', '-mx-4 sm:-mx-6 px-4 sm:px-6')}>
      {/* Header */}
      <PageHeader
        className="mb-5 border-b-0 pb-0"
        eyebrow={unidad ? tituloUnidadConOrden(unidad.orden ?? 0, unidad.title) : undefined}
        title={tema.title}
        description={unidad && unidad.title !== tema.title ? unidad.title : undefined}
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          ...(unidad
            ? [
                {
                  label: tituloUnidadConOrden(unidad.orden ?? 0, unidad.title),
                  to: `/unidades/${unidad.id}`,
                },
              ]
            : []),
          { label: tema.title },
        ]}
        actions={
          showStudentLayout ? (
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-2 text-sm text-atenas-muted-strong cursor-pointer min-h-touch">
                <input
                  type="checkbox"
                  checked={readingMode}
                  onChange={(e) => setReadingMode(e.target.checked)}
                  className="rounded border-atenas-mist-border"
                />
                Modo lectura
              </label>
              <button
                type="button"
                className="p-2 rounded-xl text-atenas-muted hover:bg-white/80 min-h-touch min-w-touch"
                aria-label="Pantalla completa"
                onClick={() => document.documentElement.requestFullscreen?.()}
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          ) : undefined
        }
      />

      {progreso && (
        <div className="mb-5 -mt-2 rounded-xl bg-white/80 border border-atenas-mist-border px-4 py-2 flex items-center gap-3">
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

      {microQuizEvaluacion && microQuizEvaluacion.micro_ubicacion === 'inicio' && esEstudiante && (
        <div className="mb-6">
          <MicroQuizCard evaluacion={microQuizEvaluacion} defaultCollapsed />
        </div>
      )}

      {showStudentLayout ? (
        <>
          <LessonTabs active={tab} onChange={setTab} />

          {tab === 'contenido' && sections.length > 0 && (
            <LessonSectionNav
              variant="horizontal"
              sections={sections}
              activeId={activeSection}
              onSelect={selectSection}
            />
          )}

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[11rem_minmax(0,1fr)_17rem] xl:grid-cols-[12rem_minmax(0,1fr)_18rem] gap-5 lg:gap-6">
            {tab === 'contenido' && (
              <aside className="hidden lg:block">
                <LessonSectionNav sections={sections} activeId={activeSection} onSelect={selectSection} />
              </aside>
            )}

            <div className="min-w-0 space-y-6">
              {tab === 'contenido' && (
                <>
                  {activeSection === 'teoria' && hasTheoryBlock && (
                    <section id="section-teoria" className="rounded-2xl bg-white border border-atenas-mist-border p-5 sm:p-6 shadow-card scroll-mt-4">
                      <h2 className="text-lg font-bold text-atenas-ink mb-4">Introducción</h2>
                      {tema.content && (
                        temaContentHtml ? (
                          <div
                            className="prose prose-sm max-w-none text-atenas-muted-strong leading-relaxed mb-6 [&_h3]:text-atenas-ink [&_h3]:font-bold [&_h3]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-atenas-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
                            dangerouslySetInnerHTML={{ __html: temaContentHtml }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-atenas-muted-strong leading-relaxed text-base mb-6">
                            {normalizedTemaContent}
                          </div>
                        )
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

                  {activeSection === 'timeline' && recursosTeoria.length >= 2 && (
                    <div id="section-timeline" className="scroll-mt-4">
                      <TimelineSection recursos={recursosTeoria} />
                    </div>
                  )}

                  {activeSection === 'video' && hasVideoBlock && (
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

                  {activeSection === 'actividades' && hasActividades && (
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

                  {activeSection === 'evaluacion' && hasEvaluaciones && (
                    <section id="section-evaluacion" className="scroll-mt-4">
                      <h2 className="text-lg font-bold text-atenas-ink mb-3">Evaluación</h2>
                      <ul className="space-y-3 list-none m-0 p-0">
                        {evaluacionesListadas.map((e) => (
                          <li key={e.id}>
                            <EvaluacionTemaCard
                              evaluacion={e}
                              resumen={resumenEvaluaciones[e.id]}
                              loadingResumen={loadingResumenEval}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {activeSection && (
                    <MascotTip>Lee con atención cada sección y completa las actividades para ganar XP.</MascotTip>
                  )}
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
                      {evaluacionesListadas.map((e) => (
                        <li key={e.id}>
                          <EvaluacionTemaCard
                            evaluacion={e}
                            resumen={resumenEvaluaciones[e.id]}
                            loadingResumen={loadingResumenEval}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {tab === 'notas' && <LessonNotesWidget temaId={tema.id} userId={user?.id} />}

              {tab === 'foro' && <TemaMensajes temaId={tema.id} />}
            </div>

            <aside className="lesson-widgets space-y-4 hidden lg:block">
              <LessonNotesWidget temaId={tema.id} userId={user?.id} compact />
              <LessonMapWidget recursos={recursos} />
              <LessonForumWidget temaId={tema.id} compact onOpenForum={openForumTab} />
            </aside>
          </div>

          {/* Footer nav temas */}
          <footer className="mt-8 border-t border-atenas-mist-border pt-5 mb-student-bottom-nav lg:mb-0">
            {temasUnidad.length > 0 && (
              <p className="text-sm text-atenas-muted font-medium text-center mb-4 tabular-nums">
                Tema {temaIndex + 1} de {temasUnidad.length}
              </p>
            )}
            <div
              className={cn(
                'grid gap-3 max-w-xl mx-auto md:max-w-none',
                prevTema ? 'grid-cols-2' : 'grid-cols-1 max-w-xs'
              )}
            >
              {prevTema ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/temas/${prevTema.id}`)}
                  className="inline-flex items-center justify-center gap-2 min-h-touch"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="truncate">Anterior</span>
                </Button>
              ) : null}
              {nextTema ? (
                <Button
                  type="button"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/temas/${nextTema.id}`)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 min-h-touch',
                    !prevTema && 'col-span-1'
                  )}
                >
                  <span className="truncate">Siguiente</span>
                  <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/unidades/${tema.unidad_id}`)}
                  className="inline-flex items-center justify-center gap-2 min-h-touch"
                >
                  <span className="truncate sm:hidden">Unidad</span>
                  <span className="truncate hidden sm:inline">Volver a unidad</span>
                </Button>
              )}
            </div>
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

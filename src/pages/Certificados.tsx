import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  Loader2,
  Lock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useUnidades } from '../hooks/useUnidades';
import { useAuthContext } from '../contexts/AuthContext';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { progresoPorcentajeUnidad } from '../lib/progresoUnidad';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { downloadCertificadoPdf, openCertificadoEnVentana, reservarVentanaCertificado } from '../lib/certificadoPdf';
import { buildCertificadoParams } from '../lib/certificadoStats';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonLines } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../components/ui/cn';

type CertState = Record<string, { pct: number; eligible: boolean }>;
type Filtro = 'todos' | 'desbloqueados' | 'pendientes';

export default function Certificados() {
  const { user, profile } = useAuthContext();
  const { unidades, loading } = useUnidades();
  const { misiones } = useMisionesAlumno();
  const [certs, setCerts] = useState<CertState>({});
  const [loadingPct, setLoadingPct] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);

  const publicadas = useMemo(() => unidades.filter((u) => u.publicada !== false), [unidades]);

  useEffect(() => {
    if (!user || profile?.role !== 'estudiante') {
      setLoadingPct(false);
      return;
    }
    let c = false;
    void (async () => {
      setLoadingPct(true);
      setCerts({});
      for (const u of publicadas) {
        const umbral = u.certificado_umbral_pct ?? 0;
        const pct = await progresoPorcentajeUnidad(user.id, u.id);
        if (c) return;
        setCerts((prev) => ({
          ...prev,
          [u.id]: { pct, eligible: umbral > 0 && pct >= umbral },
        }));
      }
      if (!c) setLoadingPct(false);
    })();
    return () => {
      c = true;
    };
  }, [user, profile?.role, publicadas]);

  const stats = useMemo(() => {
    let desbloqueados = 0;
    let cargados = 0;
    for (const u of publicadas) {
      const st = certs[u.id];
      if (!st) continue;
      cargados += 1;
      if (st.eligible) desbloqueados += 1;
    }
    return { desbloqueados, cargados, total: publicadas.length };
  }, [certs, publicadas]);

  const filtered = useMemo(() => {
    return publicadas.filter((u) => {
      const st = certs[u.id];
      if (filtro === 'todos') return true;
      if (!st) return filtro === 'pendientes';
      if (filtro === 'desbloqueados') return st.eligible;
      return !st.eligible;
    });
  }, [publicadas, certs, filtro]);

  async function abrirCertificado(unidadId: string, titulo: string, pct: number, umbral: number) {
    if (!user) return;
    const ventana = reservarVentanaCertificado();
    setOpeningId(unidadId);
    try {
      const params = await buildCertificadoParams(user.id, unidadId, {
        nombreEstudiante: profile?.full_name ?? 'Estudiante',
        tituloUnidad: titulo,
        porcentajeUnidad: pct,
        umbralCertificado: umbral,
      });
      openCertificadoEnVentana(params, ventana);
    } catch (e) {
      ventana?.close();
      console.error(e);
      window.alert('No se pudo preparar el certificado. Intenta de nuevo.');
    } finally {
      setOpeningId(null);
    }
  }

  async function descargarPdf(unidadId: string, titulo: string, pct: number, umbral: number) {
    if (!user) return;
    setPdfId(unidadId);
    try {
      const params = await buildCertificadoParams(user.id, unidadId, {
        nombreEstudiante: profile?.full_name ?? 'Estudiante',
        tituloUnidad: titulo,
        porcentajeUnidad: pct,
        umbralCertificado: umbral,
      });
      await downloadCertificadoPdf(params);
    } catch (e) {
      console.error(e);
      window.alert('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setPdfId(null);
    }
  }

  const tabs: { id: Filtro; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'desbloqueados', label: 'Desbloqueados' },
    { id: 'pendientes', label: 'Pendientes' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Certificados"
        description="Completa cada unidad al umbral indicado para obtener tu diploma."
      />

      {loading && <SkeletonLines lines={3} />}

      {!loading && publicadas.length === 0 && !loadingPct && (
        <EmptyState
          icon={<Award className="w-8 h-8" />}
          title="Sin certificados disponibles"
          description="Cuando haya unidades publicadas con umbral de certificado, aparecerán aquí."
          action={
            <Link to="/unidades" className="btn-secondary inline-flex text-sm">
              Ver unidades
            </Link>
          }
        />
      )}

      {!loading && publicadas.length > 0 && (
        <>
          <section
            className="mb-6 rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-5 shadow-card"
            aria-label="Resumen de certificados"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
                <Award className="w-7 h-7" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800/80">
                  Tus diplomas
                </p>
                <p className="text-2xl font-bold text-atenas-ink tabular-nums mt-0.5">
                  {stats.cargados < stats.total && loadingPct ? (
                    <span className="text-lg text-atenas-muted">Comprobando…</span>
                  ) : (
                    <>
                      {stats.desbloqueados}
                      <span className="text-base font-semibold text-atenas-muted">
                        {' '}
                        / {stats.total} desbloqueados
                      </span>
                    </>
                  )}
                </p>
                <p className="text-sm text-atenas-muted mt-1">
                  Necesitas alcanzar el umbral de progreso de cada unidad para ver tu certificado.
                </p>
              </div>
            </div>
          </section>

          <div
            className="flex rounded-xl border border-atenas-mist-border bg-white p-1 mb-6 shadow-card"
            role="tablist"
          >
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filtro === id}
                onClick={() => setFiltro(id)}
                className={cn(
                  'segment-tab',
                  filtro === id ? 'segment-tab--active' : 'segment-tab--inactive'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Award className="w-8 h-8" />}
              title={
                filtro === 'desbloqueados'
                  ? 'Aún no tienes certificados'
                  : 'No hay certificados en esta vista'
              }
              description={
                filtro === 'desbloqueados'
                  ? 'Sigue aprendiendo y alcanza el umbral de cada unidad.'
                  : 'Prueba otro filtro o continúa con tus unidades.'
              }
              action={
                filtro !== 'todos' ? (
                  <button
                    type="button"
                    className="btn-secondary inline-flex text-sm"
                    onClick={() => setFiltro('todos')}
                  >
                    Ver todos
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4 pb-2">
              {filtered.map((u, listIndex) => {
                const st = certs[u.id];
                const umbral = u.certificado_umbral_pct ?? 70;
                const titulo = tituloUnidadConOrden(u.orden, u.title);
                const m = misiones.find((x) => x.id === u.id);
                const certLoading = !st;
                const eligible = st?.eligible ?? false;
                const pct = st?.pct ?? 0;
                const falta = Math.max(0, umbral - pct);
                const isla = islaDesdeOrdenUnidadSafe(u.orden, listIndex);

                return (
                  <Card
                    key={u.id}
                    padding="none"
                    className={cn(
                      'overflow-hidden border shadow-card transition-shadow hover:shadow-lg',
                      eligible
                        ? 'border-amber-300/80 ring-1 ring-amber-200/50'
                        : 'border-atenas-mist-border'
                    )}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={cn(
                              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm',
                              eligible
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                                : certLoading
                                  ? 'bg-atenas-mist text-atenas-muted animate-pulse'
                                  : 'bg-atenas-mist text-atenas-muted'
                            )}
                          >
                            {eligible ? (
                              <CheckCircle2 className="w-6 h-6" aria-hidden />
                            ) : certLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                            ) : (
                              <Lock className="w-5 h-5" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Badge tone="muted" className="text-[10px] font-bold">
                                {isla.shortLabel}
                              </Badge>
                              {certLoading ? (
                                <Badge tone="default" className="text-[10px]">
                                  Comprobando…
                                </Badge>
                              ) : eligible ? (
                                <Badge tone="success" className="text-[10px]">
                                  Desbloqueado
                                </Badge>
                              ) : (
                                <Badge tone="warning" className="text-[10px]">
                                  Pendiente
                                </Badge>
                              )}
                            </div>
                            <h2 className="font-bold text-atenas-ink leading-snug">{titulo}</h2>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        {certLoading ? (
                          <div className="space-y-2" aria-busy>
                            <div className="h-3 rounded-full bg-atenas-mist animate-pulse" />
                            <div className="h-3 w-2/3 rounded-full bg-atenas-mist animate-pulse" />
                          </div>
                        ) : (
                          <>
                            <ProgressBar
                              value={pct}
                              max={100}
                              label="Progreso hacia el certificado"
                              showPercent
                              size="md"
                              tone={eligible ? 'gold' : 'blue'}
                            />
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-atenas-muted">
                              <span>
                                Umbral requerido: <strong className="text-atenas-ink">{umbral}%</strong>
                              </span>
                              {m && (
                                <span>
                                  Temas: {m.pasosCompletados}/{m.totalPasos}
                                </span>
                              )}
                              {!eligible && falta > 0 && (
                                <span className="text-amber-800 font-medium">Te faltan {falta}%</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {!certLoading && eligible && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            disabled={openingId === u.id}
                            onClick={() => void abrirCertificado(u.id, titulo, pct, umbral)}
                            className="inline-flex flex-1 items-center justify-center gap-2 shadow-sm"
                            aria-busy={openingId === u.id}
                          >
                            {openingId === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                            ) : null}
                            Ver certificado
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={pdfId === u.id}
                            onClick={() => void descargarPdf(u.id, titulo, pct, umbral)}
                            className="inline-flex flex-1 items-center justify-center gap-2"
                            aria-busy={pdfId === u.id}
                          >
                            {pdfId === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                            ) : (
                              <Download className="w-4 h-4 shrink-0" aria-hidden />
                            )}
                            PDF
                          </Button>
                        </div>
                      )}

                      {!certLoading && !eligible && (
                        <Link
                          to={`/unidades/${u.id}`}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-atenas-mist-border bg-white px-4 py-2 text-sm font-semibold text-atenas-ink hover:bg-atenas-mist min-h-[40px] transition-colors"
                        >
                          Continuar unidad
                          <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />
                        </Link>
                      )}

                      {!certLoading && !eligible && (
                        <p className="mt-3 text-xs text-atenas-muted leading-relaxed">
                          Completa actividades y evaluaciones de la unidad para alcanzar el {umbral}%
                          y desbloquear tu diploma.
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

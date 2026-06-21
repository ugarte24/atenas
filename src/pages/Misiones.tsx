import { useMemo, useState } from 'react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { useMisionesDiarias } from '../hooks/useMisionesDiarias';
import { useMisionesEspeciales } from '../hooks/useMisionesEspeciales';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SkeletonLines } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { cn } from '../components/ui/cn';
import { Gift, Target, Star } from 'lucide-react';

type TabMision = 'diarias' | 'semanales' | 'especiales';

export default function Misiones() {
  const { misiones, loading, error } = useMisionesAlumno();
  const { misiones: diarias, loading: loadingDiarias } = useMisionesDiarias();
  const {
    misionesEspeciales,
    weeklyChestReady,
    weeklyChestClaimed,
    weeklyChestXp,
    claimWeeklyChest,
  } = useMisionesEspeciales();
  const { racha } = useGamificacionEstudiante();
  const [tab, setTab] = useState<TabMision>('diarias');
  const [claimingWeekly, setClaimingWeekly] = useState(false);

  const misionesConTemas = useMemo(() => misiones.filter((m) => m.totalPasos > 0), [misiones]);

  const tabs: { id: TabMision; label: string }[] = [
    { id: 'diarias', label: 'Diarias' },
    { id: 'semanales', label: 'Semanales' },
    { id: 'especiales', label: 'Especiales' },
  ];

  async function handleClaimWeekly() {
    setClaimingWeekly(true);
    try {
      await claimWeeklyChest();
    } finally {
      setClaimingWeekly(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Misiones" description="Completa misiones y avanza en tus unidades." />

      <div className="flex rounded-xl border border-atenas-mist-border bg-white p-1 mb-6 shadow-card" role="tablist">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'segment-tab',
              tab === id ? 'segment-tab--active' : 'segment-tab--inactive'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && tab === 'semanales' && <SkeletonLines lines={4} />}
      {error && (
        <Alert tone="error" className="mb-4">
          No se pudieron cargar las misiones. Recarga la página o inténtalo más tarde.
        </Alert>
      )}

      {!loading && tab === 'semanales' && (
        <div className="space-y-4">
          {misionesConTemas.length === 0 ? (
            <EmptyState
              icon={<Target className="w-8 h-8" />}
              title="Sin misiones semanales"
              description="Cuando tu docente publique unidades, aparecerán aquí como misiones por completar."
              action={
                <Link to="/unidades" className="btn-secondary inline-flex text-sm">
                  Explorar unidades
                </Link>
              }
            />
          ) : (
            misionesConTemas.map((m) => {
              const pct = m.totalPasos ? Math.round((m.pasosCompletados / m.totalPasos) * 100) : 0;
              return (
                <Card key={m.id} padding="md" className="flex flex-col gap-3">
                  <div className="flex justify-between gap-3 items-start">
                    <h2 className="font-bold text-atenas-ink">{m.titulo}</h2>
                    <Link
                      to={`/unidades/${m.id}`}
                      className="shrink-0 text-xs font-bold text-atenas-ink underline underline-offset-2 min-h-touch inline-flex items-center"
                    >
                      Ir
                    </Link>
                  </div>
                  <p className="text-sm text-atenas-muted">{m.descripcion}</p>
                  <ProgressBar value={pct} showPercent size="md" tone="success" />
                  <p className="text-xs text-atenas-muted">
                    {m.pasosCompletados} / {m.totalPasos} temas completados
                  </p>
                </Card>
              );
            })
          )}
          <Card padding="md" className="bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Gift className="w-10 h-10 text-amber-600 shrink-0" aria-hidden />
            <div className="flex-1">
              <p className="font-bold text-amber-950">Cofre semanal</p>
              {weeklyChestClaimed ? (
                <p className="text-sm text-amber-900">¡Cofre reclamado esta semana! (+{weeklyChestXp} XP)</p>
              ) : weeklyChestReady ? (
                <p className="text-sm text-amber-900">¡Misiones semanales completas! Reclama +{weeklyChestXp} XP.</p>
              ) : (
                <p className="text-sm text-amber-900">
                  Completa todas las misiones semanales para desbloquear +{weeklyChestXp} XP.
                </p>
              )}
            </div>
            {weeklyChestReady && !weeklyChestClaimed && (
              <Button type="button" size="sm" onClick={() => void handleClaimWeekly()} disabled={claimingWeekly}>
                {claimingWeekly ? 'Abriendo…' : 'Abrir cofre'}
              </Button>
            )}
          </Card>
        </div>
      )}

      {tab === 'diarias' && (
        <div className="space-y-4">
          {loadingDiarias ? (
            <SkeletonLines lines={2} />
          ) : diarias.length === 0 ? (
            <EmptyState
              icon={<Target className="w-8 h-8" />}
              title="Sin misiones diarias"
              description="Estudia hoy para avanzar en tus objetivos diarios."
            />
          ) : (
            diarias.map((d) => (
              <Card key={d.id} padding="md">
                <div className="flex justify-between mb-2 gap-2 items-start">
                  <h2 className="font-bold text-atenas-ink text-sm">{d.titulo}</h2>
                  <Link
                    to={d.targetUrl}
                    className="text-xs font-bold text-atenas-ink underline underline-offset-2 shrink-0"
                  >
                    Ir
                  </Link>
                </div>
                <span className="text-xs font-semibold text-atenas-muted uppercase tracking-wide">
                  Objetivo diario · +{d.xp} XP
                  {d.xpOtorgada && d.completada ? ' · otorgado' : ''}
                </span>
                <ProgressBar value={d.total ? (d.progreso / d.total) * 100 : 0} size="sm" tone="success" />
                <p className="text-xs text-atenas-muted mt-1">
                  {d.progreso} / {d.total}
                  {d.id === 'd1' && racha > 0 && d.progreso === 0 && (
                    <span className="ml-1">· Sigue tu racha estudiando hoy</span>
                  )}
                </p>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'especiales' && (
        <div className="space-y-4">
          {misionesEspeciales.length === 0 ? (
            <EmptyState
              icon={<Star className="w-8 h-8" />}
              title="Misiones especiales"
              description="Publica unidades para desbloquear retos del Abya Yala."
            />
          ) : (
            misionesEspeciales.map((m) => (
              <Card key={m.id} padding="md" className="flex flex-col gap-3">
                <div className="flex justify-between gap-3 items-start">
                  <h2 className="font-bold text-atenas-ink">{m.titulo}</h2>
                  <Link
                    to={m.targetUrl}
                    className="shrink-0 text-xs font-bold text-atenas-ink underline underline-offset-2"
                  >
                    Ir
                  </Link>
                </div>
                <p className="text-sm text-atenas-muted">{m.descripcion}</p>
                <ProgressBar value={m.progreso} showPercent size="md" tone={m.completada ? 'success' : 'gold'} />
                <p className="text-xs text-atenas-muted">
                  Recompensa: +{m.xp} XP
                  {m.recompensaClaimed ? ' · reclamada' : m.completada ? ' · pendiente de reclamar' : ''}
                </p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

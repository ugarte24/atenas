import { useMemo, useState } from 'react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { useMisionesDiarias } from '../hooks/useMisionesDiarias';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SkeletonLines } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { cn } from '../components/ui/cn';
import { Star, Gift, Target } from 'lucide-react';

type TabMision = 'diarias' | 'semanales' | 'especiales';

export default function Misiones() {
  const { misiones, loading, error } = useMisionesAlumno();
  const { misiones: diarias, loading: loadingDiarias } = useMisionesDiarias();
  const { racha } = useGamificacionEstudiante();
  const [tab, setTab] = useState<TabMision>('semanales');

  const misionesConTemas = useMemo(() => misiones.filter((m) => m.totalPasos > 0), [misiones]);

  const especiales = useMemo(
    () => [
      {
        id: 'e1',
        titulo: 'Explora los 3 mundos del Abya Yala',
        progreso: misionesConTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length,
        total: 3,
        xp: 500,
      },
    ],
    [misionesConTemas]
  );

  const tabs: { id: TabMision; label: string }[] = [
    { id: 'diarias', label: 'Diarias' },
    { id: 'semanales', label: 'Semanales' },
    { id: 'especiales', label: 'Especiales' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Misiones" description="Completa misiones y gana XP extra." />

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
              const done = m.pasosCompletados >= m.totalPasos;
              return (
                <Card key={m.id} padding="md" className="flex flex-col gap-3">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-bold text-atenas-ink">{m.titulo}</h2>
                    <span className="shrink-0 flex items-center gap-1 text-sm font-bold text-atenas-gold">
                      <Star className="w-4 h-4 fill-atenas-gold" aria-hidden />
                      +{done ? 100 : 50} XP
                    </span>
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
          <Card padding="md" className="bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 flex items-center gap-4">
            <Gift className="w-10 h-10 text-amber-600 shrink-0" aria-hidden />
            <div>
              <p className="font-bold text-amber-950">Cofre semanal</p>
              <p className="text-sm text-amber-900">Completa todas las misiones semanales · +500 XP</p>
            </div>
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
                <div className="flex justify-between mb-2">
                  <h2 className="font-bold text-atenas-ink text-sm">{d.titulo}</h2>
                  <span className="text-xs font-bold text-atenas-gold">
                    {d.progreso >= d.total ? `+${d.xp} XP` : `+${d.xp} XP`}
                  </span>
                </div>
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

      {!loading && tab === 'especiales' && (
        <div className="space-y-4">
          {especiales.map((e) => (
            <Card key={e.id} padding="md" className="border-atenas-gold/30">
              <div className="flex justify-between mb-2">
                <h2 className="font-bold text-atenas-ink">{e.titulo}</h2>
                <span className="text-sm font-bold text-atenas-gold">+{e.xp} XP</span>
              </div>
              <ProgressBar value={e.total ? (e.progreso / e.total) * 100 : 0} showPercent tone="success" />
              <p className="text-xs text-atenas-muted mt-2">
                Completa las unidades de cada isla para avanzar en los tres mundos.
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

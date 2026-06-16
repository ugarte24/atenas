import { useMemo, useState } from 'react';
import { useMisionesAlumno } from '../hooks/useMisiones';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SkeletonLines } from '../components/ui/Skeleton';
import { cn } from '../components/ui/cn';
import { Star, Gift } from 'lucide-react';

type TabMision = 'diarias' | 'semanales' | 'especiales';

export default function Misiones() {
  const { misiones, loading, error } = useMisionesAlumno();
  const { racha } = useGamificacionEstudiante();
  const [tab, setTab] = useState<TabMision>('semanales');

  const misionesConTemas = useMemo(() => misiones.filter((m) => m.totalPasos > 0), [misiones]);

  const diarias = useMemo(
    () => [
      { id: 'd1', titulo: 'Estudia al menos 1 tema hoy', progreso: racha > 0 ? 1 : 0, total: 1, xp: 50 },
      { id: 'd2', titulo: 'Completa una actividad', progreso: 0, total: 1, xp: 30 },
    ],
    [racha]
  );

  const especiales = useMemo(
    () => [
      { id: 'e1', titulo: 'Explora los 3 mundos del Abya Yala', progreso: misionesConTemas.filter((m) => m.pasosCompletados >= m.totalPasos).length, total: 3, xp: 500 },
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
              'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors min-h-touch',
              tab === id ? 'bg-atenas-sidebar text-white' : 'text-atenas-muted hover:bg-atenas-mist'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <SkeletonLines lines={4} />}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && tab === 'semanales' && (
        <div className="space-y-4">
          {misionesConTemas.length === 0 ? (
            <p className="text-atenas-muted">No hay misiones disponibles aún.</p>
          ) : (
            misionesConTemas.map((m) => {
              const pct = m.totalPasos ? Math.round((m.pasosCompletados / m.totalPasos) * 100) : 0;
              const done = m.pasosCompletados >= m.totalPasos;
              return (
                <article key={m.id} className="card p-5 flex flex-col gap-3">
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
                </article>
              );
            })
          )}
          <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 p-5 flex items-center gap-4">
            <Gift className="w-10 h-10 text-amber-600 shrink-0" aria-hidden />
            <div>
              <p className="font-bold text-amber-950">Cofre semanal</p>
              <p className="text-sm text-amber-900">Completa todas las misiones semanales · +500 XP</p>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'diarias' && (
        <div className="space-y-4">
          {diarias.map((d) => (
            <article key={d.id} className="card p-5">
              <div className="flex justify-between mb-2">
                <h2 className="font-bold text-atenas-ink text-sm">{d.titulo}</h2>
                <span className="text-xs font-bold text-atenas-gold">+{d.xp} XP</span>
              </div>
              <ProgressBar value={d.total ? (d.progreso / d.total) * 100 : 0} size="sm" tone="success" />
              <p className="text-xs text-atenas-muted mt-1">
                {d.progreso} / {d.total}
              </p>
            </article>
          ))}
        </div>
      )}

      {!loading && tab === 'especiales' && (
        <div className="space-y-4">
          {especiales.map((e) => (
            <article key={e.id} className="card p-5 border-atenas-gold/30">
              <div className="flex justify-between mb-2">
                <h2 className="font-bold text-atenas-ink">{e.titulo}</h2>
                <span className="text-sm font-bold text-atenas-gold">+{e.xp} XP</span>
              </div>
              <ProgressBar value={e.total ? (e.progreso / e.total) * 100 : 0} showPercent tone="success" />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

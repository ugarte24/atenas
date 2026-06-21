import { Link } from 'react-router-dom';
import type { ActividadReciente } from '../../hooks/useActividadReciente';
import { ClipboardList, FileQuestion } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

type Props = {
  items: ActividadReciente[];
  loading?: boolean;
};

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return d.toLocaleDateString('es');
  } catch {
    return iso.slice(0, 10);
  }
}

export function RecentActivityList({ items, loading }: Props) {
  if (loading) {
    return (
      <ul className="space-y-3 list-none m-0 p-0" aria-busy aria-label="Cargando actividad">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl border border-atenas-mist-border bg-white p-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="w-8 h-8" />}
        title="Sin actividad reciente"
        description="Cuando completes actividades o evaluaciones, aparecerán aquí."
        action={
          <Link to="/unidades" className="btn-secondary inline-flex text-sm">
            Ir a unidades
          </Link>
        }
        className="p-6"
      />
    );
  }

  return (
    <ul className="space-y-3 list-none m-0 p-0">
      {items.map((item) => {
        const Icon = item.tipo === 'actividad' ? ClipboardList : FileQuestion;
        return (
          <li key={`${item.tipo}-${item.id}-${item.fecha}`}>
          <Link
            to={item.tipo === 'actividad' ? `/actividades/${item.id}` : `/evaluaciones/${item.id}`}
            className="flex items-start gap-3 rounded-xl border border-atenas-mist-border bg-white p-3 shadow-card hover:shadow-card-hover transition-shadow min-h-touch"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-atenas-mist text-atenas-sidebar">
              <Icon className="w-4 h-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-atenas-ink truncate">{item.titulo}</p>
              <p className="text-xs text-atenas-muted">
                {item.tipo === 'actividad' ? 'Actividad' : 'Evaluación'} · {item.puntuacion} pts ·{' '}
                {formatRelative(item.fecha)}
              </p>
            </div>
          </Link>
          </li>
        );
      })}
    </ul>
  );
}

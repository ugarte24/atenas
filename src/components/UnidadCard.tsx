import { Link } from 'react-router-dom';
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import type { Unidad } from '../types';
import type { MapNodeStatus } from '../lib/adventureMapTypes';
import { resolveCoverImageUrl } from '../lib/unidadVisual';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../lib/unidadDescripcion';
import { islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';
import { ExternalImage } from './ui/ExternalImage';
import { cn } from './ui/cn';

export type UnidadCardStatus = MapNodeStatus | 'not_started';

type Props = {
  unidad: Unidad;
  listIndex: number;
  /** Progreso 0–100 para estudiante; omitir para no mostrar barra */
  progressPct?: number | null;
  /** Estado en el mapa de aventura (estudiante) */
  mapStatus?: MapNodeStatus;
  compact?: boolean;
};

function cardStatus(
  mapStatus: MapNodeStatus | undefined,
  progressPct: number | null | undefined
): UnidadCardStatus {
  if (mapStatus === 'locked') return 'locked';
  if ((progressPct ?? 0) >= 100) return 'completed';
  if ((progressPct ?? 0) > 0) return 'available';
  return 'not_started';
}

export function UnidadCard({ unidad, listIndex, progressPct, mapStatus, compact }: Props) {
  const cover = resolveCoverImageUrl(unidad, listIndex);
  const showProgress = progressPct != null && !Number.isNaN(progressPct);
  const tituloHero = tituloUnidadConOrden(unidad.orden ?? 0, unidad.title, listIndex);
  const descripcionLimpia = limpiarDescripcionUnidad(unidad.description);
  const isla = islaDesdeOrdenUnidadSafe(unidad.orden, listIndex);
  const status = cardStatus(mapStatus, progressPct);
  const locked = status === 'locked';
  const completed = status === 'completed' || status === 'perfect';

  const cardClass = cn(
    'group block rounded-card overflow-hidden shadow-card border bg-atenas-card transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2',
    locked
      ? 'border-atenas-mist-border opacity-80 cursor-not-allowed'
      : 'border-atenas-mist-border hover:shadow-card-hover hover:-translate-y-0.5',
    completed && !locked && 'border-emerald-200/80 ring-1 ring-emerald-100/60'
  );

  const inner = (
    <>
      <div
        className={cn(
          'overflow-hidden relative bg-atenas-mist',
          compact ? 'aspect-[16/10] sm:aspect-video' : 'aspect-video'
        )}
      >
        <ExternalImage
          src={cover}
          alt=""
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-transform duration-300',
            !locked && 'group-hover:scale-[1.03]',
            locked && 'grayscale-[40%]'
          )}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-atenas-ink/75 via-atenas-ink/10 to-transparent pointer-events-none"
          aria-hidden
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge tone="gold" className="text-[10px] font-bold shadow-md ring-1 ring-atenas-ink/10">
            {isla.shortLabel}
          </Badge>
          {locked && (
            <Badge tone="muted" className="text-[10px] font-bold">
              Bloqueada
            </Badge>
          )}
          {completed && (
            <Badge tone="success" className="text-[10px] font-bold">
              Completada
            </Badge>
          )}
          {!locked && !completed && showProgress && (progressPct ?? 0) > 0 && (
            <Badge tone="warning" className="text-[10px] font-bold">
              En progreso
            </Badge>
          )}
        </div>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-atenas-ink/25 pointer-events-none">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-atenas-muted shadow-md">
              <Lock className="w-5 h-5" aria-hidden />
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex items-end justify-between gap-3">
          <h2 className="text-sm sm:text-lg font-bold text-white leading-snug drop-shadow-sm line-clamp-2 flex-1">
            {tituloHero}
          </h2>
          {!locked && (
            <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-white/15 backdrop-blur px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white border border-white/25 group-hover:bg-white/25 transition-colors">
              {completed ? (
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
              ) : (
                <>
                  Ver
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                </>
              )}
            </span>
          )}
        </div>
      </div>
      <div className={cn('p-3 sm:p-5', compact && 'p-3 sm:p-4')}>
        <p className="text-[11px] font-semibold text-atenas-muted uppercase tracking-wide mb-1">
          {isla.subtitle}
        </p>
        {descripcionLimpia && (
          <p className="text-atenas-muted text-sm line-clamp-2">{descripcionLimpia}</p>
        )}
        {locked && (
          <p className="text-xs text-atenas-muted mt-2 leading-relaxed">
            Completa la unidad anterior para desbloquear este contenido.
          </p>
        )}
        {showProgress && !locked && (
          <div className="mt-3">
            <ProgressBar
              value={progressPct}
              label="Tu progreso"
              showPercent
              size="sm"
              tone={completed ? 'success' : (progressPct ?? 0) > 0 ? 'gold' : 'blue'}
            />
          </div>
        )}
      </div>
    </>
  );

  if (locked) {
    return (
      <div className={cardClass} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link to={`/unidades/${unidad.id}`} className={cardClass}>
      {inner}
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Unidad } from '../types';
import { resolveCoverImageUrl } from '../lib/unidadVisual';
import { tituloUnidadConOrden } from '../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../lib/unidadDescripcion';
import { islaDesdeOrdenUnidadSafe } from '../lib/mundoUnidadMap';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';

type Props = {
  unidad: Unidad;
  listIndex: number;
  /** Progreso 0–100 para estudiante; omitir para no mostrar barra */
  progressPct?: number | null;
};

export function UnidadCard({ unidad, listIndex, progressPct }: Props) {
  const cover = resolveCoverImageUrl(unidad, listIndex);
  const showProgress = progressPct != null && !Number.isNaN(progressPct);
  const tituloHero = tituloUnidadConOrden(unidad.orden ?? 0, unidad.title, listIndex);
  const descripcionLimpia = limpiarDescripcionUnidad(unidad.description);
  const isla = islaDesdeOrdenUnidadSafe(unidad.orden, listIndex);

  return (
    <Link
      to={`/unidades/${unidad.id}`}
      className="group block rounded-card overflow-hidden shadow-card hover:shadow-card-hover border border-atenas-mist-border bg-atenas-card transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-atenas-ink focus-visible:ring-offset-2"
    >
      <div className="aspect-video overflow-hidden relative bg-atenas-mist">
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-atenas-ink/75 via-atenas-ink/10 to-transparent pointer-events-none"
          aria-hidden
        />
        <div className="absolute top-3 left-3">
          <Badge tone="gold" className="text-[10px] font-bold shadow-sm">
            {isla.shortLabel}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm line-clamp-2 flex-1">
            {tituloHero}
          </h2>
          <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white border border-white/25 group-hover:bg-white/25 transition-colors">
            Ver
            <ChevronRight className="w-3.5 h-3.5" aria-hidden />
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold text-atenas-muted uppercase tracking-wide mb-1">
          {isla.subtitle}
        </p>
        {descripcionLimpia && (
          <p className="text-atenas-muted text-sm line-clamp-2">{descripcionLimpia}</p>
        )}
        {showProgress && (
          <div className="mt-3">
            <ProgressBar
              value={progressPct}
              label="Tu progreso"
              showPercent
              size="sm"
              tone="gold"
            />
          </div>
        )}
      </div>
    </Link>
  );
}

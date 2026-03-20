import { Link } from 'react-router-dom';
import type { Unidad } from '../types';
import { resolveAccentColor, resolveCoverImageUrl } from '../lib/unidadVisual';

type Props = {
  unidad: Unidad;
  listIndex: number;
  /** Progreso 0–100 para estudiante; omitir para no mostrar barra */
  progressPct?: number | null;
};

export function UnidadCard({ unidad, listIndex, progressPct }: Props) {
  const cover = resolveCoverImageUrl(unidad, listIndex);
  const accent = resolveAccentColor(unidad.accent_color);
  const showProgress = progressPct != null && !Number.isNaN(progressPct);

  return (
    <Link
      to={`/unidades/${unidad.id}`}
      className="group block rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-atenas-card transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F2D2A] focus-visible:ring-offset-2"
    >
      <div className="aspect-video overflow-hidden relative bg-slate-200">
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1F2D2A]/75 via-[#1F2D2A]/10 to-transparent pointer-events-none"
          aria-hidden
        />
        <span
          className="absolute top-3 left-3 inline-flex items-center rounded-full bg-black/45 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-white shadow-sm border border-white/20"
          style={{ borderColor: `${accent}88` }}
        >
          Nivel {listIndex + 1}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm line-clamp-2">
            {unidad.title}
          </h2>
          <span className="btn-atenas-gold shrink-0 text-sm px-4 py-2 shadow-lg pointer-events-none">
            Entrar
          </span>
        </div>
      </div>
      <div className="p-5 pt-4">
        {unidad.description && (
          <p className="text-slate-600 text-sm line-clamp-2">{unidad.description}</p>
        )}
        {showProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Tu progreso</span>
              <span className="font-semibold text-slate-800">{progressPct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#1F2D2A]/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, progressPct))}%`,
                  backgroundColor: accent,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

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
      className="group block rounded-3xl overflow-hidden shadow-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 transition-transform hover:-translate-y-0.5"
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-slate-200">
        <img
          src={cover}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, transparent 55%)`,
          }}
        />
        <span
          className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold shadow-sm"
          style={{ color: accent }}
        >
          Unidad {listIndex + 1}
        </span>
      </div>
      <div className="p-5 bg-gradient-to-br from-white to-slate-50">
        <h2 className="text-lg font-bold text-slate-900 leading-snug">{unidad.title}</h2>
        {unidad.description && (
          <p className="text-slate-600 text-sm mt-2 line-clamp-2">{unidad.description}</p>
        )}
        {showProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-600 mb-1">
              <span>Tu progreso</span>
              <span className="font-semibold text-slate-800">{progressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
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

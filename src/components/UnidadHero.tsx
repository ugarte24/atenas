import type { ReactNode } from 'react';
import type { Unidad } from '../types';
import { resolveAccentColor, resolveCoverImageUrl } from '../lib/unidadVisual';

type Props = {
  unidad: Unidad;
  /** Índice en lista (0-based) para fallback de imagen si no hay cover en BD */
  listIndex?: number;
  children?: ReactNode;
};

export function UnidadHero({ unidad, listIndex = 0, children }: Props) {
  const accent = resolveAccentColor(unidad.accent_color);
  const cover = resolveCoverImageUrl(unidad, listIndex);

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl mb-8 relative text-white">
      <div className="absolute inset-0" style={{ backgroundColor: accent }} />
      <img
        src={cover}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, transparent 70%)`,
        }}
      />
      <div className="relative p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow-sm">{unidad.title}</h1>
        {unidad.description && (
          <p className="mt-2 text-lg text-white/95 max-w-3xl drop-shadow-sm">{unidad.description}</p>
        )}
        {children}
      </div>
    </div>
  );
}

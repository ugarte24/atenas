import { Trophy } from 'lucide-react';
import { nivelDesdeXp } from '../../lib/gamificacion';

type Props = {
  open: boolean;
  xpTotal: number;
  xpGanado?: number;
  onClose: () => void;
};

export function LevelUpModal({ open, xpTotal, xpGanado = 200, onClose }: Props) {
  if (!open) return null;

  const nivel = nivelDesdeXp(xpTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-atenas-sidebar/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="level-up-title">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-atenas-sidebar to-[#001a40] text-white p-8 text-center shadow-elevated border border-white/10">
        <Trophy className="w-12 h-12 mx-auto text-atenas-gold mb-4" aria-hidden />
        <p className="text-sm uppercase tracking-widest text-blue-200 mb-2">¡Subiste de nivel!</p>
        <h2 id="level-up-title" className="text-4xl font-bold text-atenas-gold mb-1">
          Nivel {nivel.nivel}
        </h2>
        <p className="text-lg font-semibold mb-6">{nivel.nombre}</p>

        <ul className="space-y-2 text-sm text-left bg-white/10 rounded-2xl p-4 mb-6">
          <li className="flex justify-between">
            <span>XP ganado</span>
            <span className="font-bold text-atenas-gold">+{xpGanado}</span>
          </li>
          <li className="flex justify-between">
            <span>Nuevo logro</span>
            <span className="font-semibold">Explorador experto</span>
          </li>
        </ul>

        <button type="button" onClick={onClose} className="btn-atenas-gold w-full">
          Continuar
        </button>
      </div>
    </div>
  );
}

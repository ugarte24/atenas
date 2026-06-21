import { NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { cn } from './ui/cn';
import { useAuthContext } from '../contexts/AuthContext';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { nivelDesdeXp } from '../lib/gamificacion';
import { XpBar } from './gamification/XpBar';
import { AppVersionFootnote } from './AppVersionFootnote';
import { STUDENT_SIDEBAR_ITEMS } from '../constants/studentNav';

type Props = {
  onSignOut: () => void;
  className?: string;
};

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-touch',
    isActive
      ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/25 font-semibold'
      : 'hover:bg-white/12 hover:text-white'
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function StudentSidebar({ onSignOut, className }: Props) {
  const { profile } = useAuthContext();
  const { puntos, loading } = useGamificacionEstudiante();
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);
  const name = profile?.full_name ?? 'Estudiante';

  return (
    <aside
      className={cn(
        'atenas-sidebar-panel w-[15.5rem] shrink-0 flex flex-col h-full lg:h-dvh lg:max-h-dvh',
        className
      )}
      aria-label="Menú principal"
    >
      <div className="px-4 pt-6 pb-4 border-b border-white/15">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-atenas-gold/25 border border-atenas-gold/50 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo-athena.png" alt="" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <p className="font-atenas font-bold text-lg tracking-wide text-atenas-gold leading-none">
              ATENAS
            </p>
            <p className="text-[10px] sidebar-muted mt-0.5 uppercase tracking-wider font-medium">Estudiante</p>
          </div>
        </div>

        <div className="rounded-2xl bg-black/20 border border-white/20 p-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-atenas-gold border-2 border-amber-300 flex items-center justify-center text-sm font-bold text-atenas-ink shrink-0">
              {initials(name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              <p className="text-[11px] sidebar-muted font-medium">
                Nivel {loading ? '–' : nivel.nivel} · {loading ? '…' : nivel.nombre}
              </p>
            </div>
          </div>
          <XpBar
            value={nivel.progresoEnNivel}
            showValues
            xpCurrent={loading ? 0 : puntos}
            size="sm"
            variant="on-dark"
          />
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-nav-hide">
        {STUDENT_SIDEBAR_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="w-5 h-5 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 pt-2 border-t border-white/15 space-y-1">
        <button
          type="button"
          onClick={onSignOut}
          className="sidebar-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-red-500/25 hover:text-white transition-colors min-h-touch"
        >
          <LogOut className="w-5 h-5" aria-hidden />
          Cerrar sesión
        </button>
        <AppVersionFootnote />
      </div>
    </aside>
  );
}

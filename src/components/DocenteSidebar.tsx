import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Users, LogOut } from 'lucide-react';
import { cn } from './ui/cn';
import { AppVersionFootnote } from './AppVersionFootnote';

const ITEMS = [
  { to: '/docente', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/docente/contenidos', label: 'Contenidos', icon: FolderOpen, match: 'contenidos' as const },
  { to: '/docente/progreso', label: 'Estudiantes', icon: Users, end: true },
];

type Props = {
  onSignOut: () => void;
  className?: string;
};

function linkClass(isActive: boolean) {
  return cn(
    'sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-touch',
    isActive
      ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/25 font-semibold'
      : 'hover:bg-white/12 hover:text-white'
  );
}

export function DocenteSidebar({ onSignOut, className }: Props) {
  const location = useLocation();
  const inContenidos =
    location.pathname.includes('/docente/contenidos') ||
    location.pathname.includes('/docente/unidades') ||
    location.pathname.includes('/docente/temas');

  return (
    <aside
      className={cn(
        'atenas-sidebar-panel w-[15.5rem] shrink-0 flex flex-col h-full lg:h-dvh lg:max-h-dvh',
        className
      )}
      aria-label="Panel docente"
    >
      <div className="px-4 pt-6 pb-5 border-b border-white/15">
        <Link
          to="/docente"
          className="flex items-center gap-3 rounded-xl hover:bg-white/10 transition-colors -mx-1 px-1 py-0.5"
        >
          <div className="w-11 h-11 rounded-xl bg-atenas-gold/25 border border-atenas-gold/50 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo-athena.png" alt="" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <p className="font-atenas font-bold text-lg tracking-wide text-atenas-gold leading-none">
              ATENAS
            </p>
            <p className="text-[10px] sidebar-muted mt-0.5 uppercase tracking-wider font-medium">Docente</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {ITEMS.map((item) => {
          const isActive =
            item.match === 'contenidos'
              ? inContenidos
              : item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass(isActive)}>
              <item.icon className="w-5 h-5 shrink-0" aria-hidden />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-2 border-t border-white/15">
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

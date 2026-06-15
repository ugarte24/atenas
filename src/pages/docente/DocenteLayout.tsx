import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Users } from 'lucide-react';
import { cn } from '../../components/ui/cn';

const tabs = [
  { to: '/docente', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/docente/contenidos', label: 'Contenidos', icon: FolderOpen, match: 'contenidos' },
  { to: '/docente/progreso', label: 'Progreso', icon: Users, end: true },
];

export default function DocenteLayout() {
  const location = useLocation();
  const inContenidos =
    location.pathname.includes('/docente/contenidos') ||
    location.pathname.includes('/docente/unidades') ||
    location.pathname.includes('/docente/temas');

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      {/* Desktop sub-nav */}
      <nav
        className="hidden md:flex flex-wrap gap-2 border-b border-atenas-mist-border pb-4"
        aria-label="Navegación docente"
      >
        {tabs.map((tab) => {
          const isActive =
            tab.match === 'contenidos'
              ? inContenidos
              : tab.end
                ? location.pathname === tab.to
                : location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-colors',
                isActive
                  ? 'bg-atenas-ink text-white shadow-soft'
                  : 'text-atenas-muted hover:bg-atenas-mist hover:text-atenas-ink'
              )}
            >
              <tab.icon className="w-4 h-4" aria-hidden />
              {tab.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />

      {/* Mobile bottom tabs */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-md border-t border-atenas-mist-border pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Navegación docente"
      >
        <div className="flex justify-around py-1.5">
          {tabs.map((tab) => {
            const isActive =
              tab.match === 'contenidos'
                ? inContenidos
                : tab.end
                  ? location.pathname === tab.to
                  : location.pathname.startsWith(tab.to);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={cn(
                  'flex flex-col items-center gap-0.5 min-h-[52px] min-w-[4.5rem] justify-center rounded-xl px-2 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-atenas-ink' : 'text-atenas-muted'
                )}
              >
                <span
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    isActive && 'bg-atenas-gold/25 ring-1 ring-atenas-gold/40'
                  )}
                >
                  <tab.icon className="w-5 h-5" aria-hidden />
                </span>
                {tab.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

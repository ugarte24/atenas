import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Users } from 'lucide-react';
import { cn } from '../../components/ui/cn';

const tabs = [
  { to: '/docente', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/docente/contenidos', label: 'Contenidos', icon: FolderOpen, match: 'contenidos' },
  { to: '/docente/progreso', label: 'Estudiantes', icon: Users, end: true },
];

export default function DocenteLayout() {
  const location = useLocation();
  const inContenidos =
    location.pathname.includes('/docente/contenidos') ||
    location.pathname.includes('/docente/unidades') ||
    location.pathname.includes('/docente/temas');

  return (
    <div className="flex flex-col gap-6 pb-20 lg:pb-0">
      <Outlet />

      {/* Mobile bottom tabs */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-20 atenas-sidebar-panel border-t border-white/15 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
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
                  isActive ? 'text-atenas-gold' : 'text-white/85'
                )}
              >
                <span
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    isActive && 'bg-white/15 ring-1 ring-atenas-gold/50'
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

import { Link, useLocation } from 'react-router-dom';
import { STUDENT_BOTTOM_NAV_ITEMS } from '../constants/studentNav';
import { useMisionesDiarias } from '../hooks/useMisionesDiarias';
import { cn } from './ui/cn';

export function StudentBottomNav() {
  const location = useLocation();
  const { misiones: diarias } = useMisionesDiarias();
  const diariasPendientes = diarias.filter((d) => d.total > 0 && d.progreso < d.total).length;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden w-full"
      aria-label="Navegación principal"
    >
      <div className="bg-[var(--atenas-sidebar)] border-t border-white/15 shadow-[0_-4px_24px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex justify-around items-stretch px-1 pt-1.5 pb-1">
          {STUDENT_BOTTOM_NAV_ITEMS.map(({ id, to, label, icon: Icon, end }) => {
            const active = end
              ? location.pathname === '/'
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
            const showBadge = id === 'misiones' && diariasPendientes > 0;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[3rem] flex-1 max-w-[4.5rem] rounded-xl transition-colors py-1',
                  active ? 'text-atenas-gold' : 'text-white/85'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'relative flex items-center justify-center w-9 h-9 rounded-full transition-colors',
                    active && 'bg-white/15 ring-1 ring-atenas-gold/50'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
                  {showBadge && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 rounded-full bg-amber-400 text-[9px] font-bold text-amber-950 leading-4 text-center"
                      aria-label={`${diariasPendientes} misión${diariasPendientes === 1 ? '' : 'es'} diaria${diariasPendientes === 1 ? '' : 's'} pendiente${diariasPendientes === 1 ? '' : 's'}`}
                    >
                      {diariasPendientes}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

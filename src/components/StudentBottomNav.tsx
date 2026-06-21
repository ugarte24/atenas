import { Link, useLocation } from 'react-router-dom';
import { STUDENT_BOTTOM_NAV_ITEMS, isStudentBottomNavActive } from '../constants/studentNav';
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
        <div className="flex items-stretch px-0.5 pt-1 pb-1.5">
          {STUDENT_BOTTOM_NAV_ITEMS.map(({ id, to, label, mobileLabel, icon: Icon }) => {
            const active = isStudentBottomNavActive(id, location.pathname);
            const displayLabel = mobileLabel ?? label;
            const showBadge = id === 'misiones' && diariasPendientes > 0;

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-touch min-w-0 px-0.5 py-1 rounded-xl transition-colors',
                  active ? 'text-atenas-gold' : 'text-white/75 hover:text-white/95'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-atenas-gold"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all',
                    active
                      ? 'bg-white/18 ring-1 ring-atenas-gold/45 shadow-sm'
                      : 'bg-transparent'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.35 : 2} aria-hidden />
                  {showBadge && (
                    <span
                      className="absolute -top-0.5 -right-0.5 z-10 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold leading-none text-amber-950 ring-2 ring-[var(--atenas-sidebar)]"
                      aria-label={`${diariasPendientes} misión${diariasPendientes === 1 ? '' : 'es'} diaria${diariasPendientes === 1 ? '' : 's'} pendiente${diariasPendientes === 1 ? '' : 's'}`}
                    >
                      {diariasPendientes > 9 ? '9+' : diariasPendientes}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'text-[10px] leading-tight truncate max-w-full text-center',
                    active ? 'font-bold' : 'font-semibold'
                  )}
                >
                  {displayLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

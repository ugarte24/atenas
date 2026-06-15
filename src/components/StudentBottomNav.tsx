import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, TrendingUp, Trophy, User } from 'lucide-react';
import { cn } from './ui/cn';

type Item = {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
};

const ITEMS: Item[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/unidades', label: 'Contenidos', icon: BookOpen },
  { to: '/progreso', label: 'Progreso', icon: TrendingUp },
  { to: '/logros', label: 'Logros', icon: Trophy },
  { to: '/perfil', label: 'Perfil', icon: User },
];

export function StudentBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 md:hidden w-full"
      aria-label="Navegación principal"
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-atenas-mist-border shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex justify-around items-stretch px-1 pt-1.5 pb-1">
          {ITEMS.map(({ to, label, icon: Icon, end }) => {
            const active = end
              ? location.pathname === '/'
              : location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[3.25rem] flex-1 max-w-[5rem] rounded-xl transition-colors py-1',
                  active ? 'text-atenas-ink' : 'text-atenas-muted'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full transition-colors',
                    active && 'bg-atenas-gold/25 ring-1 ring-atenas-gold/50'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
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

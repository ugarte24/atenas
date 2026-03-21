import { Link, useLocation } from 'react-router-dom';

type BottomNavItemProps = {
  to: string;
  label: string;
  icon: string;
  /** Solo inicio: ruta exactamente `/` */
  end?: boolean;
};

function BottomNavItem({ to, label, icon, end }: BottomNavItemProps) {
  const location = useLocation();
  const active = end
    ? location.pathname === '/'
    : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-0.5 text-[11px] min-h-touch min-w-[3.5rem] justify-center rounded-xl transition-colors ${
        active ? 'text-atenas-ink' : 'text-atenas-muted'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
          active ? 'bg-atenas-gold/25 ring-1 ring-atenas-gold/40' : ''
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

/**
 * Navegación inferior fija (solo móvil) para el rol estudiante.
 * Debe mostrarse en todas las pantallas del alumno; el padding inferior del `<main>` lo compensa Layout.
 */
export function StudentBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 md:hidden w-full" aria-label="Navegación principal">
      <div className="w-full">
        <div className="w-full bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,0,0,0.06)] border-t border-atenas-mist-border flex justify-around py-2 px-0">
          <BottomNavItem to="/" label="Inicio" icon="🏠" end />
          <BottomNavItem to="/progreso" label="Progreso" icon="📈" />
          <BottomNavItem to="/logros" label="Logros" icon="🏆" />
          <BottomNavItem to="/perfil" label="Perfil" icon="👤" />
        </div>
      </div>
    </nav>
  );
}

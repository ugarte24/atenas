import { NavLink, Outlet, useLocation } from 'react-router-dom';

const baseNav =
  'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-touch inline-flex items-center justify-center';

export default function DocenteLayout() {
  const location = useLocation();
  const inContenidos =
    location.pathname.includes('/docente/contenidos') ||
    location.pathname.includes('/docente/unidades') ||
    location.pathname.includes('/docente/temas');

  return (
    <div className="flex flex-col gap-8">
      <nav
        className="flex flex-wrap gap-2 border-b border-atenas-mist-border pb-4 scrollbar-nav-hide overflow-x-auto -mx-1 px-1"
        aria-label="Navegación docente"
      >
        <NavLink
          to="/docente"
          end
          className={({ isActive }) =>
            `${baseNav} ${
              isActive
                ? 'bg-atenas-ink text-white shadow-sm'
                : 'text-atenas-muted hover:bg-atenas-mist hover:text-atenas-ink'
            }`
          }
        >
          Inicio
        </NavLink>
        <NavLink
          to="/docente/contenidos"
          className={() =>
            `${baseNav} ${
              inContenidos
                ? 'bg-atenas-ink text-white shadow-sm'
                : 'text-atenas-muted hover:bg-atenas-mist hover:text-atenas-ink'
            }`
          }
        >
          Contenidos
        </NavLink>
        <NavLink
          to="/docente/progreso"
          className={({ isActive }) =>
            `${baseNav} ${
              isActive
                ? 'bg-atenas-ink text-white shadow-sm'
                : 'text-atenas-muted hover:bg-atenas-mist hover:text-atenas-ink'
            }`
          }
        >
          Progreso de estudiantes
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

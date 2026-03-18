import { Link, Outlet, useLocation } from 'react-router-dom';

export default function DocenteLayout() {
  const location = useLocation();
  const inContenidos = location.pathname.includes('/docente/contenidos') || location.pathname.includes('/docente/unidades') || location.pathname.includes('/docente/temas');

  const navLink = (to: string, active: boolean, children: React.ReactNode) => (
    <Link
      to={to}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
      style={active ? { backgroundColor: '#003366' } : undefined}
    >
      {children}
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {navLink('/docente', location.pathname === '/docente', 'Inicio')}
        {navLink('/docente/contenidos', inContenidos, 'Contenidos')}
        {navLink('/docente/progreso', location.pathname === '/docente/progreso', 'Progreso de estudiantes')}
      </nav>
      <Outlet />
    </div>
  );
}

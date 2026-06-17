import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentBottomNav } from './StudentBottomNav';
import { StudentSidebar } from './StudentSidebar';
import { DocenteSidebar } from './DocenteSidebar';
import { AppDrawer, type DrawerLink } from './AppDrawer';
import { STUDENT_DRAWER_ITEMS } from '../constants/studentNav';
import { cn } from './ui/cn';

type Props = { children: React.ReactNode };

export function Layout({ children }: Props) {
  const { profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const esEstudiante = profile?.role === 'estudiante';
  const enDocente = location.pathname.startsWith('/docente');
  const enLeccion =
    location.pathname.startsWith('/temas/') ||
    location.pathname.startsWith('/actividades/') ||
    location.pathname.startsWith('/evaluaciones/');
  const esDocenteOAdmin =
    profile?.role === 'docente' || profile?.role === 'admin';
  const showDocenteSidebar = esDocenteOAdmin && enDocente;
  const showStudentSidebar = esEstudiante;

  const drawerLinks: DrawerLink[] = profile
    ? [
        ...(esEstudiante
          ? STUDENT_DRAWER_ITEMS.map(({ to, label, end }) => ({ to, label, end }))
          : []),
        ...(!esEstudiante ? [{ to: '/perfil', label: 'Mi perfil' }] : []),
        ...(esDocenteOAdmin ? [{ to: '/docente', label: 'Panel docente' }] : []),
        ...(profile.role === 'admin' ? [{ to: '/admin', label: 'Administración' }] : []),
      ]
    : [];

  return (
    <div className="min-h-screen flex bg-atenas-page">
      {showStudentSidebar && (
        <StudentSidebar onSignOut={handleSignOut} className="hidden lg:flex" />
      )}
      {showDocenteSidebar && (
        <DocenteSidebar onSignOut={handleSignOut} className="hidden lg:flex" />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Barra superior móvil / admin sin sidebar */}
        <header
          className={cn(
            'sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-atenas-mist-border shadow-soft pt-safe',
            (showStudentSidebar || showDocenteSidebar) && 'lg:hidden'
          )}
        >
          <div className="page-container py-3 flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {profile && (showStudentSidebar || showDocenteSidebar) && (
                <button
                  type="button"
                  className="flex lg:hidden items-center justify-center min-h-touch min-w-touch rounded-xl text-atenas-ink hover:bg-atenas-mist shrink-0"
                  aria-label="Abrir menú"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <Link
                to="/"
                className="flex items-center gap-2 min-h-touch shrink-0 rounded-lg hover:opacity-90 transition-opacity min-w-0"
              >
                <img src="/logo-athena.png" alt="" className="w-9 h-9 object-contain shrink-0 rounded-2xl" />
                <span className="font-atenas font-bold text-atenas-ink text-lg tracking-wide truncate">
                  ATENAS
                </span>
              </Link>
            </div>

            {profile && !showStudentSidebar && !showDocenteSidebar && (
              <button
                type="button"
                className="flex md:hidden items-center justify-center min-h-touch min-w-touch rounded-xl text-atenas-ink hover:bg-atenas-mist shrink-0"
                aria-label="Abrir menú"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {profile && !showStudentSidebar && !showDocenteSidebar && (
              <nav className="hidden md:flex items-center gap-2" aria-label="Principal">
                <Link
                  to="/perfil"
                  className="text-sm font-medium text-atenas-muted hover:text-atenas-ink px-3 py-2 rounded-xl"
                >
                  Perfil
                </Link>
                {profile.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-atenas-muted hover:text-atenas-ink px-3 py-2 rounded-xl"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-atenas-muted hover:text-red-700 px-3 py-2 rounded-xl"
                >
                  Salir
                </button>
              </nav>
            )}
            {profile && (
              <div className="text-right min-w-0 shrink">
                <p className="text-[11px] text-atenas-muted capitalize leading-tight truncate">
                  {new Date().toLocaleDateString('es', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                {esEstudiante && (
                  <p className="text-sm font-semibold text-atenas-ink truncate leading-tight mt-0.5">
                    {profile.full_name ?? 'Explorador'}
                  </p>
                )}
              </div>
            )}
          </div>
        </header>

        {profile && (
          <AppDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            links={drawerLinks}
            role={profile.role}
            onSignOut={handleSignOut}
          />
        )}

        <main
          className={cn(
            'flex-1 page-container py-5 sm:py-8',
            esEstudiante && 'pb-24 lg:pb-8',
            showDocenteSidebar && 'pb-24 lg:pb-8',
            enLeccion && esEstudiante && 'lesson-cream-bg max-w-none rounded-none'
          )}
        >
          {children}
        </main>

        {esEstudiante && <StudentBottomNav />}
      </div>
    </div>
  );
}

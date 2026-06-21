import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentBottomNav } from './StudentBottomNav';
import { StudentSidebar } from './StudentSidebar';
import { DocenteSidebar } from './DocenteSidebar';
import { AppDrawer, type DrawerLink } from './AppDrawer';
import { STUDENT_DRAWER_ITEMS } from '../constants/studentNav';
import { StudentMobileGamificationChip } from './gamification/StudentMobileGamificationChip';
import { MascotVisitorProvider } from '../contexts/MascotVisitorContext';
import { MascotVisitor } from './gamification/MascotVisitor';
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
  const esDocente = profile?.role === 'docente';
  const esDocenteOAdmin =
    profile?.role === 'docente' || profile?.role === 'admin';
  /** Docente: sidebar siempre; admin: solo dentro de /docente */
  const showDocenteSidebar = esDocente || (profile?.role === 'admin' && enDocente);
  const showStudentSidebar = esEstudiante;

  const homeTo =
    profile?.role === 'docente'
      ? '/docente'
      : profile?.role === 'admin'
        ? '/admin'
        : '/';

  const drawerLinks: DrawerLink[] = profile
    ? [
        ...(esEstudiante
          ? STUDENT_DRAWER_ITEMS.map(({ to, label, end, icon }) => ({ to, label, end, icon }))
          : []),
        ...(esDocenteOAdmin
          ? [
              {
                to: '/docente',
                label: profile.role === 'docente' ? 'Inicio' : 'Panel docente',
                end: true,
              },
            ]
          : []),
        ...(!esEstudiante ? [{ to: '/perfil', label: 'Mi perfil' }] : []),
        ...(profile.role === 'admin' ? [{ to: '/admin', label: 'Administración' }] : []),
      ]
    : [];

  const hasDesktopSidebar = showStudentSidebar || showDocenteSidebar;

  return (
    <div
      className={cn(
        'flex bg-atenas-page min-h-screen',
        hasDesktopSidebar && 'lg:h-dvh lg:min-h-0 lg:overflow-hidden'
      )}
    >
      {showStudentSidebar && (
        <StudentSidebar onSignOut={handleSignOut} className="hidden lg:flex" />
      )}
      {showDocenteSidebar && (
        <DocenteSidebar onSignOut={handleSignOut} className="hidden lg:flex" />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:min-h-0 lg:h-full lg:overflow-hidden">
        {esEstudiante ? (
          <MascotVisitorProvider>
            <LayoutMain
              profile={profile}
              esEstudiante={esEstudiante}
              enLeccion={enLeccion}
              showDocenteSidebar={showDocenteSidebar}
              showStudentSidebar={showStudentSidebar}
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              drawerLinks={drawerLinks}
              handleSignOut={handleSignOut}
              homeTo={homeTo}
            >
              {children}
            </LayoutMain>
            <MascotVisitor />
            <StudentBottomNav />
          </MascotVisitorProvider>
        ) : (
          <LayoutMain
            profile={profile}
            esEstudiante={esEstudiante}
            enLeccion={enLeccion}
            showDocenteSidebar={showDocenteSidebar}
            showStudentSidebar={showStudentSidebar}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            drawerLinks={drawerLinks}
            handleSignOut={handleSignOut}
            homeTo={homeTo}
          >
            {children}
          </LayoutMain>
        )}
      </div>
    </div>
  );
}

type LayoutMainProps = {
  children: React.ReactNode;
  profile: ReturnType<typeof useAuthContext>['profile'];
  esEstudiante: boolean;
  enLeccion: boolean;
  showDocenteSidebar: boolean;
  showStudentSidebar: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerLinks: DrawerLink[];
  handleSignOut: () => Promise<void>;
  homeTo: string;
};

function LayoutMain({
  children,
  profile,
  esEstudiante,
  enLeccion,
  showDocenteSidebar,
  showStudentSidebar,
  drawerOpen,
  setDrawerOpen,
  drawerLinks,
  handleSignOut,
  homeTo,
}: LayoutMainProps) {
  const isStaff = profile && !esEstudiante;
  const showMobileStaffMenu =
    profile &&
    (showStudentSidebar || showDocenteSidebar || profile.role === 'admin');
  const staffRoleLabel =
    profile?.role === 'docente'
      ? 'Docente'
      : profile?.role === 'admin'
        ? 'Administrador'
        : profile?.role;
  const staffDisplayName = profile?.full_name?.trim() || profile?.email || 'Usuario';
  const todayShortLabel = new Date().toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 lg:h-full lg:overflow-hidden">
        {/* Barra superior móvil / admin sin sidebar */}
        <header
          className={cn(
            'shrink-0 sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-atenas-mist-border shadow-soft pt-safe',
            (showStudentSidebar || showDocenteSidebar) && 'lg:hidden'
          )}
        >
          <div
            className={cn(
              'page-container py-3 min-w-0',
              esEstudiante && 'flex flex-col gap-2',
              isStaff && 'flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 min-w-0 w-full',
                esEstudiante && 'justify-between sm:justify-start sm:w-auto',
                isStaff && 'justify-between lg:w-auto lg:shrink-0'
              )}
            >
              {showMobileStaffMenu && (
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
                to={homeTo}
                className="flex items-center gap-2 min-h-touch shrink-0 rounded-lg hover:opacity-90 transition-opacity"
              >
                <img src="/logo-athena.png" alt="" className="w-9 h-9 object-contain shrink-0 rounded-2xl" />
                <span className="font-atenas font-bold text-atenas-ink text-lg tracking-wide">
                  ATENAS
                </span>
              </Link>
              {profile && esEstudiante && (
                <StudentMobileGamificationChip className="ml-auto sm:ml-0" />
              )}
              {isStaff && (
                <p className="text-xs text-atenas-muted capitalize leading-tight shrink-0 text-right ml-auto pl-2 lg:hidden">
                  {todayShortLabel}
                </p>
              )}
            </div>

            {profile && !showStudentSidebar && !showDocenteSidebar && (
              <nav className="hidden md:flex items-center gap-2 shrink-0" aria-label="Principal">
                {profile.role === 'docente' && (
                  <Link
                    to="/docente"
                    className="text-sm font-medium text-atenas-muted hover:text-atenas-ink px-3 py-2 rounded-xl"
                  >
                    Inicio
                  </Link>
                )}
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
            {profile && esEstudiante && (
              <div className="flex items-center justify-between gap-2 min-w-0 sm:justify-end sm:shrink">
                <p className="text-sm font-semibold text-atenas-ink truncate leading-tight min-w-0 flex-1 sm:flex-none">
                  {profile.full_name ?? 'Explorador'}
                </p>
                <p className="text-xs text-atenas-muted capitalize leading-tight shrink-0 tabular-nums">
                  {new Date().toLocaleDateString('es', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {isStaff && (
              <div className="flex flex-col gap-0.5 min-w-0 w-full lg:hidden">
                <p className="text-sm font-semibold text-atenas-ink truncate leading-tight">
                  {staffDisplayName}
                </p>
                <p className="text-xs text-atenas-muted capitalize leading-tight">
                  {staffRoleLabel}
                </p>
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
            profileName={profile.full_name ?? undefined}
            onSignOut={handleSignOut}
          />
        )}

        <main
          className={cn(
            'flex-1 min-h-0 page-container py-5 sm:py-8',
            'lg:overflow-y-auto lg:overscroll-y-contain',
            esEstudiante && 'pb-student-bottom-nav lg:pb-8',
            showDocenteSidebar && 'pb-24 lg:pb-8',
            enLeccion && esEstudiante && 'lesson-cream-bg max-w-none rounded-none'
          )}
        >
          {children}
        </main>
    </div>
  );
}

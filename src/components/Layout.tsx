import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentBottomNav } from './StudentBottomNav';
import { StudentSidebar } from './StudentSidebar';
import { DocenteSidebar } from './DocenteSidebar';
import { AdminSidebar } from './AdminSidebar';
import { AppDrawer, type DrawerLink } from './AppDrawer';
import { STUDENT_DRAWER_ITEMS } from '../constants/studentNav';
import {
  DOCENTE_ACCOUNT_NAV_ITEMS,
  DOCENTE_MAIN_NAV_ITEMS,
} from '../constants/docenteNav';
import { getAdminAccountNavItems, getAdminMainNavItems } from '../constants/adminNav';
import { Badge } from './ui/Badge';
import { MascotVisitorProvider } from '../contexts/MascotVisitorContext';
import { MascotVisitor } from './gamification/MascotVisitor';
import { cn } from './ui/cn';

type Props = { children: React.ReactNode };

const ROL_LABEL: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Administrador',
};

function profileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Nombre compacto: primer nombre, segundo abreviado y apellidos completos. Ej. «gustavo e. ugarte canaza». */
function profileShortName(fullName: string, email: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return email.split('@')[0] ?? 'Usuario';
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  if (parts.length === 3) return `${parts[0]} ${parts[1]} ${parts[2]}`;
  const segundoInicial = parts[1]![0]?.toLowerCase() ?? '';
  const apellidos = parts.slice(2).join(' ');
  return `${parts[0]} ${segundoInicial}. ${apellidos}`;
}

function roleBadgeTone(role: string): 'gold' | 'default' | 'success' {
  if (role === 'docente' || role === 'admin') return 'gold';
  return 'default';
}

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
  const enLeccion =
    location.pathname.startsWith('/temas/') ||
    location.pathname.startsWith('/actividades/') ||
    location.pathname.startsWith('/evaluaciones/');
  const esDocente = profile?.role === 'docente';
  /** Docente: sidebar docente; admin: sidebar unificado (mismo menú que drawer móvil) */
  const showDocenteSidebar = esDocente;
  const showAdminSidebar = profile?.role === 'admin';
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
        ...(profile.role === 'admin'
          ? [
              ...getAdminMainNavItems().map(({ to, label, end, icon, match }) => ({
                to,
                label,
                end,
                icon,
                match,
                section: 'main' as const,
              })),
              ...getAdminAccountNavItems().map(({ to, label, end, icon }) => ({
                to,
                label,
                end,
                icon,
                section: 'account' as const,
              })),
            ]
          : profile.role === 'docente'
          ? DOCENTE_MAIN_NAV_ITEMS.map(({ to, label, end, icon, match }) => ({
              to,
              label,
              end,
              icon,
              match,
              section: 'main' as const,
            }))
          : []),
        ...(profile.role === 'docente'
          ? DOCENTE_ACCOUNT_NAV_ITEMS.map(({ to, label, end, icon }) => ({
              to,
              label,
              end,
              icon,
              section: 'account' as const,
            }))
          : []),
      ]
    : [];

  const hasDesktopSidebar = showStudentSidebar || showDocenteSidebar || showAdminSidebar;

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
      {showAdminSidebar && (
        <AdminSidebar onSignOut={handleSignOut} className="hidden lg:flex" />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:min-h-0 lg:h-full lg:overflow-hidden">
        {esEstudiante ? (
          <MascotVisitorProvider>
            <LayoutMain
              profile={profile}
              esEstudiante={esEstudiante}
              enLeccion={enLeccion}
              showDocenteSidebar={showDocenteSidebar}
              showAdminSidebar={showAdminSidebar}
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
            showAdminSidebar={showAdminSidebar}
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
  showAdminSidebar: boolean;
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
  showAdminSidebar,
  showStudentSidebar,
  drawerOpen,
  setDrawerOpen,
  drawerLinks,
  handleSignOut,
  homeTo,
}: LayoutMainProps) {
  const hasDesktopSidebar = showStudentSidebar || showDocenteSidebar || showAdminSidebar;
  const showMobileMenu =
    profile &&
    (hasDesktopSidebar || profile.role === 'admin' || profile.role === 'docente');
  const roleLabel = profile ? (ROL_LABEL[profile.role] ?? profile.role) : '';
  const displayName = profile?.full_name?.trim() || profile?.email || 'Usuario';
  const headerName = profile
    ? profileShortName(profile.full_name?.trim() || '', profile.email || '')
    : 'Usuario';
  const todayShortLabel = new Date().toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 lg:h-full lg:overflow-hidden">
        <header
          className={cn(
            'shrink-0 sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-atenas-mist-border shadow-soft pt-safe',
            hasDesktopSidebar && 'lg:hidden'
          )}
        >
          {profile ? (
            <div className="page-container py-2.5 flex items-center gap-2 min-w-0">
              {showMobileMenu && (
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-center min-h-touch min-w-touch rounded-xl text-atenas-ink hover:bg-atenas-mist shrink-0',
                    hasDesktopSidebar && 'lg:hidden'
                  )}
                  aria-label="Abrir menú"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}

              <button
                type="button"
                className="flex items-center gap-2.5 min-w-0 flex-1 rounded-xl hover:bg-atenas-mist/70 active:bg-atenas-mist transition-colors py-1.5 px-1 -mx-1 text-left min-h-touch"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú de cuenta"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 shadow-sm',
                    esEstudiante
                      ? 'bg-atenas-gold text-atenas-ink border-2 border-amber-300'
                      : 'bg-atenas-sidebar text-white'
                  )}
                  aria-hidden
                >
                  {profileInitials(displayName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-semibold text-atenas-ink truncate leading-tight">
                      {headerName}
                    </p>
                    <Badge tone={roleBadgeTone(profile.role)} className="text-[10px] py-0 px-1.5 shrink-0">
                      {roleLabel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-atenas-muted capitalize leading-tight truncate">
                    {todayShortLabel}
                  </p>
                </div>
              </button>

              <Link
                to={homeTo}
                className="flex items-center justify-center min-h-touch min-w-touch rounded-xl hover:bg-atenas-mist shrink-0 transition-colors"
                aria-label="Inicio ATENAS"
              >
                <img src="/logo-athena.png" alt="" className="w-8 h-8 object-contain rounded-xl" />
              </Link>
            </div>
          ) : null}
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

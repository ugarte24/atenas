import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentBottomNav } from './StudentBottomNav';
import { AppDrawer, type DrawerLink } from './AppDrawer';
import { Badge } from './ui/Badge';
import { cn } from './ui/cn';

type Props = { children: React.ReactNode };

function navClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'text-sm font-medium rounded-xl px-3 py-2.5 min-h-touch flex items-center transition-colors whitespace-nowrap',
    isActive
      ? 'bg-atenas-mist text-atenas-ink font-semibold shadow-soft'
      : 'text-atenas-muted hover:text-atenas-ink hover:bg-atenas-mist/80'
  );
}

export function Layout({ children }: Props) {
  const { profile, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const esEstudiante = profile?.role === 'estudiante';

  const drawerLinks: DrawerLink[] = profile
    ? [
        ...(esEstudiante
          ? [
              { to: '/', label: 'Inicio', end: true },
              { to: '/unidades', label: 'Contenidos' },
              { to: '/progreso', label: 'Progreso' },
              { to: '/logros', label: 'Logros' },
            ]
          : []),
        { to: '/perfil', label: 'Mi perfil' },
        ...(profile.role === 'docente' || profile.role === 'admin'
          ? [{ to: '/docente', label: 'Panel docente' }]
          : []),
        ...(profile.role === 'admin' ? [{ to: '/admin', label: 'Administración' }] : []),
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-atenas-page">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-atenas-mist-border shadow-soft pt-safe">
        <div className="page-container py-3 flex items-center justify-between gap-3 min-w-0">
          <Link
            to="/"
            className="atenas-logo hover:opacity-90 focus:outline-none rounded-lg px-1.5 py-2 min-h-touch flex shrink-0 items-center transition-opacity"
          >
            ATENAS
          </Link>

          {profile && (
            <>
              {/* Desktop nav */}
              <nav
                className="hidden md:flex items-center justify-end gap-1 flex-1 min-w-0"
                aria-label="Principal"
              >
                <Badge tone="muted" className="capitalize mr-1 shrink-0 hidden lg:inline-flex">
                  {profile.role}
                </Badge>
                {esEstudiante && (
                  <>
                    <NavLink to="/unidades" className={navClassName}>
                      Contenidos
                    </NavLink>
                    <NavLink to="/progreso" className={navClassName}>
                      Progreso
                    </NavLink>
                    <NavLink to="/logros" className={navClassName}>
                      Logros
                    </NavLink>
                  </>
                )}
                <NavLink to="/perfil" className={navClassName}>
                  Perfil
                </NavLink>
                {(profile.role === 'docente' || profile.role === 'admin') && (
                  <NavLink to="/docente" className={navClassName}>
                    Docente
                  </NavLink>
                )}
                {profile.role === 'admin' && (
                  <NavLink to="/admin" className={navClassName}>
                    Admin
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-atenas-muted hover:text-red-700 hover:bg-red-50 rounded-xl px-3 py-2.5 min-h-touch transition-colors ml-1"
                >
                  Salir
                </button>
              </nav>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden flex items-center justify-center min-h-touch min-w-touch rounded-xl text-atenas-ink hover:bg-atenas-mist"
                aria-label="Abrir menú"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </>
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
          'flex-1 page-container py-6 sm:py-8',
          esEstudiante ? 'pb-24 md:pb-8' : 'pb-10 sm:pb-8'
        )}
      >
        {children}
      </main>
      {esEstudiante && <StudentBottomNav />}
    </div>
  );
}

import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { StudentBottomNav } from './StudentBottomNav';

type Props = { children: React.ReactNode };

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    'text-sm font-medium rounded-xl px-3 py-2.5 min-h-touch flex items-center transition-colors whitespace-nowrap shrink-0',
    isActive
      ? 'bg-atenas-mist text-atenas-ink font-semibold shadow-sm'
      : 'text-atenas-muted hover:text-atenas-ink hover:bg-slate-100',
  ].join(' ');
}

/** En móvil el estudiante usa la barra inferior; estos enlaces solo en md+ */
function navClassNameHeaderDesktopOnly({ isActive }: { isActive: boolean }) {
  return `${navClassName({ isActive })} hidden md:flex`;
}

export function Layout({ children }: Props) {
  const { profile, signOut } = useAuthContext();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const esEstudiante = profile?.role === 'estudiante';

  return (
    <div className="min-h-screen flex flex-col bg-atenas-page">
      <header className="bg-white border-b border-atenas-mist-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-row flex-nowrap items-center justify-between gap-2 sm:gap-4 min-w-0">
          <Link
            to="/"
            className="atenas-logo hover:opacity-90 focus:outline-none rounded-lg px-1.5 sm:px-2 py-2 min-h-touch flex shrink-0 items-center transition-opacity"
          >
            ATENAS
          </Link>
          {profile && (
            <nav
              className="flex items-center justify-end gap-1 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-nav-hide min-w-0 flex-1 pl-2"
              aria-label="Principal"
            >
              <span className="badge-role capitalize mr-0.5 shrink-0">{profile.role}</span>
              {esEstudiante && (
                <>
                  <NavLink to="/unidades" className={navClassNameHeaderDesktopOnly}>
                    Contenidos
                  </NavLink>
                  <NavLink to="/progreso" className={navClassNameHeaderDesktopOnly}>
                    Progreso
                  </NavLink>
                  <NavLink to="/logros" className={navClassNameHeaderDesktopOnly}>
                    Logros
                  </NavLink>
                </>
              )}
              <NavLink
                to="/perfil"
                className={esEstudiante ? navClassNameHeaderDesktopOnly : navClassName}
              >
                Mi perfil
              </NavLink>
              {(profile.role === 'docente' || profile.role === 'admin') && (
                <NavLink to="/docente" className={navClassName}>
                  Panel docente
                </NavLink>
              )}
              {profile.role === 'admin' && (
                <NavLink to="/admin" className={navClassName}>
                  Administración
                </NavLink>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-atenas-muted hover:text-red-700 hover:bg-red-50 rounded-xl px-3 py-2.5 min-h-touch transition-colors shrink-0"
                aria-label="Cerrar sesión"
              >
                Salir
              </button>
            </nav>
          )}
        </div>
      </header>
      <main
        className={
          esEstudiante
            ? 'flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8'
            : 'flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 pb-10 sm:pb-8'
        }
      >
        {children}
      </main>
      {esEstudiante && <StudentBottomNav />}
    </div>
  );
}

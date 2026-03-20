import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

type Props = { children: React.ReactNode };

export function Layout({ children }: Props) {
  const { profile, signOut } = useAuthContext();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-atenas-page">
      <header className="bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="atenas-logo hover:opacity-90 focus:outline-none rounded-lg px-1.5 sm:px-2 py-2 min-h-touch flex shrink-0 items-center transition-opacity"
          >
            ATENAS
          </Link>
          <span className="text-slate-600 text-sm hidden sm:inline">Ciencias Sociales · 6.º Primaria</span>
          <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {profile && (
              <>
                <span className="badge-role capitalize mr-1">
                  {profile.role}
                </span>
                <Link
                  to="/perfil"
                  className="text-sm font-medium text-slate-600 hover:text-atenas-blue hover:bg-slate-100 rounded-lg px-3 py-2.5 min-h-touch flex items-center transition-colors"
                >
                  Mi perfil
                </Link>
                {(profile.role === 'docente' || profile.role === 'admin') && (
                  <Link
                    to="/docente"
                    className="text-sm font-medium text-slate-600 hover:text-atenas-blue hover:bg-slate-100 rounded-lg px-3 py-2.5 min-h-touch flex items-center transition-colors"
                  >
                    Panel docente
                  </Link>
                )}
                {profile.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-slate-600 hover:text-atenas-blue hover:bg-slate-100 rounded-lg px-3 py-2.5 min-h-touch flex items-center transition-colors"
                  >
                    Administración
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2.5 min-h-touch transition-colors"
                  aria-label="Cerrar sesión"
                >
                  Salir
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

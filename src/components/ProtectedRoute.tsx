import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { ClassicalBackdrop } from './ClassicalBackdrop';
import type { UserRole } from '../types';

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="relative isolate min-h-screen min-h-[100dvh] overflow-hidden flex flex-col items-center justify-center gap-4 px-4">
        <ClassicalBackdrop />
        <div className="relative z-10 card p-8 text-center max-w-sm shadow-lg">
          <h1 className="atenas-logo">ATENAS</h1>
          <p className="atenas-subtitle mt-1">Ciencias Sociales · 6.º Primaria</p>
          <p className="text-slate-500 text-sm mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

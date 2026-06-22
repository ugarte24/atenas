import {
  FolderOpen,
  LayoutDashboard,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type DocenteNavItem = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Activo en contenidos, unidades y temas */
  match?: 'contenidos';
};

export const DOCENTE_MAIN_NAV_ITEMS: DocenteNavItem[] = [
  { id: 'inicio', to: '/docente', label: 'Inicio', icon: LayoutDashboard, end: true },
  { id: 'contenidos', to: '/docente/contenidos', label: 'Contenidos', icon: FolderOpen, match: 'contenidos' },
  { id: 'progreso', to: '/docente/progreso', label: 'Estudiantes', icon: Users, end: true },
  { id: 'logros', to: '/docente/logros', label: 'Logros', icon: Trophy, end: true },
];

export const DOCENTE_ACCOUNT_NAV_ITEMS: DocenteNavItem[] = [
  { id: 'perfil', to: '/perfil', label: 'Mi perfil', icon: User, end: true },
];

export function isDocenteNavActive(item: DocenteNavItem, pathname: string): boolean {
  if (item.match === 'contenidos') {
    return (
      pathname.includes('/docente/contenidos') ||
      pathname.includes('/docente/unidades') ||
      pathname.includes('/docente/temas') ||
      pathname.includes('/docente/recursos') ||
      pathname.includes('/docente/actividades') ||
      pathname.includes('/docente/evaluaciones')
    );
  }
  if (item.end) return pathname === item.to;
  return pathname.startsWith(item.to);
}

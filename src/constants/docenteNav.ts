import {
  FolderOpen,
  LayoutDashboard,
  Map as MapIcon,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type DocenteNavSection = 'pedagogia' | 'preview' | 'plataforma';

export type DocenteNavItem = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Activo en contenidos, unidades y temas */
  match?: 'contenidos' | 'vista-alumno';
  navSection?: DocenteNavSection;
};

export const DOCENTE_MAIN_NAV_ITEMS: DocenteNavItem[] = [
  {
    id: 'inicio',
    to: '/docente',
    label: 'Inicio',
    icon: LayoutDashboard,
    end: true,
    navSection: 'pedagogia',
  },
  {
    id: 'contenidos',
    to: '/docente/contenidos',
    label: 'Contenidos',
    icon: FolderOpen,
    match: 'contenidos',
    navSection: 'pedagogia',
  },
  {
    id: 'progreso',
    to: '/docente/progreso',
    label: 'Estudiantes',
    icon: Users,
    end: true,
    navSection: 'pedagogia',
  },
  {
    id: 'logros',
    to: '/docente/logros',
    label: 'Logros',
    icon: Trophy,
    end: true,
    navSection: 'pedagogia',
  },
  {
    id: 'vista-alumno',
    to: '/unidades?view=map',
    label: 'Vista previa alumno',
    icon: MapIcon,
    match: 'vista-alumno',
    navSection: 'preview',
  },
];

export const DOCENTE_ACCOUNT_NAV_ITEMS: DocenteNavItem[] = [
  { id: 'perfil', to: '/perfil', label: 'Mi perfil', icon: User, end: true },
];

export const DOCENTE_NAV_SECTION_LABELS: Record<DocenteNavSection, string> = {
  pedagogia: 'Gestión pedagógica',
  preview: 'Vista alumno',
  plataforma: 'Plataforma',
};

export function isDocenteNavActive(item: DocenteNavItem, pathname: string): boolean {
  if (item.match === 'contenidos') {
    return (
      pathname.includes('/docente/contenidos') ||
      pathname.includes('/docente/unidades') ||
      pathname.includes('/docente/temas')
    );
  }
  if (item.match === 'vista-alumno') {
    return (
      pathname === '/unidades' ||
      pathname.startsWith('/unidades/') ||
      pathname.startsWith('/temas/') ||
      pathname.startsWith('/actividades/') ||
      pathname.startsWith('/evaluaciones/')
    );
  }
  if (item.end) return pathname === item.to;
  return pathname.startsWith(item.to);
}

export function groupDocenteNavItems(items: DocenteNavItem[]): { section: DocenteNavSection; items: DocenteNavItem[] }[] {
  const order: DocenteNavSection[] = ['pedagogia', 'preview', 'plataforma'];
  const groups = new Map<DocenteNavSection, DocenteNavItem[]>();
  for (const item of items) {
    const key = item.navSection ?? 'pedagogia';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return order
    .filter((s) => groups.has(s))
    .map((section) => ({ section, items: groups.get(section)! }));
}

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  BookOpen,
  Target,
  TrendingUp,
  Trophy,
  Award,
  User,
  Radio,
} from 'lucide-react';

export type StudentNavItem = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Visible en bottom nav móvil (máx. 5) */
  mobilePrimary?: boolean;
  /** Tarjetas rápidas en Home */
  homeQuickLink?: boolean;
  homeQuickLinkColor?: string;
  homeQuickLinkLabel?: string;
  /** Badge «Próximamente» en Home */
  comingSoon?: boolean;
};

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { id: 'inicio', to: '/', label: 'Inicio', icon: Home, end: true, mobilePrimary: true, homeQuickLink: false },
  { id: 'unidades', to: '/unidades', label: 'Unidades', icon: BookOpen, mobilePrimary: true, homeQuickLink: true, homeQuickLinkColor: 'from-sky-500 to-blue-600', homeQuickLinkLabel: 'Mis Unidades' },
  { id: 'misiones', to: '/misiones', label: 'Misiones', icon: Target, mobilePrimary: true, homeQuickLink: true, homeQuickLinkColor: 'from-orange-400 to-amber-500' },
  { id: 'progreso', to: '/progreso', label: 'Progreso', icon: TrendingUp, mobilePrimary: true, homeQuickLink: true, homeQuickLinkColor: 'from-emerald-500 to-teal-600', homeQuickLinkLabel: 'Mi Progreso' },
  { id: 'logros', to: '/logros', label: 'Logros', icon: Trophy, homeQuickLink: true, homeQuickLinkColor: 'from-violet-500 to-purple-600' },
  { id: 'certificados', to: '/certificados', label: 'Certificados', icon: Award, homeQuickLink: true, homeQuickLinkColor: 'from-amber-400 to-yellow-500' },
  { id: 'perfil', to: '/perfil', label: 'Perfil', icon: User, mobilePrimary: true },
  {
    id: 'aula-en-vivo',
    to: '/aula-en-vivo',
    label: 'Aula en vivo',
    icon: Radio,
    homeQuickLink: true,
    homeQuickLinkColor: 'from-red-500 to-rose-600',
  },
];

export const STUDENT_BOTTOM_NAV_ITEMS = STUDENT_NAV_ITEMS.filter((i) => i.mobilePrimary);

export const STUDENT_SIDEBAR_ITEMS = STUDENT_NAV_ITEMS.filter(
  (i) => i.id !== 'aula-en-vivo'
);

export const STUDENT_DRAWER_ITEMS = STUDENT_SIDEBAR_ITEMS;

/** Atajos en Home: solo rutas que no están en la bottom nav móvil. */
export const STUDENT_HOME_QUICK_LINKS = STUDENT_NAV_ITEMS.filter(
  (i) => i.homeQuickLink && !i.mobilePrimary
);

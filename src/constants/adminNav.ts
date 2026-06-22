import { Shield } from 'lucide-react';
import {
  DOCENTE_ACCOUNT_NAV_ITEMS,
  DOCENTE_MAIN_NAV_ITEMS,
  isDocenteNavActive,
  type DocenteNavItem,
} from './docenteNav';

/** Navegación principal admin: gestión pedagógica + vista alumno + plataforma. */
export function getAdminMainNavItems(): DocenteNavItem[] {
  const pedagogia = DOCENTE_MAIN_NAV_ITEMS.filter((item) => item.navSection !== 'preview').map(
    (item) => (item.id === 'inicio' ? { ...item, label: 'Resumen' } : item)
  );
  const preview = DOCENTE_MAIN_NAV_ITEMS.filter((item) => item.navSection === 'preview');
  return [
    ...pedagogia,
    ...preview,
    {
      id: 'admin',
      to: '/admin',
      label: 'Administración',
      icon: Shield,
      end: true,
      navSection: 'plataforma',
    },
  ];
}

export function getAdminAccountNavItems(): DocenteNavItem[] {
  return DOCENTE_ACCOUNT_NAV_ITEMS;
}

export { isDocenteNavActive };

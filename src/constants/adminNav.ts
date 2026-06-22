import { Shield } from 'lucide-react';
import {
  DOCENTE_ACCOUNT_NAV_ITEMS,
  DOCENTE_MAIN_NAV_ITEMS,
  isDocenteNavActive,
  type DocenteNavItem,
} from './docenteNav';

/** Navegación principal admin = panel docente + administración (sin duplicar en Cuenta). */
export function getAdminMainNavItems(): DocenteNavItem[] {
  const docente = DOCENTE_MAIN_NAV_ITEMS.map((item) =>
    item.id === 'inicio' ? { ...item, label: 'Panel docente' } : item
  );
  return [
    ...docente,
    { id: 'admin', to: '/admin', label: 'Administración', icon: Shield, end: true },
  ];
}

/** Cuenta admin: solo perfil (Administración va en el menú principal). */
export function getAdminAccountNavItems(): DocenteNavItem[] {
  return DOCENTE_ACCOUNT_NAV_ITEMS;
}

export { isDocenteNavActive };

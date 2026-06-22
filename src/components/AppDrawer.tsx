import { useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, LogOut, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { cn } from './ui/cn';
import { AppVersionFootnote } from './AppVersionFootnote';
import { XpBar } from './gamification/XpBar';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { nivelDesdeXp } from '../lib/gamificacion';
import { isDocenteNavActive, type DocenteNavItem } from '../constants/docenteNav';
import {
  DOCENTE_NAV_SECTION_LABELS,
  groupDocenteNavItems,
  type DocenteNavSection,
} from '../constants/docenteNav';
import { STUDENT_BOTTOM_NAV_ITEMS } from '../constants/studentNav';

export type DrawerLink = {
  to: string;
  label: string;
  end?: boolean;
  icon?: LucideIcon;
  match?: DocenteNavItem['match'];
  navSection?: DocenteNavSection;
  section?: 'main' | 'account';
};

type Props = {
  open: boolean;
  onClose: () => void;
  links: DrawerLink[];
  role: string;
  profileName?: string;
  onSignOut: () => void;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const ROL_LABEL: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  admin: 'Administrador',
};

function sidebarLinkClass(isActive: boolean) {
  return cn(
    'sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-touch',
    isActive
      ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/25 font-semibold'
      : 'hover:bg-white/12 hover:text-white text-white/90'
  );
}

function isDrawerLinkActive(link: DrawerLink, pathname: string, navIsActive: boolean): boolean {
  if (link.match === 'contenidos') {
    return isDocenteNavActive(
      { id: 'contenidos', to: link.to, label: link.label, icon: LayoutDashboard, match: 'contenidos' },
      pathname
    );
  }
  if (link.match === 'vista-alumno') {
    return isDocenteNavActive(
      { id: 'vista-alumno', to: link.to, label: link.label, icon: LayoutDashboard, match: 'vista-alumno' },
      pathname
    );
  }
  return navIsActive;
}

export function AppDrawer({ open, onClose, links, role, profileName, onSignOut }: Props) {
  const location = useLocation();
  const esEstudiante = role === 'estudiante';
  const esStaff = role === 'docente' || role === 'admin';
  const { puntos, loading: loadingGam } = useGamificacionEstudiante();
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);
  const displayName = profileName?.trim() || ROL_LABEL[role] || 'Usuario';
  const bottomNavPaths = useMemo(
    () => new Set(STUDENT_BOTTOM_NAV_ITEMS.map((i) => i.to)),
    []
  );

  const { primaryLinks, extraLinks, mainStaffLinks, accountStaffLinks } = useMemo(() => {
    if (esStaff) {
      const mainStaffLinks = links.filter((l) => l.section === 'main');
      const accountStaffLinks = links.filter((l) => l.section === 'account');
      return { primaryLinks: [], extraLinks: [], mainStaffLinks, accountStaffLinks };
    }
    const primary: DrawerLink[] = [];
    const extra: DrawerLink[] = [];
    for (const link of links) {
      if (bottomNavPaths.has(link.to)) primary.push(link);
      else extra.push(link);
    }
    return { primaryLinks: primary, extraLinks: extra, mainStaffLinks: [], accountStaffLinks: [] };
  }, [links, esStaff, bottomNavPaths]);

  const staffNavGroups = useMemo(() => {
    if (!esStaff || mainStaffLinks.length === 0) return [];
    return groupDocenteNavItems(
      mainStaffLinks.map((l) => ({
        id: l.to + l.label,
        to: l.to,
        label: l.label,
        icon: l.icon ?? LayoutDashboard,
        end: l.end,
        match: l.match,
        navSection: l.navSection ?? 'pedagogia',
      }))
    );
  }, [esStaff, mainStaffLinks]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function renderSidebarNavLink(link: DrawerLink) {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to + link.label}
        to={link.to}
        end={link.end}
        onClick={onClose}
        className={({ isActive }) =>
          sidebarLinkClass(isDrawerLinkActive(link, location.pathname, isActive))
        }
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" aria-hidden />}
        {link.label}
      </NavLink>
    );
  }

  function renderDrawerHeader(showProfile: boolean) {
    return (
      <div className="px-4 pt-5 pb-4 border-b border-white/15">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-atenas-gold/25 border border-atenas-gold/50 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo-athena.png" alt="" className="w-9 h-9 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="font-atenas font-bold text-lg tracking-wide text-atenas-gold leading-none">
                ATENAS
              </p>
              <p className="text-[10px] sidebar-muted mt-0.5 uppercase tracking-wider font-medium">
                {ROL_LABEL[role] ?? role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl sidebar-muted hover:bg-white/10 hover:text-white min-h-touch min-w-touch flex items-center justify-center shrink-0 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showProfile && (
          <div className="rounded-2xl bg-black/20 border border-white/20 p-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2',
                  esEstudiante
                    ? 'bg-atenas-gold border-amber-300 text-atenas-ink'
                    : 'bg-white/15 border-white/30 text-white'
                )}
              >
                {initials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                {esEstudiante ? (
                  <p className="text-[11px] sidebar-muted font-medium">
                    Nivel {loadingGam ? '–' : nivel.nivel} · {loadingGam ? '…' : nivel.nombre}
                  </p>
                ) : (
                  <p className="text-[11px] sidebar-muted font-medium">{ROL_LABEL[role] ?? role}</p>
                )}
              </div>
            </div>
            {esEstudiante && (
              <div className="mt-3">
                <XpBar
                  value={nivel.progresoEnNivel}
                  showValues
                  xpCurrent={loadingGam ? 0 : puntos}
                  size="sm"
                  variant="on-dark"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderDrawerFooter() {
    return (
      <div className="px-3 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] border-t border-white/15 space-y-1 shrink-0">
        <button
          type="button"
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="sidebar-link flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-red-500/25 hover:text-white transition-colors min-h-touch"
        >
          <LogOut className="w-5 h-5" aria-hidden />
          Cerrar sesión
        </button>
        <AppVersionFootnote />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Menú">
      <button
        type="button"
        className="absolute inset-0 bg-atenas-ink/50 backdrop-blur-sm"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside className="absolute top-0 left-0 h-full w-[min(100%,20rem)] shadow-elevated flex flex-col pt-safe pb-safe border-r atenas-sidebar-panel border-white/10">
        {renderDrawerHeader(true)}

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-nav-hide" aria-label="Menú principal">
          {esStaff ? (
            <>
              {staffNavGroups.map(({ section, items }) => (
                <div key={section}>
                  <p className="px-3 pt-3 first:pt-0 pb-1 text-[10px] font-bold uppercase tracking-wider sidebar-muted">
                    {DOCENTE_NAV_SECTION_LABELS[section]}
                  </p>
                  {items.map((item) =>
                    renderSidebarNavLink({
                      to: item.to,
                      label: item.label,
                      end: item.end,
                      icon: item.icon,
                      match: item.match,
                      navSection: item.navSection,
                      section: 'main',
                    })
                  )}
                </div>
              ))}
              {accountStaffLinks.length > 0 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider sidebar-muted">
                    Cuenta
                  </p>
                  {accountStaffLinks.map((link) => renderSidebarNavLink(link))}
                </>
              )}
            </>
          ) : (
            <>
              {primaryLinks.map((link) => renderSidebarNavLink(link))}
              {extraLinks.length > 0 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider sidebar-muted">
                    Más
                  </p>
                  {extraLinks.map((link) => renderSidebarNavLink(link))}
                </>
              )}
            </>
          )}
        </nav>

        {renderDrawerFooter()}
      </aside>
    </div>
  );
}

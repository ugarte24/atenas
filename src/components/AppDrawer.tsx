import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut, type LucideIcon } from 'lucide-react';
import { cn } from './ui/cn';
import { Badge } from './ui/Badge';
import { AppVersionFootnote } from './AppVersionFootnote';
import { XpBar } from './gamification/XpBar';
import { useGamificacionEstudiante } from '../hooks/useGamificacionEstudiante';
import { nivelDesdeXp } from '../lib/gamificacion';
import { STUDENT_BOTTOM_NAV_ITEMS } from '../constants/studentNav';

export type DrawerLink = {
  to: string;
  label: string;
  end?: boolean;
  icon?: LucideIcon;
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

function drawerLinkClass(isActive: boolean) {
  return cn(
    'drawer-nav-link gap-3',
    isActive ? 'drawer-nav-link--active' : 'drawer-nav-link--inactive'
  );
}

export function AppDrawer({ open, onClose, links, role, profileName, onSignOut }: Props) {
  const esEstudiante = role === 'estudiante';
  const { puntos, loading: loadingGam } = useGamificacionEstudiante();
  const nivel = useMemo(() => nivelDesdeXp(puntos), [puntos]);
  const displayName = profileName?.trim() || 'Estudiante';
  const bottomNavPaths = useMemo(
    () => new Set(STUDENT_BOTTOM_NAV_ITEMS.map((i) => i.to)),
    []
  );

  const { primaryLinks, extraLinks } = useMemo(() => {
    if (!esEstudiante) return { primaryLinks: links, extraLinks: [] as DrawerLink[] };
    const primary: DrawerLink[] = [];
    const extra: DrawerLink[] = [];
    for (const link of links) {
      if (bottomNavPaths.has(link.to)) primary.push(link);
      else extra.push(link);
    }
    return { primaryLinks: primary, extraLinks: extra };
  }, [links, esEstudiante, bottomNavPaths]);

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

  function renderNavLink(link: DrawerLink, variant: 'student' | 'default') {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to + link.label}
        to={link.to}
        end={link.end}
        onClick={onClose}
        className={({ isActive }) =>
          variant === 'student' ? sidebarLinkClass(isActive) : drawerLinkClass(isActive)
        }
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" aria-hidden />}
        {link.label}
      </NavLink>
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
      <aside
        className={cn(
          'absolute top-0 left-0 h-full w-[min(100%,20rem)] shadow-elevated flex flex-col pt-safe pb-safe border-r',
          esEstudiante
            ? 'atenas-sidebar-panel border-white/10'
            : 'bg-white border-atenas-mist-border'
        )}
      >
        {esEstudiante ? (
          <>
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

              <div className="rounded-2xl bg-black/20 border border-white/20 p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-atenas-gold border-2 border-amber-300 flex items-center justify-center text-sm font-bold text-atenas-ink shrink-0">
                    {initials(displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-[11px] sidebar-muted font-medium">
                      Nivel {loadingGam ? '–' : nivel.nivel} · {loadingGam ? '…' : nivel.nombre}
                    </p>
                  </div>
                </div>
                <XpBar
                  value={nivel.progresoEnNivel}
                  showValues
                  xpCurrent={loadingGam ? 0 : puntos}
                  size="sm"
                  variant="on-dark"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-nav-hide" aria-label="Menú principal">
              {primaryLinks.map((link) => renderNavLink(link, 'student'))}
              {extraLinks.length > 0 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider sidebar-muted">
                    Más
                  </p>
                  {extraLinks.map((link) => renderNavLink(link, 'student'))}
                </>
              )}
            </nav>

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
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-atenas-mist-border">
              <Badge tone="gold" className="capitalize">
                {ROL_LABEL[role] ?? role}
              </Badge>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-atenas-muted hover:bg-atenas-mist min-h-touch min-w-touch flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Menú principal">
              {links.map((link) => renderNavLink(link, 'default'))}
            </nav>
            <div className="p-4 border-t border-atenas-mist-border">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="flex w-full items-center justify-center gap-2 min-h-touch rounded-xl text-red-700 font-medium hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" aria-hidden />
                Cerrar sesión
              </button>
              <AppVersionFootnote variant="on-light" className="pb-0" />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

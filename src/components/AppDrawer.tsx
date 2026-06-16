import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { cn } from './ui/cn';
import { Badge } from './ui/Badge';
import { AppVersionFootnote } from './AppVersionFootnote';

export type DrawerLink = {
  to: string;
  label: string;
  end?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  links: DrawerLink[];
  role: string;
  onSignOut: () => void;
};

export function AppDrawer({ open, onClose, links, role, onSignOut }: Props) {
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

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menú">
      <button
        type="button"
        className="absolute inset-0 bg-atenas-ink/40 backdrop-blur-sm"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside className="absolute top-0 left-0 h-full w-[min(100%,20rem)] bg-white shadow-elevated flex flex-col pt-safe pb-safe border-r border-atenas-mist-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-atenas-mist-border">
          <Badge tone="gold" className="capitalize">
            {role}
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
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'drawer-nav-link',
                  isActive ? 'drawer-nav-link--active' : 'drawer-nav-link--inactive'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
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
      </aside>
    </div>
  );
}

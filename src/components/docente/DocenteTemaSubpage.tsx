import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { SkeletonLines } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../ui/cn';

type BreadcrumbItem = { label: string; to?: string };

type ShellProps = {
  unidadId: string;
  temaTitle: string;
  sectionLabel: string;
  sectionDescription: string;
  icon: ReactNode;
  primaryAction?: ReactNode;
  stats?: ReactNode;
  toolbar?: ReactNode;
  loading?: boolean;
  empty?: { title: string; description: string; icon: ReactNode; action?: ReactNode };
  footer?: ReactNode;
  children: ReactNode;
};

export function DocenteTemaSubpageShell({
  unidadId,
  temaTitle,
  sectionLabel,
  sectionDescription,
  icon,
  primaryAction,
  stats,
  toolbar,
  loading,
  empty,
  footer,
  children,
}: ShellProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Contenidos', to: '/docente/contenidos' },
    { label: 'Temas', to: `/docente/unidades/${unidadId}` },
    { label: sectionLabel },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20 lg:pb-0">
      <Link
        to={`/docente/unidades/${unidadId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-atenas-muted hover:text-atenas-ink min-h-touch w-fit rounded-lg px-2 -ml-2 hover:bg-atenas-mist transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
        Volver a temas
      </Link>

      <PageHeader
        breadcrumbs={breadcrumbs}
        title={temaTitle}
        description={sectionDescription}
        icon={icon}
        actions={primaryAction}
      />

      {stats}

      {toolbar}

      {loading ? (
        <SkeletonLines lines={5} />
      ) : empty ? (
        <EmptyState
          title={empty.title}
          description={empty.description}
          icon={empty.icon}
          action={empty.action}
        />
      ) : (
        children
      )}

      {footer}
    </div>
  );
}

type ToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterAriaLabel: string;
  filterOptions: { value: string; label: string }[];
};

export function DocenteListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  filterValue,
  onFilterChange,
  filterAriaLabel,
  filterOptions,
}: ToolbarProps) {
  return (
    <Card padding="md" className="flex flex-col sm:flex-row gap-3">
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchAriaLabel}
        className="flex-1"
      />
      <Select
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        aria-label={filterAriaLabel}
        className="sm:max-w-[220px]"
      >
        {filterOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Card>
  );
}

export type GestionItemAction = {
  key: string;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  tone?: 'default' | 'success' | 'violet' | 'danger' | 'muted';
  icon?: ReactNode;
};

type OrderProps = {
  disabled?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUp: () => void;
  onDown: () => void;
};

type GestionItemCardProps = {
  title: string;
  subtitle?: string;
  chips?: ReactNode;
  order?: OrderProps;
  published?: { value: boolean; onToggle: () => void };
  actions: GestionItemAction[];
};

const actionToneClass: Record<NonNullable<GestionItemAction['tone']>, string> = {
  default: 'text-atenas-ink hover:bg-atenas-mist border-atenas-mist-border',
  success: 'text-emerald-800 hover:bg-emerald-50 border-emerald-200/80',
  violet: 'text-violet-800 hover:bg-violet-50 border-violet-200/80',
  danger: 'text-red-700 hover:bg-red-50 border-red-200/80',
  muted: 'text-atenas-muted hover:bg-atenas-page border-atenas-mist-border',
};

export function DocenteGestionItemCard({
  title,
  subtitle,
  chips,
  order,
  published,
  actions,
}: GestionItemCardProps) {
  return (
    <Card padding="md" hover className="flex flex-col gap-4">
      <div className="flex items-start gap-3 min-w-0">
        {order && (
          <div className="flex flex-col gap-1 shrink-0" aria-label="Orden en el tema">
            <button
              type="button"
              disabled={order.disabled || !order.canMoveUp}
              onClick={order.onUp}
              className="table-action-btn disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Subir"
            >
              <ChevronUp aria-hidden />
            </button>
            <button
              type="button"
              disabled={order.disabled || !order.canMoveDown}
              onClick={order.onDown}
              className="table-action-btn disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Bajar"
            >
              <ChevronDown aria-hidden />
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-bold text-atenas-ink leading-snug break-words">{title}</h3>
            {published && (
              <button type="button" onClick={published.onToggle} className="shrink-0">
                <Badge tone={published.value ? 'success' : 'muted'}>
                  {published.value ? 'Publicada' : 'Borrador'}
                </Badge>
              </button>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-atenas-muted mt-1.5 leading-relaxed">{subtitle}</p>
          )}
          {chips && <div className="flex flex-wrap gap-2 mt-2.5">{chips}</div>}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-atenas-mist-border">
          {actions.map((action) => {
            const className = cn(
              'inline-flex items-center gap-1.5 text-sm font-medium min-h-touch px-3 rounded-xl border transition-colors',
              actionToneClass[action.tone ?? 'default']
            );
            const content = (
              <>
                {action.icon}
                {action.label}
              </>
            );

            if (action.href) {
              return (
                <Link
                  key={action.key}
                  to={action.href}
                  className={className}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noopener noreferrer' : undefined}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={action.key} type="button" onClick={action.onClick} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export const gestionActionIcons = {
  duplicate: <Copy className="w-4 h-4 shrink-0" aria-hidden />,
  edit: <Pencil className="w-4 h-4 shrink-0" aria-hidden />,
  preview: <Eye className="w-4 h-4 shrink-0" aria-hidden />,
  students: <Users className="w-4 h-4 shrink-0" aria-hidden />,
  external: <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />,
  delete: <Trash2 className="w-4 h-4 shrink-0" aria-hidden />,
};

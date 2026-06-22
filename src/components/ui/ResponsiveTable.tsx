import type { ReactNode } from 'react';
import { cn } from './cn';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Ocultar en vista móvil card */
  hideOnMobile?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  mobileCard?: (row: T) => ReactNode;
};

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Sin datos',
  mobileCard,
}: Props<T>) {
  if (data.length === 0) {
    return <p className="text-sm text-atenas-muted py-6 text-center">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="md:hidden space-y-3">
        {data.map((row) =>
          mobileCard ? (
            <div key={keyExtractor(row)}>{mobileCard(row)}</div>
          ) : (
            <div key={keyExtractor(row)} className="card p-4 space-y-3 text-sm">
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex justify-between gap-3 items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-atenas-muted-strong shrink-0 pt-0.5">
                      {col.header}
                    </span>
                    <span className="text-atenas-ink text-right min-w-0">{col.cell(row)}</span>
                  </div>
                ))}
            </div>
          )
        )}
      </div>

      <div className="hidden md:block data-table-shell">
        <table className="data-table table-mobile">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

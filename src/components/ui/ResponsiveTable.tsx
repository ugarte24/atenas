import type { ReactNode } from 'react';
import { cn } from './cn';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Ocultar en vista móvil card */
  hideOnMobile?: boolean;
  className?: string;
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
      {/* Móvil: cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) =>
          mobileCard ? (
            <div key={keyExtractor(row)}>{mobileCard(row)}</div>
          ) : (
            <div
              key={keyExtractor(row)}
              className="card p-4 space-y-2 text-sm"
            >
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex justify-between gap-3">
                    <span className="text-atenas-muted font-medium shrink-0">{col.header}</span>
                    <span className="text-atenas-ink text-right">{col.cell(row)}</span>
                  </div>
                ))}
            </div>
          )
        )}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-atenas-mist-border shadow-card">
        <table className="w-full border-collapse bg-white table-mobile">
          <thead>
            <tr className="bg-atenas-page border-b border-atenas-mist-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-atenas-ink',
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
              <tr
                key={keyExtractor(row)}
                className="border-b border-atenas-mist-border/60 last:border-0 hover:bg-atenas-page/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-sm text-atenas-ink', col.className)}>
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

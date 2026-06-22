import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from './cn';

type ShellProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function DataTableShell({ children, className, ...props }: ShellProps) {
  return (
    <div className={cn('data-table-shell', className)} {...props}>
      {children}
    </div>
  );
}

type TableProps = HTMLAttributes<HTMLTableElement> & { children: ReactNode };

export function DataTable({ children, className, ...props }: TableProps) {
  return (
    <table className={cn('data-table table-mobile', className)} {...props}>
      {children}
    </table>
  );
}

export function DataTableHead({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function DataTableBody({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

type RowProps = HTMLAttributes<HTMLTableRowElement> & { children: ReactNode };

export function DataTableRow({ children, className, ...props }: RowProps) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

type ThProps = ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode };

export function DataTableTh({ children, className, align, ...props }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(align === 'right' && 'text-right', align === 'center' && 'text-center', className)}
      {...props}
    >
      {children}
    </th>
  );
}

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode };

export function DataTableTd({ children, className, align, ...props }: TdProps) {
  return (
    <td
      className={cn(align === 'right' && 'text-right', align === 'center' && 'text-center', className)}
      {...props}
    >
      {children}
    </td>
  );
}

type StackProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

export function TableCellStack({ primary, secondary, className }: StackProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="table-cell-primary">{primary}</div>
      {secondary != null && secondary !== '' && (
        <div className="table-cell-secondary">{secondary}</div>
      )}
    </div>
  );
}

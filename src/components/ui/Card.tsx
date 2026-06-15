import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
};

const paddingClass = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({ children, padding = 'md', hover, className, ...props }: Props) {
  return (
    <div
      className={cn(
        hover ? 'card-hover' : 'card',
        paddingClass[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

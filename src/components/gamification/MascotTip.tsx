import { cn } from '../ui/cn';

type Props = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function MascotTip({ title = '¡Recuerda!', children, className }: Props) {
  return (
    <div className={cn('flex gap-3 items-start rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4', className)}>
      <img src="/mascot-owl.svg" alt="" className="w-12 h-12 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-bold text-emerald-900">{title}</p>
        <p className="text-sm text-emerald-800 mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

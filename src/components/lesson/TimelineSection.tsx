import type { Recurso } from '../../types';
import { cn } from '../ui/cn';
import { ExternalImage } from '../ui/ExternalImage';

const LINE_COLORS = ['bg-emerald-500', 'bg-orange-400', 'bg-violet-500', 'bg-sky-500', 'bg-amber-500'];

type Props = {
  recursos: Recurso[];
  title?: string;
  className?: string;
};

export function TimelineSection({ recursos, title = 'Hechos importantes', className }: Props) {
  const items = recursos.filter((r) => r.tipo === 'imagen' || r.tipo === 'texto' || r.tipo === 'mapa');
  if (items.length === 0) return null;

  return (
    <section className={cn('rounded-2xl bg-white border border-atenas-mist-border p-5 sm:p-6 shadow-card', className)}>
      <h2 className="text-lg font-bold text-atenas-ink mb-6">{title}</h2>
      <div className="overflow-x-auto pb-2 scrollbar-nav-hide">
        <div className="flex gap-4 min-w-max px-1">
          {items.map((r, i) => (
            <article key={r.id} className="w-[200px] sm:w-[220px] shrink-0 flex flex-col">
              <div className="rounded-xl overflow-hidden border border-atenas-mist-border bg-atenas-mist/30 aspect-[4/3] mb-3">
                {(r.tipo === 'imagen' || r.tipo === 'mapa') && r.url ? (
                  <ExternalImage src={r.url} alt={r.title ?? ''} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3 text-xs text-atenas-muted text-center">
                    {r.contenido?.slice(0, 80) ?? r.title}
                  </div>
                )}
              </div>
              <div className={cn('h-1 rounded-full mb-2', LINE_COLORS[i % LINE_COLORS.length])} />
              {r.title && <h3 className="text-sm font-bold text-atenas-ink leading-snug">{r.title}</h3>}
              {r.tipo === 'texto' && r.contenido && (
                <p className="text-xs text-atenas-muted mt-1 line-clamp-3">{r.contenido}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

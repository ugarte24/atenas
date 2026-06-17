import { cn } from '../ui/cn';

export type SectionItem = {
  id: string;
  step: number;
  title: string;
};

type Props = {
  sections: SectionItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  variant?: 'vertical' | 'horizontal';
};

export function LessonSectionNav({ sections, activeId, onSelect, variant = 'vertical' }: Props) {
  if (sections.length === 0) return null;

  if (variant === 'horizontal') {
    return (
      <nav
        className="lesson-section-nav flex gap-2 overflow-x-auto scrollbar-nav-hide pb-2 lg:hidden"
        aria-label="Secciones del tema"
      >
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                'shrink-0 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold min-h-touch transition-colors border',
                active
                  ? 'bg-atenas-sidebar text-white border-atenas-sidebar'
                  : 'bg-white text-atenas-muted-strong border-atenas-mist-border hover:border-atenas-ink/30'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  active ? 'bg-atenas-gold text-atenas-ink' : 'bg-atenas-mist text-atenas-muted'
                )}
              >
                {s.step}
              </span>
              <span className="whitespace-nowrap">{s.title}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="lesson-section-nav space-y-1" aria-label="Secciones del tema">
      {sections.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              'lesson-nav-item',
              active ? 'lesson-nav-item--active' : 'lesson-nav-item--inactive'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                active ? 'bg-atenas-gold text-atenas-ink' : 'bg-atenas-mist text-atenas-muted border border-atenas-mist-border'
              )}
            >
              {s.step}
            </span>
            <span className="leading-snug">{s.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

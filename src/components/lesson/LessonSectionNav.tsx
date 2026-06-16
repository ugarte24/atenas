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
};

export function LessonSectionNav({ sections, activeId, onSelect }: Props) {
  if (sections.length === 0) return null;

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
              'flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 text-sm transition-colors min-h-touch',
              active
                ? 'bg-atenas-sidebar text-white font-semibold shadow-sm'
                : 'text-atenas-muted-strong hover:bg-white/80 hover:text-atenas-ink'
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

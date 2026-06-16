import { cn } from '../ui/cn';

export type LessonTab = 'contenido' | 'recursos' | 'actividades' | 'notas';

type Props = {
  active: LessonTab;
  onChange: (tab: LessonTab) => void;
};

const TABS: { id: LessonTab; label: string }[] = [
  { id: 'contenido', label: 'Contenido' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'actividades', label: 'Actividades' },
  { id: 'notas', label: 'Notas' },
];

export function LessonTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-nav-hide border-b border-atenas-mist-border pb-px" role="tablist">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={cn(
            'page-tab',
            active === id ? 'page-tab--active' : 'page-tab--inactive'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

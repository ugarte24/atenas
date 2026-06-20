import { motion } from 'framer-motion';
import { cn } from '../ui/cn';
import { useMotionSafe } from '../../hooks/useMotionSafe';

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
  const { reduceMotion } = useMotionSafe();

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
                'relative shrink-0 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold min-h-touch transition-colors border',
                active
                  ? 'text-white border-atenas-sidebar'
                  : 'bg-white text-atenas-muted-strong border-atenas-mist-border hover:border-atenas-ink/30'
              )}
            >
              {active && !reduceMotion && (
                <motion.span
                  layoutId="lesson-section-pill-h"
                  className="absolute inset-0 rounded-full bg-atenas-sidebar border border-atenas-sidebar -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {active && reduceMotion && (
                <span className="absolute inset-0 rounded-full bg-atenas-sidebar border border-atenas-sidebar -z-10" />
              )}
              <span
                className={cn(
                  'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  active ? 'bg-atenas-gold text-atenas-ink' : 'bg-atenas-mist text-atenas-muted'
                )}
              >
                {s.step}
              </span>
              <span className="relative whitespace-nowrap">{s.title}</span>
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
              'relative lesson-nav-item',
              active ? 'lesson-nav-item--active' : 'lesson-nav-item--inactive'
            )}
          >
            {active && !reduceMotion && (
              <motion.span
                layoutId="lesson-section-pill-v"
                className="absolute inset-0 rounded-xl bg-white shadow-sm border border-atenas-mist-border -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className={cn(
                'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                active ? 'bg-atenas-gold text-atenas-ink' : 'bg-atenas-mist text-atenas-muted border border-atenas-mist-border'
              )}
            >
              {s.step}
            </span>
            <span className="relative leading-snug">{s.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

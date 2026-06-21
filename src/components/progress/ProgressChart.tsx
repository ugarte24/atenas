type BarItem = {
  label: string;
  value: number;
  title?: string;
  color?: string;
};

const BAR_TONES = [
  'bg-atenas-blue',
  'bg-atenas-success',
  'bg-atenas-gold',
  'bg-atenas-ink/70',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
];

type Props = {
  items: BarItem[];
  maxValue?: number;
  className?: string;
};

export function ProgressChart({ items, maxValue = 100, className }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-36 sm:h-40 px-0.5 overflow-x-auto scrollbar-nav-hide">
        {items.map((item, i) => {
          const h = maxValue > 0 ? Math.max(6, (item.value / maxValue) * 100) : 6;
          const tone = item.color ?? BAR_TONES[i % BAR_TONES.length];
          const tooltip = item.title ? `${item.title}: ${item.value}%` : `${item.label}: ${item.value}%`;
          return (
            <div
              key={`${item.label}-${i}`}
              className="flex-1 flex flex-col items-center gap-1.5 min-w-[2.25rem] sm:min-w-0"
              title={tooltip}
            >
              <span className="text-[10px] sm:text-xs font-bold text-atenas-ink tabular-nums">
                {item.value}%
              </span>
              <div className="w-full flex justify-center items-end h-24 sm:h-28">
                <div
                  className={`w-full max-w-[2.5rem] sm:max-w-[3rem] rounded-t-lg transition-all ${tone}`}
                  style={{ height: `${h}%` }}
                  role="img"
                  aria-label={tooltip}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-atenas-muted text-center line-clamp-2 leading-tight w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

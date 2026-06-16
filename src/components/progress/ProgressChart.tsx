type BarItem = {
  label: string;
  value: number;
  color?: string;
};

const COLORS = ['#4A90E2', '#28A745', '#FFC107', '#9B59B6', '#E67E22'];

type Props = {
  items: BarItem[];
  maxValue?: number;
  className?: string;
};

export function ProgressChart({ items, maxValue = 100, className }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-2 h-40 px-1">
        {items.map((item, i) => {
          const h = maxValue > 0 ? Math.max(4, (item.value / maxValue) * 100) : 4;
          const color = item.color ?? COLORS[i % COLORS.length];
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-atenas-ink tabular-nums">{item.value}%</span>
              <div className="w-full flex justify-center items-end h-28">
                <div
                  className="w-full max-w-[3rem] rounded-t-lg transition-all"
                  style={{ height: `${h}%`, backgroundColor: color }}
                  title={`${item.label}: ${item.value}%`}
                />
              </div>
              <span className="text-[10px] text-atenas-muted text-center line-clamp-2 leading-tight w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

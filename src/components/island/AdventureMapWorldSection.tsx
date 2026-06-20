import type { AdventureMapWorldZone } from '../../lib/adventureMapTypes';
import { ADVENTURE_MAP_VIEWBOX } from '../../lib/adventureMapTypes';
import { AdventureMapIsometricWorld } from './AdventureMapIsometricWorld';
import { cn } from '../ui/cn';

type Props = {
  zone: AdventureMapWorldZone;
};

export function AdventureMapWorldSection({ zone }: Props) {
  const { height } = ADVENTURE_MAP_VIEWBOX;
  const top = `${(zone.yStart / height) * 100}%`;
  const sectionHeight = `${((zone.yEnd - zone.yStart) / height) * 100}%`;

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top, height: sectionHeight }}
      aria-hidden
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center z-10 px-4"
        style={{
          top: `${((zone.islandAnchor.y - zone.yStart - 80) / (zone.yEnd - zone.yStart)) * 100}%`,
          width: '88%',
        }}
      >
        <div
          className={cn(
            'inline-block rounded-2xl px-4 py-1.5 text-sm font-bold text-white shadow-lg mb-2',
            zone.worldId === 1 && 'bg-gradient-to-r from-emerald-600 to-teal-700',
            zone.worldId === 2 && 'bg-gradient-to-r from-sky-600 to-blue-700',
            zone.worldId === 3 && 'bg-gradient-to-r from-amber-600 to-orange-700'
          )}
        >
          {zone.title}
        </div>
        <p className="text-[11px] font-semibold text-white/90 drop-shadow-md">{zone.subtitle}</p>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 w-[75%] max-w-[280px]"
        style={{
          top: `${((zone.islandAnchor.y - zone.yStart - 20) / (zone.yEnd - zone.yStart)) * 100}%`,
        }}
      >
        <AdventureMapIsometricWorld worldId={zone.worldId} className="w-full h-auto drop-shadow-2xl" />
      </div>
    </div>
  );
}

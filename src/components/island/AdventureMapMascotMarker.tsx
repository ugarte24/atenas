import { useMemo } from 'react';
import { MascotLottie } from '../MascotLottie';
import { nodePositionInScene } from '../../lib/adventureMapLayout';
import { ADVENTURE_WORLD_ZONES } from '../../lib/adventureMapLayout';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';

type Props = {
  node: AdventureMapNode | null;
};

export function AdventureMapMascotMarker({ node }: Props) {
  const zone = useMemo(
    () => (node ? ADVENTURE_WORLD_ZONES.find((z) => z.worldId === node.worldId) : null),
    [node]
  );

  if (!node || !zone) return null;

  const pos = nodePositionInScene(node, zone);
  const sceneIndex = zone.worldId - 1;
  const topCalc = `calc(${sceneIndex} * (100% / 3) + (${pos.top} * (100% / 3)))`;

  return (
    <div
      className="absolute z-40 pointer-events-none -translate-x-1/2 left-0 w-full h-full"
      aria-hidden
    >
      <div
        className="absolute -translate-x-1/2"
        style={{ left: pos.left, top: topCalc, marginTop: '-3.5rem' }}
      >
        <MascotLottie variant="idle" loop className="w-14 h-14 drop-shadow-lg" />
      </div>
    </div>
  );
}

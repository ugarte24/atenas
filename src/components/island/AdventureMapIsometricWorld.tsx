import { IslandArtSvg } from './IslandArtSvg';
import type { WorldId } from '../../lib/adventureMapTypes';

type Props = {
  worldId: WorldId;
  className?: string;
};

export function AdventureMapIsometricWorld({ worldId, className }: Props) {
  return <IslandArtSvg islaId={worldId} className={className} />;
}

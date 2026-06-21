import type { MapNodeKind } from './adventureMapTypes';
import { ADVENTURE_SCENE } from './adventureMapTypes';

/** Mismo ratio que escena y WebP generado (400×980 @2x → 800×1960). */
export const SCENE_ASPECT_RATIO = `${ADVENTURE_SCENE.width} / ${ADVENTURE_SCENE.height}`;

/** Alineado con img object-cover en AdventureMapPaintedIsland. */
export const SCENE_PRESERVE_ASPECT = 'xMidYMid slice' as const;

export type NodeAnchorOffset = {
  translateX: string;
  translateY: string;
};

/** Centro del hitbox del nodo sobre el punto (x, y) del layout. */
export function nodeAnchorOffset(kind: MapNodeKind, minimalOverlay = false): NodeAnchorOffset {
  if (kind === 'unit') {
    return {
      translateX: '-50%',
      translateY: minimalOverlay ? '-50%' : '-58%',
    };
  }
  return { translateX: '-50%', translateY: '-50%' };
}

export function percentInScene(
  x: number,
  y: number,
  sceneHeight: number = ADVENTURE_SCENE.height
) {
  return {
    left: `${(x / ADVENTURE_SCENE.width) * 100}%`,
    top: `${(y / sceneHeight) * 100}%`,
  };
}

export function nodeStyleInScene(
  x: number,
  y: number,
  kind: MapNodeKind,
  minimalOverlay = false,
  sceneHeight: number = ADVENTURE_SCENE.height
) {
  const pos = percentInScene(x, y, sceneHeight);
  const anchor = nodeAnchorOffset(kind, minimalOverlay);
  return {
    left: pos.left,
    top: pos.top,
    transform: `translate(${anchor.translateX}, ${anchor.translateY})`,
  };
}

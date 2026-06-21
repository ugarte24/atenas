import { motion } from 'framer-motion';
import type { AdventureMapNode, AdventureMapWorldZone } from '../../lib/adventureMapTypes';
import { ADVENTURE_SCENE } from '../../lib/adventureMapTypes';
import { nodeLocalPosition } from '../../lib/adventureMapLayout';
import { useSceneParallax, useSceneRef } from '../../hooks/useSceneParallax';
import { AdventureMapSceneSky } from './AdventureMapSceneSky';
import {
  AdventureMapIslandAsset,
} from './AdventureMapIslandAsset';
import { AdventureMapPath } from './AdventureMapPath';
import { AdventureMapNodeLayer } from './AdventureMapNodeLayer';
import { MascotLottie } from '../MascotLottie';
import { getPaintedIslandConfig, isPaintedWorld } from '../../lib/paintedWorldLayout';
import { nodeStyleInScene } from '../../lib/adventureMapCoords';
import { cn } from '../ui/cn';

type Props = {
  zone: AdventureMapWorldZone;
  nodes: AdventureMapNode[];
  selectedId: string | null;
  celebrateNodeId: string | null;
  mascotNode: AdventureMapNode | null;
  openingChestId: string | null;
  onChestOpenComplete?: () => void;
  onSelectNode: (node: AdventureMapNode) => void;
};

export function AdventureMapWorldScene({
  zone,
  nodes,
  selectedId,
  celebrateNodeId,
  mascotNode,
  openingChestId,
  onChestOpenComplete,
  onSelectNode,
}: Props) {
  const sectionRef = useSceneRef();
  const { skyY, farY, midY, fgY, reduceMotion } = useSceneParallax(sectionRef);
  const aspectRatio = `${ADVENTURE_SCENE.width} / ${ADVENTURE_SCENE.height}`;

  const layerClass = 'absolute inset-0 h-[108%] w-full -top-[4%] pointer-events-none';

  const paintedConfig = getPaintedIslandConfig(zone.worldId);
  const isPainted = isPaintedWorld(zone.worldId);

  return (
    <section
      ref={sectionRef}
      data-world-id={zone.worldId}
      className="relative w-full shrink-0 overflow-hidden"
      style={{ aspectRatio }}
      aria-label={`Mundo ${zone.title}`}
    >
      {/* Cielo — omitido si el asset pintado ya incluye cielo */}
      {!paintedConfig?.paintedArt ? (
        <motion.div className={layerClass} style={{ y: reduceMotion ? 0 : skyY }} aria-hidden>
          <AdventureMapSceneSky worldId={zone.worldId} />
        </motion.div>
      ) : null}

      {!isPainted && (
        <motion.div className={cn(layerClass, 'z-[1]')} style={{ y: reduceMotion ? 0 : farY }} aria-hidden>
          <AdventureMapIslandAsset worldId={zone.worldId} layer="far" className="opacity-95" />
        </motion.div>
      )}

      {/* Isla premium pintada a pantalla completa; procedural con parallax en capas */}
      <motion.div
        className={cn(layerClass, 'z-[2]', isPainted && '!h-full !top-0')}
        style={{ y: reduceMotion ? 0 : isPainted && paintedConfig?.paintedArt ? 0 : midY }}
        aria-hidden
      >
        <AdventureMapIslandAsset worldId={zone.worldId} layer="full" />
      </motion.div>

      <div className="absolute inset-0 z-[3] pointer-events-none">
        <AdventureMapPath nodes={nodes} zone={zone} />
      </div>

      {!isPainted && (
        <motion.div className={cn(layerClass, 'z-[4]')} style={{ y: reduceMotion ? 0 : fgY }} aria-hidden>
          <AdventureMapIslandAsset worldId={zone.worldId} layer="foreground" />
        </motion.div>
      )}

      <div
        className="absolute left-0 right-0 top-3 z-20 flex flex-col items-center px-3 pointer-events-none"
        aria-hidden
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-1.5 text-sm font-bold text-white shadow-lg border border-white/25 backdrop-blur-sm',
            zone.worldId === 1 && 'bg-emerald-700/85',
            zone.worldId === 2 && 'bg-sky-700/85',
            zone.worldId === 3 && 'bg-orange-700/85'
          )}
        >
          {zone.title}
        </div>
        <p className="mt-1 text-[10px] font-semibold text-white/95 drop-shadow-md">{zone.subtitle}</p>
      </div>

      <AdventureMapNodeLayer
        nodes={nodes}
        zone={zone}
        selectedId={selectedId}
        celebrateNodeId={celebrateNodeId}
        openingChestId={openingChestId}
        onChestOpenComplete={onChestOpenComplete}
        onSelectNode={onSelectNode}
      />

      {mascotNode && (
        <div
          className="absolute z-[25] pointer-events-none"
          style={nodeStyleInScene(
            nodeLocalPosition(mascotNode, zone).x,
            nodeLocalPosition(mascotNode, zone).y - 48,
            'unit'
          )}
          aria-hidden
        >
          <MascotLottie variant="idle" loop className="w-14 h-14 drop-shadow-lg" />
        </div>
      )}
    </section>
  );
}

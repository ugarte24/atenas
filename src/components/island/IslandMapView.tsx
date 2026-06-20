import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Circle, CheckCircle2 } from 'lucide-react';
import type { Unidad } from '../../types';
import type { UnitAdventureProgress } from '../../lib/adventureMapTypes';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';
import {
  ADVENTURE_WORLD_ZONES,
  buildAdventureMapGraph,
} from '../../lib/adventureMapLayout';
import {
  getOpenedChestIds,
  markChestOpened,
  totalStars,
  firstAvailableNodeId,
} from '../../lib/adventureMapState';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { MascotLottie } from '../MascotLottie';
import { AdventureMapCanvas } from './AdventureMapCanvas';
import { AdventureMapWorldScene } from './AdventureMapWorldScene';
import { AdventureMapNodeSheet } from './AdventureMapNodeSheet';
import { AdventureMapChestModal } from './AdventureMapChestModal';
import { AdventureMapCompletionBurst } from './AdventureMapCompletionBurst';

type Props = {
  unidades: Unidad[];
  progressByUnit: Record<string, UnitAdventureProgress>;
  showProgress: boolean;
};

export function IslandMapView({ unidades, progressByUnit, showProgress }: Props) {
  const { reduceMotion } = useMotionSafe();
  const canvasRef = useRef<HTMLDivElement>(null);
  const prevProgressRef = useRef<Record<string, UnitAdventureProgress>>({});

  const [openedChestIds, setOpenedChestIds] = useState<Set<string>>(() => getOpenedChestIds());
  const [selectedNode, setSelectedNode] = useState<AdventureMapNode | null>(null);
  const [chestModalOpen, setChestModalOpen] = useState(false);
  const [celebrateNodeId, setCelebrateNodeId] = useState<string | null>(null);
  const [celebrateBurst, setCelebrateBurst] = useState(false);
  const [openingChestId, setOpeningChestId] = useState<string | null>(null);
  const pendingChestRef = useRef<string | null>(null);

  const previewAllOpen = !showProgress;

  const nodes = useMemo(
    () => buildAdventureMapGraph(unidades, progressByUnit, openedChestIds, previewAllOpen),
    [unidades, progressByUnit, openedChestIds, previewAllOpen]
  );

  const nodesByWorld = useMemo(() => {
    const map: Record<1 | 2 | 3, AdventureMapNode[]> = { 1: [], 2: [], 3: [] };
    for (const n of nodes) map[n.worldId].push(n);
    return map;
  }, [nodes]);

  const starsTotal = useMemo(() => totalStars(nodes), [nodes]);
  const activeNode = useMemo(
    () => nodes.find((n) => n.id === firstAvailableNodeId(nodes)) ?? null,
    [nodes]
  );

  useEffect(() => {
    if (!showProgress) return;
    for (const u of unidades) {
      const prev = prevProgressRef.current[u.id]?.progressPct ?? 0;
      const curr = progressByUnit[u.id]?.progressPct ?? 0;
      if (prev < 100 && curr >= 100) {
        const node = nodes.find((n) => n.unitId === u.id);
        if (node) {
          setCelebrateNodeId(node.id);
          setCelebrateBurst(true);
          window.setTimeout(() => {
            setCelebrateBurst(false);
            setCelebrateNodeId(null);
          }, 2000);
        }
      }
    }
    prevProgressRef.current = { ...progressByUnit };
  }, [progressByUnit, unidades, nodes, showProgress]);

  useEffect(() => {
    if (reduceMotion || !canvasRef.current) return;
    const id = firstAvailableNodeId(nodes);
    if (!id) return;
    const el = canvasRef.current.querySelector(`[data-node-id="${id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [nodes, reduceMotion]);

  const handleSelectNode = useCallback((node: AdventureMapNode) => {
    setSelectedNode(node);
  }, []);

  const handleOpenChest = useCallback(() => {
    if (!selectedNode || selectedNode.kind !== 'chest') return;
    const chestId = selectedNode.id;
    pendingChestRef.current = chestId;
    setSelectedNode(null);
    setOpeningChestId(chestId);
  }, [selectedNode]);

  const handleChestAnimationComplete = useCallback(() => {
    const chestId = pendingChestRef.current;
    if (!chestId) return;
    markChestOpened(chestId);
    setOpenedChestIds((prev) => new Set([...prev, chestId]));
    pendingChestRef.current = null;
    setOpeningChestId(null);
    setChestModalOpen(true);
  }, []);

  return (
    <div className="relative">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-atenas-ink flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            Mapa del Abya Yala
          </p>
          <p className="text-xs text-atenas-muted mt-0.5 max-w-lg">
            Recorre Convivencia, Territorio e Historia. Desbloquea unidades, checkpoints y cofres.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <MascotLottie variant="idle" loop className="w-12 h-12" />
          <p className="text-xs text-atenas-muted max-w-[8rem] leading-snug">
            {showProgress ? `${starsTotal} estrellas` : 'Vista docente'}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-3 mb-3 text-[10px] font-semibold text-atenas-muted">
        <li className="flex items-center gap-1">
          <Lock className="w-3 h-3" /> Bloqueado
        </li>
        <li className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-sky-500 fill-sky-500" /> Disponible
        </li>
        <li className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-amber-500" /> Completado
        </li>
        <li className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {starsTotal} estrellas
        </li>
      </ul>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdventureMapCanvas canvasRef={canvasRef}>
          {ADVENTURE_WORLD_ZONES.map((zone) => (
            <AdventureMapWorldScene
              key={zone.worldId}
              zone={zone}
              nodes={nodesByWorld[zone.worldId]}
              selectedId={selectedNode?.id ?? null}
              celebrateNodeId={celebrateNodeId}
              mascotNode={activeNode?.worldId === zone.worldId ? activeNode : null}
              openingChestId={openingChestId}
              onChestOpenComplete={handleChestAnimationComplete}
              onSelectNode={handleSelectNode}
            />
          ))}
          {celebrateBurst && (
            <AdventureMapCompletionBurst
              active
              className="pointer-events-none absolute inset-0 z-50 overflow-hidden"
            />
          )}
        </AdventureMapCanvas>
      </motion.div>

      <AdventureMapNodeSheet
        node={selectedNode}
        showProgress={showProgress}
        onClose={() => setSelectedNode(null)}
        onOpenChest={selectedNode?.kind === 'chest' ? handleOpenChest : undefined}
      />

      <AdventureMapChestModal
        open={chestModalOpen}
        onClose={() => setChestModalOpen(false)}
      />
    </div>
  );
}

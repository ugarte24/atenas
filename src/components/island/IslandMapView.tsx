import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Circle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Unidad } from '../../types';
import type { UnitAdventureProgress } from '../../lib/adventureMapTypes';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';
import {
  ADVENTURE_WORLD_ZONES,
  buildAdventureMapGraph,
} from '../../lib/adventureMapLayout';
import {
  totalStars,
  firstAvailableNodeId,
} from '../../lib/adventureMapState';
import { CHEST_XP_REWARD } from '../../lib/adventureMapRewards';
import { useMapRewards } from '../../hooks/useMapRewards';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { MascotLottie } from '../MascotLottie';
import { AdventureMapCanvas } from './AdventureMapCanvas';
import { AdventureMapWorldScene } from './AdventureMapWorldScene';
import { AdventureMapWorldBridge } from './AdventureMapWorldBridge';
import { AdventureMapNodeSheet } from './AdventureMapNodeSheet';
import { AdventureMapChestModal } from './AdventureMapChestModal';
import { AdventureMapCompletionBurst } from './AdventureMapCompletionBurst';
import { cn } from '../ui/cn';

const MAP_SCROLL_KEY = 'atenas-map-initial-scroll-done';

function scrollMapToElement(
  container: HTMLElement,
  el: Element,
  align: 'start' | 'center',
  smooth: boolean
) {
  const canScrollInside = container.scrollHeight > container.clientHeight + 2;
  if (!canScrollInside) {
    el.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: align === 'start' ? 'start' : 'center',
    });
    return;
  }
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const top = eRect.top - cRect.top + container.scrollTop;
  const target =
    align === 'start' ? top - 12 : top - container.clientHeight / 2 + eRect.height / 2;
  container.scrollTo({ top: Math.max(0, target), behavior: smooth ? 'smooth' : 'auto' });
}

type Props = {
  unidades: Unidad[];
  progressByUnit: Record<string, UnitAdventureProgress>;
  showProgress: boolean;
  scrollWorldId?: 1 | 2 | 3 | null;
  scrollNodeId?: string | null;
};

export function IslandMapView({
  unidades,
  progressByUnit,
  showProgress,
  scrollWorldId = null,
  scrollNodeId = null,
}: Props) {
  const { reduceMotion } = useMotionSafe();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const initialScrollDoneRef = useRef(false);
  const lastDeepLinkRef = useRef('');
  const prevProgressRef = useRef<Record<string, UnitAdventureProgress>>({});

  const pendingChestRef = useRef<string | null>(null);
  const previewAllOpen = !showProgress;
  const { openedChestIds, openChest } = useMapRewards(showProgress);

  const [selectedNode, setSelectedNode] = useState<AdventureMapNode | null>(null);
  const [chestModalOpen, setChestModalOpen] = useState(false);
  const [chestRewardXp, setChestRewardXp] = useState(CHEST_XP_REWARD);
  const [celebrateNodeId, setCelebrateNodeId] = useState<string | null>(null);
  const [celebrateBurst, setCelebrateBurst] = useState(false);
  const [openingChestId, setOpeningChestId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

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
    const container = scrollContainerRef.current;
    const content = mapContentRef.current;
    if (!container || !content || !showProgress || nodes.length === 0) return;

    const smooth = !reduceMotion;
    const deepLink = `${scrollWorldId ?? ''}:${scrollNodeId ?? ''}`;
    const hasDeepLink = scrollWorldId != null || scrollNodeId != null;

    if (hasDeepLink) {
      if (lastDeepLinkRef.current === deepLink) return;
      lastDeepLinkRef.current = deepLink;
      if (scrollWorldId && !scrollNodeId) {
        const worldEl = content.querySelector(`[data-world-id="${scrollWorldId}"]`);
        if (worldEl) scrollMapToElement(container, worldEl, 'start', smooth);
      } else {
        const id = scrollNodeId ?? firstAvailableNodeId(nodes);
        if (id) {
          const el = content.querySelector(`[data-node-id="${id}"]`);
          if (el) scrollMapToElement(container, el, 'center', smooth);
        }
      }
      return;
    }

    if (initialScrollDoneRef.current) return;
    if (sessionStorage.getItem(MAP_SCROLL_KEY) === '1') {
      initialScrollDoneRef.current = true;
      return;
    }

    const targetId = firstAvailableNodeId(nodes);
    initialScrollDoneRef.current = true;
    if (!targetId) return;

    const el = content.querySelector(`[data-node-id="${targetId}"]`);
    if (el) scrollMapToElement(container, el, 'center', smooth);
    sessionStorage.setItem(MAP_SCROLL_KEY, '1');
  }, [nodes, reduceMotion, showProgress, scrollWorldId, scrollNodeId]);

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
    void openChest(chestId, CHEST_XP_REWARD).then(() => {
      setChestRewardXp(CHEST_XP_REWARD);
      pendingChestRef.current = null;
      setOpeningChestId(null);
      setChestModalOpen(true);
    });
  }, [openChest]);

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

      <div className="mb-3 sm:hidden">
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-atenas-mist-border bg-white px-3 py-2 text-xs font-semibold text-atenas-muted"
          aria-expanded={legendOpen}
        >
          Leyenda del mapa
          {legendOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <ul
        className={cn(
          'flex flex-wrap gap-3 mb-3 text-[10px] font-semibold text-atenas-muted',
          !legendOpen && 'hidden sm:flex'
        )}
      >
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
        <AdventureMapCanvas scrollRef={scrollContainerRef} contentRef={mapContentRef}>
          {ADVENTURE_WORLD_ZONES.map((zone, index) => (
            <div key={zone.worldId} className="contents">
              {index > 0 && <AdventureMapWorldBridge fromWorldId={index as 1 | 2} />}
              <AdventureMapWorldScene
                zone={zone}
                nodes={nodesByWorld[zone.worldId]}
                selectedId={selectedNode?.id ?? null}
                celebrateNodeId={celebrateNodeId}
                mascotNode={activeNode?.worldId === zone.worldId ? activeNode : null}
                openingChestId={openingChestId}
                onChestOpenComplete={handleChestAnimationComplete}
                onSelectNode={handleSelectNode}
              />
            </div>
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
        rewardLabel={`+${chestRewardXp} XP de exploración`}
        onClose={() => setChestModalOpen(false)}
      />
    </div>
  );
}

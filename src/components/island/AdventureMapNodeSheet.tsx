import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Lock, Gift, Flag } from 'lucide-react';
import type { AdventureMapNode } from '../../lib/adventureMapTypes';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';
import { limpiarDescripcionUnidad } from '../../lib/unidadDescripcion';
import { resolveCoverImageUrl } from '../../lib/unidadVisual';
import { useMotionSafe } from '../../hooks/useMotionSafe';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { ExternalImage } from '../ui/ExternalImage';
import { AdventureMapNodeStars } from './AdventureMapNodeStars';
import { cn } from '../ui/cn';

type Props = {
  node: AdventureMapNode | null;
  showProgress: boolean;
  onClose: () => void;
  onOpenChest?: () => void;
};

export function AdventureMapNodeSheet({ node, showProgress, onClose, onOpenChest }: Props) {
  const { reduceMotion, spring } = useMotionSafe();

  const titulo =
    node?.kind === 'unit' && node.unidad
      ? tituloUnidadConOrden(node.unidad.orden ?? 0, node.unidad.title, node.listIndex ?? 0)
      : node?.kind === 'checkpoint'
        ? `Checkpoint · ${node.worldId === 1 ? 'Hacia Territorio' : 'Hacia Historia'}`
        : node?.kind === 'chest'
          ? 'Cofre del tesoro'
          : '';

  const descripcion =
    node?.kind === 'unit' && node.unidad
      ? limpiarDescripcionUnidad(node.unidad.description)
      : node?.kind === 'checkpoint'
        ? 'Completa todas las unidades de este mundo para desbloquear el siguiente archipiélago.'
        : node?.kind === 'chest'
          ? '¡Has llegado a un cofre! Ábrelo para recibir una recompensa simbólica de XP.'
          : '';

  const cover =
    node?.kind === 'unit' && node.unidad
      ? resolveCoverImageUrl(node.unidad, node.listIndex ?? 0)
      : '';
  const pct = node?.progressPct ?? 0;
  const completed = node?.status === 'completed' || node?.status === 'perfect';
  const locked = node?.status === 'locked';

  return (
    <AnimatePresence>
      {node ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar panel"
            className="fixed inset-0 z-40 bg-atenas-ink/30 backdrop-blur-[2px] lg:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-labelledby="adventure-node-title"
            className={cn(
              'z-50 border border-atenas-mist-border bg-white shadow-elevated',
              'fixed bottom-0 left-0 right-0 rounded-t-3xl p-5 pb-student-bottom-nav max-h-[70vh] overflow-y-auto',
              'lg:fixed lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2',
              'lg:max-w-sm lg:rounded-2xl lg:pb-5 lg:max-h-[min(80vh,28rem)]'
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            transition={spring}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              {node.kind === 'unit' && node.isla ? (
                <Badge tone="gold" className="text-[10px] font-bold">
                  {node.isla.shortLabel}
                </Badge>
              ) : node.kind === 'chest' ? (
                <Badge tone="warning" className="text-[10px] font-bold inline-flex gap-1">
                  <Gift className="w-3 h-3" /> Cofre
                </Badge>
              ) : (
                <Badge tone="default" className="text-[10px] font-bold inline-flex gap-1">
                  <Flag className="w-3 h-3" /> Checkpoint
                </Badge>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-atenas-muted hover:bg-atenas-mist"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {node.kind === 'unit' && cover ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-atenas-mist mb-3">
                <ExternalImage src={cover} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}

            <h3 id="adventure-node-title" className="text-lg font-bold text-atenas-ink leading-snug">
              {titulo}
            </h3>

            {node.kind === 'unit' && node.isla && (
              <p className="text-xs font-semibold text-atenas-muted uppercase tracking-wide mt-1">
                {node.isla.subtitle}
              </p>
            )}

            {descripcion ? (
              <p className="text-sm text-atenas-muted mt-2 line-clamp-3">{descripcion}</p>
            ) : null}

            {node.kind === 'unit' && showProgress && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-atenas-muted">Estrellas</span>
                  <AdventureMapNodeStars stars={node.stars} />
                </div>
                <ProgressBar
                  value={pct}
                  label="Tu progreso"
                  showPercent
                  size="sm"
                  tone={completed ? 'success' : 'gold'}
                />
              </div>
            )}

            {locked && node.kind === 'unit' && (
              <p className="mt-4 flex items-center gap-2 text-sm text-atenas-muted font-medium">
                <Lock className="w-4 h-4 shrink-0" />
                Completa la unidad anterior para desbloquear.
              </p>
            )}

            {node.kind === 'unit' && !locked && node.unitId && (
              <Link
                to={`/unidades/${node.unitId}`}
                className={cn(
                  'mt-5 flex w-full items-center justify-center gap-2 rounded-2xl min-h-touch',
                  'font-bold text-base shadow-md transition-colors',
                  completed
                    ? 'bg-atenas-mist text-atenas-ink border border-atenas-mist-border'
                    : 'btn-success'
                )}
              >
                {completed ? 'Repasar aventura' : '¡Explorar!'}
                <ChevronRight className="w-5 h-5" aria-hidden />
              </Link>
            )}

            {node.kind === 'chest' && node.status === 'available' && onOpenChest && (
              <button type="button" onClick={onOpenChest} className="mt-5 btn-atenas-gold w-full min-h-touch font-bold">
                Abrir cofre
              </button>
            )}

            {node.kind === 'chest' && node.status === 'completed' && (
              <p className="mt-4 text-sm font-semibold text-emerald-700">¡Cofre ya abierto!</p>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

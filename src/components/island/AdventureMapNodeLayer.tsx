import type { AdventureMapNode, AdventureMapWorldZone } from '../../lib/adventureMapTypes';
import { nodeStyleInScene } from '../../lib/adventureMapCoords';
import { isMinimalOverlayNode } from '../../lib/paintedWorldLayout';
import { nodeLocalPosition } from '../../lib/adventureMapLayout';
import { AdventureMapUnitNode } from './AdventureMapUnitNode';
import { AdventureMapChest } from './AdventureMapChest';
import { AdventureMapCheckpoint } from './AdventureMapCheckpoint';
import { tituloUnidadConOrden } from '../../lib/unidadTitulo';

type Props = {
  nodes: AdventureMapNode[];
  zone: AdventureMapWorldZone;
  selectedId: string | null;
  celebrateNodeId: string | null;
  openingChestId: string | null;
  onChestOpenComplete?: () => void;
  onSelectNode: (node: AdventureMapNode) => void;
};

function nodeAriaLabel(node: AdventureMapNode): string {
  if (node.kind === 'unit' && node.unidad) {
    const title = tituloUnidadConOrden(
      node.unidad.orden ?? 0,
      node.unidad.title,
      node.listIndex ?? 0
    );
    if (node.status === 'locked') return `${title}, bloqueada`;
    if (node.status === 'perfect') return `${title}, completada con excelencia`;
    if (node.status === 'completed') return `${title}, completada`;
    return `${title}, disponible`;
  }
  if (node.kind === 'checkpoint') {
    if (node.status === 'locked') return 'Portal bloqueado';
    if (node.status === 'completed') return 'Portal superado';
    return 'Portal disponible';
  }
  if (node.status === 'locked') return 'Cofre bloqueado';
  if (node.status === 'completed') return 'Cofre abierto';
  return 'Cofre disponible';
}

export function AdventureMapNodeLayer({
  nodes,
  zone,
  selectedId,
  celebrateNodeId,
  openingChestId,
  onChestOpenComplete,
  onSelectNode,
}: Props) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {nodes.map((node) => {
        const local = nodeLocalPosition(node, zone);
        const minimal = isMinimalOverlayNode(zone.worldId, node.kind);
        const style = nodeStyleInScene(local.x, local.y, node.kind, minimal);
        const selected = selectedId === node.id;
        const celebrate = celebrateNodeId === node.id;
        const label = nodeAriaLabel(node);

        return (
          <div
            key={node.id}
            className="absolute pointer-events-auto touch-pan-y"
            style={style}
          >
            {node.kind === 'unit' && (
              <AdventureMapUnitNode
                node={node}
                selected={selected}
                celebrate={celebrate}
                onSelect={() => onSelectNode(node)}
                label={label}
                minimalOverlay={minimal}
              />
            )}
            {node.kind === 'chest' && (
              <AdventureMapChest
                node={node}
                selected={selected}
                opening={openingChestId === node.id}
                onOpenComplete={
                  openingChestId === node.id ? onChestOpenComplete : undefined
                }
                onSelect={() => onSelectNode(node)}
                minimalOverlay={minimal}
              />
            )}
            {node.kind === 'checkpoint' && (
              <AdventureMapCheckpoint
                node={node}
                selected={selected}
                onSelect={() => onSelectNode(node)}
                minimalOverlay={minimal}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

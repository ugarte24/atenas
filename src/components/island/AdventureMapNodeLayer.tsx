import type { AdventureMapNode, AdventureMapWorldZone } from '../../lib/adventureMapTypes';
import { nodePositionInScene } from '../../lib/adventureMapLayout';
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
        const pos = nodePositionInScene(node, zone);
        const selected = selectedId === node.id;
        const celebrate = celebrateNodeId === node.id;

        return (
          <div
            key={node.id}
            className="absolute pointer-events-auto"
            style={{ left: pos.left, top: pos.top }}
          >
            {node.kind === 'unit' && (
              <AdventureMapUnitNode
                node={node}
                selected={selected}
                celebrate={celebrate}
                onSelect={() => onSelectNode(node)}
                label={
                  node.unidad
                    ? `${tituloUnidadConOrden(node.unidad.orden ?? 0, node.unidad.title, node.listIndex ?? 0)} — ${node.status}`
                    : node.id
                }
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
              />
            )}
            {node.kind === 'checkpoint' && (
              <AdventureMapCheckpoint
                node={node}
                selected={selected}
                onSelect={() => onSelectNode(node)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

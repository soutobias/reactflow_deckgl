import type { Node, Edge } from '@xyflow/react';
import type { RenderLayer } from '@/store/layersSlice';
import { SourceNodeData } from '../nodes/SourceNode';

export function deriveLayers(nodes: Node[], edges: Edge[]): RenderLayer[] {
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  const incoming = new Map<string, string[]>();
  for (const edge of edges) {
    const arr = incoming.get(edge.target) ?? [];
    arr.push(edge.source);
    incoming.set(edge.target, arr);
  }

  const layerNodes = nodes.filter(n => n.type === 'layer');

  const resolved = layerNodes
    .map(layer => {
      const sources = incoming.get(layer.id) ?? [];
      const sourceId = sources.find(id => nodeById.get(id)?.type === 'source');
      if (!sourceId) return null;

      const sourceNode = nodeById.get(sourceId);
      const url = (sourceNode?.data as SourceNodeData | undefined)?.url?.trim();
      if (!url) return null;

      return {
        id: layer.id,
        sourceNodeId: sourceId,
        url,
        y: layer.position.y,
        order: 0
      };
    })
    .filter(Boolean) as RenderLayer[];

  resolved.sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
  return resolved.map((layer, idx) => ({ ...layer, order: idx }));
}

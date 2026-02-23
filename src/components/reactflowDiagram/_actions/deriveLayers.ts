import type { Edge, Node } from '@xyflow/react';

import type { RenderLayer } from '@/store/layersSlice';

import type { SourceNodeData } from '../nodes/SourceNode';

type IncomingRef = { id: string; handle?: string | null };

export function deriveLayers(nodes: Node[], edges: Edge[]): RenderLayer[] {
  const nodeById = new Map(nodes.map(n => [n.id, n]));

  const incoming = new Map<string, IncomingRef[]>();
  for (const e of edges) {
    const arr = incoming.get(e.target) ?? [];
    arr.push({ id: e.source, handle: e.targetHandle ?? null });
    incoming.set(e.target, arr);
  }

  const layerNodes = nodes.filter(n => n.type === 'layer');

  const resolved = layerNodes
    .map(layer => {
      const upstream = incoming.get(layer.id) ?? [];
      const producer = upstream
        .map(ref => nodeById.get(ref.id))
        .find(node => node?.type === 'source' || node?.type === 'intersection');

      if (!producer) return null;

      if (producer.type === 'source') {
        const url = (producer.data as SourceNodeData | undefined)?.url?.trim();
        if (!url) return null;

        return {
          id: layer.id,
          order: 0,
          y: layer.position.y,
          kind: 'source',
          url,
          sourceNodeId: producer.id
        } satisfies RenderLayer;
      }

      const intersectionNodeId = producer.id;

      const inRefs = incoming.get(intersectionNodeId) ?? [];

      const aRef = inRefs.find(ref => ref.handle === 'in-a');
      const bRef = inRefs.find(ref => ref.handle === 'in-b');

      const aNode = aRef ? nodeById.get(aRef.id) : undefined;
      const bNode = bRef ? nodeById.get(bRef.id) : undefined;

      if (aNode?.type !== 'source' || bNode?.type !== 'source') return null;

      const aUrl = (aNode.data as SourceNodeData | undefined)?.url?.trim();
      const bUrl = (bNode.data as SourceNodeData | undefined)?.url?.trim();
      if (!aUrl || !bUrl) return null;
      return {
        id: layer.id,
        order: 0,
        y: layer.position.y,
        kind: 'intersection',
        intersectionNodeId,
        a: { sourceNodeId: aNode.id, url: aUrl },
        b: { sourceNodeId: bNode.id, url: bUrl }
      } satisfies RenderLayer;
    })
    .filter(Boolean) as RenderLayer[];

  resolved.sort((a, b) => a.y - b.y || a.id.localeCompare(b.id));
  return resolved.map((layer, idx) => ({ ...layer, order: idx }));
}

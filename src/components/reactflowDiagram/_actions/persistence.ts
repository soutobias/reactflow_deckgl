import type { Node, Edge } from '@xyflow/react';

const KEY = 'reactflow-deckgl-v1';

export function saveReactflowDiagram(nodes: Node[], edges: Edge[]) {
  localStorage.setItem(KEY, JSON.stringify({ nodes, edges }));
}

export function loadReactflowDiagram(): { nodes: Node[]; edges: Edge[] } | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearReactflowDiagram() {
  localStorage.removeItem(KEY);
}

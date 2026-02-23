'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import BaseNode from './BaseNode';

export type LayerNodeData = Record<string, never>;

type LayerNodeViewProps = {
  preview?: boolean;
  selected?: boolean;
};

function LayerNodeView({ selected, preview = false }: LayerNodeViewProps) {
  return (
    <BaseNode title="Layer" size={160} selected={selected}>
      {!preview && <Handle type="target" position={Position.Left} />}
    </BaseNode>
  );
}

export default function LayerNode(_props: NodeProps) {
  const { selected } = _props as NodeProps & { selected?: boolean };
  return <LayerNodeView selected={selected} />;
}

export function LayerNodePreview() {
  return <LayerNodeView preview />;
}

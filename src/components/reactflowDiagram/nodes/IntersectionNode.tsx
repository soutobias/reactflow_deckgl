'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import BaseNode from './BaseNode';

export type IntersectionNodeData = Record<string, never>;

type IntersectionNodeViewProps = {
  preview?: boolean;
  selected?: boolean;
};

function IntersectionNodeView({ selected, preview = false }: IntersectionNodeViewProps) {
  return (
    <BaseNode title="Intersection" size={160} selected={selected}>
      {!preview && (
        <>
          <Handle id="in-a" type="target" position={Position.Left} style={{ top: 55 }} />
          <Handle id="in-b" type="target" position={Position.Left} style={{ top: 105 }} />
          <Handle id="out" type="source" position={Position.Right} style={{ top: 80 }} />
        </>
      )}
    </BaseNode>
  );
}

export default function IntersectionNode(_props: NodeProps) {
  const { selected } = _props as NodeProps & { selected?: boolean };
  return <IntersectionNodeView selected={selected} />;
}

export function IntersectionNodePreview() {
  return <IntersectionNodeView preview />;
}

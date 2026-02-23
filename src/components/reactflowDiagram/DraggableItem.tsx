'use client';

import '@xyflow/react/dist/style.css';

import { Box } from '@mui/material';
import React from 'react';

import { IntersectionNodePreview } from './nodes/IntersectionNode';
import { LayerNodePreview } from './nodes/LayerNode';
import { SourceNodePreview } from './nodes/SourceNode';

export type NodeType = 'source' | 'layer' | 'intersection';

export default function DraggableItem({ type }: { type: NodeType }) {
  const onDragStart = (evt: React.DragEvent) => {
    evt.dataTransfer.setData('application/reactflow', type);
    evt.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box draggable onDragStart={onDragStart} sx={{ cursor: 'grab', mb: 2, userSelect: 'none' }}>
      {type === 'source' ? (
        <SourceNodePreview />
      ) : type === 'layer' ? (
        <LayerNodePreview />
      ) : (
        <IntersectionNodePreview />
      )}
    </Box>
  );
}

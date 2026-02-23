'use client';

import React from 'react';
import '@xyflow/react/dist/style.css';

import { Box } from '@mui/material';

import { SourceNodePreview } from './nodes/SourceNode';
import { LayerNodePreview } from './nodes/LayerNode';

export default function DraggableItem({ type }: { type: 'source' | 'layer' }) {
  const onDragStart = (evt: React.DragEvent) => {
    evt.dataTransfer.setData('application/reactflow', type);
    evt.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box draggable onDragStart={onDragStart} sx={{ cursor: 'grab', mb: 2, userSelect: 'none' }}>
      {type === 'source' ? <SourceNodePreview /> : <LayerNodePreview />}
    </Box>
  );
}

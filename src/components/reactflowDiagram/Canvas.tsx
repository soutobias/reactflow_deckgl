'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  useReactFlow,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange
} from '@xyflow/react';
import SourceNode, { SourceNodeData } from './nodes/SourceNode';
import LayerNode, { LayerNodeData } from './nodes/LayerNode';
import { AppNode } from './ReactflowCanvas';

const nodeTypes = {
  source: SourceNode,
  layer: LayerNode
};

export default function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  getNewNode
}: {
  nodes: AppNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  getNewNode: (type: string, id: string, position: { x: number; y: number }) => AppNode;
}) {
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => addEdge(connection, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((evt: React.DragEvent) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (evt: React.DragEvent) => {
      evt.preventDefault();
      const type = evt.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });

      const id = crypto.randomUUID();
      setNodes((nds: AppNode[]) => nds.concat(getNewNode(type, id, position)));
    },
    [getNewNode, screenToFlowPosition, setNodes]
  );

  return (
    <div style={{ height: '100%', minWidth: 0 }} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

'use client';

import {
  addEdge,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  useReactFlow
} from '@xyflow/react';
import React, { useCallback } from 'react';

import { NodeType } from './DraggableItem';
import IntersectionNode from './nodes/IntersectionNode';
import LayerNode from './nodes/LayerNode';
import SourceNode from './nodes/SourceNode';
import { AppNode } from './ReactflowCanvas';
import { CanvaContainer } from './styles';

const nodeTypes = {
  source: SourceNode,
  layer: LayerNode,
  intersection: IntersectionNode
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
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  getNewNode: (type: NodeType, id: string, position: { x: number; y: number }) => AppNode;
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
      const type = evt.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });

      const id = crypto.randomUUID();
      setNodes((nds: AppNode[]) => nds.concat(getNewNode(type, id, position)));
    },
    [getNewNode, screenToFlowPosition, setNodes]
  );

  return (
    <CanvaContainer onDrop={onDrop} onDragOver={onDragOver}>
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
    </CanvaContainer>
  );
}

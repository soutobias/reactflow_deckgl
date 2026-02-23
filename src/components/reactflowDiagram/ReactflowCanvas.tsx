'use client';

import '@xyflow/react/dist/style.css';

import { Box } from '@mui/material';
import {
  type Edge,
  type Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from '@xyflow/react';
import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';
import { clearLayers, setLayers } from '@/store/layersSlice';

import { deriveLayers } from './_actions/deriveLayers';
import {
  clearReactflowDiagram,
  loadReactflowDiagram,
  saveReactflowDiagram
} from './_actions/persistence';
import Canvas from './Canvas';
import { NodeType } from './DraggableItem';
import { IntersectionNodeData } from './nodes/IntersectionNode';
import { LayerNodeData } from './nodes/LayerNode';
import { SourceNodeData } from './nodes/SourceNode';
import ReactflowSidebar from './ReactflowSidebar';

export type AppNode = Node<SourceNodeData | LayerNodeData | IntersectionNodeData>;

export default function ReactflowCanvas() {
  const dispatch = useDispatch<AppDispatch>();
  const [hydrated, setHydrated] = React.useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const handleSourceUrlChange = useCallback(
    (id: string, url: string) => {
      setNodes(nds =>
        nds.map(node =>
          node.id === id
            ? { ...node, data: { ...node.data, url, onChange: handleSourceUrlChange } }
            : node
        )
      );
    },
    [setNodes]
  );

  const getNewNode = useCallback(
    (type: NodeType, id: string, position: { x: number; y: number }) => {
      if (type === 'source') {
        return {
          id,
          type,
          position,
          data: { url: '', onChange: handleSourceUrlChange }
        } as AppNode;
      }
      if (type === 'intersection') {
        return { id, type, position, data: {} };
      }
      return { id, type, position, data: {} };
    },
    [handleSourceUrlChange]
  );

  useEffect(() => {
    const saved = loadReactflowDiagram();

    if (saved) {
      const hydrated: AppNode[] = saved.nodes.map(node => {
        if (node.type === 'source') {
          return {
            ...node,
            data: {
              url: (node.data as SourceNodeData)?.url ?? '',
              onChange: handleSourceUrlChange
            }
          } as AppNode;
        }
        return node as AppNode;
      });

      setNodes(hydrated);
      setEdges(saved.edges);
    }
    setHydrated(true);
  }, [handleSourceUrlChange, setEdges, setNodes]);

  useEffect(() => {
    if (!hydrated) return;
    saveReactflowDiagram(nodes, edges);
    dispatch(setLayers(deriveLayers(nodes, edges)));
  }, [nodes, edges, dispatch, hydrated]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);

    clearReactflowDiagram();
    dispatch(clearLayers());
  }, [dispatch, setEdges, setNodes]);

  return (
    <Box sx={{ height: '100%', display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
      <ReactflowSidebar onClear={handleClear} />
      <Box sx={{ height: '100%', minWidth: 0 }}>
        <ReactFlowProvider>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setNodes={setNodes}
            setEdges={setEdges}
            getNewNode={getNewNode}
          />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}

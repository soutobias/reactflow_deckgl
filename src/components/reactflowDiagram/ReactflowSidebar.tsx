'use client';

import '@xyflow/react/dist/style.css';

import { Box, Divider } from '@mui/material';

import Button from '../ui/button';
import DraggableItem from './DraggableItem';

interface ReactflowSidebarProps {
  onClear: () => void;
}

export default function ReactflowSidebar({ onClear }: ReactflowSidebarProps) {
  return (
    <Box
      sx={{
        m: 1,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Box sx={{ display: 'grid', gap: 2 }}>
        <DraggableItem type="source" />
        <DraggableItem type="layer" />
        <DraggableItem type="intersection" />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Divider />

      <Button label="Clear" onClick={onClear} color="error" />
    </Box>
  );
}

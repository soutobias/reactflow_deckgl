'use client';

import { Box } from '@mui/material';

import ReactflowCanvas from '@/components/reactflowDiagram/ReactflowCanvas';
import Button from '@/components/ui/button';

export default function ReactFlowPage() {
  return (
    <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <ReactflowCanvas />
      <Button
        label="Map >"
        href="/map"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16
        }}
      />
    </Box>
  );
}

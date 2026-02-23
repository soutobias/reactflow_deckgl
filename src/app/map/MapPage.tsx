'use client';

import { Box } from '@mui/material';

import DeckMap from '@/components/map/DeckMap';
import Button from '@/components/ui/button';
export default function MapPage() {
  return (
    <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <DeckMap />
      <Button
        label="Back >"
        href="/"
        sx={{
          position: 'absolute',
          top: 16,
          right: 16
        }}
      />
    </Box>
  );
}

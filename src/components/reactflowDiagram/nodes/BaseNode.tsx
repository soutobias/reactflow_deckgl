'use client';

import React from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';

type BaseNodeProps = {
  title: string;
  size?: number;
  selected?: boolean;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};
export default function BaseNode({
  title,
  size = 160,
  selected = false,
  sx,
  children
}: BaseNodeProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: selected ? '' : 'divider',
        borderRadius: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        p: 2,
        transition: 'border-color 0.2s ease',
        ...sx
      }}
    >
      <Typography fontWeight={700}>{title}</Typography>
      {children}
    </Box>
  );
}

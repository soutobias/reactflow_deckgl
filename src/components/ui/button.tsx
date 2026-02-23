'use client';

import { Button as MuiButton } from '@mui/material';
import { type SxProps, type Theme } from '@mui/material';
import Link from 'next/link';

interface ButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export default function Button({
  label,
  href,
  onClick,
  sx,
  variant = 'outlined',
  color = 'primary'
}: ButtonProps) {
  const commonProps = {
    variant: variant,
    color: color,
    sx: {
      zIndex: 10,
      borderRadius: 1,
      textTransform: 'none',
      ...sx
    }
  };

  if (href) {
    return (
      <MuiButton component={Link} href={href} {...commonProps}>
        {label}
      </MuiButton>
    );
  }

  return (
    <MuiButton onClick={onClick} {...commonProps}>
      {label}
    </MuiButton>
  );
}

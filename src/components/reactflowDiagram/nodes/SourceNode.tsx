'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { TextField } from '@mui/material';
import BaseNode from './BaseNode';
import { useMemo } from 'react';

export type SourceNodeData = {
  url: string;
  onChange: (id: string, url: string) => void;
};

type SourceNodeViewProps = {
  id: string;
  url: string;
  onChange?: (id: string, url: string) => void;
  preview?: boolean;
  selected?: boolean;
};

export function isValidUrl(value: string) {
  if (!value) return false;
  try {
    new URL(value, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    return true;
  } catch {
    return false;
  }
}

function SourceNodeView({ id, url, onChange, selected, preview = false }: SourceNodeViewProps) {
  const isValid = useMemo(() => isValidUrl(url), [url]);

  return (
    <BaseNode title="Source" size={160} selected={selected}>
      <TextField
        label="URL"
        size="small"
        fullWidth
        disabled={preview}
        value={url}
        helperText={!isValid ? 'Enter a valid URL (https://...)' : ' '}
        onChange={e => onChange?.(id, e.target.value)}
        placeholder="https://..."
      />

      {!preview && <Handle type="source" position={Position.Right} />}
    </BaseNode>
  );
}

export default function SourceNode(props: NodeProps) {
  const { id, data, selected } = props as NodeProps & { data: SourceNodeData };

  return <SourceNodeView id={id} url={data.url} onChange={data.onChange} selected={selected} />;
}
export function SourceNodePreview() {
  return <SourceNodeView id="preview" url="" preview />;
}

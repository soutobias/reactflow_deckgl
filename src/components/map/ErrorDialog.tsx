'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';

type ErrorDialogProps = {
  open: boolean;
  urls: string[];
  onClose: () => void;
};

export default function ErrorDialog({ open, urls, onClose }: ErrorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Some layers could not be loaded</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          These URLs are invalid or returned invalid GeoJSON:
        </Typography>

        {urls.length === 0 ? (
          <Typography variant="body2">No errors.</Typography>
        ) : (
          <List dense>
            {urls.map(url => (
              <ListItem key={url} disableGutters>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      <code>{url}</code>
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

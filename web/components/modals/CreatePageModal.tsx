import { useState } from 'react';
import { PageType } from '@/lib/store';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { Kanban, Table as TableIcon, FileText } from 'lucide-react';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: PageType) => void;
}

export function CreatePageModal({ isOpen, onClose, onSubmit }: CreatePageModalProps) {
  const [title, setTitle] = useState('');
  const [pageType, setPageType] = useState<PageType>('document');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim(), pageType);
      setTitle('');
      setPageType('document');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setPageType('document');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Page</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Page Title"
          type="text"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mb: 2 }}
        />
        
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Document Type
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={pageType === 'board' ? 'contained' : 'outlined'}
            onClick={() => setPageType('board')}
            startIcon={<Kanban size={18} />}
            sx={{ flex: 1 }}
          >
            Board
          </Button>
          <Button
            variant={pageType === 'table' ? 'contained' : 'outlined'}
            onClick={() => setPageType('table')}
            startIcon={<TableIcon size={18} />}
            sx={{ flex: 1 }}
          >
            Table
          </Button>
          <Button
            variant={pageType === 'document' ? 'contained' : 'outlined'}
            onClick={() => setPageType('document')}
            startIcon={<FileText size={18} />}
            sx={{ flex: 1 }}
          >
            Document
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

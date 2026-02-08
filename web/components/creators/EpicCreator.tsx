"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box
} from '@mui/material';

interface EpicCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { useAuth } from '@/contexts/AuthContext';

export function EpicCreator({ open, onClose, onSubmit, initialData }: EpicCreatorProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    epic: '',
    description: '',
    startDate: '',
    dueDate: '',
    owner: {
      id: '',
      name: '',
      email: ''
    },
    phase: 'Backlog',
    priority: 'Nice to Have',
    hierarchy: 0
  });

  // Format dates for input type="date" (YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Load initial data when available
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        epic: initialData.epic || '',
        description: initialData.description || '',
        startDate: formatDate(initialData.startDate),
        dueDate: formatDate(initialData.dueDate),
        owner: initialData.owner || { id: '', name: '', email: '' },
        phase: initialData.phase || 'Backlog',
        priority: initialData.priority || 'Nice to Have',
        hierarchy: initialData.hierarchy || 0
      });
    } else if (open && user && !initialData) {
      setFormData(prev => ({
        ...prev,
        owner: {
          id: user.uid,
          name: user.displayName || 'Unknown User',
          email: user.email || ''
        }
      }));
    }
  }, [user, open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure owner is set correctly
    const ownerData = {
      id: user?.uid || '1',
      name: user?.displayName || 'Current User',
      email: user?.email || 'user@example.com'
    };

    const submissionData: any = {
      ...formData,
      owner: initialData ? formData.owner : (formData.owner.id ? formData.owner : ownerData)
    };

    if (initialData?._id) {
      submissionData._id = initialData._id;
    }

    onSubmit(submissionData);

    setFormData({
      epic: '',
      description: '',
      startDate: '',
      dueDate: '',
      owner: {
        id: '',
        name: '',
        email: ''
      },
      phase: 'Backlog',
      priority: 'Nice to Have',
      hierarchy: 0
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Epic' : 'Create New Epic'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Epic Name"
              value={formData.epic}
              onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
              required
              fullWidth
              placeholder="e.g., User Authentication System"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Detailed description of the epic..."
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              select
              label="Phase"
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
              fullWidth
            >
              <MenuItem value="Product discovery">Product discovery</MenuItem>
              <MenuItem value="Backlog">Backlog</MenuItem>
              <MenuItem value="Dev WIP">Dev WIP</MenuItem>
              <MenuItem value="Nice to Have">Nice to Have</MenuItem>
              <MenuItem value="Best Effort">Best Effort</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              fullWidth
            >
              <MenuItem value="Must Have">Must Have</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="Nice to Have">Nice to Have</MenuItem>
            </TextField>

            <TextField
              select
              label="Hierarchy Level"
              value={formData.hierarchy}
              onChange={(e) => setFormData({ ...formData, hierarchy: parseInt(e.target.value) })}
              fullWidth
              helperText="0 = Top level, 1 = Sub-epic, 2 = Sub-sub-epic"
            >
              <MenuItem value={0}>Top Level (0)</MenuItem>
              <MenuItem value={1}>Sub-epic (1)</MenuItem>
              <MenuItem value={2}>Sub-sub-epic (2)</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Update Epic' : 'Create Epic'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
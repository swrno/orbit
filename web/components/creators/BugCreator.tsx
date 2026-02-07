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

interface BugCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { useAuth } from '@/contexts/AuthContext';

export function BugCreator({ open, onClose, onSubmit, initialData }: BugCreatorProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    bug: '',
    description: '',
    dueDate: '',
    reporter: {
      id: '',
      name: '',
      email: ''
    },
    status: 'Awaiting Review',
    priority: 'Medium',
    group: 'Incoming Bugs'
  });

  // Load initial data when available
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        bug: initialData.bug || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        reporter: initialData.reporter || { id: '', name: '', email: '' },
        status: initialData.status || 'Awaiting Review',
        priority: initialData.priority || 'Medium',
        group: initialData.group || 'Incoming Bugs'
      });
    } else if (open && user && !initialData) {
      // Only set default reporter if NOT editing
      setFormData(prev => ({
        ...prev,
        reporter: {
          id: user.uid,
          name: user.displayName || 'Unknown User',
          email: user.email || ''
        }
      }));
    }
  }, [user, open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData: any = {
      ...formData,
      // If editing, keep original reporter unless it was empty/invalid
      reporter: initialData ? formData.reporter : {
        id: user?.uid || 'anonymous',
        name: user?.displayName || 'Unknown User',
        email: user?.email || ''
      }
    };

    // Pass back existing ID if editing
    if (initialData?._id) {
      submissionData._id = initialData._id;
    }

    onSubmit(submissionData);

    // Reset form
    setFormData({
      bug: '',
      description: '',
      dueDate: '',
      reporter: {
        id: '',
        name: '',
        email: ''
      },
      status: 'Awaiting Review',
      priority: 'Medium',
      group: 'Incoming Bugs'
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Bug' : 'Report New Bug'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.bug}
              onChange={(e) => setFormData({ ...formData, bug: e.target.value })}
              required
              fullWidth
              placeholder="Brief summary of the bug"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Detailed description..."
            />

            <TextField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              fullWidth
            >
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="Awaiting Review">Awaiting Review</MenuItem>
              <MenuItem value="Pending Review">Pending Review</MenuItem>
              <MenuItem value="Ready for Dev">Ready for Dev</MenuItem>
              <MenuItem value="Fixed">Fixed</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </TextField>

            <TextField
              select
              label="Group"
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              fullWidth
            >
              <MenuItem value="Incoming Bugs">Incoming Bugs</MenuItem>
              <MenuItem value="Development Work">Development Work</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Update Bug' : 'Create Bug'}</Button>
        </DialogActions>
      </form>
    </Dialog >
  );
}
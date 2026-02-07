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
  Box,
  Typography
} from '@mui/material';

interface SprintCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { useAuth } from '@/contexts/AuthContext';

export function SprintCreator({ open, onClose, onSubmit, initialData }: SprintCreatorProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    sprint: '',
    sprintGoals: '',
    activeSprintStatus: 'Planned',
    sprintStartDate: '',
    sprintEndDate: ''
  });

  // Load initial data when available
  // Format dates for input type="date" (YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        sprint: initialData.sprint || '',
        sprintGoals: initialData.sprintGoals || '',
        activeSprintStatus: initialData.activeSprintStatus || 'Planned',
        sprintStartDate: formatDate(initialData.sprintStartDate),
        sprintEndDate: formatDate(initialData.sprintEndDate)
      });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only set owner if creating new sprint, or if specifically needed for updates (logic depends on requirements)
    // For now, consistent with other creators, we supply owner context but don't force overwrite if it exists on backend
    const ownerData = {
      id: user?.uid || '1',
      name: user?.displayName || 'Current User',
      email: user?.email || 'user@example.com'
    };

    const submissionData = {
      ...formData,
      owner: initialData && initialData.owner ? initialData.owner : ownerData
    };

    if (initialData?._id) {
      submissionData._id = initialData._id;
    }

    onSubmit(submissionData);

    setFormData({
      sprint: '',
      sprintGoals: '',
      activeSprintStatus: 'Planned',
      sprintStartDate: '',
      sprintEndDate: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Sprint' : 'Create New Sprint'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Sprint Name"
              value={formData.sprint}
              onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
              required
              fullWidth
              placeholder="e.g., Sprint 1"
            />
            
            <TextField
              label="Sprint Goals"
              value={formData.sprintGoals}
              onChange={(e) => setFormData({ ...formData, sprintGoals: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="What are the goals for this sprint?"
            />

            <TextField
              select
              label="Status"
              value={formData.activeSprintStatus}
              onChange={(e) => setFormData({ ...formData, activeSprintStatus: e.target.value })}
              fullWidth
            >
              <MenuItem value="Planned">Planned</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={formData.sprintStartDate}
                onChange={(e) => setFormData({ ...formData, sprintStartDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="End Date"
                type="date"
                value={formData.sprintEndDate}
                onChange={(e) => setFormData({ ...formData, sprintEndDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Update Sprint' : 'Create Sprint'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

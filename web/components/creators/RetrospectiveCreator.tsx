"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox
} from '@mui/material';

interface RetrospectiveCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

import { useAuth } from '@/contexts/AuthContext';

export function RetrospectiveCreator({ open, onClose, onSubmit, initialData }: RetrospectiveCreatorProps) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    feedback: '',
    type: 'Keep',
    repeating: false,
    sprint: 'Sprint 1',
    owner: {
      id: '',
      name: '',
      email: ''
    }
  });

  // Load initial data when available
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        feedback: initialData.feedback || '',
        type: initialData.type || 'Keep',
        repeating: initialData.repeating || false,
        sprint: initialData.sprint || 'Sprint 1',
        owner: initialData.owner || { id: '', name: '', email: '' }
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

    const userData = {
      id: user?.uid || 'anonymous',
      name: user?.displayName || 'Unknown User',
      email: user?.email || '',
      avatar: user?.photoURL || ''
    };

    const submissionData: any = {
      ...formData,
      // If editing, keep original owner unless it was empty/invalid
      owner: initialData ? formData.owner : (formData.owner.id ? formData.owner : userData),
      // Keep original submitter if editing
      submitter: initialData ? initialData.submitter : userData
    };

    if (initialData?._id) {
      submissionData._id = initialData._id;
    }

    onSubmit(submissionData);

    setFormData({
      feedback: '',
      type: 'Keep',
      repeating: false,
      sprint: 'Sprint 1',
      owner: {
        id: '',
        name: '',
        email: ''
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Retrospective Feedback' : 'Add Retrospective Feedback'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Feedback"
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              required
              fullWidth
              multiline
              rows={3}
              placeholder="What went well? What didn't?"
            />

            <TextField
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
            >
              <MenuItem value="Keep">Keep (Went Well)</MenuItem>
              <MenuItem value="Improve">Improve (Needs Work)</MenuItem>
              <MenuItem value="Discussion">Discussion</MenuItem>
            </TextField>

            <TextField
              label="Sprint"
              value={formData.sprint}
              onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
              fullWidth
              placeholder="e.g., Sprint 1"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.repeating}
                  onChange={(e) => setFormData({ ...formData, repeating: e.target.checked })}
                />
              }
              label="Repeating Item?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Update Feedback' : 'Add Feedback'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
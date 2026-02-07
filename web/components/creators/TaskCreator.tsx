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
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';

interface TaskCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  workspaceId: string;
  pageId: string;
  teamId: string | null;
  initialData?: any;
}

import { useAuth } from '@/contexts/AuthContext';

export function TaskCreator({ open, onClose, onSubmit, workspaceId, pageId, teamId, initialData }: TaskCreatorProps) {
  const { user } = useAuth();

  const [sprints, setSprints] = useState<any[]>([]);
  const [epics, setEpics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    task: '',
    owner: {
      id: '',
      name: '',
      email: ''
    },
    status: 'Ready to start',
    type: 'Feature',
    estimatedSP: 1,
    sprint: '',
    epic: '',
    githubLink: ''
  });

  // Load initial data when available
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        task: initialData.task || '',
        owner: initialData.owner || { id: '', name: '', email: '' },
        status: initialData.status || 'Ready to start',
        type: initialData.type || 'Feature',
        estimatedSP: initialData.estimatedSP || 1,
        sprint: initialData.sprint || '',
        epic: initialData.epic || '',
        githubLink: initialData.githubLink || ''
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

  useEffect(() => {
    if (open) {
      fetchSprintsAndEpics();
    }
  }, [open, workspaceId, pageId, teamId]);

  const fetchSprintsAndEpics = async () => {
    try {
      setLoading(true);
      const teamQuery = teamId ? `&teamId=${teamId}` : '';
      const [sprintsRes, epicsRes] = await Promise.all([
        fetch(`/api/sprints?workspaceId=${workspaceId}&pageId=${pageId}${teamQuery}`),
        fetch(`/api/epics?workspaceId=${workspaceId}&pageId=${pageId}${teamQuery}`)
      ]);

      const sprintsData = await sprintsRes.json();
      const epicsData = await epicsRes.json();

      if (sprintsData.success) setSprints(sprintsData.data);
      if (epicsData.success) setEpics(epicsData.data);
    } catch (error) {
      console.error('Error fetching sprints/epics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure owner is set correctly
    const ownerData = {
      id: user?.uid || '1',
      name: user?.displayName || 'Current User',
      email: user?.email || 'user@example.com'
    };

    const submissionData = {
      ...formData,
      owner: initialData ? formData.owner : (formData.owner.id ? formData.owner : ownerData)
    };

    if (initialData?._id) {
      submissionData._id = initialData._id;
    }

    onSubmit(submissionData);
    
    setFormData({
      task: '',
      owner: {
        id: '',
        name: '',
        email: ''
      },
      status: 'Ready to start',
      type: 'Feature',
      estimatedSP: 1,
      sprint: '',
      epic: '',
      githubLink: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Task Name"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              required
              fullWidth
              placeholder="e.g., Implement login page"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="Ready to start">Ready to start</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </TextField>

              <TextField
                select
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                fullWidth
              >
                <MenuItem value="Feature">Feature</MenuItem>
                <MenuItem value="Bug">Bug</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Estimated SP"
                type="number"
                value={formData.estimatedSP}
                onChange={(e) => setFormData({ ...formData, estimatedSP: parseInt(e.target.value) })}
                fullWidth
              />
              
              <FormControl fullWidth>
                <InputLabel>Sprint</InputLabel>
                <Select
                  value={formData.sprint}
                  label="Sprint"
                  onChange={(e) => setFormData({ ...formData, sprint: e.target.value as string })}
                >
                  <MenuItem value="">
                    <em>No Sprint</em>
                  </MenuItem>
                  {sprints.map((sprint) => (
                    <MenuItem key={sprint._id || sprint.id} value={sprint.sprint}>
                      {sprint.sprint}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Epic</InputLabel>
              <Select
                value={formData.epic}
                label="Epic"
                onChange={(e) => setFormData({ ...formData, epic: e.target.value as string })}
              >
                <MenuItem value="">
                  <em>No Epic</em>
                </MenuItem>
                {epics.map((epic) => (
                  <MenuItem key={epic._id || epic.id} value={epic.epic}>
                    {epic.epic}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="GitHub Link"
              value={formData.githubLink}
              onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
              fullWidth
              placeholder="https://github.com/..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Update Task' : 'Create Task'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

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
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip
} from '@mui/material';
import { CheckCircle2, AlertTriangle, MessageSquare, RefreshCw } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface RetrospectiveCreatorProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const TYPE_CONFIG: Record<string, { icon: any, color: string, label: string, desc: string }> = {
  "Keep": { icon: CheckCircle2, color: "#00c875", label: "Keep", desc: "What went right?" },
  "Improve": { icon: AlertTriangle, color: "#ff6b00", label: "Improve", desc: "What needs work?" },
  "Discussion": { icon: MessageSquare, color: "#fdab3d", label: "Discuss", desc: "Topics to discuss" }
};

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
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      feedback: '',
      type: 'Keep',
      repeating: false,
      sprint: 'Sprint 1',
      owner: { id: '', name: '', email: '' }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, padding: 1 }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', pb: 1 }}>
          {initialData ? 'Edit Feedback' : 'New Retrospective Feedback'}
        </DialogTitle>
        <DialogContent sx={{ overflowY: 'visible' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#676879' }}>What kind of feedback is this?</Typography>
              <ToggleButtonGroup
                value={formData.type}
                exclusive
                onChange={(e, newType) => newType && setFormData({ ...formData, type: newType })}
                fullWidth
                sx={{ gap: 2 }}
              >
                {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = formData.type === key;
                  return (
                    <ToggleButton
                      key={key}
                      value={key}
                      sx={{
                        borderRadius: '8px !important',
                        border: `1px solid ${isSelected ? config.color : '#e6e9ef'} !important`,
                        bgcolor: isSelected ? `${config.color}15 !important` : 'white',
                        py: 2,
                        flexDirection: 'column',
                        gap: 1,
                        textTransform: 'none',
                        flex: 1
                      }}
                    >
                      <Icon size={24} color={isSelected ? config.color : '#676879'} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: isSelected ? config.color : '#323338' }}>{config.label}</Typography>
                        <Typography sx={{ fontSize: '11px', color: '#676879' }}>{config.desc}</Typography>
                      </Box>
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#676879' }}>Your Feedback</Typography>
              <TextField
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                required
                fullWidth
                multiline
                rows={4}
                placeholder="Share your thoughts..."
                variant="outlined"
                sx={{
                  bgcolor: '#f9f9fb',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#e6e9ef' },
                    '&.Mui-focused fieldset': { borderColor: '#0073ea' },
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: '#676879', display: 'block' }}>Sprint</Typography>
                <TextField
                  size="small"
                  value={formData.sprint}
                  onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
                  fullWidth
                  placeholder="Sprint 1"
                  sx={{ bgcolor: '#f9f9fb', '& fieldset': { borderColor: '#e6e9ef' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.repeating}
                      onChange={(e) => setFormData({ ...formData, repeating: e.target.checked })}
                      icon={<RefreshCw size={20} color="#9aa0a6" />}
                      checkedIcon={<RefreshCw size={20} color="#0073ea" />}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '14px', color: formData.repeating ? '#0073ea' : '#676879', fontWeight: 500 }}>
                      Repeating Item
                    </Typography>
                  }
                />
              </Box>
            </Box>

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} sx={{ color: '#676879', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: TYPE_CONFIG[formData.type]?.color || '#0073ea',
              '&:hover': { bgcolor: TYPE_CONFIG[formData.type]?.color || '#0062c6', opacity: 0.9 },
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {initialData ? 'Update Feedback' : 'Add Feedback'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
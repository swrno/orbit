"use client";

import { useAppStore, Label } from "@/lib/store";
import {
    Box, Typography, Button, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Paper
} from "@mui/material";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import { useState } from "react";

interface LabelManagementProps {
    workspaceId: string;
}

const PRESET_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#84cc16', // Lime
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#6b7280', // Gray
];

export function LabelManagement({ workspaceId }: LabelManagementProps) {
    const { workspaces, addLabel, updateLabel, deleteLabel } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);

    if (!workspace) return null;

    const handleAdd = () => {
        if (name.trim()) {
            addLabel(workspaceId, { name: name.trim(), color });
            closeDialog();
        }
    };

    const handleUpdate = () => {
        if (editingLabel && name.trim()) {
            updateLabel(workspaceId, editingLabel.id, { name: name.trim(), color });
            closeDialog();
        }
    };

    const handleDelete = (labelId: string) => {
        if (confirm('Delete this label? It will be removed from all tasks.')) {
            deleteLabel(workspaceId, labelId);
        }
    };

    const openEdit = (label: Label) => {
        setEditingLabel(label);
        setName(label.name);
        setColor(label.color);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingLabel(null);
        setName('');
        setColor(PRESET_COLORS[0]);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Labels
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setDialogOpen(true)}
                >
                    Add Label
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                {workspace.labels.length > 0 ? (
                    <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {workspace.labels.map((label) => (
                            <Box
                                key={label.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    px: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: label.color,
                                        boxShadow: `0 2px 8px ${label.color}30`
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: label.color
                                    }}
                                />
                                <Typography variant="body2" fontWeight={500}>
                                    {label.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                    <IconButton size="small" onClick={() => openEdit(label)}>
                                        <Edit2 size={14} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(label.id)}>
                                        <Trash2 size={14} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Tag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <Typography variant="h6" gutterBottom>
                            No Labels Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create labels to categorize and filter your tasks.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setDialogOpen(true)}
                        >
                            Create First Label
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
                <DialogTitle>{editingLabel ? 'Edit Label' : 'Create New Label'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Label Name"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Bug, Feature, Enhancement"
                        />
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Color
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {PRESET_COLORS.map((presetColor) => (
                                    <Box
                                        key={presetColor}
                                        onClick={() => setColor(presetColor)}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 1,
                                            bgcolor: presetColor,
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: color === presetColor ? 'text.primary' : 'transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                        {/* Preview */}
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Preview
                            </Typography>
                            <Chip
                                label={name || 'Label Name'}
                                sx={{
                                    bgcolor: `${color}20`,
                                    color: color,
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="inherit">Cancel</Button>
                    <Button
                        onClick={editingLabel ? handleUpdate : handleAdd}
                        variant="contained"
                        disabled={!name.trim()}
                    >
                        {editingLabel ? 'Save Changes' : 'Create Label'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

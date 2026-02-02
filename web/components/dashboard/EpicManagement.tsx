"use client";

import { useAppStore, Epic } from "@/lib/store";
import {
    Box, Paper, Typography, Button, IconButton, Chip, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, FormControl, InputLabel, MenuItem, Avatar, Tooltip,
    Menu, ListItemIcon, ListItemText
} from "@mui/material";
import {
    Plus, MoreVertical, Trash2, Edit, Target, Calendar,
    ChevronRight, Check, Layers
} from "lucide-react";
import { useState, useMemo } from "react";

interface EpicManagementProps {
    workspaceId: string;
}

const EPIC_COLORS = [
    '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const STATUS_CONFIG = {
    'To Do': { color: '#64748b', bgColor: '#f1f5f9' },
    'In Progress': { color: '#f59e0b', bgColor: '#fef3c7' },
    'Done': { color: '#10b981', bgColor: '#d1fae5' },
};

export function EpicManagement({ workspaceId }: EpicManagementProps) {
    const {
        workspaces,
        addEpic,
        updateEpic,
        deleteEpic
    } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; epic: Epic } | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(EPIC_COLORS[0]);
    const [status, setStatus] = useState<Epic['status']>('To Do');
    const [startDate, setStartDate] = useState('');
    const [targetDate, setTargetDate] = useState('');

    if (!workspace) return null;

    // Calculate epic progress for each epic
    const epicStats = useMemo(() => {
        const stats: Record<string, { total: number; done: number; points: number; completedPoints: number }> = {};
        workspace.epics?.forEach(epic => {
            const epicTasks = workspace.tasks.filter(t => t.epicId === epic.id);
            const doneTasks = epicTasks.filter(t => t.status === 'Done');
            stats[epic.id] = {
                total: epicTasks.length,
                done: doneTasks.length,
                points: epicTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0),
                completedPoints: doneTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0),
            };
        });
        return stats;
    }, [workspace]);

    const handleCreate = () => {
        if (name.trim()) {
            addEpic(workspaceId, {
                name: name.trim(),
                description: description || undefined,
                color,
                status,
                startDate: startDate || undefined,
                targetDate: targetDate || undefined,
            });
            closeDialog();
        }
    };

    const handleUpdate = () => {
        if (editingEpic && name.trim()) {
            updateEpic(workspaceId, editingEpic.id, {
                name: name.trim(),
                description: description || undefined,
                color,
                status,
                startDate: startDate || undefined,
                targetDate: targetDate || undefined,
            });
            closeDialog();
        }
    };

    const handleDelete = () => {
        if (menuAnchor?.epic && confirm(`Delete epic "${menuAnchor.epic.name}"? Tasks will be unlinked.`)) {
            deleteEpic(workspaceId, menuAnchor.epic.id);
        }
        setMenuAnchor(null);
    };

    const openEdit = (epic: Epic) => {
        setEditingEpic(epic);
        setName(epic.name);
        setDescription(epic.description || '');
        setColor(epic.color);
        setStatus(epic.status);
        setStartDate(epic.startDate || '');
        setTargetDate(epic.targetDate || '');
        setDialogOpen(true);
        setMenuAnchor(null);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingEpic(null);
        setName('');
        setDescription('');
        setColor(EPIC_COLORS[0]);
        setStatus('To Do');
        setStartDate('');
        setTargetDate('');
    };

    const getProgress = (epicId: string) => {
        const s = epicStats[epicId];
        if (!s || s.total === 0) return 0;
        return Math.round((s.done / s.total) * 100);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Target size={24} />
                    <Typography variant="h5" fontWeight={600}>
                        Epics
                    </Typography>
                    <Chip label={`${workspace.epics?.length || 0} epics`} size="small" />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setDialogOpen(true)}
                >
                    Create Epic
                </Button>
            </Box>

            {workspace.epics && workspace.epics.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {workspace.epics.map((epic) => {
                        const stats = epicStats[epic.id] || { total: 0, done: 0, points: 0, completedPoints: 0 };
                        const progress = getProgress(epic.id);

                        return (
                            <Paper
                                key={epic.id}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    borderLeft: `4px solid ${epic.color}`,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    {/* Epic Icon */}
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1.5,
                                            bgcolor: `${epic.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Target size={20} color={epic.color} />
                                    </Box>

                                    {/* Epic Details */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                {epic.key}
                                            </Typography>
                                            <Chip
                                                label={epic.status}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                    bgcolor: STATUS_CONFIG[epic.status].bgColor,
                                                    color: STATUS_CONFIG[epic.status].color
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                                            {epic.name}
                                        </Typography>
                                        {epic.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                                {epic.description}
                                            </Typography>
                                        )}

                                        {/* Progress */}
                                        <Box sx={{ mb: 1.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {stats.done} of {stats.total} tasks complete
                                                </Typography>
                                                <Typography variant="caption" fontWeight={600} color={progress === 100 ? 'success.main' : 'text.secondary'}>
                                                    {progress}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: 'action.hover',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: progress === 100 ? 'success.main' : epic.color,
                                                        borderRadius: 3
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Stats Row */}
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Layers size={14} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {stats.completedPoints}/{stats.points} SP
                                                </Typography>
                                            </Box>
                                            {epic.startDate && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar size={14} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(epic.startDate).toLocaleDateString()}
                                                    </Typography>
                                                    {epic.targetDate && (
                                                        <>
                                                            <ChevronRight size={12} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(epic.targetDate).toLocaleDateString()}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Actions */}
                                    <IconButton
                                        size="small"
                                        onClick={(e) => setMenuAnchor({ el: e.currentTarget, epic })}
                                    >
                                        <MoreVertical size={18} />
                                    </IconButton>
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                        No Epics Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create epics to group related tasks and track larger initiatives.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setDialogOpen(true)}
                    >
                        Create First Epic
                    </Button>
                </Paper>
            )}

            {/* Action Menu */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem onClick={() => menuAnchor && openEdit(menuAnchor.epic)}>
                    <ListItemIcon><Edit size={16} /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                {menuAnchor?.epic.status !== 'Done' && (
                    <MenuItem onClick={() => {
                        if (menuAnchor) {
                            updateEpic(workspaceId, menuAnchor.epic.id, { status: 'Done' });
                            setMenuAnchor(null);
                        }
                    }}>
                        <ListItemIcon><Check size={16} color="green" /></ListItemIcon>
                        <ListItemText>Mark Complete</ListItemText>
                    </MenuItem>
                )}
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon><Trash2 size={16} color="red" /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingEpic ? 'Edit Epic' : 'Create Epic'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Epic Name"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., User Authentication System"
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this epic..."
                        />

                        {/* Color Picker */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Color
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {EPIC_COLORS.map((c) => (
                                    <Box
                                        key={c}
                                        onClick={() => setColor(c)}
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 1,
                                            bgcolor: c,
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: color === c ? 'text.primary' : 'transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': { transform: 'scale(1.1)' }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                native
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Epic['status'])}
                                label="Status"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                fullWidth
                                size="small"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Target Date"
                                type="date"
                                fullWidth
                                size="small"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="inherit">Cancel</Button>
                    <Button onClick={editingEpic ? handleUpdate : handleCreate} variant="contained" disabled={!name.trim()}>
                        {editingEpic ? 'Save Changes' : 'Create Epic'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

"use client";

import { useAppStore, Sprint, Task } from "@/lib/store";
import {
    Box, Paper, Typography, Button, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    LinearProgress, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from "@mui/material";
import {
    Plus, Play, CheckCircle, MoreVertical, Calendar, Target,
    TrendingUp, Clock, Trash2, Edit, Archive
} from "lucide-react";
import { useState } from "react";

interface SprintManagementProps {
    workspaceId: string;
}

export function SprintManagement({ workspaceId }: SprintManagementProps) {
    const {
        workspaces,
        addSprint,
        updateSprint,
        deleteSprint,
        startSprint,
        completeSprint
    } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
    const [sprintName, setSprintName] = useState('');
    const [sprintGoal, setSprintGoal] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; sprint: Sprint } | null>(null);

    if (!workspace) return null;

    const activeSprint = workspace.sprints.find(s => s.status === 'active');
    const planningSprints = workspace.sprints.filter(s => s.status === 'planning');
    const completedSprints = workspace.sprints.filter(s => s.status === 'completed');

    // Get sprint stats
    const getSprintStats = (sprintId: string) => {
        const tasks = workspace.tasks.filter(t => t.sprintId === sprintId);
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const totalPoints = tasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const completedPoints = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

        return { totalTasks, completedTasks, totalPoints, completedPoints, progress };
    };

    // Calculate days remaining
    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const handleOpenCreateDialog = () => {
        setSprintName(`Sprint ${workspace.sprints.length + 1}`);
        setSprintGoal('');
        // Set default dates (2 week sprint starting tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const twoWeeksLater = new Date(tomorrow);
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 13);
        setStartDate(tomorrow.toISOString().split('T')[0]);
        setEndDate(twoWeeksLater.toISOString().split('T')[0]);
        setCreateDialogOpen(true);
    };

    const handleCreateSprint = () => {
        if (sprintName.trim() && startDate && endDate) {
            addSprint(workspaceId, {
                name: sprintName,
                goal: sprintGoal || undefined,
                startDate,
                endDate,
                status: 'planning',
                velocity: 0
            });
            setCreateDialogOpen(false);
            resetForm();
        }
    };

    const handleEditSprint = () => {
        if (editingSprint && sprintName.trim() && startDate && endDate) {
            updateSprint(workspaceId, editingSprint.id, {
                name: sprintName,
                goal: sprintGoal || undefined,
                startDate,
                endDate,
            });
            setEditingSprint(null);
            resetForm();
        }
    };

    const resetForm = () => {
        setSprintName('');
        setSprintGoal('');
        setStartDate('');
        setEndDate('');
    };

    const handleStartSprint = (sprintId: string) => {
        if (activeSprint) {
            if (confirm('Starting this sprint will complete the current active sprint. Continue?')) {
                startSprint(workspaceId, sprintId);
            }
        } else {
            startSprint(workspaceId, sprintId);
        }
        setMenuAnchor(null);
    };

    const handleCompleteSprint = (sprintId: string) => {
        if (confirm('Complete this sprint? Incomplete tasks will be moved to backlog.')) {
            completeSprint(workspaceId, sprintId);
        }
        setMenuAnchor(null);
    };

    const handleDeleteSprint = (sprintId: string) => {
        if (confirm('Delete this sprint? Tasks will be moved to backlog.')) {
            deleteSprint(workspaceId, sprintId);
        }
        setMenuAnchor(null);
    };

    const openEditDialog = (sprint: Sprint) => {
        setEditingSprint(sprint);
        setSprintName(sprint.name);
        setSprintGoal(sprint.goal || '');
        setStartDate(sprint.startDate);
        setEndDate(sprint.endDate);
        setMenuAnchor(null);
    };

    const SprintCard = ({ sprint, isActive = false }: { sprint: Sprint; isActive?: boolean }) => {
        const stats = getSprintStats(sprint.id);
        const daysRemaining = getDaysRemaining(sprint.endDate);

        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: isActive ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        borderColor: 'primary.light',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }
                }}
            >
                {/* Active Indicator */}
                {isActive && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            bgcolor: 'primary.main'
                        }}
                    />
                )}

                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600}>
                                {sprint.name}
                            </Typography>
                            <Chip
                                label={sprint.status === 'active' ? 'Active' : sprint.status === 'completed' ? 'Completed' : 'Planning'}
                                size="small"
                                sx={{
                                    height: 22,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    bgcolor: sprint.status === 'active' ? '#dcfce7' : sprint.status === 'completed' ? '#e0e7ff' : '#fef3c7',
                                    color: sprint.status === 'active' ? '#166534' : sprint.status === 'completed' ? '#3730a3' : '#92400e'
                                }}
                            />
                        </Box>
                        {sprint.goal && (
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Target size={14} />
                                {sprint.goal}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        size="small"
                        onClick={(e) => setMenuAnchor({ el: e.currentTarget, sprint })}
                    >
                        <MoreVertical size={18} />
                    </IconButton>
                </Box>

                {/* Date Range */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                    <Calendar size={14} />
                    <Typography variant="caption">
                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </Typography>
                    {sprint.status === 'active' && daysRemaining > 0 && (
                        <Chip
                            label={`${daysRemaining} days left`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', ml: 'auto' }}
                        />
                    )}
                </Box>

                {/* Progress */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            {stats.progress}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={stats.progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: sprint.status === 'completed' ? 'success.main' : 'primary.main'
                            }
                        }}
                    />
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color={stats.completedTasks === stats.totalTasks && stats.totalTasks > 0 ? 'success.main' : 'text.primary'}>
                            {stats.completedTasks}/{stats.totalTasks}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Tasks</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                            {stats.completedPoints}/{stats.totalPoints}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Story Points</Typography>
                    </Box>
                    {sprint.velocity !== undefined && sprint.velocity > 0 && (
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TrendingUp size={18} />
                                {sprint.velocity}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Velocity</Typography>
                        </Box>
                    )}
                </Box>

                {/* Actions */}
                {sprint.status === 'planning' && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Play size={16} />}
                            onClick={() => handleStartSprint(sprint.id)}
                            fullWidth
                        >
                            Start Sprint
                        </Button>
                    </Box>
                )}
                {sprint.status === 'active' && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CheckCircle size={16} />}
                            onClick={() => handleCompleteSprint(sprint.id)}
                            fullWidth
                        >
                            Complete Sprint
                        </Button>
                    </Box>
                )}
            </Paper>
        );
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Sprint Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleOpenCreateDialog}
                >
                    Create Sprint
                </Button>
            </Box>

            {/* Active Sprint */}
            {activeSprint && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={16} />
                        Active Sprint
                    </Typography>
                    <SprintCard sprint={activeSprint} isActive />
                </Box>
            )}

            {/* Planning Sprints */}
            {planningSprints.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Upcoming Sprints ({planningSprints.length})
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                        {planningSprints.map(sprint => (
                            <SprintCard key={sprint.id} sprint={sprint} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Completed Sprints */}
            {completedSprints.length > 0 && (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Archive size={16} />
                        Completed Sprints ({completedSprints.length})
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {completedSprints.map(sprint => (
                            <SprintCard key={sprint.id} sprint={sprint} />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Empty State */}
            {workspace.sprints.length === 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                        No Sprints Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first sprint to start organizing your work into time-boxed iterations.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={handleOpenCreateDialog}
                    >
                        Create Your First Sprint
                    </Button>
                </Paper>
            )}

            {/* Sprint Menu */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem onClick={() => openEditDialog(menuAnchor!.sprint)}>
                    <ListItemIcon><Edit size={16} /></ListItemIcon>
                    <ListItemText>Edit Sprint</ListItemText>
                </MenuItem>
                {menuAnchor?.sprint.status === 'planning' && (
                    <MenuItem onClick={() => handleStartSprint(menuAnchor!.sprint.id)}>
                        <ListItemIcon><Play size={16} /></ListItemIcon>
                        <ListItemText>Start Sprint</ListItemText>
                    </MenuItem>
                )}
                {menuAnchor?.sprint.status === 'active' && (
                    <MenuItem onClick={() => handleCompleteSprint(menuAnchor!.sprint.id)}>
                        <ListItemIcon><CheckCircle size={16} /></ListItemIcon>
                        <ListItemText>Complete Sprint</ListItemText>
                    </MenuItem>
                )}
                <Divider />
                <MenuItem
                    onClick={() => handleDeleteSprint(menuAnchor!.sprint.id)}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><Trash2 size={16} color="red" /></ListItemIcon>
                    <ListItemText>Delete Sprint</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create/Edit Dialog */}
            <Dialog
                open={createDialogOpen || Boolean(editingSprint)}
                onClose={() => { setCreateDialogOpen(false); setEditingSprint(null); resetForm(); }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingSprint ? 'Edit Sprint' : 'Create New Sprint'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Sprint Name"
                            fullWidth
                            value={sprintName}
                            onChange={(e) => setSprintName(e.target.value)}
                            placeholder="e.g., Sprint 1"
                        />
                        <TextField
                            label="Sprint Goal (optional)"
                            fullWidth
                            multiline
                            rows={2}
                            value={sprintGoal}
                            onChange={(e) => setSprintGoal(e.target.value)}
                            placeholder="What is the main objective of this sprint?"
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                fullWidth
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                fullWidth
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setCreateDialogOpen(false); setEditingSprint(null); resetForm(); }} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={editingSprint ? handleEditSprint : handleCreateSprint}
                        variant="contained"
                        disabled={!sprintName.trim() || !startDate || !endDate}
                    >
                        {editingSprint ? 'Save Changes' : 'Create Sprint'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

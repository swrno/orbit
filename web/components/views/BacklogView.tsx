"use client";

import { useAppStore, Task, TaskPriority, TaskStatus } from "@/lib/store";
import {
    Box, Paper, Typography, Button, IconButton, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, FormControl, InputLabel, Menu, MenuItem, ListItemIcon, ListItemText,
    Divider, LinearProgress, Avatar, Tooltip, Checkbox
} from "@mui/material";
import {
    Plus, GripVertical, MoreVertical, Trash2, Edit, MoveRight,
    Filter, ArrowUpDown, Layers, Flag, User, Clock, Target
} from "lucide-react";
import { useState, useMemo } from "react";

interface BacklogViewProps {
    workspaceId: string;
}

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; bgColor: string; order: number }> = {
    'Critical': { color: '#ef4444', bgColor: '#fee2e2', order: 0 },
    'High': { color: '#f97316', bgColor: '#ffedd5', order: 1 },
    'Medium': { color: '#3b82f6', bgColor: '#dbeafe', order: 2 },
    'Low': { color: '#94a3b8', bgColor: '#f1f5f9', order: 3 },
};

const STATUS_CONFIG: Record<TaskStatus, { color: string }> = {
    'Todo': { color: '#64748b' },
    'In Progress': { color: '#f59e0b' },
    'In Review': { color: '#8b5cf6' },
    'Done': { color: '#10b981' },
    'Blocked': { color: '#ef4444' },
};

export function BacklogView({ workspaceId }: BacklogViewProps) {
    const {
        workspaces,
        addTask,
        updateTask,
        deleteTask,
        assignTaskToSprint
    } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'priority' | 'points' | 'title' | 'createdAt'>('priority');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [assignSprintDialog, setAssignSprintDialog] = useState(false);
    const [targetSprintId, setTargetSprintId] = useState('');
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; task: Task } | null>(null);

    // New task form
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
    const [newPoints, setNewPoints] = useState(0);

    if (!workspace) return null;

    // Get backlog tasks
    const backlogTasks = useMemo(() => {
        let tasks = workspace.tasks.filter(t => t.sprintId === 'backlog' || !t.sprintId);

        // Apply priority filter
        if (filterPriority !== 'all') {
            tasks = tasks.filter(t => t.priority === filterPriority);
        }

        // Sort tasks
        tasks.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const aOrder = PRIORITY_CONFIG[a.priority || 'Medium'].order;
                    const bOrder = PRIORITY_CONFIG[b.priority || 'Medium'].order;
                    return aOrder - bOrder;
                case 'points':
                    return (b.estimatedPoints || 0) - (a.estimatedPoints || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'createdAt':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return tasks;
    }, [workspace.tasks, filterPriority, sortBy]);

    // Calculate backlog stats
    const stats = useMemo(() => ({
        totalTasks: backlogTasks.length,
        totalPoints: backlogTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0),
        byPriority: {
            Critical: backlogTasks.filter(t => t.priority === 'Critical').length,
            High: backlogTasks.filter(t => t.priority === 'High').length,
            Medium: backlogTasks.filter(t => t.priority === 'Medium').length,
            Low: backlogTasks.filter(t => t.priority === 'Low').length,
        }
    }), [backlogTasks]);

    const handleCreateTask = () => {
        if (newTitle.trim()) {
            addTask(workspaceId, {
                title: newTitle,
                description: newDescription || undefined,
                priority: newPriority,
                status: 'Todo',
                sprintId: 'backlog',
                estimatedPoints: newPoints,
            });
            resetForm();
            setCreateDialogOpen(false);
        }
    };

    const resetForm = () => {
        setNewTitle('');
        setNewDescription('');
        setNewPriority('Medium');
        setNewPoints(0);
    };

    const handleSelectTask = (taskId: string, checked: boolean) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(taskId);
            else newSet.delete(taskId);
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTasks(new Set(backlogTasks.map(t => t.id)));
        } else {
            setSelectedTasks(new Set());
        }
    };

    const handleBulkAssignSprint = () => {
        if (targetSprintId) {
            selectedTasks.forEach(taskId => {
                assignTaskToSprint(workspaceId, taskId, targetSprintId);
            });
            setSelectedTasks(new Set());
            setAssignSprintDialog(false);
            setTargetSprintId('');
        }
    };

    const handleDeleteTask = (taskId: string) => {
        if (confirm('Delete this task?')) {
            deleteTask(workspaceId, taskId);
        }
        setMenuAnchor(null);
    };

    const handleMoveToSprint = (taskId: string, sprintId: string) => {
        assignTaskToSprint(workspaceId, taskId, sprintId);
        setMenuAnchor(null);
    };

    // Get active and planning sprints
    const availableSprints = workspace.sprints.filter(s => s.status !== 'completed');

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Layers size={24} />
                        <Typography variant="h5" fontWeight={600}>
                            Product Backlog
                        </Typography>
                        <Chip label={`${stats.totalTasks} items`} size="small" />
                        <Chip label={`${stats.totalPoints} SP`} size="small" variant="outlined" />
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Add Item
                    </Button>
                </Box>

                {/* Priority Stats */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {(['Critical', 'High', 'Medium', 'Low'] as TaskPriority[]).map(priority => (
                        <Chip
                            key={priority}
                            label={`${priority}: ${stats.byPriority[priority]}`}
                            size="small"
                            onClick={() => setFilterPriority(filterPriority === priority ? 'all' : priority)}
                            sx={{
                                bgcolor: filterPriority === priority ? PRIORITY_CONFIG[priority].bgColor : 'transparent',
                                color: PRIORITY_CONFIG[priority].color,
                                border: '1px solid',
                                borderColor: PRIORITY_CONFIG[priority].color,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                    {filterPriority !== 'all' && (
                        <Button size="small" onClick={() => setFilterPriority('all')}>
                            Clear Filter
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Toolbar */}
            <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper' }}>
                <Checkbox
                    size="small"
                    checked={selectedTasks.size > 0 && selectedTasks.size === backlogTasks.length}
                    indeterminate={selectedTasks.size > 0 && selectedTasks.size < backlogTasks.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />

                {selectedTasks.size > 0 ? (
                    <>
                        <Typography variant="body2" color="text.secondary">
                            {selectedTasks.size} selected
                        </Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MoveRight size={14} />}
                            onClick={() => setAssignSprintDialog(true)}
                        >
                            Move to Sprint
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Trash2 size={14} />}
                            onClick={() => {
                                if (confirm(`Delete ${selectedTasks.size} tasks?`)) {
                                    selectedTasks.forEach(id => deleteTask(workspaceId, id));
                                    setSelectedTasks(new Set());
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </>
                ) : (
                    <>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                native
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                startAdornment={<ArrowUpDown size={14} style={{ marginRight: 8 }} />}
                            >
                                <option value="priority">Sort by Priority</option>
                                <option value="points">Sort by Points</option>
                                <option value="title">Sort by Title</option>
                                <option value="createdAt">Sort by Created</option>
                            </Select>
                        </FormControl>
                    </>
                )}
            </Box>

            {/* Backlog Items */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
                {backlogTasks.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {backlogTasks.map((task, index) => (
                            <Paper
                                key={task.id}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: selectedTasks.has(task.id) ? 'primary.main' : 'divider',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    transition: 'all 0.2s',
                                    bgcolor: selectedTasks.has(task.id) ? 'action.selected' : 'background.paper',
                                    '&:hover': {
                                        borderColor: 'primary.light',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }
                                }}
                            >
                                {/* Drag Handle */}
                                <GripVertical size={16} style={{ opacity: 0.3, cursor: 'grab' }} />

                                {/* Checkbox */}
                                <Checkbox
                                    size="small"
                                    checked={selectedTasks.has(task.id)}
                                    onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                                />

                                {/* Priority Indicator */}
                                <Tooltip title={task.priority || 'Medium'}>
                                    <Box
                                        sx={{
                                            width: 4,
                                            height: 36,
                                            borderRadius: 2,
                                            bgcolor: PRIORITY_CONFIG[task.priority || 'Medium'].color
                                        }}
                                    />
                                </Tooltip>

                                {/* Task Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                                        {task.title}
                                    </Typography>
                                    {task.description && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                                            {task.description}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Story Points */}
                                {task.estimatedPoints !== undefined && task.estimatedPoints > 0 && (
                                    <Chip
                                        label={`${task.estimatedPoints} SP`}
                                        size="small"
                                        sx={{
                                            height: 24,
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            bgcolor: '#e0e7ff',
                                            color: '#3730a3'
                                        }}
                                    />
                                )}

                                {/* Status */}
                                <Chip
                                    label={task.status}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        bgcolor: `${STATUS_CONFIG[task.status].color}20`,
                                        color: STATUS_CONFIG[task.status].color
                                    }}
                                />

                                {/* Owner */}
                                {task.owner ? (
                                    <Tooltip title={task.owner}>
                                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                                            {task.owner.charAt(0)}
                                        </Avatar>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Unassigned">
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.selected' }}>
                                            <User size={14} />
                                        </Avatar>
                                    </Tooltip>
                                )}

                                {/* Actions */}
                                <IconButton
                                    size="small"
                                    onClick={(e) => setMenuAnchor({ el: e.currentTarget, task })}
                                >
                                    <MoreVertical size={16} />
                                </IconButton>
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 10
                        }}
                    >
                        <Layers size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="h6" gutterBottom>
                            Backlog is Empty
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Add items to your backlog to plan future work.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Add First Item
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Task Menu */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">Move to Sprint</Typography>
                </MenuItem>
                {availableSprints.map(sprint => (
                    <MenuItem
                        key={sprint.id}
                        onClick={() => handleMoveToSprint(menuAnchor!.task.id, sprint.id)}
                    >
                        <ListItemIcon>
                            {sprint.status === 'active' ? <Target size={16} color="#10b981" /> : <Clock size={16} />}
                        </ListItemIcon>
                        <ListItemText>{sprint.name}</ListItemText>
                    </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={() => handleDeleteTask(menuAnchor!.task.id)} sx={{ color: 'error.main' }}>
                    <ListItemIcon><Trash2 size={16} color="red" /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create Task Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Backlog Item</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Title"
                            fullWidth
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="As a user, I want to..."
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Acceptance criteria and details..."
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    native
                                    value={newPriority}
                                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                                    label="Priority"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Story Points"
                                type="number"
                                value={newPoints}
                                onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)}
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: 150 }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateTask} variant="contained" disabled={!newTitle.trim()}>
                        Add to Backlog
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Sprint Dialog */}
            <Dialog open={assignSprintDialog} onClose={() => setAssignSprintDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Move to Sprint</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Select Sprint</InputLabel>
                        <Select
                            native
                            value={targetSprintId}
                            onChange={(e) => setTargetSprintId(e.target.value)}
                            label="Select Sprint"
                        >
                            <option value="">Select...</option>
                            {availableSprints.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name} {s.status === 'active' ? '(Active)' : ''}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignSprintDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleBulkAssignSprint} variant="contained" disabled={!targetSprintId}>
                        Move {selectedTasks.size} Items
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

"use client";

import { useAppStore, Task, TaskStatus, TaskPriority, Subtask, TimeLog } from "@/lib/store";
import {
    Box, Paper, Typography, Button, IconButton, Chip, LinearProgress,
    Dialog, DialogTitle, DialogContent, TextField, Avatar, Tooltip,
    Divider, List, ListItem, ListItemText, ListItemIcon, Checkbox,
    Select, FormControl, InputLabel, Tab, Tabs, Badge, Menu, MenuItem
} from "@mui/material";
import {
    X, Clock, Calendar, User, Flag, Target, MessageSquare,
    Layers, Link2, Plus, Trash2, Play, Check, AlertTriangle,
    ChevronRight, MoreVertical, Timer, Edit2
} from "lucide-react";
import { useState, useMemo } from "react";

interface TaskDetailModalProps {
    workspaceId: string;
    task: Task;
    open: boolean;
    onClose: () => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; icon: any }> = {
    'Critical': { color: '#ef4444', icon: AlertTriangle },
    'High': { color: '#f97316', icon: Flag },
    'Medium': { color: '#3b82f6', icon: Flag },
    'Low': { color: '#94a3b8', icon: Flag },
};

const STATUS_OPTIONS: TaskStatus[] = ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'];

export function TaskDetailModal({ workspaceId, task, open, onClose }: TaskDetailModalProps) {
    const {
        workspaces,
        updateTask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        logTime,
        deleteTimeLog,
        addBlocker,
        removeBlocker,
        addComment
    } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [activeTab, setActiveTab] = useState(0);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editDesc, setEditDesc] = useState(task.description || '');

    // Subtask form
    const [newSubtask, setNewSubtask] = useState('');

    // Time log form
    const [logHours, setLogHours] = useState('');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [logDesc, setLogDesc] = useState('');

    // Comment form
    const [newComment, setNewComment] = useState('');

    // Dependency picker
    const [depMenuAnchor, setDepMenuAnchor] = useState<HTMLElement | null>(null);

    if (!workspace) return null;

    // Get related data
    const epic = workspace.epics?.find(e => e.id === task.epicId);
    const sprint = workspace.sprints?.find(s => s.id === task.sprintId);
    const blockerTasks = (task.blockedBy?.map(id => workspace.tasks.find(t => t.id === id)).filter(Boolean) as Task[]) || [];
    const blocksTasks = (task.blocks?.map(id => workspace.tasks.find(t => t.id === id)).filter(Boolean) as Task[]) || [];

    // Calculate total time logged
    const totalTimeLogged = useMemo(() =>
        (task.timeLogs || []).reduce((sum, tl) => sum + tl.hours, 0),
        [task.timeLogs]
    );

    // Subtask progress
    const subtaskProgress = useMemo(() => {
        if (!task.subtasks?.length) return 0;
        const done = task.subtasks.filter(s => s.status === 'Done').length;
        return Math.round((done / task.subtasks.length) * 100);
    }, [task.subtasks]);

    const handleSaveTitle = () => {
        if (editTitle.trim() && editTitle !== task.title) {
            updateTask(workspaceId, task.id, { title: editTitle.trim() });
        }
        setIsEditingTitle(false);
    };

    const handleSaveDesc = () => {
        if (editDesc !== task.description) {
            updateTask(workspaceId, task.id, { description: editDesc || undefined });
        }
        setIsEditingDesc(false);
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            addSubtask(workspaceId, task.id, newSubtask.trim());
            setNewSubtask('');
        }
    };

    const handleToggleSubtask = (subtask: Subtask) => {
        updateSubtask(workspaceId, task.id, subtask.id, {
            status: subtask.status === 'Done' ? 'Todo' : 'Done'
        });
    };

    const handleLogTime = () => {
        const hours = parseFloat(logHours);
        if (!isNaN(hours) && hours > 0) {
            const currentUser = workspace.teamMembers?.[0] || { id: 'user', name: 'User' };
            logTime(workspaceId, task.id, {
                userId: currentUser.id,
                userName: currentUser.name,
                hours,
                description: logDesc || undefined,
                date: logDate
            });
            setLogHours('');
            setLogDesc('');
        }
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const currentUser = workspace.teamMembers?.[0] || { name: 'User' };
            addComment(workspaceId, task.id, {
                author: currentUser.name,
                content: newComment.trim()
            });
            setNewComment('');
        }
    };

    const handleAddBlocker = (blockerTaskId: string) => {
        addBlocker(workspaceId, task.id, blockerTaskId);
        setDepMenuAnchor(null);
    };

    const availableTasksForBlocking = workspace.tasks.filter(t =>
        t.id !== task.id &&
        !task.blockedBy?.includes(t.id) &&
        !task.blocks?.includes(t.id)
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <Box sx={{ display: 'flex', height: '80vh', maxHeight: 700 }}>
                {/* Main Content */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                            {task.key}
                        </Typography>
                        {epic && (
                            <Chip
                                label={epic.name}
                                size="small"
                                sx={{
                                    height: 22,
                                    bgcolor: `${epic.color}20`,
                                    color: epic.color,
                                    fontWeight: 600,
                                    '& .MuiChip-label': { px: 1 }
                                }}
                            />
                        )}
                        <Box sx={{ flex: 1 }} />
                        <IconButton onClick={onClose} size="small">
                            <X size={18} />
                        </IconButton>
                    </Box>

                    {/* Title */}
                    <Box sx={{ px: 3, py: 2 }}>
                        {isEditingTitle ? (
                            <TextField
                                autoFocus
                                fullWidth
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                                variant="standard"
                                InputProps={{
                                    sx: { fontSize: '1.25rem', fontWeight: 600 }
                                }}
                            />
                        ) : (
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                onClick={() => setIsEditingTitle(true)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, p: 0.5, mx: -0.5, borderRadius: 1 }}
                            >
                                {task.title}
                            </Typography>
                        )}
                    </Box>

                    {/* Tabs */}
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Tab label="Details" />
                        <Tab label={<Badge badgeContent={task.subtasks?.length || 0} color="primary">Subtasks</Badge>} />
                        <Tab label={<Badge badgeContent={task.timeLogs?.length || 0} color="primary">Time Log</Badge>} />
                        <Tab label={<Badge badgeContent={task.comments?.length || 0} color="primary">Comments</Badge>} />
                    </Tabs>

                    {/* Tab Content */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        {/* Details Tab */}
                        {activeTab === 0 && (
                            <Box>
                                {/* Description */}
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                    Description
                                </Typography>
                                {isEditingDesc ? (
                                    <Box>
                                        <TextField
                                            autoFocus
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            placeholder="Add a description..."
                                        />
                                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="contained" onClick={handleSaveDesc}>Save</Button>
                                            <Button size="small" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Paper
                                        elevation={0}
                                        onClick={() => setIsEditingDesc(true)}
                                        sx={{
                                            p: 2,
                                            bgcolor: 'action.hover',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            minHeight: 80,
                                            '&:hover': { bgcolor: 'action.selected' }
                                        }}
                                    >
                                        <Typography variant="body2" color={task.description ? 'text.primary' : 'text.secondary'}>
                                            {task.description || 'Click to add description...'}
                                        </Typography>
                                    </Paper>
                                )}

                                {/* Dependencies */}
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            Dependencies
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<Plus size={14} />}
                                            onClick={(e) => setDepMenuAnchor(e.currentTarget)}
                                        >
                                            Add Blocker
                                        </Button>
                                    </Box>

                                    {blockerTasks.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="caption" color="error.main" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                                Blocked By
                                            </Typography>
                                            {blockerTasks.map(bt => (
                                                <Chip
                                                    key={bt.id}
                                                    label={`${bt.key}: ${bt.title}`}
                                                    size="small"
                                                    onDelete={() => removeBlocker(workspaceId, task.id, bt.id)}
                                                    sx={{ m: 0.5, bgcolor: 'error.50' }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    {blocksTasks.length > 0 && (
                                        <Box>
                                            <Typography variant="caption" color="warning.main" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                                Blocks
                                            </Typography>
                                            {blocksTasks.map(bt => (
                                                <Chip
                                                    key={bt.id}
                                                    label={`${bt.key}: ${bt.title}`}
                                                    size="small"
                                                    sx={{ m: 0.5, bgcolor: 'warning.50' }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    {blockerTasks.length === 0 && blocksTasks.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            No dependencies
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Subtasks Tab */}
                        {activeTab === 1 && (
                            <Box>
                                {/* Progress */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {task.subtasks.filter(s => s.status === 'Done').length} of {task.subtasks.length} complete
                                            </Typography>
                                            <Typography variant="caption" fontWeight={600}>{subtaskProgress}%</Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={subtaskProgress}
                                            sx={{ height: 6, borderRadius: 3 }}
                                        />
                                    </Box>
                                )}

                                {/* Add Subtask */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Add a subtask..."
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                    />
                                    <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                                        Add
                                    </Button>
                                </Box>

                                {/* Subtask List */}
                                <List disablePadding>
                                    {task.subtasks?.map(subtask => (
                                        <ListItem
                                            key={subtask.id}
                                            dense
                                            sx={{
                                                px: 0,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider'
                                            }}
                                            secondaryAction={
                                                <IconButton size="small" onClick={() => deleteSubtask(workspaceId, task.id, subtask.id)}>
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            }
                                        >
                                            <Checkbox
                                                checked={subtask.status === 'Done'}
                                                onChange={() => handleToggleSubtask(subtask)}
                                                size="small"
                                            />
                                            <ListItemText
                                                primary={subtask.title}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        textDecoration: subtask.status === 'Done' ? 'line-through' : 'none',
                                                        color: subtask.status === 'Done' ? 'text.secondary' : 'text.primary'
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                {!task.subtasks?.length && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                        No subtasks yet. Add one above!
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Time Log Tab */}
                        {activeTab === 2 && (
                            <Box>
                                {/* Summary */}
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                        <Box>
                                            <Typography variant="h5" fontWeight={600} color="primary.main">
                                                {totalTimeLogged}h
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Logged</Typography>
                                        </Box>
                                        {task.originalEstimate && (
                                            <Box>
                                                <Typography variant="h5" fontWeight={600}>
                                                    {task.originalEstimate}h
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">Estimated</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>

                                {/* Log Time Form */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'flex-end' }}>
                                    <TextField
                                        size="small"
                                        label="Hours"
                                        type="number"
                                        value={logHours}
                                        onChange={(e) => setLogHours(e.target.value)}
                                        inputProps={{ min: 0, step: 0.5 }}
                                        sx={{ width: 100 }}
                                    />
                                    <TextField
                                        size="small"
                                        label="Date"
                                        type="date"
                                        value={logDate}
                                        onChange={(e) => setLogDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ width: 140 }}
                                    />
                                    <TextField
                                        size="small"
                                        label="Description"
                                        fullWidth
                                        value={logDesc}
                                        onChange={(e) => setLogDesc(e.target.value)}
                                        placeholder="What did you work on?"
                                    />
                                    <Button onClick={handleLogTime} disabled={!logHours}>
                                        Log
                                    </Button>
                                </Box>

                                {/* Time Entries */}
                                <List disablePadding>
                                    {task.timeLogs?.map(log => (
                                        <ListItem
                                            key={log.id}
                                            sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}
                                            secondaryAction={
                                                <IconButton size="small" onClick={() => deleteTimeLog(workspaceId, task.id, log.id)}>
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                                    {log.userName.charAt(0)}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" fontWeight={600}>{log.hours}h</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            by {log.userName} on {new Date(log.date).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={log.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                {!task.timeLogs?.length && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                        No time logged yet
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 3 && (
                            <Box>
                                {/* Add Comment */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Add a comment..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Box sx={{ mt: 1 }}>
                                            <Button size="small" variant="contained" onClick={handleAddComment} disabled={!newComment.trim()}>
                                                Comment
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Comments List */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {task.comments?.map(comment => (
                                        <Box key={comment.id} sx={{ display: 'flex', gap: 2 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                {comment.author.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>{comment.author}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {comment.content}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {!task.comments?.length && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                        No comments yet. Be the first to comment!
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Sidebar */}
                <Box sx={{ width: 280, borderLeft: '1px solid', borderColor: 'divider', p: 2, bgcolor: 'background.paper', overflow: 'auto' }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                        Details
                    </Typography>

                    {/* Status */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Status</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                native
                                value={task.status}
                                onChange={(e) => updateTask(workspaceId, task.id, { status: e.target.value as TaskStatus })}
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Priority */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Priority</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                native
                                value={task.priority || 'Medium'}
                                onChange={(e) => updateTask(workspaceId, task.id, { priority: e.target.value as TaskPriority })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Assignee */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Assignee</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                native
                                value={task.owner || ''}
                                onChange={(e) => updateTask(workspaceId, task.id, { owner: e.target.value || undefined })}
                            >
                                <option value="">Unassigned</option>
                                {workspace.teamMembers?.map(m => (
                                    <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Sprint */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Sprint</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                native
                                value={task.sprintId || 'backlog'}
                                onChange={(e) => updateTask(workspaceId, task.id, { sprintId: e.target.value })}
                            >
                                <option value="backlog">Backlog</option>
                                {workspace.sprints?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Epic */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Epic</Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                native
                                value={task.epicId || ''}
                                onChange={(e) => updateTask(workspaceId, task.id, { epicId: e.target.value || undefined })}
                            >
                                <option value="">None</option>
                                {workspace.epics?.map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Story Points */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Story Points</Typography>
                        <TextField
                            size="small"
                            type="number"
                            fullWidth
                            value={task.estimatedPoints || ''}
                            onChange={(e) => updateTask(workspaceId, task.id, { estimatedPoints: parseInt(e.target.value) || undefined })}
                            inputProps={{ min: 0 }}
                        />
                    </Box>

                    {/* Due Date */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Due Date</Typography>
                        <TextField
                            size="small"
                            type="date"
                            fullWidth
                            value={task.dueDate || ''}
                            onChange={(e) => updateTask(workspaceId, task.id, { dueDate: e.target.value || undefined })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Metadata */}
                    <Box sx={{ color: 'text.secondary' }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                            Updated: {new Date(task.updatedAt).toLocaleDateString()}
                        </Typography>
                        {task.reporter && (
                            <Typography variant="caption" sx={{ display: 'block' }}>
                                Reporter: {task.reporter}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Dependency Menu */}
            <Menu
                anchorEl={depMenuAnchor}
                open={Boolean(depMenuAnchor)}
                onClose={() => setDepMenuAnchor(null)}
            >
                {availableTasksForBlocking.length > 0 ? (
                    availableTasksForBlocking.slice(0, 10).map(t => (
                        <MenuItem key={t.id} onClick={() => handleAddBlocker(t.id)}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>{t.key}</Typography>
                            {t.title.length > 30 ? t.title.substring(0, 30) + '...' : t.title}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No available tasks</MenuItem>
                )}
            </Menu>
        </Dialog>
    );
}

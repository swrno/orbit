"use client";

import { useParams } from "next/navigation";
import { useAppStore, Task, Sprint } from "@/lib/store";

import {
    Box, Paper, Typography, Button, IconButton, Chip, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, FormControl, InputLabel, Avatar, Tooltip, Divider,
    Card, CardContent
} from "@mui/material";
import {
    Plus, Calendar, Target, Layers, Clock, User,
    ChevronRight, Play, Check, MoreVertical, Trash2,
    AlertCircle, Flag, GripVertical
} from "lucide-react";
import { useState, useMemo } from "react";

const PRIORITY_COLORS = {
    'Low': '#94a3b8',
    'Medium': '#3b82f6',
    'High': '#f97316',
    'Critical': '#ef4444',
};

export default function SprintPlanningPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const {
        workspaces,
        addSprint,
        updateSprint,
        deleteSprint,
        startSprint,
        completeSprint,
        updateTask
    } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [sprintName, setSprintName] = useState('');
    const [sprintGoal, setSprintGoal] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [dragOverSprintId, setDragOverSprintId] = useState<string | null>(null);

    if (!workspace) {
        return <Typography>Workspace not found</Typography>;
    }

    // Get backlog tasks (no sprint assigned or explicitly in backlog)
    const backlogTasks = workspace.tasks.filter(t => !t.sprintId || t.sprintId === 'backlog');

    // Get planned and active sprints
    const plannedSprints = workspace.sprints?.filter(s => s.status === 'planning') || [];
    const activeSprint = workspace.sprints?.find(s => s.status === 'active');
    const completedSprints = workspace.sprints?.filter(s => s.status === 'completed') || [];

    // Calculate sprint stats
    const getSprintStats = (sprintId: string) => {
        const tasks = workspace.tasks.filter(t => t.sprintId === sprintId);
        const totalPoints = tasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const donePoints = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        return { tasks, totalPoints, donePoints, count: tasks.length };
    };

    const handleCreateSprint = () => {
        if (sprintName.trim() && startDate && endDate) {
            addSprint(workspaceId, {
                name: sprintName.trim(),
                goal: sprintGoal || undefined,
                startDate,
                endDate,
                status: 'planning'
            });
            setSprintName('');
            setSprintGoal('');
            setStartDate('');
            setEndDate('');
            setCreateDialogOpen(false);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, sprintId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverSprintId(sprintId);
    };

    const handleDragLeave = () => {
        setDragOverSprintId(null);
    };

    const handleDrop = (e: React.DragEvent, sprintId: string) => {
        e.preventDefault();
        if (draggedTask) {
            updateTask(workspaceId, draggedTask.id, { sprintId });
        }
        setDraggedTask(null);
        setDragOverSprintId(null);
    };

    // Task Card Component
    const TaskCard = ({ task, showDragHandle = true }: { task: Task; showDragHandle?: boolean }) => (
        <Card
            elevation={0}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            sx={{
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'grab',
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                },
                '&:active': { cursor: 'grabbing' }
            }}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    {showDragHandle && (
                        <GripVertical size={14} style={{ color: '#94a3b8', marginTop: 2, flexShrink: 0 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                                {task.key}
                            </Typography>
                            {task.priority && (
                                <Flag size={10} fill={PRIORITY_COLORS[task.priority]} color={PRIORITY_COLORS[task.priority]} />
                            )}
                            {task.blockedBy && task.blockedBy.length > 0 && (
                                <AlertCircle size={10} color="#ef4444" />
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {task.estimatedPoints && task.estimatedPoints > 0 && (
                                    <Chip
                                        label={`${task.estimatedPoints} SP`}
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                                    />
                                )}
                                {task.epicId && workspace.epics?.find(e => e.id === task.epicId) && (
                                    <Chip
                                        label={workspace.epics.find(e => e.id === task.epicId)?.name}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.6rem',
                                            bgcolor: `${workspace.epics.find(e => e.id === task.epicId)?.color}20`,
                                            color: workspace.epics.find(e => e.id === task.epicId)?.color
                                        }}
                                    />
                                )}
                            </Box>
                            {task.owner && (
                                <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: 'primary.main' }}>
                                    {task.owner.charAt(0)}
                                </Avatar>
                            )}
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    // Sprint Card Component
    const SprintCard = ({ sprint }: { sprint: Sprint }) => {
        const stats = getSprintStats(sprint.id);
        const progress = stats.totalPoints > 0 ? Math.round((stats.donePoints / stats.totalPoints) * 100) : 0;
        const sprintTasks = workspace.tasks.filter(t => t.sprintId === sprint.id);

        return (
            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: dragOverSprintId === sprint.id ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: dragOverSprintId === sprint.id ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s',
                    mb: 2
                }}
                onDragOver={(e) => handleDragOver(e, sprint.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, sprint.id)}
            >
                {/* Sprint Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {sprint.name}
                            </Typography>
                            <Chip
                                label={sprint.status}
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    bgcolor: sprint.status === 'active' ? '#dcfce7' : sprint.status === 'completed' ? '#dbeafe' : '#f1f5f9',
                                    color: sprint.status === 'active' ? '#166534' : sprint.status === 'completed' ? '#1e40af' : '#475569'
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {sprint.status === 'planning' && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Play size={14} />}
                                    onClick={() => startSprint(workspaceId, sprint.id)}
                                >
                                    Start Sprint
                                </Button>
                            )}
                            {sprint.status === 'active' && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    startIcon={<Check size={14} />}
                                    onClick={() => completeSprint(workspaceId, sprint.id)}
                                >
                                    Complete
                                </Button>
                            )}
                            <IconButton size="small" onClick={() => deleteSprint(workspaceId, sprint.id)}>
                                <Trash2 size={14} />
                            </IconButton>
                        </Box>
                    </Box>

                    {sprint.goal && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            🎯 {sprint.goal}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <Calendar size={14} />
                            <Typography variant="caption">
                                {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Layers size={14} />
                            <Typography variant="caption">{stats.count} tasks</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Target size={14} />
                            <Typography variant="caption" fontWeight={600}>{stats.totalPoints} SP</Typography>
                        </Box>
                    </Box>

                    {sprint.status === 'active' && stats.totalPoints > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Progress</Typography>
                                <Typography variant="caption" fontWeight={600}>{progress}%</Typography>
                            </Box>
                            <LinearProgress value={progress} variant="determinate" sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                    )}
                </Box>

                {/* Sprint Tasks */}
                <Box sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                    {sprintTasks.length > 0 ? (
                        sprintTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="body2">Drop tasks here to add to sprint</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>

            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Backlog Column */}
                <Box
                    sx={{
                        width: 350,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                    onDragOver={(e) => handleDragOver(e, 'backlog')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'backlog')}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={600}>Backlog</Typography>
                            <Chip label={backlogTasks.length} size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {backlogTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0)} story points
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            p: 2,
                            overflow: 'auto',
                            bgcolor: dragOverSprintId === 'backlog' ? 'action.hover' : 'transparent',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {backlogTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        {backlogTasks.length === 0 && (
                            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2">No items in backlog</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Sprints Column */}
                <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5" fontWeight={600}>Sprint Planning</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Sprint
                        </Button>
                    </Box>

                    {/* Active Sprint */}
                    {activeSprint && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="overline" color="success.main" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                Active Sprint
                            </Typography>
                            <SprintCard sprint={activeSprint} />
                        </Box>
                    )}

                    {/* Planned Sprints */}
                    {plannedSprints.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                Planned Sprints
                            </Typography>
                            {plannedSprints.map(sprint => (
                                <SprintCard key={sprint.id} sprint={sprint} />
                            ))}
                        </Box>
                    )}

                    {/* Completed Sprints */}
                    {completedSprints.length > 0 && (
                        <Box>
                            <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                Completed Sprints ({completedSprints.length})
                            </Typography>
                            {completedSprints.slice(0, 3).map(sprint => (
                                <SprintCard key={sprint.id} sprint={sprint} />
                            ))}
                        </Box>
                    )}

                    {!activeSprint && plannedSprints.length === 0 && (
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
                            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <Typography variant="h6" gutterBottom>No Sprints</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Create a sprint to start planning your work.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                Create First Sprint
                            </Button>
                        </Paper>
                    )}
                </Box>
            </Box>

            {/* Create Sprint Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Sprint</DialogTitle>
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
                            label="Sprint Goal"
                            fullWidth
                            multiline
                            rows={2}
                            value={sprintGoal}
                            onChange={(e) => setSprintGoal(e.target.value)}
                            placeholder="What do you want to achieve this sprint?"
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
                    <Button onClick={() => setCreateDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleCreateSprint}
                        variant="contained"
                        disabled={!sprintName.trim() || !startDate || !endDate}
                    >
                        Create Sprint
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

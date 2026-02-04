"use client";

import { useAppStore, Epic } from "@/lib/store";
import { formatDate } from "@/lib/date-utils";
import {
    Box, Paper, Typography, Button, Chip, Tooltip, IconButton,
    Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField
} from "@mui/material";
import {
    Calendar, ChevronLeft, ChevronRight, Plus, Filter,
    TrendingUp, Target, Clock, User, Layers
} from "lucide-react";
import { useState, useMemo } from "react";

interface RoadmapPageProps {
    workspaceId: string;
}

type ViewMode = 'quarters' | 'months' | 'weeks';

export default function RoadmapPage({ params }: { params: { workspaceId: string } }) {
    const { workspaces, epics: storeEpics, addEpic, updateEpic } = useAppStore();
    const workspace = workspaces.find(w => w.id === params.workspaceId);

    const [viewMode, setViewMode] = useState<ViewMode>('months');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<'all' | 'To Do' | 'In Progress' | 'Done'>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newEpicName, setNewEpicName] = useState('');
    const [newEpicDesc, setNewEpicDesc] = useState('');
    const [newEpicStart, setNewEpicStart] = useState('');
    const [newEpicEnd, setNewEpicEnd] = useState('');

    if (!workspace) return null;

    const epics = workspace.epics || [];

    // Filter epics
    const filteredEpics = useMemo(() => {
        return epics.filter(epic =>
            filterStatus === 'all' || epic.status === filterStatus
        );
    }, [epics, filterStatus]);

    // Generate timeline periods
    const timelinePeriods = useMemo(() => {
        const periods: string[] = [];
        const start = new Date(currentDate);
        start.setMonth(start.getMonth() - 2);

        if (viewMode === 'months') {
            for (let i = 0; i < 12; i++) {
                const date = new Date(start);
                date.setMonth(start.getMonth() + i);
                periods.push(date.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
            }
        } else if (viewMode === 'quarters') {
            for (let i = 0; i < 8; i++) {
                const date = new Date(start);
                date.setMonth(start.getMonth() + i * 3);
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                periods.push(`Q${quarter} ${date.getFullYear()}`);
            }
        }
        return periods;
    }, [currentDate, viewMode]);

    // Calculate epic position on timeline
    const getEpicPosition = (epic: Epic) => {
        if (!epic.startDate || !epic.targetDate) return null;

        const start = new Date(epic.startDate);
        const end = new Date(epic.targetDate);
        const timelineStart = new Date(currentDate);
        timelineStart.setMonth(timelineStart.getMonth() - 2);
        const timelineEnd = new Date(currentDate);
        timelineEnd.setMonth(timelineEnd.getMonth() + 10);

        const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
        const epicStart = start.getTime() - timelineStart.getTime();
        const epicDuration = end.getTime() - start.getTime();

        return {
            left: `${(epicStart / totalDuration) * 100}%`,
            width: `${(epicDuration / totalDuration) * 100}%`,
        };
    };

    const calculateProgress = (epic: Epic) => {
        const tasks = workspace.tasks.filter(t => t.epicId === epic.id);
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'Done').length;
        return Math.round((completed / tasks.length) * 100);
    };

    const handleCreateEpic = () => {
        if (!workspace || !newEpicName.trim()) return;

        const workspaceKey = workspace.key || 'PROJ';
        const epicCounter = (workspace.epicCounter || 0) + 1;

        // addEpic needs to be implemented in store
        setCreateDialogOpen(false);
        setNewEpicName('');
        setNewEpicDesc('');
        setNewEpicStart('');
        setNewEpicEnd('');
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Target size={28} />
                        <Typography variant="h5" fontWeight={700}>
                            Roadmap
                        </Typography>
                        <Chip label={`${filteredEpics.length} epics`} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>View</InputLabel>
                            <Select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                                label="View"
                            >
                                <MenuItem value="months">Months</MenuItem>
                                <MenuItem value="quarters">Quarters</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Filter</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                                label="Filter"
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="To Do">To Do</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="Done">Done</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Epic
                        </Button>
                    </Box>
                </Box>

                {/* Timeline Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <IconButton
                        size="small"
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() - (viewMode === 'quarters' ? 3 : 1));
                            setCurrentDate(newDate);
                        }}
                    >
                        <ChevronLeft size={20} />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600}>
                        {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(newDate.getMonth() + (viewMode === 'quarters' ? 3 : 1));
                            setCurrentDate(newDate);
                        }}
                    >
                        <ChevronRight size={20} />
                    </IconButton>
                    <Button size="small" onClick={() => setCurrentDate(new Date())}>
                        Today
                    </Button>
                </Box>
            </Paper>

            {/* Timeline */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {/* Timeline Header */}
                <Box sx={{ display: 'flex', borderBottom: '2px solid', borderColor: 'divider', mb: 3 }}>
                    <Box sx={{ width: 250, flexShrink: 0, pr: 2, pb: 2 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                            EPIC
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex' }}>
                        {timelinePeriods.map((period, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    pb: 1,
                                    borderLeft: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                    {period}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Epic Rows */}
                {filteredEpics.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {filteredEpics.map((epic) => {
                            const position = getEpicPosition(epic);
                            const progress = calculateProgress(epic);
                            const taskCount = workspace.tasks.filter(t => t.epicId === epic.id).length;

                            return (
                                <Box key={epic.id} sx={{ display: 'flex', alignItems: 'center', minHeight: 60 }}>
                                    {/* Epic Info */}
                                    <Box sx={{ width: 250, flexShrink: 0, pr: 2 }}>
                                        <Typography variant="body2" fontWeight={600} noWrap>
                                            {epic.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Chip
                                                label={epic.status}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    bgcolor: epic.status === 'Done' ? '#d1fae5' : epic.status === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                                                    color: epic.status === 'Done' ? '#10b981' : epic.status === 'In Progress' ? '#f59e0b' : '#64748b',
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {taskCount} tasks
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Timeline Bar */}
                                    <Box sx={{ flex: 1, position: 'relative', height: 40 }}>
                                        {position && (
                                            <Tooltip
                                                title={
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={600}>{epic.name}</Typography>
                                                        <Typography variant="caption" display="block">
                                                            {epic.startDate && epic.targetDate &&
                                                                `${formatDate(epic.startDate)} - ${formatDate(epic.targetDate)}`
                                                            }
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            Progress: {progress}%
                                                        </Typography>
                                                    </Box>
                                                }
                                            >
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        left: position.left,
                                                        width: position.width,
                                                        height: 32,
                                                        borderRadius: 1,
                                                        bgcolor: epic.color || '#3b82f6',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            transform: 'scaleY(1.1)',
                                                            boxShadow: 2,
                                                        }
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            height: '100%',
                                                            width: `${progress}%`,
                                                            bgcolor: 'rgba(255,255,255,0.3)',
                                                            borderRadius: 1,
                                                            transition: 'width 0.3s',
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {progress}%
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Target size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="h6" gutterBottom>
                            No Epics Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create epics to visualize your product roadmap
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create First Epic
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Create Epic Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Epic</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Epic Name"
                            fullWidth
                            value={newEpicName}
                            onChange={(e) => setNewEpicName(e.target.value)}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={newEpicDesc}
                            onChange={(e) => setNewEpicDesc(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                fullWidth
                                value={newEpicStart}
                                onChange={(e) => setNewEpicStart(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Target Date"
                                type="date"
                                fullWidth
                                value={newEpicEnd}
                                onChange={(e) => setNewEpicEnd(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateEpic} variant="contained" disabled={!newEpicName.trim()}>
                        Create Epic
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

"use client";

import { use, useState } from "react";
import {
    Box, Container, Typography, Paper, Button, Chip, Select, MenuItem,
    FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tooltip
} from "@mui/material";
import {
    Calendar, Download, Filter, ZoomIn, ZoomOut, Target
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function GanttChartPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = use(params);
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
    const [timeRange, setTimeRange] = useState<3 | 6 | 12>(3);

    if (!workspace) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    // Generate time periods based on zoom
    const getTimePeriods = () => {
        const periods = [];
        const now = new Date();
        const totalDays = timeRange * 30;
        const periodCount = zoom === 'day' ? totalDays :
            zoom === 'week' ? Math.floor(totalDays / 7) :
                timeRange;

        for (let i = 0; i < periodCount; i++) {
            if (zoom === 'day') {
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
                periods.push({
                    label: date.getDate().toString(),
                    fullDate: date.toLocaleDateString()
                });
            } else if (zoom === 'week') {
                const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (i * 7));
                periods.push({
                    label: `W${i + 1}`,
                    fullDate: weekStart.toLocaleDateString()
                });
            } else {
                const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
                periods.push({
                    label: month.toLocaleDateString('en-US', { month: 'short' }),
                    fullDate: month.toLocaleDateString()
                });
            }
        }
        return periods;
    };

    const timePeriods = getTimePeriods();

    // Get tasks grouped by epic or sprint
    const getGroupedTasks = () => {
        const groups: { [key: string]: any[] } = {};

        workspace.tasks.forEach(task => {
            let groupKey = 'Unassigned';
            
            if (task.epicId) {
                const epic = workspace.epics.find(e => e.id === task.epicId);
                if (epic) groupKey = epic.name;
            } else if (task.sprintId && task.sprintId !== 'backlog') {
                const sprint = workspace.sprints.find(s => s.id === task.sprintId);
                if (sprint) groupKey = sprint.name;
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(task);
        });

        return groups;
    };

    const groupedTasks = getGroupedTasks();

    // Calculate task bar position and width
    const getTaskBarStyle = (taskIdx: number, groupIdx: number) => {
        const totalPeriods = timePeriods.length;
        const startPercent = ((taskIdx * 5 + groupIdx * 2) % 70);
        const widthPercent = 15 + (taskIdx % 3) * 10;

        return {
            left: `${startPercent}%`,
            width: `${Math.min(widthPercent, 100 - startPercent)}%`
        };
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #DFE1E6', p: 3 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={600} sx={{ color: '#172B4D', mb: 0.5 }}>
                                Gantt Chart
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Visual project timeline and dependency tracking
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Download size={16} />}
                                sx={{
                                    borderColor: '#DFE1E6',
                                    color: '#42526E',
                                    textTransform: 'none',
                                    '&:hover': { borderColor: '#B3BAC5', bgcolor: '#F4F5F7' }
                                }}
                            >
                                Export to PDF
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Filter size={16} />}
                                sx={{
                                    borderColor: '#DFE1E6',
                                    color: '#42526E',
                                    textTransform: 'none',
                                    '&:hover': { borderColor: '#B3BAC5', bgcolor: '#F4F5F7' }
                                }}
                            >
                                Filters
                            </Button>
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Zoom</InputLabel>
                            <Select
                                value={zoom}
                                label="Zoom"
                                onChange={(e) => setZoom(e.target.value as 'day' | 'week' | 'month')}
                            >
                                <MenuItem value="day">Day</MenuItem>
                                <MenuItem value="week">Week</MenuItem>
                                <MenuItem value="month">Month</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Time Range</InputLabel>
                            <Select
                                value={timeRange}
                                label="Time Range"
                                onChange={(e) => setTimeRange(e.target.value as 3 | 6 | 12)}
                            >
                                <MenuItem value={3}>3 Months</MenuItem>
                                <MenuItem value={6}>6 Months</MenuItem>
                                <MenuItem value={12}>12 Months</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                                size="small"
                                onClick={() => {
                                    if (zoom === 'month') setZoom('week');
                                    else if (zoom === 'week') setZoom('day');
                                }}
                                disabled={zoom === 'day'}
                                sx={{ minWidth: 40 }}
                            >
                                <ZoomIn size={16} />
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    if (zoom === 'day') setZoom('week');
                                    else if (zoom === 'week') setZoom('month');
                                }}
                                disabled={zoom === 'month'}
                                sx={{ minWidth: 40 }}
                            >
                                <ZoomOut size={16} />
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Gantt Chart */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Container maxWidth="xl">
                    <TableContainer component={Paper} sx={{ border: '1px solid #DFE1E6', boxShadow: 'none' }}>
                        <Table stickyHeader>
                            {/* Header */}
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            bgcolor: '#FAFBFC',
                                            borderRight: '2px solid #DFE1E6',
                                            width: 250,
                                            fontWeight: 600,
                                            color: '#42526E'
                                        }}
                                    >
                                        Task Name
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            bgcolor: '#FAFBFC',
                                            borderRight: '1px solid #DFE1E6',
                                            width: 100,
                                            fontWeight: 600,
                                            color: '#42526E',
                                            textAlign: 'center'
                                        }}
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            bgcolor: '#FAFBFC',
                                            borderRight: '2px solid #DFE1E6',
                                            width: 120,
                                            fontWeight: 600,
                                            color: '#42526E',
                                            textAlign: 'center'
                                        }}
                                    >
                                        Assignee
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: '#FAFBFC', position: 'relative', p: 0 }}>
                                        <Box sx={{ display: 'flex' }}>
                                            {timePeriods.map((period, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        flex: 1,
                                                        p: 1,
                                                        borderRight: idx < timePeriods.length - 1 ? '1px solid #DFE1E6' : 'none',
                                                        textAlign: 'center',
                                                        minWidth: zoom === 'day' ? 40 : zoom === 'week' ? 80 : 100
                                                    }}
                                                >
                                                    <Tooltip title={period.fullDate}>
                                                        <Typography variant="caption" fontWeight={600} sx={{ color: '#42526E' }}>
                                                            {period.label}
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>
                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            {/* Body */}
                            <TableBody>
                                {Object.entries(groupedTasks).map(([groupName, tasks], groupIdx) => (
                                    <>
                                        {/* Group Header */}
                                        <TableRow key={`group-${groupName}`}>
                                            <TableCell
                                                colSpan={4}
                                                sx={{
                                                    bgcolor: '#F4F5F7',
                                                    fontWeight: 600,
                                                    color: '#172B4D',
                                                    borderBottom: '2px solid #DFE1E6'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Target size={16} color="#6554C0" />
                                                    {groupName}
                                                    <Chip
                                                        label={`${tasks.length} tasks`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'white',
                                                            color: '#6B778C',
                                                            fontSize: '0.7rem',
                                                            height: 20,
                                                            ml: 1
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>

                                        {/* Tasks */}
                                        {tasks.map((task, taskIdx) => {
                                            const barStyle = getTaskBarStyle(taskIdx, groupIdx);

                                            return (
                                                <TableRow key={task.id} sx={{ '&:hover': { bgcolor: '#F4F5F7' } }}>
                                                    <TableCell sx={{ borderRight: '2px solid #DFE1E6' }}>
                                                        <Typography variant="body2" fontWeight={500} sx={{ color: '#172B4D' }}>
                                                            {task.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                                            {task.key}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: '1px solid #DFE1E6', textAlign: 'center' }}>
                                                        <Chip
                                                            label={task.status}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: task.status === 'Done' ? '#E3FCEF' :
                                                                    task.status === 'In Progress' ? '#DEEBFF' :
                                                                        task.status === 'In Review' ? '#EAE6FF' : '#DFE1E6',
                                                                color: task.status === 'Done' ? '#006644' :
                                                                    task.status === 'In Progress' ? '#0052CC' :
                                                                        task.status === 'In Review' ? '#5243AA' : '#42526E',
                                                                fontSize: '0.7rem',
                                                                height: 20
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ borderRight: '2px solid #DFE1E6', textAlign: 'center' }}>
                                                        {task.assignee && (
                                                            <Tooltip title={task.assignee.name}>
                                                                <Box
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        borderRadius: '50%',
                                                                        bgcolor: task.assignee.color || '#0052CC',
                                                                        color: 'white',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        mx: 'auto'
                                                                    }}
                                                                >
                                                                    {task.assignee.name.charAt(0)}
                                                                </Box>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ position: 'relative', p: 0 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                height: 56,
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            {/* Grid lines */}
                                                            {timePeriods.map((_, idx) => (
                                                                <Box
                                                                    key={idx}
                                                                    sx={{
                                                                        flex: 1,
                                                                        borderRight: idx < timePeriods.length - 1 ? '1px solid #F4F5F7' : 'none',
                                                                        minWidth: zoom === 'day' ? 40 : zoom === 'week' ? 80 : 100
                                                                    }}
                                                                />
                                                            ))}

                                                            {/* Task bar */}
                                                            <Tooltip title={`${task.title} • ${task.status}`}>
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)',
                                                                        height: 24,
                                                                        borderRadius: '4px',
                                                                        bgcolor: task.status === 'Done' ? '#00875A' :
                                                                            task.status === 'In Progress' ? '#0052CC' :
                                                                                task.status === 'In Review' ? '#6554C0' : '#6B778C',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        px: 1,
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            opacity: 0.8
                                                                        },
                                                                        ...barStyle
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis'
                                                                        }}
                                                                    >
                                                                        {task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title}
                                                                    </Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {Object.keys(groupedTasks).length === 0 && (
                        <Box sx={{ p: 8, textAlign: 'center', border: '1px solid #DFE1E6', borderTop: 'none', bgcolor: 'white' }}>
                            <Calendar size={48} color="#DFE1E6" style={{ marginBottom: 16 }} />
                            <Typography variant="h6" gutterBottom sx={{ color: '#42526E' }}>
                                No Tasks to Display
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Create tasks in your backlog to see them on the Gantt chart
                            </Typography>
                        </Box>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

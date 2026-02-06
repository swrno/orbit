"use client";

import { use, useState } from "react";
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent, CardHeader,
    IconButton, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import {
    BarChart3, PieChart, LineChart, Activity, MoreHorizontal, Download, Filter
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ChartViewProps {
    workspaceId: string;
}

export function ChartView({ workspaceId }: ChartViewProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    if (!workspace) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    // Calculate metrics
    const totalTasks = workspace.tasks.length;
    const completedTasks = workspace.tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = workspace.tasks.filter(t => t.status === 'In Progress').length;
    const todoTasks = workspace.tasks.filter(t => t.status === 'Todo' || t.status === 'Blocked').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Epics metrics
    const epicsCount = workspace.epics?.length || 0;
    const completedEpics = workspace.epics?.filter(e => e.status === 'Done').length || 0;
    
    // Sprint metrics
    const activeSprint = workspace.sprints?.find(s => s.status === 'active');
    const activeSprintTasks = activeSprint ? workspace.tasks.filter(t => t.sprintId === activeSprint.id) : [];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #DFE1E6', p: 3 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" fontWeight={600} sx={{ color: '#172B4D', mb: 0.5 }}>
                                Analytics
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Project performance and statistics
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small">
                                <Filter size={20} />
                            </IconButton>
                            <IconButton size="small">
                                <Download size={20} />
                            </IconButton>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        {/* KPI Cards */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #DFE1E6', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ color: '#6B778C', mb: 1 }}>
                                        Total Completion
                                    </Typography>
                                    <Typography variant="h4" fontWeight={600} sx={{ color: '#0052CC', mb: 1 }}>
                                        {completionRate}%
                                    </Typography>
                                    <Box sx={{ width: '100%', bgcolor: '#EBECF0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                                        <Box sx={{ width: `${completionRate}%`, bgcolor: '#0052CC', height: '100%' }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #DFE1E6', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ color: '#6B778C', mb: 1 }}>
                                        Active Tasks
                                    </Typography>
                                    <Typography variant="h4" fontWeight={600} sx={{ color: '#172B4D' }}>
                                        {inProgressTasks}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#00875A', display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Activity size={14} style={{ marginRight: 4 }} /> 
                                        {Math.round((inProgressTasks / totalTasks) * 100)}% of total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #DFE1E6', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ color: '#6B778C', mb: 1 }}>
                                        Completed Tasks
                                    </Typography>
                                    <Typography variant="h4" fontWeight={600} sx={{ color: '#172B4D' }}>
                                        {completedTasks}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6B778C', mt: 1, display: 'block' }}>
                                        Last 30 days
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #DFE1E6', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ color: '#6B778C', mb: 1 }}>
                                        Epic Progress
                                    </Typography>
                                    <Typography variant="h4" fontWeight={600} sx={{ color: '#172B4D' }}>
                                        {completedEpics}/{epicsCount}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6B778C', mt: 1, display: 'block' }}>
                                        Epics completed
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Status Distribution */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #DFE1E6', height: 400 }}>
                                <CardHeader 
                                    title="Task Status Distribution" 
                                    action={
                                        <IconButton size="small"><MoreHorizontal size={20} /></IconButton>
                                    }
                                />
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                                    {/* Simplified 'Bar Chat' Visualization */}
                                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, px: 4 }}>
                                        {[
                                            { label: 'To Do', count: todoTasks, color: '#42526E' },
                                            { label: 'In Progress', count: inProgressTasks, color: '#0052CC' },
                                            { label: 'Done', count: completedTasks, color: '#00875A' }
                                        ].map(item => (
                                            <Box key={item.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
                                                <Typography variant="caption" fontWeight={600} sx={{ mb: 1 }}>{item.count}</Typography>
                                                <Box 
                                                    sx={{ 
                                                        width: 40, 
                                                        height: Math.max(20, (item.count / totalTasks) * 180), 
                                                        bgcolor: item.color, 
                                                        borderRadius: '4px 4px 0 0' 
                                                    }} 
                                                />
                                                <Typography variant="caption" sx={{ mt: 1, color: '#6B778C' }}>{item.label}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Recent Activity Mock */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ boxShadow: 'none', border: '1px solid #DFE1E6', height: 400 }}>
                                <CardHeader 
                                    title="Sprint Progress" 
                                    subheader={activeSprint ? activeSprint.name : 'No Active Sprint'}
                                    action={
                                        <IconButton size="small"><MoreHorizontal size={20} /></IconButton>
                                    }
                                />
                                <Box sx={{ p: 3 }}>
                                    {activeSprint ? (
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 2, color: '#6B778C' }}>
                                                Tasks by owner
                                            </Typography>
                                            {/* Mock owner distribution */}
                                            {['Unassigned', 'Me'].map(acc => (
                                                <Box key={acc} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2">{acc}</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {activeSprintTasks.filter(t => (acc === 'Unassigned' ? !t.owner : true)).length}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ width: '100%', bgcolor: '#EBECF0', height: 6, borderRadius: 3 }}>
                                                        <Box sx={{ width: '50%', bgcolor: '#6554C0', height: '100%', borderRadius: 3 }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                                            <Typography variant="body1" sx={{ color: '#6B778C' }}>Start a sprint to see analytics</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

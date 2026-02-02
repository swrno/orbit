"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

import { Box, Paper, Typography, Tabs, Tab, Chip } from "@mui/material";
import { SprintBurndown } from "@/components/analytics/SprintBurndown";
import { ActivityLog } from "@/components/analytics/ActivityLog";
import { BarChart3, TrendingUp, Users, Layers, Target, Clock } from "lucide-react";
import { useState, useMemo } from "react";

export default function ReportsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [activeTab, setActiveTab] = useState(0);

    // Calculate workspace-level stats
    const stats = useMemo(() => {
        if (!workspace) return null;

        const tasks = workspace.tasks;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
        const totalPoints = tasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const completedPoints = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const totalHoursLogged = tasks.reduce((sum, t) =>
            sum + (t.timeLogs?.reduce((tSum, tl) => tSum + tl.hours, 0) || 0), 0
        );

        // Calculate velocity from completed sprints
        const completedSprints = workspace.sprints?.filter(s => s.status === 'completed' && s.velocity) || [];
        const avgVelocity = completedSprints.length > 0
            ? Math.round(completedSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / completedSprints.length)
            : 0;

        // Task distribution by status
        const statusDistribution = {
            'Todo': tasks.filter(t => t.status === 'Todo').length,
            'In Progress': inProgressTasks,
            'In Review': tasks.filter(t => t.status === 'In Review').length,
            'Done': completedTasks,
            'Blocked': blockedTasks,
        };

        // Task distribution by priority
        const priorityDistribution = {
            'Critical': tasks.filter(t => t.priority === 'Critical').length,
            'High': tasks.filter(t => t.priority === 'High').length,
            'Medium': tasks.filter(t => t.priority === 'Medium').length,
            'Low': tasks.filter(t => t.priority === 'Low').length,
        };

        // Tasks by assignee
        const tasksByAssignee: Record<string, number> = {};
        tasks.forEach(t => {
            const owner = t.owner || 'Unassigned';
            tasksByAssignee[owner] = (tasksByAssignee[owner] || 0) + 1;
        });

        // Epic progress
        const epicProgress = workspace.epics?.map(epic => {
            const epicTasks = tasks.filter(t => t.epicId === epic.id);
            const completedEpicTasks = epicTasks.filter(t => t.status === 'Done');
            return {
                ...epic,
                totalTasks: epicTasks.length,
                completedTasks: completedEpicTasks.length,
                progress: epicTasks.length > 0 ? Math.round((completedEpicTasks.length / epicTasks.length) * 100) : 0
            };
        }) || [];

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            blockedTasks,
            totalPoints,
            completedPoints,
            totalHoursLogged,
            avgVelocity,
            statusDistribution,
            priorityDistribution,
            tasksByAssignee,
            epicProgress,
            teamSize: workspace.teamMembers?.length || 0,
            activeSprintsCount: workspace.sprints?.filter(s => s.status === 'active').length || 0
        };
    }, [workspace]);

    if (!workspace) {
        return <Typography>Workspace not found</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>

            <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <BarChart3 size={28} />
                    <Typography variant="h4" fontWeight={700}>
                        Reports & Analytics
                    </Typography>
                </Box>

                {stats && (
                    <>
                        {/* Summary Cards */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, mb: 4 }}>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Layers size={16} color="#6b7280" />
                                    <Typography variant="caption" color="text.secondary">Total Tasks</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700}>{stats.totalTasks}</Typography>
                            </Paper>

                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrendingUp size={16} color="#10b981" />
                                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} color="success.main">{stats.completedTasks}</Typography>
                            </Paper>

                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Target size={16} color="#6b7280" />
                                    <Typography variant="caption" color="text.secondary">Story Points</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700}>
                                    {stats.completedPoints}<Typography component="span" variant="h6" color="text.secondary">/{stats.totalPoints}</Typography>
                                </Typography>
                            </Paper>

                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Clock size={16} color="#6b7280" />
                                    <Typography variant="caption" color="text.secondary">Hours Logged</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700}>{stats.totalHoursLogged}h</Typography>
                            </Paper>

                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TrendingUp size={16} color="#3b82f6" />
                                    <Typography variant="caption" color="text.secondary">Avg Velocity</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700} color="primary.main">{stats.avgVelocity || '-'}</Typography>
                            </Paper>

                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Users size={16} color="#6b7280" />
                                    <Typography variant="caption" color="text.secondary">Team Size</Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={700}>{stats.teamSize}</Typography>
                            </Paper>
                        </Box>

                        {/* Tabs for different reports */}
                        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Tab label="Sprint Burndown" />
                                <Tab label="Task Distribution" />
                                <Tab label="Epic Progress" />
                                <Tab label="Activity Log" />
                            </Tabs>

                            <Box sx={{ p: 3 }}>
                                {/* Sprint Burndown */}
                                {activeTab === 0 && (
                                    <SprintBurndown workspaceId={workspaceId} />
                                )}

                                {/* Task Distribution */}
                                {activeTab === 1 && (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                                        {/* By Status */}
                                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                                By Status
                                            </Typography>
                                            {Object.entries(stats.statusDistribution).map(([status, count]) => (
                                                <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                                    <Typography variant="body2">{status}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: Math.max(4, (count / stats.totalTasks) * 100),
                                                                height: 8,
                                                                bgcolor: status === 'Done' ? 'success.main' : status === 'Blocked' ? 'error.main' : 'primary.main',
                                                                borderRadius: 1
                                                            }}
                                                        />
                                                        <Typography variant="body2" fontWeight={600}>{count}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Paper>

                                        {/* By Priority */}
                                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                                By Priority
                                            </Typography>
                                            {Object.entries(stats.priorityDistribution).map(([priority, count]) => (
                                                <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                                    <Typography variant="body2">{priority}</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: Math.max(4, (count / stats.totalTasks) * 100),
                                                                height: 8,
                                                                bgcolor: priority === 'Critical' ? '#ef4444' : priority === 'High' ? '#f97316' : priority === 'Medium' ? '#3b82f6' : '#94a3b8',
                                                                borderRadius: 1
                                                            }}
                                                        />
                                                        <Typography variant="body2" fontWeight={600}>{count}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Paper>

                                        {/* By Assignee */}
                                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                                By Assignee
                                            </Typography>
                                            {Object.entries(stats.tasksByAssignee)
                                                .sort((a, b) => b[1] - a[1])
                                                .slice(0, 5)
                                                .map(([assignee, count]) => (
                                                    <Box key={assignee} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                                        <Typography variant="body2">{assignee}</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box
                                                                sx={{
                                                                    width: Math.max(4, (count / stats.totalTasks) * 100),
                                                                    height: 8,
                                                                    bgcolor: 'primary.main',
                                                                    borderRadius: 1
                                                                }}
                                                            />
                                                            <Typography variant="body2" fontWeight={600}>{count}</Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                        </Paper>
                                    </Box>
                                )}

                                {/* Epic Progress */}
                                {activeTab === 2 && (
                                    <Box>
                                        {stats.epicProgress.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {stats.epicProgress.map(epic => (
                                                    <Paper key={epic.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: epic.color }} />
                                                            <Typography variant="subtitle2" fontWeight={600}>{epic.name}</Typography>
                                                            <Chip label={epic.status} size="small" />
                                                            <Box sx={{ flex: 1 }} />
                                                            <Typography variant="body2" fontWeight={600}>{epic.progress}%</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                                                                <Box sx={{ width: `${epic.progress}%`, height: '100%', bgcolor: epic.color, borderRadius: 4 }} />
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {epic.completedTasks} / {epic.totalTasks} tasks
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                                <Typography variant="h6" gutterBottom>No Epics</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Create epics to track larger initiatives.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {/* Activity Log */}
                                {activeTab === 3 && (
                                    <ActivityLog workspaceId={workspaceId} limit={15} />
                                )}
                            </Box>
                        </Paper>
                    </>
                )}
            </Box>
        </Box>
    );
}

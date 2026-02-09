"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

import { Box, Paper, Typography, Tabs, Tab, Chip, GlobalStyles, Stack } from "@mui/material";
import { SprintBurndown } from "@/components/analytics/SprintBurndown";
import { ActivityLog } from "@/components/analytics/ActivityLog";
import { BarChart3, TrendingUp, Users, Layers, Target, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { alpha, useTheme } from "@mui/material/styles";

const fontJakarta = 'var(--font-plus-jakarta)';

export default function ReportsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const theme = useTheme();

    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
                const data = await res.json();
                if (data.success) {
                    setTasks(data.data);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        if (workspaceId) {
            fetchTasks();
        }
    }, [workspaceId]);

    const [activeTab, setActiveTab] = useState(0);

    // Calculate workspace-level stats
    const stats = useMemo(() => {
        if (!workspace || tasks.length === 0) return null;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
        const totalPoints = tasks.reduce((sum, t) => sum + (t.estimatedPoints || t.estimatedSP || 0), 0);
        const completedPoints = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || t.estimatedSP || 0), 0);
        const totalHoursLogged = tasks.reduce((sum, t) =>
            sum + (t.timeLogs?.reduce((tSum: any, tl: any) => tSum + tl.hours, 0) || 0), 0
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
            const owner = t.owner?.name || t.owner || 'Unassigned';
            tasksByAssignee[owner] = (tasksByAssignee[owner] || 0) + 1;
        });

        // Epic progress
        const epicProgress = workspace.epics?.map(epic => {
            const epicTasks = tasks.filter(t => t.epicId === epic.id || t.epic === epic.name);
            const completedEpicTasks = epicTasks.filter(t => t.status === 'Done');
            return {
                ...epic,
                totalTasks: epicTasks.length,
                completedTasks: completedEpicTasks.length,
                progress: epicTasks.length > 0 ? Math.round((completedEpicTasks.length / epicTasks.length) * 100) : 0
            };
        }) || [];

        // Team breakdown
        const teamStats = workspace.teams?.map(team => {
            const teamTasks = tasks.filter(t => t.teamId === team.id);
            const teamCompleted = teamTasks.filter(t => t.status === 'Done').length;
            return {
                id: team.id,
                title: team.title,
                total: teamTasks.length,
                completed: teamCompleted,
                inProgress: teamTasks.filter(t => t.status === 'In Progress').length,
                progress: teamTasks.length > 0 ? Math.round((teamCompleted / teamTasks.length) * 100) : 0
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
            teamStats,
            teamSize: workspace.teamMembers?.length || workspace.members?.length || 0,
            activeSprintsCount: workspace.sprints?.filter(s => s.status === 'active').length || 0
        };
    }, [workspace, tasks]);

    if (!workspace) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontFamily: fontJakarta }}>Workspace not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f8fafc', p: { xs: 3, md: 5 } }}>
            <GlobalStyles styles={{
                '.MuiTab-root': { fontFamily: fontJakarta, textTransform: 'none', fontWeight: 600 },
                '.MuiTypography-root': { fontFamily: fontJakarta }
            }} />

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
                    Reports & Analytics
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Interactive project performance and team insights for {workspace.name || workspace.title}
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>Loading report data...</Typography>
                </Box>
            ) : stats ? (
                <>
                    {/* Summary Cards */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: 'white', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Layers size={14} color="#64748b" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Tasks</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a' }}>{stats.totalTasks}</Typography>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: 'white', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CheckCircle2 size={14} color="#10b981" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Completed</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>{stats.completedTasks}</Typography>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: 'white', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Target size={14} color="#64748b" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Story Points</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a' }}>
                                {stats.completedPoints}<Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>/ {stats.totalPoints}</Typography>
                            </Typography>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: 'white', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Clock size={14} color="#64748b" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Hours Logged</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a' }}>{stats.totalHoursLogged}h</Typography>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: 'white', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp size={14} color="#3b82f6" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Avg Velocity</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#3b82f6' }}>{stats.avgVelocity || '0'}</Typography>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: 'white', borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Users size={14} color="#64748b" />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Team Size</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a' }}>{stats.teamSize}</Typography>
                        </Paper>
                    </Box>

                    {/* Tabs for different reports */}
                    <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden', bgcolor: 'white' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            sx={{
                                px: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                            }}
                        >
                            <Tab label="Sprint Burndown" />
                            <Tab label="Team Performance" />
                            <Tab label="Task Distribution" />
                            <Tab label="Epic Progress" />
                            <Tab label="Activity" />
                        </Tabs>

                        <Box sx={{ p: 4 }}>
                            {/* Sprint Burndown */}
                            {activeTab === 0 && (
                                <SprintBurndown workspaceId={workspaceId} />
                            )}

                            {/* Team Performance */}
                            {activeTab === 1 && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                    {stats.teamStats.map(team => (
                                        <Paper key={team.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{team.title}</Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">Progress</Typography>
                                                    <Typography variant="body2" fontWeight={600}>{team.progress}%</Typography>
                                                </Box>
                                                <Box sx={{ width: '100%', height: 8, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                                    <Box sx={{ width: `${team.progress}%`, height: '100%', bgcolor: theme.palette.primary.main, borderRadius: 4 }} />
                                                </Box>
                                            </Box>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Completed Tasks</Typography>
                                                    <Typography variant="body2" fontWeight={600}>{team.completed}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">In Progress</Typography>
                                                    <Typography variant="body2" fontWeight={600}>{team.inProgress}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Total Work</Typography>
                                                    <Typography variant="body2" fontWeight={600}>{team.total}</Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Box>
                            )}

                            {/* Task Distribution */}
                            {activeTab === 2 && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                                    {/* By Status */}
                                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>By Status</Typography>
                                        <Stack spacing={2}>
                                            {Object.entries(stats.statusDistribution).map(([label, count]) => (
                                                <Box key={label}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="caption" fontWeight={600}>{label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{count}</Typography>
                                                    </Box>
                                                    <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                        <Box sx={{
                                                            width: `${(count / stats.totalTasks) * 100}%`,
                                                            height: '100%',
                                                            bgcolor: label === 'Done' ? '#10b981' : label === 'InProgress' ? '#3b82f6' : '#cbd5e1',
                                                            borderRadius: 3
                                                        }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>

                                    {/* By Priority */}
                                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>By Priority</Typography>
                                        <Stack spacing={2}>
                                            {Object.entries(stats.priorityDistribution).map(([label, count]) => (
                                                <Box key={label}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="caption" fontWeight={600}>{label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{count}</Typography>
                                                    </Box>
                                                    <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                        <Box sx={{
                                                            width: `${(count / stats.totalTasks) * 100}%`,
                                                            height: '100%',
                                                            bgcolor: label === 'Critical' ? '#ef4444' : label === 'High' ? '#f97316' : '#3b82f6',
                                                            borderRadius: 3
                                                        }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>

                                    {/* By Assignee */}
                                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>By Assignee</Typography>
                                        <Stack spacing={2}>
                                            {Object.entries(stats.tasksByAssignee).slice(0, 5).map(([label, count]) => (
                                                <Box key={label}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="caption" fontWeight={600}>{label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{count} tasks</Typography>
                                                    </Box>
                                                    <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                        <Box sx={{ width: `${(count / stats.totalTasks) * 100}%`, height: '100%', bgcolor: '#6366f1', borderRadius: 3 }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}

                            {/* Epic Progress */}
                            {activeTab === 3 && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                                    {(stats.epicProgress && stats.epicProgress.length > 0) ? stats.epicProgress.map(epic => (
                                        <Paper key={epic.id} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>{epic.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{epic.totalTasks} tasks</Typography>
                                                </Box>
                                                <Chip label={`${epic.progress}%`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                                            </Box>
                                            <Box sx={{ width: '100%', height: 10, bgcolor: '#f1f5f9', borderRadius: 5, overflow: 'hidden', mb: 2 }}>
                                                <Box sx={{ width: `${epic.progress}%`, height: '100%', bgcolor: theme.palette.primary.main, borderRadius: 5 }} />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {epic.completedTasks} of {epic.totalTasks} tasks completed
                                            </Typography>
                                        </Paper>
                                    )) : (
                                        <Box sx={{ gridColumn: 'span 2', p: 4, textAlign: 'center' }}>
                                            <Typography color="text.secondary">No epics found in this workspace.</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* Activity Log */}
                            {activeTab === 4 && (
                                <ActivityLog workspaceId={workspaceId} limit={15} />
                            )}
                        </Box>
                    </Paper>
                </>
            ) : (
                <Box sx={{ p: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">No data available for this workspace yet. Start by creating some tasks!</Typography>
                </Box>
            )}
        </Box>
    );
}

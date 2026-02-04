"use client";

import { useAppStore } from "@/lib/store";
import { Box, Paper, Typography, LinearProgress, Avatar, Chip, Tooltip } from "@mui/material";
import { User, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

interface CapacityPlanningProps {
    workspaceId: string;
    sprintId?: string;
}

export function CapacityPlanning({ workspaceId, sprintId }: CapacityPlanningProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const teamCapacity = useMemo(() => {
        if (!workspace) return [];

        const members = workspace.teamMembers || [];
        const tasks = workspace.tasks.filter(t =>
            (!sprintId || t.sprintId === sprintId) &&
            t.status !== 'Done'
        );

        return members.map(member => {
            const assignedTasks = tasks.filter(t => t.owner === member.name);
            const totalPoints = assignedTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
            const totalHours = assignedTasks.reduce((sum, t) => sum + (t.originalEstimate || 0), 0);

            // Assuming 40 hours per week capacity
            const weeklyCapacity = 40;
            const utilizationPercent = (totalHours / weeklyCapacity) * 100;

            return {
                member,
                tasks: assignedTasks.length,
                points: totalPoints,
                hours: totalHours,
                capacity: weeklyCapacity,
                utilization: utilizationPercent,
                status: utilizationPercent > 100 ? 'overloaded' : utilizationPercent < 70 ? 'underloaded' : 'balanced',
            };
        });
    }, [workspace, sprintId]);

    if (!workspace || teamCapacity.length === 0) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Team Capacity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">
                        No team members found
                    </Typography>
                </Box>
            </Paper>
        );
    }

    const avgUtilization = teamCapacity.reduce((sum, m) => sum + m.utilization, 0) / teamCapacity.length;

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                    Team Capacity Planning
                </Typography>
                <Chip
                    label={`Avg Utilization: ${Math.round(avgUtilization)}%`}
                    size="small"
                    color={avgUtilization > 100 ? 'error' : avgUtilization < 70 ? 'warning' : 'success'}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {teamCapacity.map((item) => {
                    const StatusIcon = item.status === 'overloaded' ? TrendingUp :
                        item.status === 'underloaded' ? TrendingDown : Minus;
                    const statusColor = item.status === 'overloaded' ? '#ef4444' :
                        item.status === 'underloaded' ? '#f59e0b' : '#10b981';

                    return (
                        <Box
                            key={item.member.id}
                            sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: 1,
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                        {item.member.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            {item.member.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.member.role}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {item.tasks} tasks · {item.points} SP
                                        </Typography>
                                        <Typography variant="caption" fontWeight={600}>
                                            {item.hours}h / {item.capacity}h
                                        </Typography>
                                    </Box>
                                    <Tooltip title={item.status.charAt(0).toUpperCase() + item.status.slice(1)}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: `${statusColor}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <StatusIcon size={16} color={statusColor} />
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <LinearProgress
                                variant="determinate"
                                value={Math.min(item.utilization, 100)}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: '#f1f5f9',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: statusColor,
                                        borderRadius: 4,
                                    }
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    mt: 0.5,
                                    textAlign: 'right',
                                    fontWeight: 600,
                                    color: statusColor,
                                }}
                            >
                                {Math.round(item.utilization)}% utilized
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
                    CAPACITY LEGEND
                </Typography>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingDown size={14} color="#f59e0b" />
                        <Typography variant="caption">&lt;70% - Underloaded</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Minus size={14} color="#10b981" />
                        <Typography variant="caption">70-100% - Balanced</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUp size={14} color="#ef4444" />
                        <Typography variant="caption">&gt;100% - Overloaded</Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}

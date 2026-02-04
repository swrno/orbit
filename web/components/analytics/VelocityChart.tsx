"use client";

import { useAppStore } from "@/lib/store";
import { Box, Paper, Typography } from "@mui/material";
import { useMemo } from "react";

interface VelocityChartProps {
    workspaceId: string;
}

export function VelocityChart({ workspaceId }: VelocityChartProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const velocityData = useMemo(() => {
        if (!workspace) return [];

        const sprints = workspace.sprints
            .filter(s => s.status === 'completed')
            .slice(-6) // Last 6 sprints
            .map(sprint => {
                const sprintTasks = workspace.tasks.filter(t => t.sprintId === sprint.id);
                const committed = sprintTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
                const completed = sprintTasks
                    .filter(t => t.status === 'Done')
                    .reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);

                return {
                    name: sprint.name,
                    committed,
                    completed,
                };
            });

        return sprints;
    }, [workspace]);

    if (!workspace || velocityData.length === 0) {
        return (
            <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Velocity Chart
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">
                        No completed sprints yet
                    </Typography>
                </Box>
            </Paper>
        );
    }

    const maxValue = Math.max(...velocityData.flatMap(d => [d.committed, d.completed]));
    const avgCompleted = velocityData.reduce((sum, d) => sum + d.completed, 0) / velocityData.length;

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                    Velocity Chart
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: 0.5 }} />
                        <Typography variant="caption">Committed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: 0.5 }} />
                        <Typography variant="caption">Completed</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ position: 'relative', height: 250 }}>
                {/* Average line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: `${(avgCompleted / maxValue) * 100}%`,
                        borderTop: '2px dashed',
                        borderColor: 'warning.main',
                        opacity: 0.5,
                        zIndex: 1,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: -20,
                            bgcolor: 'warning.50',
                            px: 0.5,
                            borderRadius: 0.5,
                            fontWeight: 600,
                        }}
                    >
                        Avg: {Math.round(avgCompleted)} SP
                    </Typography>
                </Box>

                {/* Bars */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 2 }}>
                    {velocityData.map((sprint, idx) => (
                        <Box key={idx} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', mb: 1 }}>
                                {/* Committed bar */}
                                <Box
                                    sx={{
                                        width: 20,
                                        height: (sprint.committed / maxValue) * 200,
                                        bgcolor: '#3b82f6',
                                        borderRadius: '4px 4px 0 0',
                                        position: 'relative',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            bgcolor: '#2563eb',
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            position: 'absolute',
                                            top: -18,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                        }}
                                    >
                                        {sprint.committed}
                                    </Typography>
                                </Box>

                                {/* Completed bar */}
                                <Box
                                    sx={{
                                        width: 20,
                                        height: (sprint.completed / maxValue) * 200,
                                        bgcolor: '#10b981',
                                        borderRadius: '4px 4px 0 0',
                                        position: 'relative',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            bgcolor: '#059669',
                                        }
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            position: 'absolute',
                                            top: -18,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                        }}
                                    >
                                        {sprint.completed}
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 500,
                                    textAlign: 'center',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {sprint.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                Average Velocity: {Math.round(avgCompleted)} Story Points
            </Typography>
        </Paper>
    );
}

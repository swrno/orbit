"use client";

import { useAppStore, Sprint } from "@/lib/store";
import { Box, Paper, Typography, Select, FormControl, MenuItem } from "@mui/material";
import { TrendingDown, Calendar, Target, Layers } from "lucide-react";
import { useState, useMemo } from "react";

interface SprintBurndownProps {
    workspaceId: string;
}

export function SprintBurndown({ workspaceId }: SprintBurndownProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const activeSprints = useMemo(() =>
        workspace?.sprints?.filter(s => s.status === 'active' || s.status === 'completed') || [],
        [workspace]
    );

    const [selectedSprintId, setSelectedSprintId] = useState<string>(
        activeSprints[0]?.id || ''
    );

    if (!workspace) return null;

    const selectedSprint = workspace.sprints?.find(s => s.id === selectedSprintId);

    // Calculate burndown data
    const burndownData = useMemo(() => {
        if (!selectedSprint) return null;

        const sprintTasks = workspace.tasks.filter(t => t.sprintId === selectedSprintId);
        const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const completedPoints = sprintTasks
            .filter(t => t.status === 'Done')
            .reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);

        const startDate = new Date(selectedSprint.startDate);
        const endDate = new Date(selectedSprint.endDate);
        const today = new Date();

        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.min(
            totalDays,
            Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        );
        const daysRemaining = totalDays - daysPassed;

        // Ideal burndown line
        const idealBurndown: number[] = [];
        const pointsPerDay = totalPoints / totalDays;
        for (let i = 0; i <= totalDays; i++) {
            idealBurndown.push(Math.max(0, totalPoints - (pointsPerDay * i)));
        }

        // Simulated actual burndown (in a real app, this would come from historical data)
        const actualBurndown: number[] = [];
        const remainingPoints = totalPoints - completedPoints;
        for (let i = 0; i <= daysPassed; i++) {
            // Simulate some progress variation
            const progress = (completedPoints / daysPassed) * i;
            actualBurndown.push(Math.max(0, totalPoints - progress));
        }

        return {
            totalPoints,
            completedPoints,
            remainingPoints,
            totalDays,
            daysPassed,
            daysRemaining,
            idealBurndown,
            actualBurndown,
            startDate,
            endDate,
            tasksCount: sprintTasks.length,
            completedTasksCount: sprintTasks.filter(t => t.status === 'Done').length,
            velocity: selectedSprint.velocity || 0
        };
    }, [selectedSprint, workspace.tasks, selectedSprintId]);

    if (activeSprints.length === 0) {
        return (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <TrendingDown size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <Typography variant="h6" gutterBottom>No Sprint Data</Typography>
                <Typography variant="body2" color="text.secondary">
                    Start a sprint to see burndown analytics.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingDown size={24} />
                    <Typography variant="h5" fontWeight={600}>
                        Sprint Burndown
                    </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                        native
                        value={selectedSprintId}
                        onChange={(e) => setSelectedSprintId(e.target.value)}
                    >
                        {activeSprints.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} {s.status === 'active' ? '(Active)' : ''}
                            </option>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {burndownData && (
                <>
                    {/* Stats Cards */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Total Points</Typography>
                            <Typography variant="h4" fontWeight={700}>{burndownData.totalPoints}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Completed</Typography>
                            <Typography variant="h4" fontWeight={700} color="success.main">{burndownData.completedPoints}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Remaining</Typography>
                            <Typography variant="h4" fontWeight={700} color="warning.main">{burndownData.remainingPoints}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Days Left</Typography>
                            <Typography variant="h4" fontWeight={700}>{burndownData.daysRemaining}</Typography>
                        </Paper>
                    </Box>

                    {/* Burndown Chart (SVG) */}
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Burndown Chart
                        </Typography>
                        <Box sx={{ height: 250, position: 'relative' }}>
                            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                                {/* Grid lines */}
                                <g stroke="#e5e7eb" strokeWidth="0.5">
                                    {[0, 50, 100, 150, 200].map(y => (
                                        <line key={y} x1="40" y1={y} x2="380" y2={y} />
                                    ))}
                                    {[40, 120, 200, 280, 360].map(x => (
                                        <line key={x} x1={x} y1="0" x2={x} y2="200" />
                                    ))}
                                </g>

                                {/* Y-axis labels */}
                                <g fill="#6b7280" fontSize="10">
                                    <text x="35" y="10" textAnchor="end">{burndownData.totalPoints}</text>
                                    <text x="35" y="60" textAnchor="end">{Math.round(burndownData.totalPoints * 0.75)}</text>
                                    <text x="35" y="110" textAnchor="end">{Math.round(burndownData.totalPoints * 0.5)}</text>
                                    <text x="35" y="160" textAnchor="end">{Math.round(burndownData.totalPoints * 0.25)}</text>
                                    <text x="35" y="200" textAnchor="end">0</text>
                                </g>

                                {/* Ideal burndown line */}
                                <line
                                    x1="40"
                                    y1="10"
                                    x2="380"
                                    y2="198"
                                    stroke="#94a3b8"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />

                                {/* Actual burndown line */}
                                {burndownData.daysPassed > 0 && (
                                    <polyline
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={burndownData.actualBurndown.map((points, i) => {
                                            const x = 40 + (i / burndownData.totalDays) * 340;
                                            const y = 198 - (points / burndownData.totalPoints) * 188;
                                            return `${x},${y}`;
                                        }).join(' ')}
                                    />
                                )}

                                {/* Current point marker */}
                                {burndownData.daysPassed > 0 && (
                                    <circle
                                        cx={40 + (burndownData.daysPassed / burndownData.totalDays) * 340}
                                        cy={198 - (burndownData.remainingPoints / burndownData.totalPoints) * 188}
                                        r="6"
                                        fill="#3b82f6"
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                )}
                            </svg>

                            {/* Legend */}
                            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 24, height: 2, bgcolor: '#94a3b8', borderStyle: 'dashed' }} />
                                    <Typography variant="caption" color="text.secondary">Ideal</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 24, height: 3, bgcolor: '#3b82f6', borderRadius: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Actual</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Sprint Details */}
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Sprint Details
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Calendar size={18} color="#6b7280" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                                    <Typography variant="body2">
                                        {burndownData.startDate.toLocaleDateString()} - {burndownData.endDate.toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Target size={18} color="#6b7280" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Goal</Typography>
                                    <Typography variant="body2">{selectedSprint?.goal || 'No goal set'}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Layers size={18} color="#6b7280" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tasks</Typography>
                                    <Typography variant="body2">
                                        {burndownData.completedTasksCount} / {burndownData.tasksCount} completed
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <TrendingDown size={18} color="#6b7280" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Velocity</Typography>
                                    <Typography variant="body2">
                                        {burndownData.velocity > 0 ? `${burndownData.velocity} points` : 'In progress'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </>
            )}
        </Box>
    );
}

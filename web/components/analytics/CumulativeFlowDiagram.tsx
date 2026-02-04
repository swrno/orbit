"use client";

import { useAppStore, TaskStatus } from "@/lib/store";
import { Box, Paper, Typography } from "@mui/material";
import { useMemo } from "react";

interface CumulativeFlowProps {
    workspaceId: string;
    sprintId?: string;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
    'Todo': '#64748b',
    'In Progress': '#f59e0b',
    'In Review': '#8b5cf6',
    'Done': '#10b981',
    'Blocked': '#ef4444',
};

export function CumulativeFlowDiagram({ workspaceId, sprintId }: CumulativeFlowProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const flowData = useMemo(() => {
        if (!workspace) return [];

        // Generate last 14 days of data
        const days: Array<{
            date: string;
            todo: number;
            inProgress: number;
            inReview: number;
            done: number;
            blocked: number;
        }> = [];

        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // In a real app, you'd fetch historical data
            // For now, simulate cumulative data
            const tasks = workspace.tasks.filter(t => !sprintId || t.sprintId === sprintId);
            const multiplier = (14 - i) / 14; // Simulate progress over time

            days.push({
                date: dateStr,
                todo: Math.round(tasks.filter(t => t.status === 'Todo').length * (1 - multiplier * 0.5)),
                inProgress: Math.round(tasks.filter(t => t.status === 'In Progress').length * multiplier),
                inReview: Math.round(tasks.filter(t => t.status === 'In Review').length * multiplier * 0.8),
                done: Math.round(tasks.filter(t => t.status === 'Done').length * multiplier),
                blocked: Math.round(tasks.filter(t => t.status === 'Blocked').length * 0.5),
            });
        }

        return days;
    }, [workspace, sprintId]);

    if (!workspace || flowData.length === 0) {
        return null;
    }

    const maxValue = Math.max(...flowData.map(d => d.todo + d.inProgress + d.inReview + d.done + d.blocked));

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                    Cumulative Flow Diagram
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {(['Done', 'In Review', 'In Progress', 'Blocked', 'Todo'] as TaskStatus[]).map(status => (
                        <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: STATUS_COLORS[status], borderRadius: 0.5 }} />
                            <Typography variant="caption">{status}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ position: 'relative', height: 300 }}>
                <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(percent => (
                        <line
                            key={percent}
                            x1="0"
                            y1={300 - (percent / 100) * 300}
                            x2="800"
                            y2={300 - (percent / 100) * 300}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Stacked areas */}
                    {flowData.map((day, idx) => {
                        const x = (idx / (flowData.length - 1)) * 800;
                        const nextX = ((idx + 1) / (flowData.length - 1)) * 800;

                        const stack = [
                            day.done,
                            day.done + day.inReview,
                            day.done + day.inReview + day.inProgress,
                            day.done + day.inReview + day.inProgress + day.blocked,
                            day.done + day.inReview + day.inProgress + day.blocked + day.todo,
                        ];

                        if (idx < flowData.length - 1) {
                            const nextDay = flowData[idx + 1];
                            const nextStack = [
                                nextDay.done,
                                nextDay.done + nextDay.inReview,
                                nextDay.done + nextDay.inReview + nextDay.inProgress,
                                nextDay.done + nextDay.inReview + nextDay.inProgress + nextDay.blocked,
                                nextDay.done + nextDay.inReview + nextDay.inProgress + nextDay.blocked + nextDay.todo,
                            ];

                            const colors = [STATUS_COLORS.Done, STATUS_COLORS['In Review'], STATUS_COLORS['In Progress'], STATUS_COLORS.Blocked, STATUS_COLORS.Todo];

                            return colors.map((color, layerIdx) => {
                                const y1 = 300 - (stack[layerIdx] / maxValue) * 300;
                                const y2 = layerIdx > 0 ? 300 - (stack[layerIdx - 1] / maxValue) * 300 : 300;
                                const nextY1 = 300 - (nextStack[layerIdx] / maxValue) * 300;
                                const nextY2 = layerIdx > 0 ? 300 - (nextStack[layerIdx - 1] / maxValue) * 300 : 300;

                                return (
                                    <path
                                        key={`${idx}-${layerIdx}`}
                                        d={`M ${x} ${y1} L ${nextX} ${nextY1} L ${nextX} ${nextY2} L ${x} ${y2} Z`}
                                        fill={color}
                                        opacity={0.8}
                                    />
                                );
                            });
                        }
                        return null;
                    })}

                    {/* X-axis labels */}
                    {flowData.map((day, idx) => {
                        if (idx % 3 === 0) {
                            return (
                                <text
                                    key={idx}
                                    x={(idx / (flowData.length - 1)) * 800}
                                    y="295"
                                    fontSize="10"
                                    textAnchor="middle"
                                    fill="#64748b"
                                >
                                    {day.date}
                                </text>
                            );
                        }
                        return null;
                    })}
                </svg>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                14-day workflow distribution showing work-in-progress trends
            </Typography>
        </Paper>
    );
}

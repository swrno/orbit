"use client";

import { useAppStore, Activity } from "@/lib/store";
import { Box, Paper, Typography, Avatar, Chip, Button } from "@mui/material";
import {
    Activity as ActivityIcon, Plus, Edit, ArrowRight, MessageSquare,
    Clock, Play, Check, AlertTriangle, User
} from "lucide-react";
import { useMemo, useState } from "react";

interface ActivityLogProps {
    workspaceId: string;
    limit?: number;
    taskId?: string; // Optional: filter by task
}

const ACTIVITY_ICONS: Record<Activity['type'], any> = {
    'created': Plus,
    'updated': Edit,
    'status_changed': ArrowRight,
    'assigned': User,
    'commented': MessageSquare,
    'moved': ArrowRight,
    'time_logged': Clock,
    'sprint_started': Play,
    'sprint_completed': Check,
};

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
    'created': '#10b981',
    'updated': '#3b82f6',
    'status_changed': '#f59e0b',
    'assigned': '#8b5cf6',
    'commented': '#06b6d4',
    'moved': '#f97316',
    'time_logged': '#ec4899',
    'sprint_started': '#10b981',
    'sprint_completed': '#3b82f6',
};

function formatActivityMessage(activity: Activity): string {
    switch (activity.type) {
        case 'created':
            return 'created a new task';
        case 'updated':
            return `updated ${activity.field || 'the task'}`;
        case 'status_changed':
            return `changed status from "${activity.oldValue}" to "${activity.newValue}"`;
        case 'assigned':
            return activity.newValue
                ? `assigned task to ${activity.newValue}`
                : 'unassigned the task';
        case 'commented':
            return 'added a comment';
        case 'moved':
            return `moved task to ${activity.newValue || 'another sprint'}`;
        case 'time_logged':
            return `logged ${activity.newValue} hours`;
        case 'sprint_started':
            return 'started the sprint';
        case 'sprint_completed':
            return 'completed the sprint';
        default:
            return 'performed an action';
    }
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export function ActivityLog({ workspaceId, limit = 20, taskId }: ActivityLogProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);
    const [showAll, setShowAll] = useState(false);

    // Get activities - if no activities in store, generate from tasks
    const activities = useMemo(() => {
        if (!workspace) return [];

        // If we have activities in store, use them
        if (workspace.activities && workspace.activities.length > 0) {
            let filtered = [...workspace.activities];
            if (taskId) {
                filtered = filtered.filter(a => a.taskId === taskId);
            }
            return filtered.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }

        // Otherwise, generate activities from task data
        const generatedActivities: Activity[] = [];

        workspace.tasks.forEach(task => {
            // Task creation
            generatedActivities.push({
                id: `gen-${task.id}-created`,
                taskId: task.id,
                type: 'created',
                userId: 'user',
                userName: task.reporter || task.owner || 'User',
                createdAt: task.createdAt
            });

            // Comments
            task.comments?.forEach(comment => {
                generatedActivities.push({
                    id: `gen-${task.id}-comment-${comment.id}`,
                    taskId: task.id,
                    type: 'commented',
                    userId: 'user',
                    userName: comment.author,
                    createdAt: comment.createdAt
                });
            });

            // Time logs
            task.timeLogs?.forEach(log => {
                generatedActivities.push({
                    id: `gen-${task.id}-time-${log.id}`,
                    taskId: task.id,
                    type: 'time_logged',
                    newValue: log.hours.toString(),
                    userId: log.userId,
                    userName: log.userName,
                    createdAt: log.createdAt
                });
            });
        });

        // Sort by date
        return generatedActivities
            .filter(a => !taskId || a.taskId === taskId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [workspace, taskId]);

    if (!workspace) return null;

    const displayedActivities = showAll ? activities : activities.slice(0, limit);

    // Get task info for activity
    const getTaskInfo = (activityTaskId?: string) => {
        if (!activityTaskId) return null;
        return workspace.tasks.find(t => t.id === activityTaskId);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ActivityIcon size={24} />
                <Typography variant="h5" fontWeight={600}>
                    Activity Log
                </Typography>
                <Chip label={`${activities.length} events`} size="small" />
            </Box>

            {activities.length > 0 ? (
                <Box>
                    {displayedActivities.map((activity, index) => {
                        const IconComponent = ACTIVITY_ICONS[activity.type];
                        const iconColor = ACTIVITY_COLORS[activity.type];
                        const task = getTaskInfo(activity.taskId);

                        return (
                            <Box
                                key={activity.id}
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    py: 1.5,
                                    borderBottom: index < displayedActivities.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider'
                                }}
                            >
                                {/* Icon */}
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: `${iconColor}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    <IconComponent size={16} color={iconColor} />
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {activity.userName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatActivityMessage(activity)}
                                        </Typography>
                                    </Box>

                                    {task && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                                                {task.key}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: 300
                                                }}
                                            >
                                                {task.title}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                                        {formatTimeAgo(activity.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}

                    {activities.length > limit && !showAll && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                size="small"
                                onClick={() => setShowAll(true)}
                            >
                                Show All ({activities.length - limit} more)
                            </Button>
                        </Box>
                    )}
                </Box>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <ActivityIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <Typography variant="h6" gutterBottom>
                        No Activity Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Activity events will appear here as you work on tasks.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}

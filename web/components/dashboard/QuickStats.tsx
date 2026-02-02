"use client";

import { useAppStore, Workspace, TaskStatus } from "@/lib/store";
import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import { CheckCircle2, Clock, AlertCircle, Layers, TrendingUp, Users } from "lucide-react";

interface QuickStatsProps {
  workspaceId: string;
}

export function QuickStats({ workspaceId }: QuickStatsProps) {
  const { workspaces } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) return null;

  const allTasks = workspace.tasks;
  const activeSprint = workspace.sprints.find(s => s.status === 'active');
  const sprintTasks = activeSprint
    ? allTasks.filter(t => t.sprintId === activeSprint.id)
    : [];

  // Calculate stats
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
  const blockedTasks = allTasks.filter(t => t.status === 'Blocked').length;

  const sprintTotal = sprintTasks.length;
  const sprintCompleted = sprintTasks.filter(t => t.status === 'Done').length;
  const sprintProgress = sprintTotal > 0 ? Math.round((sprintCompleted / sprintTotal) * 100) : 0;

  const totalPoints = allTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
  const completedPoints = allTasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);

  // Calculate average velocity from completed sprints
  const completedSprints = workspace.sprints.filter(s => s.status === 'completed' && s.velocity);
  const avgVelocity = completedSprints.length > 0
    ? Math.round(completedSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / completedSprints.length)
    : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      subLabel: `${completedTasks} completed`,
      icon: <Layers size={20} />,
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      subLabel: 'Currently active',
      icon: <Clock size={20} />,
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      label: 'Blocked',
      value: blockedTasks,
      subLabel: 'Need attention',
      icon: <AlertCircle size={20} />,
      color: '#ef4444',
      bgColor: '#fee2e2'
    },
    {
      label: 'Story Points',
      value: `${completedPoints}/${totalPoints}`,
      subLabel: 'Completed/Total',
      icon: <TrendingUp size={20} />,
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      label: 'Team Members',
      value: workspace.teamMembers.length,
      subLabel: 'Active contributors',
      icon: <Users size={20} />,
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      label: 'Avg Velocity',
      value: avgVelocity || '-',
      subLabel: 'Points per sprint',
      icon: <TrendingUp size={20} />,
      color: '#06b6d4',
      bgColor: '#cffafe'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
        Quick Stats
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(6, 1fr)'
        },
        gap: 2
      }}>
        {stats.map((stat, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: stat.color,
                boxShadow: `0 4px 12px ${stat.color}20`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: stat.bgColor,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </Box>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Active Sprint Progress */}
      {activeSprint && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {activeSprint.name} Progress
              </Typography>
              {activeSprint.goal && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  🎯 {activeSprint.goal}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" fontWeight={700}>
                {sprintProgress}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {sprintCompleted}/{sprintTotal} tasks
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={sprintProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white',
                borderRadius: 4
              }
            }}
          />
        </Paper>
      )}
    </Box>
  );
}

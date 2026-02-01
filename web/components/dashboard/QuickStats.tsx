"use client";

import { useAppStore, Workspace } from "@/lib/store";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { LayoutGrid, CheckCircle2, Activity } from "lucide-react";

export function QuickStats() {
  const { workspaces } = useAppStore();
  
  const totalWorkspaces = workspaces.length;
  const totalTasks = workspaces.reduce((sum: number, ws: Workspace) => sum + (ws.tasks?.length || 0), 0);
  const activeTasks = workspaces.reduce((sum: number, ws: Workspace) => {
    return sum + (ws.tasks?.filter(t => t.status !== 'Done').length || 0);
  }, 0);

  const stats = [
    {
      label: "Workspaces",
      value: totalWorkspaces,
      icon: LayoutGrid,
      color: "#2563eb",
      bgColor: "#eff6ff"
    },
    {
      label: "Active Tasks",
      value: activeTasks,
      icon: Activity,
      color: "#f59e0b",
      bgColor: "#fef3c7"
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: CheckCircle2,
      color: "#10b981",
      bgColor: "#d1fae5"
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} color={stat.color} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

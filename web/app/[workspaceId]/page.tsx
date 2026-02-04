"use client";

import { use } from "react";
import { Box, Container, Typography, Grid, Paper, Button } from "@mui/material";
import { LayoutGrid, Plus, TrendingUp, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = use(params);
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    if (!workspace) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    const activeSprints = workspace.sprints?.filter(s => s.status === 'active') || [];
    const completedTasks = workspace.tasks?.filter(t => t.status === 'Done') || [];
    const inProgressTasks = workspace.tasks?.filter(t => t.status === 'In Progress') || [];

    const quickLinks = [
        {
            title: 'Backlog',
            description: 'Manage and prioritize your product backlog',
            icon: <LayoutGrid size={24} />,
            path: `/${workspaceId}/backlog`,
            color: '#0052CC'
        },
        {
            title: 'Active Sprints',
            description: `${activeSprints.length} sprint(s) in progress`,
            icon: <Calendar size={24} />,
            path: `/${workspaceId}/sprints`,
            color: '#00875A'
        },
        {
            title: 'Roadmap',
            description: 'Strategic planning and epic timeline',
            icon: <TrendingUp size={24} />,
            path: `/${workspaceId}/roadmap`,
            color: '#6554C0'
        }
    ];

    return (
        <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f4f5f7' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #DFE1E6', p: 3 }}>
                <Container maxWidth="xl">
                    <Typography variant="h4" fontWeight={600} sx={{ color: '#172B4D', mb: 1 }}>
                        {workspace.name || workspace.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B778C' }}>
                        Project workspace for agile development
                    </Typography>
                </Container>
            </Box>

            {/* Content */}
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid #DFE1E6', boxShadow: 'none' }}>
                            <Typography variant="h3" fontWeight={600} sx={{ color: '#0052CC', mb: 1 }}>
                                {workspace.tasks?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Total Tasks
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid #DFE1E6', boxShadow: 'none' }}>
                            <Typography variant="h3" fontWeight={600} sx={{ color: '#00875A', mb: 1 }}>
                                {completedTasks.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Completed
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid #DFE1E6', boxShadow: 'none' }}>
                            <Typography variant="h3" fontWeight={600} sx={{ color: '#FF8B00', mb: 1 }}>
                                {inProgressTasks.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                In Progress
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Quick Links */}
                <Typography variant="h6" fontWeight={600} sx={{ color: '#172B4D', mb: 2 }}>
                    Quick Access
                </Typography>
                <Grid container spacing={3}>
                    {quickLinks.map((link, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                            <Link href={link.path} style={{ textDecoration: 'none' }}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: 'white',
                                        border: '1px solid #DFE1E6',
                                        boxShadow: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            borderColor: link.color,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '8px',
                                            bgcolor: `${link.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: link.color,
                                            mb: 2
                                        }}
                                    >
                                        {link.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#172B4D' }}>
                                        {link.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                        {link.description}
                                    </Typography>
                                </Paper>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

"use client";

import { use } from "react";
import { Box, Container, Typography, Grid, Paper, Avatar, Stack, IconButton, Divider, Button } from "@mui/material";
import {
    LayoutGrid, Calendar, TrendingUp, CheckCircle2,
    Circle, Clock, Users, ArrowRight, MoreHorizontal
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";

const fontJakarta = 'var(--font-plus-jakarta)';

export default function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = use(params);
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);
    const theme = useTheme();

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

    if (!workspace) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography sx={{ fontFamily: fontJakarta }}>Workspace not found</Typography>
            </Box>
        );
    }

    // Dynamic Stats
    const activeSprints = workspace.sprints?.filter(s => s.status === 'active') || [];
    const completedTasks = tasks.filter(t => t.status === 'Done');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const todoTasks = tasks.filter(t => t.status === 'Todo');

    const stats = [
        {
            label: "Total Tasks",
            value: tasks.length,
            color: theme.palette.primary.main,
            icon: Circle
        },
        {
            label: "Completed",
            value: completedTasks.length,
            color: "#10b981", // green-500
            icon: CheckCircle2
        },
        {
            label: "In Progress",
            value: inProgressTasks.length,
            color: "#f59e0b", // amber-500
            icon: Clock
        }
    ];

    const quickLinks = [
        {
            title: 'Backlog',
            description: 'Manage and prioritize your product backlog',
            icon: LayoutGrid,
            path: `/${workspaceId}/backlog`,
            color: '#3b82f6', // blue-500
            bgcolor: '#eff6ff'
        },
        {
            title: 'Active Sprints',
            description: `${activeSprints.length} sprint(s) in progress`,
            icon: Calendar,
            path: `/${workspaceId}/sprints`,
            color: '#10b981', // green-500
            bgcolor: '#f0fdf4'
        },
        {
            title: 'Roadmap',
            description: 'Strategic planning and epic timeline',
            icon: TrendingUp,
            path: `/${workspaceId}/roadmap`,
            color: '#8b5cf6', // violet-500
            bgcolor: '#f5f3ff'
        }
    ];

    return (
        <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 4, px: { xs: 3, md: 5 } }}>
                <Container maxWidth="xl" disableGutters>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h3" fontWeight={800} sx={{
                                color: '#0f172a',
                                mb: 1,
                                fontFamily: fontJakarta,
                                letterSpacing: '-0.02em'
                            }}>
                                {workspace.name || workspace.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontFamily: fontJakarta }}>
                                Project workspace for agile development
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Users size={18} />}
                                sx={{
                                    textTransform: 'none',
                                    fontFamily: fontJakarta,
                                    borderRadius: 2,
                                    borderColor: '#e2e8f0',
                                    color: '#475569',
                                    '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                                }}
                            >
                                Share
                            </Button>
                            <IconButton sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                <MoreHorizontal size={20} color="#475569" />
                            </IconButton>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* Content */}
            <Container maxWidth="xl" disableGutters sx={{ p: { xs: 3, md: 5 } }}>

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {stats.map((stat, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: 'white',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-2px)' }
                            }}>
                                <Typography variant="h2" fontWeight={700} sx={{
                                    color: stat.color,
                                    mb: 1,
                                    fontFamily: fontJakarta
                                }}>
                                    {stat.value}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <stat.icon size={18} color="#64748b" />
                                    <Typography variant="body1" fontWeight={500} sx={{ color: '#64748b', fontFamily: fontJakarta }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Quick Access */}
                <Typography variant="h5" fontWeight={700} sx={{
                    color: '#0f172a',
                    mb: 3,
                    fontFamily: fontJakarta
                }}>
                    Quick Access
                </Typography>

                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {quickLinks.map((link, idx) => (
                        <Grid size={{ xs: 12, md: 4 }} key={idx}>
                            <Link href={link.path} style={{ textDecoration: 'none' }}>
                                <Paper sx={{
                                    p: 3,
                                    bgcolor: 'white',
                                    borderRadius: 4,
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    cursor: 'pointer',
                                    height: '100%',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        borderColor: link.color,
                                        boxShadow: `0 10px 15px -3px ${alpha(link.color, 0.1)}`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}>
                                    <Box sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 3,
                                        bgcolor: link.bgcolor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: link.color,
                                        mb: 3
                                    }}>
                                        <link.icon size={28} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#0f172a', fontFamily: fontJakarta }}>
                                        {link.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontFamily: fontJakarta }}>
                                        {link.description}
                                    </Typography>
                                </Paper>
                            </Link>
                        </Grid>
                    ))}
                </Grid>

                {/* Team Overview Section */}
                {workspace.teams && workspace.teams.length > 0 && (
                    <>
                        <Typography variant="h5" fontWeight={700} sx={{
                            color: '#0f172a',
                            mb: 3,
                            fontFamily: fontJakarta
                        }}>
                            Team Performance
                        </Typography>
                        <Grid container spacing={3}>
                            {workspace.teams.map((team) => {
                                const teamTasks = tasks.filter(t => t.teamId === team.id);
                                const teamCompleted = teamTasks.filter(t => t.status === 'Done').length;
                                const teamTotal = teamTasks.length;
                                const teamProgress = teamTotal > 0 ? Math.round((teamCompleted / teamTotal) * 100) : 0;

                                return (
                                    <Grid size={{ xs: 12, md: 4 }} key={team.id}>
                                        <Paper sx={{
                                            p: 3,
                                            borderRadius: 4,
                                            border: '1px solid #e2e8f0',
                                            bgcolor: 'white',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontJakarta }}>
                                                    {team.title}
                                                </Typography>
                                                <Box sx={{
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>
                                                    {teamProgress}% Done
                                                </Box>
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontJakarta }}>Progress</Typography>
                                                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: fontJakarta }}>{teamCompleted}/{teamTotal}</Typography>
                                                </Box>
                                                <Box sx={{ width: '100%', height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                                                    <Box sx={{
                                                        width: `${teamProgress}%`,
                                                        height: '100%',
                                                        bgcolor: theme.palette.primary.main,
                                                        borderRadius: 3
                                                    }} />
                                                </Box>
                                            </Box>

                                            <Stack direction="row" spacing={2}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontJakarta }}>{teamTasks.filter(t => t.status === 'In Progress').length}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: fontJakarta }}>In Progress</Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontJakarta }}>{teamTasks.filter(t => t.status === 'Todo').length}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: fontJakarta }}>Backlog</Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </>
                )}

            </Container>
        </Box>
    );
}

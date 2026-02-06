"use client";

import { use, useState } from "react";
import {
    Box, Container, Typography, Paper, Button, Chip, Select, MenuItem,
    FormControl, InputLabel, Tabs, Tab, Card, CardContent, Grid
} from "@mui/material";
import {
    Calendar, Target, TrendingUp, Plus, Filter, ChevronRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function RoadmapPage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = use(params);
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
    const [timeRange, setTimeRange] = useState<'quarter' | 'year'>('quarter');

    if (!workspace) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    // Generate timeline months
    const getTimelineMonths = () => {
        const months = [];
        const now = new Date();
        const count = timeRange === 'quarter' ? 3 : 12;

        for (let i = 0; i < count; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                year: date.getFullYear()
            });
        }
        return months;
    };

    const timelineMonths = getTimelineMonths();

    // Epic progress calculation
    const getEpicProgress = (epicId: string) => {
        const stories = workspace.tasks.filter(t => t.epicId === epicId);
        const completed = stories.filter(t => t.status === 'Done').length;
        return stories.length > 0 ? (completed / stories.length) * 100 : 0;
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #DFE1E6', p: 3 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={600} sx={{ color: '#172B4D', mb: 0.5 }}>
                                Roadmap
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Strategic planning and epic timeline visualization
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Link href={`/${workspaceId}/epics`} style={{ textDecoration: 'none' }}>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#DFE1E6',
                                        color: '#42526E',
                                        textTransform: 'none',
                                        '&:hover': { borderColor: '#B3BAC5', bgcolor: '#F4F5F7' }
                                    }}
                                >
                                    Manage Epics
                                </Button>
                            </Link>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={16} />}
                                sx={{
                                    bgcolor: '#0052CC',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#0747A6' },
                                    boxShadow: 'none'
                                }}
                            >
                                Create Epic
                            </Button>
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
                            <Tab label="Timeline" value="timeline" sx={{ textTransform: 'none' }} />
                            <Tab label="List" value="list" sx={{ textTransform: 'none' }} />
                        </Tabs>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Time Range</InputLabel>
                            <Select
                                value={timeRange}
                                label="Time Range"
                                onChange={(e) => setTimeRange(e.target.value as 'quarter' | 'year')}
                            >
                                <MenuItem value="quarter">Quarter (3 months)</MenuItem>
                                <MenuItem value="year">Year (12 months)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Container>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Container maxWidth="xl">
                    {viewMode === 'timeline' ? (
                        <Paper sx={{ p: 0, bgcolor: 'white', border: '1px solid #DFE1E6', boxShadow: 'none', overflow: 'hidden' }}>
                            {/* Timeline Header */}
                            <Box sx={{ display: 'flex', borderBottom: '1px solid #DFE1E6', bgcolor: '#FAFBFC' }}>
                                <Box sx={{ width: 250, p: 2, borderRight: '1px solid #DFE1E6', flexShrink: 0 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#42526E' }}>
                                        Epic
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flex: 1, overflow: 'auto' }}>
                                    {timelineMonths.map((tm, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                minWidth: 120,
                                                p: 2,
                                                borderRight: idx < timelineMonths.length - 1 ? '1px solid #DFE1E6' : 'none',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Typography variant="caption" fontWeight={600} sx={{ color: '#42526E' }}>
                                                {tm.month} {tm.year}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Epic Rows */}
                            {workspace.epics && workspace.epics.length > 0 ? (
                                workspace.epics.map((epic, epicIdx) => {
                                    const progress = getEpicProgress(epic.id);
                                    const storyCount = workspace.tasks.filter(t => t.epicId === epic.id).length;

                                    return (
                                        <Box
                                            key={epic.id}
                                            sx={{
                                                display: 'flex',
                                                borderBottom: epicIdx < workspace.epics!.length - 1 ? '1px solid #DFE1E6' : 'none',
                                                '&:hover': { bgcolor: '#F4F5F7' }
                                            }}
                                        >
                                            {/* Epic Info */}
                                            <Box sx={{ width: 250, p: 2, borderRight: '1px solid #DFE1E6', flexShrink: 0 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Target size={16} color="#6554C0" />
                                                    <Typography variant="body2" fontWeight={600} sx={{ color: '#172B4D' }}>
                                                        {epic.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                    <Chip
                                                        label={epic.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: epic.status === 'Done' ? '#E3FCEF' :
                                                                epic.status === 'In Progress' ? '#DEEBFF' : '#DFE1E6',
                                                            color: epic.status === 'Done' ? '#006644' :
                                                                epic.status === 'In Progress' ? '#0052CC' : '#42526E',
                                                            fontSize: '0.7rem',
                                                            height: 20
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`${storyCount} stories`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#F4F5F7',
                                                            color: '#6B778C',
                                                            fontSize: '0.7rem',
                                                            height: 20
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            height: 6,
                                                            bgcolor: '#DFE1E6',
                                                            borderRadius: 3,
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: `${progress}%`,
                                                                height: '100%',
                                                                bgcolor: '#00875A',
                                                                transition: 'width 0.3s'
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#6B778C', minWidth: 35 }}>
                                                        {Math.round(progress)}%
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Timeline Bar */}
                                            <Box sx={{ display: 'flex', flex: 1, p: 2, alignItems: 'center', position: 'relative' }}>
                                                {/* Timeline bar visualization */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        left: `${(epicIdx * 15) % 60}%`,
                                                        width: `${40 - (epicIdx * 5)}%`,
                                                        height: 32,
                                                        bgcolor: epic.status === 'Done' ? '#00875A' :
                                                            epic.status === 'In Progress' ? '#0052CC' : '#6554C0',
                                                        opacity: 0.3,
                                                        borderRadius: '4px',
                                                        border: `2px solid ${epic.status === 'Done' ? '#00875A' :
                                                            epic.status === 'In Progress' ? '#0052CC' : '#6554C0'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        px: 1
                                                    }}
                                                >
                                                    <Typography variant="caption" fontWeight={600} sx={{ color: '#172B4D' }}>
                                                        Q{Math.floor(epicIdx / 3) + 1} 2026
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Box sx={{ p: 8, textAlign: 'center' }}>
                                    <Target size={48} color="#DFE1E6" style={{ marginBottom: 16 }} />
                                    <Typography variant="h6" gutterBottom sx={{ color: '#42526E' }}>
                                        No Epics Yet
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#6B778C', mb: 3 }}>
                                        Create your first epic to start planning your roadmap
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Plus size={16} />}
                                        sx={{
                                            bgcolor: '#0052CC',
                                            color: 'white',
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#0747A6' }
                                        }}
                                    >
                                        Create Epic
                                    </Button>
                                </Box>
                            )}
                        </Paper>
                    ) : (
                        // List View
                        <Grid container spacing={2}>
                            {workspace.epics && workspace.epics.length > 0 ? (
                                workspace.epics.map((epic) => {
                                    const progress = getEpicProgress(epic.id);
                                    const stories = workspace.tasks.filter(t => t.epicId === epic.id);

                                    return (
                                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={epic.id}>
                                            <Card sx={{ border: '1px solid #DFE1E6', boxShadow: 'none', height: '100%' }}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Target size={20} color="#6554C0" />
                                                        <Typography variant="h6" fontWeight={600} sx={{ color: '#172B4D' }}>
                                                            {epic.name}
                                                        </Typography>
                                                    </Box>

                                                    <Typography variant="body2" sx={{ color: '#6B778C', mb: 2 }}>
                                                        {epic.description || 'No description'}
                                                    </Typography>

                                                    <Box sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                                                Progress
                                                            </Typography>
                                                            <Typography variant="caption" fontWeight={600} sx={{ color: '#172B4D' }}>
                                                                {Math.round(progress)}%
                                                            </Typography>
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                width: '100%',
                                                                height: 8,
                                                                bgcolor: '#DFE1E6',
                                                                borderRadius: 4,
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: `${progress}%`,
                                                                    height: '100%',
                                                                    bgcolor: '#00875A',
                                                                    transition: 'width 0.3s'
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                        <Chip
                                                            label={epic.status}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: epic.status === 'Done' ? '#E3FCEF' :
                                                                    epic.status === 'In Progress' ? '#DEEBFF' : '#DFE1E6',
                                                                color: epic.status === 'Done' ? '#006644' :
                                                                    epic.status === 'In Progress' ? '#0052CC' : '#42526E',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${stories.length} stories`}
                                                            size="small"
                                                            sx={{ bgcolor: '#F4F5F7', color: '#6B778C', fontSize: '0.75rem' }}
                                                        />
                                                    </Box>

                                                    <Link href={`/${workspaceId}/epics`} style={{ textDecoration: 'none' }}>
                                                        <Button
                                                            fullWidth
                                                            endIcon={<ChevronRight size={16} />}
                                                            sx={{
                                                                color: '#0052CC',
                                                                textTransform: 'none',
                                                                justifyContent: 'space-between',
                                                                '&:hover': { bgcolor: '#DEEBFF' }
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })
                            ) : (
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'white', border: '1px solid #DFE1E6' }}>
                                        <Target size={48} color="#DFE1E6" style={{ marginBottom: 16 }} />
                                        <Typography variant="h6" gutterBottom sx={{ color: '#42526E' }}>
                                            No Epics Yet
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#6B778C', mb: 3 }}>
                                            Create your first epic to start planning your roadmap
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Plus size={16} />}
                                            sx={{
                                                bgcolor: '#0052CC',
                                                color: 'white',
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: '#0747A6' }
                                            }}
                                        >
                                            Create Epic
                                        </Button>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

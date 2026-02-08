"use client";

import { useMemo, useState, useEffect } from "react";
import {
    Box, Container, Typography, Grid, Card, CardContent, CardHeader,
    IconButton, CircularProgress
} from "@mui/material";
import {
    MoreHorizontal, Filter, Download
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar, PolarArea } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartViewProps {
    workspaceId: string;
    pageId?: string;
    viewType?: string;
}

export function ChartView({ workspaceId, pageId, viewType }: ChartViewProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [tasks, setTasks] = useState<any[]>([]);
    const [sprints, setSprints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!workspaceId) return;
            try {
                setLoading(true);
                
                // Fetch Tasks
                let tasksUrl = `/api/tasks?workspaceId=${workspaceId}`;
                // if (pageId) tasksUrl += `&pageId=${pageId}`; // Removed per user request
                const tasksRes = await fetch(tasksUrl);
                const tasksData = await tasksRes.json();
                
                if (tasksData.success && Array.isArray(tasksData.data)) {
                    setTasks(tasksData.data);
                } else {
                    setTasks([]);
                }

                // Fetch Sprints
                let sprintsUrl = `/api/sprints?workspaceId=${workspaceId}`;
                // We typically want workspace level sprints for velocity, but pageId if relevant
                const sprintsRes = await fetch(sprintsUrl);
                const sprintsData = await sprintsRes.json();

                if (sprintsData.success && Array.isArray(sprintsData.data)) {
                    setSprints(sprintsData.data);
                } else {
                    setSprints([]);
                }

            } catch (error) {
                console.error("Failed to fetch data for charts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [workspaceId, pageId]);

    // Memoize chart data calculations
    const chartData = useMemo(() => {
        if (!tasks) return null;

        // --- Status Distribution (Real) ---
        const statusCounts = {
            todo: tasks.filter(t => t.status === 'Todo' || t.status === 'Ready to start').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            inReview: tasks.filter(t => t.status === 'In Review').length,
            done: tasks.filter(t => t.status === 'Done' || t.status === 'Fixed').length,
            blocked: tasks.filter(t => t.status === 'Blocked').length,
        };

        const statusData = {
            labels: ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'],
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#E2E8F0', '#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
                borderWidth: 0,
                hoverOffset: 4
            }],
        };

        // --- Priority Breakdown (Real) ---
        const priorityCounts = {
            low: tasks.filter(t => t.priority === 'Low').length,
            medium: tasks.filter(t => t.priority === 'Medium').length,
            high: tasks.filter(t => t.priority === 'High').length,
            critical: tasks.filter(t => t.priority === 'Critical').length,
        };

        const priorityData = {
            labels: ['Low', 'Medium', 'High', 'Critical'],
            datasets: [{
                label: 'Tasks',
                data: Object.values(priorityCounts),
                backgroundColor: ['#94A3B8', '#60A5FA', '#F97316', '#DC2626'],
                borderRadius: 4,
            }],
        };

        // --- Velocity (Real) ---
        // Filter for completed sprints
        const completedSprints = sprints
            .filter(s => s.status === 'completed' || s.activeSprintStatus === 'Completed')
            .sort((a, b) => new Date(a.sprintEndDate).getTime() - new Date(b.sprintEndDate).getTime())
            .slice(-5); // Last 5 sprints

        const velocityData = {
            labels: completedSprints.length ? completedSprints.map(s => s.sprint || s.name) : ['No Completed Sprints'],
            datasets: [
                {
                    label: 'Completed Points',
                    data: completedSprints.length ? completedSprints.map(s => s.velocity || 0) : [0],
                    backgroundColor: '#8B5CF6',
                    borderRadius: 4,
                }
            ],
        };

        // --- Burndown (Real - Active Sprint) ---
        const activeSprint = sprints.find(s => s.status === 'active' || s.activeSprintStatus === 'Active');
        let burndownLabels = ['Start', 'End'];
        let idealData = [0, 0];
        let remainingData = [0, 0];

        if (activeSprint) {
            const start = new Date(activeSprint.sprintStartDate);
            const end = new Date(activeSprint.sprintEndDate);
            const sprintTasks = tasks.filter(t => t.sprintId === activeSprint.id || t.sprint === activeSprint.sprint); // Match by ID or Name logic
            const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.estimatedPoints || 1), 0); // Default 1 point if null

            // Generate daily labels
            const days = [];
            const ideal = [];
            const dayRemaining = [];
            
            const oneDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
            
            for (let i = 0; i <= diffDays; i++) {
                const d = new Date(start.getTime() + i * oneDay);
                days.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
                
                // Ideal: Linear
                ideal.push(totalPoints - ((totalPoints / diffDays) * i));
                
                // Remaining: Check tasks resolved before this day
                // Only calculate for days up to today (don't predict future remaining)
                if (d <= new Date()) {
                    const resolvedPoints = sprintTasks
                        .filter(t => t.status === 'Done' && t.resolvedAt && new Date(t.resolvedAt) <= d)
                        .reduce((acc, t) => acc + (t.estimatedPoints || 1), 0);
                    dayRemaining.push(totalPoints - resolvedPoints);
                }
            }
            
            burndownLabels = days;
            idealData = ideal;
            remainingData = dayRemaining;
        }

        const burndownData = {
            labels: burndownLabels,
            datasets: [
                {
                    label: 'Ideal Guide',
                    data: idealData,
                    borderColor: '#94A3B8',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    borderWidth: 2,
                    fill: false,
                    tension: 0
                },
                {
                    label: 'Remaining Effort',
                    data: remainingData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.1
                }
            ]
        };

        // --- Radar (Member Workload - Real) ---
        // Group tasks by owner/assignee
        const memberLoad: Record<string, number> = {};
        tasks.forEach(t => {
            if (t.status !== 'Done') { // Only count active load
                const owner = t.owner?.name || t.owner || 'Unassigned';
                memberLoad[owner] = (memberLoad[owner] || 0) + (t.estimatedPoints || 1);
            }
        });

        const topMembers = Object.entries(memberLoad)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6); // Top 6 members

        const radarData = {
            labels: topMembers.length ? topMembers.map(([name]) => name) : ['No Data'],
            datasets: [
                {
                    label: 'Pending Points',
                    data: topMembers.length ? topMembers.map(([, points]) => points) : [0],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                }
            ]
        };

        // --- Polar Area (Task Types - Real) ---
        const typeCounts = {
            bug: tasks.filter(t => (t.type === 'Bug' || t.bug)).length,
            feature: tasks.filter(t => t.type === 'Feature').length,
            story: tasks.filter(t => t.type === 'Story').length,
            epic: tasks.filter(t => t.type === 'Epic').length,
            task: tasks.filter(t => (t.type === 'Task' || (!t.type && !t.bug))).length,
        };

        const polarData = {
            labels: ['Bug', 'Feature', 'Story', 'Epic', 'Task'],
            datasets: [{
                label: 'Task Types',
                data: Object.values(typeCounts),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.5)',   // Red
                    'rgba(59, 130, 246, 0.5)',  // Blue
                    'rgba(16, 185, 129, 0.5)',  // Green
                    'rgba(139, 92, 246, 0.5)',  // Violet
                    'rgba(245, 158, 11, 0.5)',  // Amber
                ],
                borderWidth: 1,
            }]
        };

        return { statusData, priorityData, velocityData, burndownData, radarData, polarData };
    }, [tasks, sprints]);

    if (loading) {
         return (
             <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f5f7' }}>
                 <CircularProgress />
             </Box>
         );
    }
    
    if (!chartData) return null;
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: 'Inter, sans-serif',
                        size: 12
                    },
                    color: '#64748B' // Slate 500
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#94A3B8'
                }
            },
            y: {
                grid: {
                    color: '#F1F5F9',
                    drawBorder: false
                },
                ticks: {
                    color: '#94A3B8',
                    padding: 10
                },
                border: {
                    display: false
                }
            }
        },
        layout: {
            padding: 0
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        family: 'Inter, sans-serif',
                        size: 12
                    },
                    color: '#64748B'
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 0
            }
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #DFE1E6', px: 3, py: 2 }}>
                <Container maxWidth="xl" disableGutters>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                                Project Insights
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                Real-time overview of project performance
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: 1 }}>
                                <Filter size={16} color="#64748B" />
                            </IconButton>
                            <IconButton size="small" sx={{ border: '1px solid #E2E8F0', borderRadius: 1 }}>
                                <Download size={16} color="#64748B" />
                            </IconButton>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3, pb: 8 }}>
                <Container maxWidth="xl" disableGutters>
                    <Grid container spacing={3}>
                        {/* Status Distribution */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={{ height: 360, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <CardHeader 
                                    title="Task Status" 
                                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#1E293B' }}
                                    action={<IconButton size="small"><MoreHorizontal size={16} /></IconButton>}
                                />
                                <CardContent sx={{ height: 280, position: 'relative' }}>
                                    <Doughnut data={chartData.statusData} options={doughnutOptions} />
                                    {/* Centered Total */}
                                    <Box sx={{ 
                                        position: 'absolute', 
                                        top: '50%', 
                                        left: '40%', // Adjust based on legend width
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="h4" fontWeight={700} color="#1E293B">
                                            {tasks.length}
                                        </Typography>
                                        <Typography variant="caption" color="#64748B">Total</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Priority Breakdown */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={{ height: 360, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <CardHeader 
                                    title="Priority Breakdown" 
                                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#1E293B' }}
                                    action={<IconButton size="small"><MoreHorizontal size={16} /></IconButton>}
                                />
                                <CardContent sx={{ height: 280 }}>
                                    <Bar data={chartData.priorityData} options={chartOptions} />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Velocity Chart */}
                        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
                            <Card sx={{ height: 360, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <CardHeader 
                                    title="Sprint Velocity" 
                                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#1E293B' }}
                                    action={<IconButton size="small"><MoreHorizontal size={16} /></IconButton>}
                                />
                                <CardContent sx={{ height: 280 }}>
                                    <Bar data={chartData.velocityData} options={chartOptions} />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Burndown Chart */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ height: 400, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <CardHeader 
                                    title="Sprint Burndown" 
                                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#1E293B' }}
                                    subheader="Tracking remaining effort"
                                    action={<IconButton size="small"><MoreHorizontal size={16} /></IconButton>}
                                />
                                <CardContent sx={{ height: 320 }}>
                                    <Line data={chartData.burndownData} options={chartOptions} />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Radar Chart - Team Skills (Mock) */}
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <Card sx={{ height: 400, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <CardHeader 
                                    title="Member Workload" 
                                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#1E293B' }}
                                    action={<IconButton size="small"><MoreHorizontal size={16} /></IconButton>}
                                />
                                <CardContent sx={{ height: 320 }}>
                                    <Radar data={chartData.radarData} options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            r: {
                                                ticks: { display: false },
                                                grid: { color: '#F1F5F9' }
                                            }
                                        },
                                        plugins: { legend: { display: false } }
                                    }} />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Polar Area Chart - Task Types (Mock) */}
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <Card sx={{ height: 400, boxShadow: '0px 1px 3px rgba(0,0,0,0.05)', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <CardHeader 
                                    title="Task Types" 
                                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#1E293B' }}
                                    action={<IconButton size="small"><MoreHorizontal size={16} /></IconButton>}
                                />
                                <CardContent sx={{ height: 320 }}>
                                    <PolarArea data={chartData.polarData} options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            r: {
                                                ticks: { display: false },
                                                grid: { color: '#F1F5F9' }
                                            }
                                        },
                                        plugins: { 
                                            legend: { 
                                                position: 'bottom', 
                                                labels: { boxWidth: 10, font: { size: 10 } } 
                                            } 
                                        }
                                    }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

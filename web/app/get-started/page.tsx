"use client";

import {
    Box, Container, Typography, Paper, List, ListItem, ListItemIcon,
    ListItemText, Chip, Accordion, AccordionSummary, AccordionDetails,
    Button, Grid
} from "@mui/material";
import {
    CheckCircle2, Zap, ChevronDown, Layout, Target, Users,
    BarChart3, Bug, Book, Layers, TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function GetStartedPage() {
    const quickStartSteps = [
        {
            title: "Create Your Workspace",
            description: "Click on the workspace dropdown and create a new workspace. Each workspace represents a team or project."
        },
        {
            title: "Set Up Your Team",
            description: "Add team members through the Team page. Assign roles and set capacity for better workload management."
        },
        {
            title: "Create Epics & Sprints",
            description: "Define high-level goals with Epics and break work into time-boxed Sprints for agile delivery."
        },
        {
            title: "Start Planning",
            description: "Use the Backlog to create tasks, prioritize work, and assign estimates and owners."
        },
        {
            title: "Track Progress",
            description: "Monitor sprint progress with Boards, track velocity, and use analytics for data-driven decisions."
        }
    ];

    const features = [
        {
            category: "Agile Workflows",
            icon: <Layout size={20} />,
            items: [
                { name: "Scrum Boards", description: "Kanban-style boards with drag-and-drop and WIP limits", path: "/ws-1/board-1" },
                { name: "Sprint Planning", description: "Create sprints, assign tasks, and track goals", path: "/ws-1/sprints" },
                { name: "Backlog Management", description: "Prioritize work and groom your backlog", path: "/ws-1/backlog" },
                { name: "Epic Management", description: "Define strategic initiatives and track progress", path: "/ws-1/epics" }
            ]
        },
        {
            category: "Planning & Roadmaps",
            icon: <Target size={20} />,
            items: [
                { name: "Roadmap Timeline", description: "Visual timeline with epic schedules across quarters", path: "/ws-1/roadmap" },
                { name: "Release Planning", description: "Group tasks and track release progress" }
            ]
        },
        {
            category: "Analytics & Reporting",
            icon: <BarChart3 size={20} />,
            items: [
                { name: "Velocity Chart", description: "Track sprint velocity and forecast capacity", path: "/ws-1/reports" },
                { name: "Burndown Chart", description: "Monitor daily progress", path: "/ws-1/reports" },
                { name: "Cumulative Flow", description: "Identify bottlenecks and optimize flow", path: "/ws-1/reports" },
                { name: "Capacity Planning", description: "View team workload and balance work", path: "/ws-1/reports" }
            ]
        },
        {
            category: "Bug Tracking",
            icon: <Bug size={20} />,
            items: [
                { name: "Bugs Queue", description: "Dedicated bug tracking with SLA and priority management", path: "/ws-1/bugs" },
                { name: "Bug Workflows", description: "Custom statuses and automated triage" }
            ]
        }
    ];

    return (
        <Box sx={{ bgcolor: '#f4f5f7', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #dfe1e6', py: 2, mb: 4 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Zap size={28} color="#0052CC" />
                            <Typography variant="h5" fontWeight={600} sx={{ color: '#172B4D' }}>
                                ForgeAI
                            </Typography>
                        </Box>
                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#0052CC',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    px: 3,
                                    '&:hover': { bgcolor: '#0747A6' },
                                    boxShadow: 'none'
                                }}
                            >
                                Go to Dashboard
                            </Button>
                        </Link>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Page Header */}
                <Box sx={{ mb: 6 }}>
                    <Chip
                        label="DOCUMENTATION"
                        sx={{
                            bgcolor: '#DEEBFF',
                            color: '#0052CC',
                            fontWeight: 500,
                            mb: 2,
                            fontSize: '0.75rem',
                            letterSpacing: '0.5px'
                        }}
                    />
                    <Typography variant="h3" fontWeight={500} gutterBottom sx={{ color: '#172B4D' }}>
                        Get Started with ForgeAI
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#42526E', maxWidth: 700 }}>
                        Everything you need to know to master ForgeAI and supercharge your team's productivity
                    </Typography>
                </Box>

                {/* Quick Start */}
                <Paper sx={{ p: 4, mb: 4, bgcolor: 'white', border: '1px solid #DFE1E6', borderRadius: '3px', boxShadow: 'none' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#172B4D' }}>
                        <Zap size={24} color="#0052CC" />
                        Quick Start Guide
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#42526E', mb: 3 }}>
                        Follow these 5 simple steps to get your team up and running
                    </Typography>

                    <List>
                        {quickStartSteps.map((step, idx) => (
                            <ListItem
                                key={idx}
                                sx={{
                                    bgcolor: '#F4F5F7',
                                    borderRadius: '3px',
                                    mb: 1.5,
                                    border: '1px solid #DFE1E6',
                                    '&:hover': { bgcolor: '#EBECF0' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ListItemIcon>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            bgcolor: '#0052CC',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {idx + 1}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#172B4D' }}>
                                            {step.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" sx={{ color: '#42526E', mt: 0.5 }}>
                                            {step.description}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Features Documentation */}
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3, color: '#172B4D', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Book size={24} />
                    Feature Documentation
                </Typography>

                {features.map((section, sectionIdx) => (
                    <Accordion
                        key={sectionIdx}
                        sx={{
                            bgcolor: 'white',
                            border: '1px solid #DFE1E6',
                            borderRadius: '3px',
                            mb: 2,
                            boxShadow: 'none',
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': { margin: '0 0 16px 0' }
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ChevronDown size={20} color="#42526E" />}
                            sx={{
                                '&:hover': { bgcolor: '#F4F5F7' },
                                borderRadius: '3px'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ color: '#0052CC' }}>{section.icon}</Box>
                                <Typography variant="h6" fontWeight={600} sx={{ color: '#172B4D' }}>
                                    {section.category}
                                </Typography>
                                <Chip
                                    label={`${section.items.length} features`}
                                    size="small"
                                    sx={{ bgcolor: '#F4F5F7', color: '#42526E', fontSize: '0.75rem' }}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <List>
                                {section.items.map((item, itemIdx) => (
                                    <ListItem
                                        key={itemIdx}
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            bgcolor: '#F4F5F7',
                                            borderRadius: '3px',
                                            mb: 1,
                                            p: 2,
                                            border: '1px solid #DFE1E6'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                                            <CheckCircle2 size={16} color="#00875A" style={{ marginRight: 8 }} />
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#172B4D' }}>
                                                {item.name}
                                            </Typography>
                                            {item.path && (
                                                <Link href={item.path} style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                                                    <Button
                                                        size="small"
                                                        sx={{
                                                            textTransform: 'none',
                                                            color: '#0052CC',
                                                            fontWeight: 500,
                                                            '&:hover': { bgcolor: '#DEEBFF' }
                                                        }}
                                                    >
                                                        Try it →
                                                    </Button>
                                                </Link>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#42526E', pl: 3 }}>
                                            {item.description}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {/* Tips */}
                <Paper sx={{ p: 4, mt: 4, bgcolor: 'white', border: '1px solid #DFE1E6', borderRadius: '3px', boxShadow: 'none' }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#172B4D' }}>
                        Tips & Best Practices
                    </Typography>
                    <List>
                        {[
                            { title: "Use story points consistently", desc: "Establish a baseline and stick to it for accurate velocity tracking" },
                            { title: "Review velocity after each sprint", desc: "Identify trends and adjust commitments" },
                            { title: "Monitor team capacity weekly", desc: "Prevent burnout and maintain sustainable pace" },
                            { title: "Update roadmap monthly", desc: "Keep stakeholders informed with regular reviews" }
                        ].map((tip, idx) => (
                            <ListItem key={idx} alignItems="flex-start" sx={{ py: 1 }}>
                                <ListItemIcon sx={{ mt: 0.5 }}>
                                    <CheckCircle2 size={18} color="#00875A" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<Typography fontWeight={600} sx={{ color: '#172B4D' }}>{tip.title}</Typography>}
                                    secondary={<Typography variant="body2" sx={{ color: '#42526E' }}>{tip.desc}</Typography>}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Container>
        </Box>
    );
}

"use client";

import { useState } from 'react';
import { Box, Container, Typography, Tab, Tabs, Stack, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid'; // Default export for Grid v2 in MUI v6, but usually it's named import in v5. Let's check imports.
// Check imports in page.tsx: import Grid from "@mui/material/Grid"; (default)
import { alpha } from '@mui/material/styles';
import {
    Zap, Layout, CheckSquare, Calendar, Target, Bug, BarChart3,
    MessageSquare, Command, ArrowRight, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Font matches page.tsx
const fontJakarta = 'var(--font-plus-jakarta)';
const primaryMain = "#2563eb";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`doc-tabpanel-${index}`}
            aria-labelledby={`doc-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 0, animation: 'fadeIn 0.5s ease' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const CodeBlock = ({ children }: { children: string }) => (
    <Box component="pre" sx={{
        bgcolor: '#1e293b',
        color: '#e2e8f0',
        p: 2,
        borderRadius: 2,
        overflowX: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        my: 2,
        border: '1px solid #334155'
    }}>
        <code>{children}</code>
    </Box>
);

const FeatureCard = ({ icon: Icon, title, content, command }: { icon: any, title: string, content: string, command?: string }) => (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 4, height: '100%', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(primaryMain, 0.1), color: primaryMain }}>
                <Icon size={20} />
            </Box>
            <Typography variant="h6" fontWeight={700} fontFamily={fontJakarta}>
                {title}
            </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            {content}
        </Typography>
        {command && (
            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                <Typography variant="caption" fontWeight={600} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Command size={14} /> TRY: "{command}"
                </Typography>
            </Box>
        )}
    </Paper>
);

export default function DocumentationSection() {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ py: 15, bgcolor: '#f8fafc' }} id="documentation">
            <Container maxWidth="lg">
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography variant="overline" fontWeight={700} sx={{ color: primaryMain, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        USER GUIDE
                    </Typography>
                    <Typography variant="h2" fontWeight={800} sx={{ fontFamily: fontJakarta, color: '#0f172a', mb: 3 }}>
                        Master Orbit in Minutes
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
                        Everything you need to know to build faster with AI-powered project management.
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        bgcolor: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(12px)'
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, md: 4 }, pt: 2 }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': {
                                    fontFamily: fontJakarta,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    mr: 4,
                                    pb: 2,
                                    color: '#64748b',
                                    '&.Mui-selected': { color: primaryMain }
                                },
                                '& .MuiTabs-indicator': {
                                    bgcolor: primaryMain,
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab label="Getting Started" icon={<Zap size={18} />} iconPosition="start" />
                            <Tab label="AI Assistant" icon={<MessageSquare size={18} />} iconPosition="start" />
                            <Tab label="Agile Workflow" icon={<Layout size={18} />} iconPosition="start" />
                            <Tab label="Advanced" icon={<BarChart3 size={18} />} iconPosition="start" />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: { xs: 3, md: 6 }, bgcolor: 'white', minHeight: 400 }}>
                        {/* Tab 1: Getting Started */}
                        <TabPanel value={value} index={0}>
                            <Grid container spacing={6}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="h4" fontWeight={800} sx={{ fontFamily: fontJakarta, mb: 3, color: '#0f172a' }}>
                                        Welcome to Orbit
                                    </Typography>
                                    <Typography paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                                        Orbit combines traditional agile tools with Tambo, an intelligent AI assistant that handles the busy work for you.
                                    </Typography>

                                    <Stack spacing={3} sx={{ mt: 4 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ minWidth: 32, height: 32, borderRadius: '50%', bgcolor: primaryMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>Create a Workspace</Typography>
                                                <Typography variant="body2" color="text.secondary">Use the sidebar or ask AI: "Create a new workspace called Mobile App".</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ minWidth: 32, height: 32, borderRadius: '50%', bgcolor: primaryMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>Open Tambo AI</Typography>
                                                <Typography component="div" variant="body2" color="text.secondary">Press <Chip size="small" label="⌘K" sx={{ fontWeight: 700, borderRadius: 1 }} /> or click the chat icon to start commanding your workspace.</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ minWidth: 32, height: 32, borderRadius: '50%', bgcolor: primaryMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a' }}>Start Planning</Typography>
                                                <Typography variant="body2" color="text.secondary">Add tasks, sprints, and teams. Try saying: "Create a task for user login".</Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={0} sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: 4, height: '100%', border: '1px dashed #cbd5e1' }}>
                                        <Typography variant="subtitle2" fontWeight={700} color="text.disabled" sx={{ mb: 2, textTransform: 'uppercase' }}>
                                            AI Interaction Demo
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Paper sx={{ p: 2, borderRadius: '12px 12px 12px 0', bgcolor: '#e2e8f0', alignSelf: 'flex-start', maxWidth: '80%' }} elevation={0}>
                                                <Typography variant="body2" fontWeight={500} color="#334155">
                                                    Create a sprint called Sprint 5 starting next Monday.
                                                </Typography>
                                            </Paper>
                                            <Paper sx={{ p: 2, borderRadius: '12px 12px 0 12px', bgcolor: '#eff6ff', alignSelf: 'flex-end', maxWidth: '90%', border: `1px solid ${alpha(primaryMain, 0.2)}` }} elevation={0}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Zap size={14} color={primaryMain} fill={primaryMain} />
                                                    <Typography variant="caption" fontWeight={700} color={primaryMain}>TAMBO AI</Typography>
                                                </Box>
                                                <Typography variant="body2" color="#1e293b">
                                                    I've created <strong>Sprint 5</strong> scheduled for Oct 23 - Nov 6. Would you like me to move existing backlog items into this sprint?
                                                </Typography>
                                            </Paper>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* Tab 2: AI Assistant */}
                        <TabPanel value={value} index={1}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" fontWeight={800} sx={{ fontFamily: fontJakarta, mb: 1, color: '#0f172a' }}>
                                    Your Intelligent Teammate
                                </Typography>
                                <Typography color="text.secondary">
                                    Tambo isn't just a chatbot details; it has full control over your workspace.
                                </Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FeatureCard
                                        icon={CheckSquare}
                                        title="Task Management"
                                        content="Create, update, and assign tasks using natural language. No more form filling."
                                        command="Create a high priority bug for login"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FeatureCard
                                        icon={Calendar}
                                        title="Sprint Planning"
                                        content="Organize sprints, move tasks, and check team velocity instantly."
                                        command="Move all high priority tasks to current sprint"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FeatureCard
                                        icon={FileText}
                                        title="Content Generation"
                                        content="Draft documents, release notes, and retrospectives in seconds."
                                        command="Draft a retrospective for Sprint 4"
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 5 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Prompting Tips</Typography>
                                <Grid container spacing={2}>
                                    {[
                                        "Be specific about priorities and assignees",
                                        "Chain commands: 'Create task and assign to Sarah'",
                                        "Ask for summaries: 'What is blocking the team?'"
                                    ].map((tip, i) => (
                                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                                            <Paper sx={{ p: 2, bgcolor: alpha(primaryMain, 0.05), borderRadius: 2, border: '1px solid', borderColor: alpha(primaryMain, 0.1) }} elevation={0}>
                                                <Typography variant="body2" fontWeight={600} color={primaryMain}>✅ {tip}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </TabPanel>

                        {/* Tab 3: Agile */}
                        <TabPanel value={value} index={2}>
                            <Grid container spacing={6}>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Core Concepts</Typography>
                                    <Stack spacing={3}>
                                        {[
                                            { icon: Target, title: "Epics", desc: "Large initiatives broken down into stories. Group related tasks." },
                                            { icon: CheckSquare, title: "Backlog", desc: "Single source of truth. Prioritize and estimate work here." },
                                            { icon: Calendar, title: "Sprints", desc: "Time-boxed iterations (usually 2 weeks) for focused delivery." },
                                            { icon: Bug, title: "Bugs", desc: "Track defects with severity levels and reproduction steps." },
                                        ].map((item, i) => (
                                            <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                                <Box sx={{ mt: 0.5, p: 1, borderRadius: 1.5, bgcolor: '#f1f5f9', color: '#475569', height: 'fit-content' }}>
                                                    <item.icon size={20} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>{item.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 7 }}>
                                    <Box sx={{ bgcolor: '#1e293b', borderRadius: 4, p: 4, color: 'white' }}>
                                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Layout size={20} /> Scrum Board Logic
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 4, opacity: 0.8 }}>
                                            <Chip label="TO DO" size="small" sx={{ bgcolor: '#334155', color: 'white' }} />
                                            <ArrowRight size={16} />
                                            <Chip label="IN PROGRESS" size="small" sx={{ bgcolor: '#0ea5e9', color: 'white' }} />
                                            <ArrowRight size={16} />
                                            <Chip label="DONE" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                                            Move cards automatically with AI commands:
                                        </Typography>
                                        <CodeBlock>
                                            "Move task WS1-42 to In Progress"
                                        </CodeBlock>
                                        <CodeBlock>
                                            "Mark all subtasks of Login Feature as Done"
                                        </CodeBlock>
                                    </Box>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* Tab 4: Advanced */}
                        <TabPanel value={value} index={3}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Reports & Analytics</Typography>
                                    <Stack spacing={2}>
                                        <FeatureCard
                                            icon={BarChart3}
                                            title="Velocity Tracking"
                                            content="Understand your team's throughput. Orbit calculates average velocity to help you plan accurate sprints."
                                        />
                                        <FeatureCard
                                            icon={BarChart3}
                                            title="Burndown Charts"
                                            content="Track real-time progress during sprints. Identify bottlenecks early if the line trends above ideal."
                                        />
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Shortcuts</Typography>
                                    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                        {[
                                            { keys: ["⌘", "K"], desc: "Open AI Assistant" },
                                            { keys: ["⌘", "/"], desc: "Global Search" },
                                            { keys: ["Esc"], desc: "Close Modals" },
                                        ].map((item, i) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f1f5f9' }}>
                                                <Typography variant="body2" fontWeight={500}>{item.desc}</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    {item.keys.map(k => (
                                                        <Box key={k} sx={{
                                                            minWidth: 24,
                                                            px: 0.8,
                                                            py: 0.4,
                                                            bgcolor: '#f1f5f9',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: 1,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            textAlign: 'center',
                                                            color: '#475569'
                                                        }}>
                                                            {k}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

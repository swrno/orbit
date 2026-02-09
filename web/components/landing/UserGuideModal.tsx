"use client";

import { useState } from 'react';
import {
    Dialog, DialogContent, Box, Typography, List, ListItemButton,
    ListItemText, ListItemIcon, IconButton, Divider, Chip, Paper
} from '@mui/material';
import {
    X, Book, Zap, ListTodo, Calendar, Kanban, Layers, Bug,
    BarChart3, Users, FileText, Search, Keyboard, Star
} from 'lucide-react';
import { alpha } from '@mui/material/styles';

const fontJakarta = 'var(--font-plus-jakarta)';
const primaryMain = "#2563eb";

interface Section {
    id: string;
    title: string;
    icon: any;
    content: React.ReactNode;
}

const CodeBlock = ({ children }: { children: string }) => (
    <Box component="pre" sx={{
        bgcolor: '#1e293b',
        color: '#e2e8f0',
        p: 2,
        borderRadius: 2,
        overflowX: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        my: 2,
        border: '1px solid #334155'
    }}>
        {children}
    </Box>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="h4" fontWeight={800} sx={{ fontFamily: fontJakarta, mb: 3, color: '#0f172a' }}>
        {children}
    </Typography>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 1.5, color: '#334155', fontFamily: fontJakarta }}>
        {children}
    </Typography>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, color: '#475569' }}>
        {children}
    </Typography>
);

export default function UserGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [activeSection, setActiveSection] = useState("getting-started");

    const sections: Section[] = [
        {
            id: "getting-started",
            title: "Getting Started",
            icon: Book,
            content: (
                <>
                    <SectionTitle>Getting Started</SectionTitle>
                    <Paragraph>
                        Welcome to Orbit AI Workspace. This guide will help you set up your environment and start managing projects with the power of Tambo AI.
                    </Paragraph>

                    <SubTitle>Your First Workspace</SubTitle>
                    <Paragraph>
                        1. <strong>Open Orbit</strong> and navigate to the Dashboard.<br />
                        2. Click <strong>"Create Workspace"</strong> or ask the AI: <em>"Create a new workspace called My Project"</em>
                    </Paragraph>
                </>
            )
        },
        {
            id: "tambo-ai",
            title: "Tambo AI Assistant",
            icon: Zap,
            content: (
                <>
                    <SectionTitle>Using Tambo AI</SectionTitle>
                    <Paragraph>
                        Tambo is your intelligent project manager. You can command it to perform almost any action in the workspace.
                    </Paragraph>

                    <SubTitle>Opening the Chat</SubTitle>
                    <Paragraph>
                        Press <Chip size="small" label="⌘K" sx={{ fontWeight: 700, borderRadius: 1, mx: 0.5 }} /> (Mac) or <Chip size="small" label="Ctrl+K" sx={{ fontWeight: 700, borderRadius: 1, mx: 0.5 }} /> (Windows) anytime to open the assistant.
                    </Paragraph>

                    <SubTitle>Example Commands</SubTitle>
                    <CodeBlock>
                        {`"Create a task for implementing user authentication"
"Show me all tasks assigned to Sarah"
"Update task WS1-42 to In Progress"
"Create a new sprint called Sprint 5"
"Draft a sprint retrospective document"`}
                    </CodeBlock>
                </>
            )
        },
        {
            id: "backlog",
            title: "Backlog Management",
            icon: ListTodo,
            content: (
                <>
                    <SectionTitle>Managing Your Backlog</SectionTitle>
                    <Paragraph>
                        The backlog is your single source of truth for all work items.
                    </Paragraph>

                    <SubTitle>Creating Tasks</SubTitle>
                    <Paragraph>
                        <strong>Via UI:</strong> Navigate to Backlog and click "Create Task".<br />
                        <strong>Via AI:</strong> Ask Tambo:
                    </Paragraph>
                    <CodeBlock>
                        "Create a task: User can reset password via email, 5 story points, high priority"
                    </CodeBlock>
                </>
            )
        },
        {
            id: "sprints",
            title: "Sprint Planning",
            icon: Calendar,
            content: (
                <>
                    <SectionTitle>Sprint Planning</SectionTitle>
                    <Paragraph>
                        Sprints are time-boxed periods where your team commits to specific work.
                    </Paragraph>

                    <SubTitle>Creating a Sprint</SubTitle>
                    <CodeBlock>
                        "Create a sprint called Sprint 5 with goal 'Complete user auth' starting today"
                    </CodeBlock>

                    <SubTitle>Adding Tasks</SubTitle>
                    <Paragraph>
                        Drag and drop tasks from the backlog into the active sprint, or ask AI to "Move all high-priority items to current sprint".
                    </Paragraph>
                </>
            )
        },
        {
            id: "board",
            title: "Scrum Board",
            icon: Kanban,
            content: (
                <>
                    <SectionTitle>Using the Scrum Board</SectionTitle>
                    <Paragraph>
                        Visualise your workflow with columns: <strong>To Do</strong> → <strong>In Progress</strong> → <strong>In Review</strong> → <strong>Done</strong>.
                    </Paragraph>
                    <SubTitle>Moving Tasks</SubTitle>
                    <Paragraph>
                        Simply drag cards between columns or ask Tambo: <em>"Move task WS1-42 to In Progress"</em>.
                    </Paragraph>
                </>
            )
        },
        {
            id: "epics",
            title: "Epics",
            icon: Layers,
            content: (
                <>
                    <SectionTitle>Epic Management</SectionTitle>
                    <Paragraph>
                        Epics are large initiatives broken down into smaller tasks across multiple sprints.
                    </Paragraph>
                    <SubTitle>Creating Epics</SubTitle>
                    <CodeBlock>
                        "Create an epic called Payment Integration with target date next month"
                    </CodeBlock>
                </>
            )
        },
        {
            id: "bugs",
            title: "Bug Tracking",
            icon: Bug,
            content: (
                <>
                    <SectionTitle>Bug Tracking</SectionTitle>
                    <Paragraph>
                        Track defects with severity levels, reproduction steps, and environments.
                    </Paragraph>
                    <SubTitle>Reporting Bugs via AI</SubTitle>
                    <CodeBlock>
                        "Report a bug: Login button doesn't work on Safari, high severity"
                    </CodeBlock>
                </>
            )
        },
        {
            id: "reports",
            title: "Reports & Analytics",
            icon: BarChart3,
            content: (
                <>
                    <SectionTitle>Reports & Analytics</SectionTitle>
                    <Paragraph>
                        Orbit provides real-time insights into your team's performance.
                    </Paragraph>
                    <SubTitle>Available Charts</SubTitle>
                    <List>
                        <ListItemText primary="• Velocity Chart: Track completed story points per sprint" />
                        <ListItemText primary="• Burndown Chart: Monitor daily progress during a sprint" />
                        <ListItemText primary="• Cumulative Flow: Identify bottlenecks in your workflow" />
                    </List>
                </>
            )
        },
        {
            id: "team",
            title: "Team Management",
            icon: Users,
            content: (
                <>
                    <SectionTitle>Team Management</SectionTitle>
                    <Paragraph>
                        Manage your team roster and roles directly within the workspace.
                    </Paragraph>
                    <SubTitle>Adding Members</SubTitle>
                    <CodeBlock>
                        "Add team member Sarah Johnson, sarah@email.com, Senior Developer"
                    </CodeBlock>
                </>
            )
        },
        {
            id: "docs",
            title: "Documents",
            icon: FileText,
            content: (
                <>
                    <SectionTitle>AI Document Editing</SectionTitle>
                    <Paragraph>
                        Orbit includes a powerful Markdown editor with AI generation capabilities.
                    </Paragraph>
                    <SubTitle>Drafting Content</SubTitle>
                    <CodeBlock>
                        "Draft a sprint retrospective for Sprint 4"
                        "Write a technical design doc for the API integration"
                    </CodeBlock>
                </>
            )
        },
        {
            id: "shortcuts",
            title: "Shortcuts",
            icon: Keyboard,
            content: (
                <>
                    <SectionTitle>Keyboard Shortcuts</SectionTitle>
                    <Paragraph>
                        Work faster with these global hotkeys:
                    </Paragraph>
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                                            minWidth: 24, px: 0.8, py: 0.4, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1',
                                            borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, color: '#475569', textAlign: 'center'
                                        }}>
                                            {k}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </>
            )
        },
    ];

    const activeContent = sections.find(s => s.id === activeSection)?.content;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: '85vh',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'row'
                }
            }}
        >
            {/* Sidebar */}
            <Box sx={{ width: 280, bgcolor: '#0f172a', color: 'white', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', borderRight: '1px solid #334155' }}>
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #1e293b' }}>
                    <Book size={20} color={primaryMain} />
                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontJakarta }}>User Guide</Typography>
                </Box>
                <List sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <ListItemButton
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                sx={{
                                    mx: 1.5,
                                    borderRadius: 2,
                                    mb: 0.5,
                                    bgcolor: isActive ? alpha(primaryMain, 0.15) : 'transparent',
                                    color: isActive ? '#60a5fa' : '#94a3b8',
                                    '&:hover': {
                                        bgcolor: isActive ? alpha(primaryMain, 0.25) : 'rgba(255,255,255,0.05)',
                                        color: isActive ? '#60a5fa' : 'white'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                                    <section.icon size={18} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={section.title}
                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400, fontFamily: fontJakarta }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>

            {/* Content Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white', height: '100%' }}>
                {/* Mobile Header (only visible on mobile) */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" fontWeight={700}>User Guide</Typography>
                    <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
                </Box>

                {/* Desktop header close button */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', p: 2, pb: 0 }}>
                    <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}><X size={24} /></IconButton>
                </Box>

                <DialogContent sx={{ p: { xs: 3, md: 5 }, pt: { md: 2 } }}>
                    {activeContent}
                </DialogContent>
            </Box>
        </Dialog>
    );
}

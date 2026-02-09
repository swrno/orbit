"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Container, Typography, Stack, Paper, IconButton, Divider,
    List, ListItem, ListItemButton, ListItemText, ListItemIcon,
    Button, Chip, Breadcrumbs
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {
    Zap, Book, Layout, MessageSquare, CheckSquare, Calendar,
    Target, Bug, BarChart3, Users, FileText, Search, Layers,
    Keyboard, ArrowRight, ChevronRight, Menu, X, Home,
    ChevronDown, MousePointer2, Settings, Shield, Github, Twitter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const fontJakarta = 'var(--font-plus-jakarta)';
const primaryMain = "#2563eb";

// --- Components ---

const SidebarItem = ({ icon: Icon, title, active, onClick }: any) => (
    <ListItemButton
        onClick={onClick}
        sx={{
            py: 1.5,
            px: 2,
            borderRadius: 3,
            mb: 0.5,
            bgcolor: active ? alpha(primaryMain, 0.1) : 'transparent',
            color: active ? primaryMain : '#64748b',
            '&:hover': {
                bgcolor: active ? alpha(primaryMain, 0.15) : alpha(primaryMain, 0.05),
                color: active ? primaryMain : '#334155',
            },
            transition: 'all 0.2s ease',
        }}
    >
        <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
            <Icon size={20} />
        </ListItemIcon>
        <ListItemText
            primary={title}
            primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: active ? 700 : 500,
                fontFamily: fontJakarta
            }}
        />
        {active && <ChevronRight size={16} />}
    </ListItemButton>
);

const FeatureHighlight = ({ title, description, icon: Icon }: any) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            height: '100%',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                borderColor: alpha(primaryMain, 0.3)
            }
        }}
    >
        <Box sx={{
            display: 'inline-flex',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'white',
            color: primaryMain,
            mb: 2,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
        }}>
            <Icon size={24} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontFamily: fontJakarta }}>
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
        </Typography>
    </Paper>
);

const Screenshot = ({ src, caption }: { src: string, caption: string }) => (
    <Box sx={{ my: 6 }}>
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                bgcolor: '#f1f5f9',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                position: 'relative'
            }}
        >
            <Box sx={{ height: 12, bgcolor: '#e2e8f0', width: '100%', display: 'flex', gap: 1, alignItems: 'center', px: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94a3b8' }} />
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94a3b8' }} />
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#94a3b8' }} />
            </Box>
            <Box sx={{ p: 1 }}>
                <Image
                    src={src}
                    alt={caption}
                    width={1200}
                    height={700}
                    style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        display: 'block'
                    }}
                />
            </Box>
        </Paper>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#64748b', fontStyle: 'italic' }}>
            {caption}
        </Typography>
    </Box>
);

const CodeSnippet = ({ children }: any) => (
    <Paper
        elevation={0}
        sx={{
            bgcolor: '#0f172a',
            color: '#e2e8f0',
            p: 2.5,
            borderRadius: 3,
            my: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                bgcolor: primaryMain
            }
        }}
    >
        <Box component="pre" sx={{
            m: 0,
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap'
        }}>
            {children}
        </Box>
    </Paper>
);

const Callout = ({ type = 'info', title, children }: any) => {
    const colors = {
        info: { bg: '#eff6ff', border: '#bfdbfe', icon: <Zap size={20} />, text: '#1e40af', iconColor: '#3b82f6' },
        warning: { bg: '#fffbeb', border: '#fef3c7', icon: <ChevronDown size={20} />, text: '#92400e', iconColor: '#f59e0b' },
        tip: { bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckSquare size={20} />, text: '#166534', iconColor: '#22c55e' }
    };
    const config = colors[type as keyof typeof colors] || colors.info;

    return (
        <Box sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: config.bg,
            border: `1px solid ${config.border}`,
            my: 4,
            display: 'flex',
            gap: 2
        }}>
            <Box sx={{ color: config.iconColor, mt: 0.5 }}>{config.icon}</Box>
            <Box>
                {title && <Typography variant="subtitle1" fontWeight={800} sx={{ color: config.text, mb: 0.5 }}>{title}</Typography>}
                <Typography variant="body2" sx={{ color: config.text, lineHeight: 1.6 }}>{children}</Typography>
            </Box>
        </Box>
    );
};

// --- Documentation Content ---

const IntroductionSection = () => (
    <Box>
        <Typography variant="h2" fontWeight={900} sx={{ mb: 2, fontFamily: fontJakarta, letterSpacing: '-0.04em' }}>
            Welcome to Orbit AI
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 6, fontWeight: 400, lineHeight: 1.6 }}>
            The next generation of agile project management, powered by Tambo AI.
            Orbit combines traditional scrum workflows with intelligent assistance to help teams ship faster.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 8 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                <FeatureHighlight
                    icon={Layout}
                    title="Unified Workspace"
                    description="Bring tasks, bugs, sprints, and reports into a single, cohesive interface."
                />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FeatureHighlight
                    icon={MessageSquare}
                    title="AI Assistant (Tambo)"
                    description="Command your workspace using natural language. No more manual form filling."
                />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FeatureHighlight
                    icon={BarChart3}
                    title="Real-time Analytics"
                    description="Live burndown charts and velocity tracking updated with every task progress."
                />
            </Grid>
        </Grid>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontFamily: fontJakarta }}>
            Key Philosophy
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            At Orbit, we believe that project management tools should get out of your way. Instead of clicking through
            dozens of modals to create a sprint or assign a bug, you should be able to just <strong>say what you want</strong>.
            Whether you're a developer tracking bugs or a PM planning a roadmap, Orbit adapts to your workflow.
        </Typography>

        <Screenshot src="/images/product_1.png" caption="Orbit AI Landing Page - Your gateway to efficient agile management." />
    </Box>
);

const GettingStartedSection = () => (
    <Box>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 3, fontFamily: fontJakarta }}>
            Getting Started
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            Setting up your first workspace is instantaneous. Follow these steps to get your team up and running.
        </Typography>

        <Stack spacing={4} sx={{ my: 6 }}>
            <Box>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: primaryMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</Box>
                    Launch the Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 5 }}>
                    Once logged in, you'll see your Workspace Hub. Here you can see all the environments you belong to or create a brand new one.
                </Typography>
                <Screenshot src="/images/product_2.png" caption="Workspace Hub - Manage multiple projects from a central dashboard." />
            </Box>

            <Box>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: primaryMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</Box>
                    Create Your First Workspace
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 5 }}>
                    Click the <strong>'Create New Workspace'</strong> card. Enter a descriptive name for your project (e.g., 'Project Phoenix' or 'Mobile App v2').
                </Typography>
                <Screenshot src="/images/product_3.png" caption="Workspace Creation - Fast and intuitive setup process." />
            </Box>

            <Box>
                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: primaryMain, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</Box>
                    Initialize Teams
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 5 }}>
                    Inside your workspace, you can create multiple teams (e.g., Frontend, Backend, QA). This allows for granular task management and reporting.
                </Typography>
                <Screenshot src="/images/product_6.png" caption="Team Management - Organizing your developers and stakeholders." />
            </Box>
        </Stack>

        <Callout type="tip" title="Pro Tip: AI Setup">
            You don't even need to use the UI. Just open Tambo (⌘K) and say:
            <em> "Create a workspace called Orbit Demo then add a team called 'Engineers'"</em>.
        </Callout>
    </Box>
);

const AgileCoreSection = () => (
    <Box>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 3, fontFamily: fontJakarta }}>
            Agile Core Workflow
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            Orbit is built on the foundation of Scrum and Kanban. Our tools are flexible enough to accommodate any team size.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 5, mb: 2, fontFamily: fontJakarta }}>
            1. The Backlog
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.7 }}>
            The Backlog is your single source of truth. Every feature request, technical debt item, and user story lives here before being planned into a sprint.
            Use the <strong>Quick Add</strong> feature or ask Tambo to draft stories for you.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 5, mb: 2, fontFamily: fontJakarta }}>
            2. Sprint Planning
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Sprints are time-boxed iterations (usually 2 weeks). Create a sprint, define its goal, and pull tasks from the backlog using our drag-and-drop interface.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 5, mb: 2, fontFamily: fontJakarta }}>
            3. Scrum Board (Kanban)
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.7 }}>
            The heart of daily execution. Visualize work moving through <strong>To Do</strong>, <strong>In Progress</strong>, <strong>In Review</strong>, and <strong>Done</strong>.
            Status updates happen in real-time across all team members' screens.
        </Typography>

        <Screenshot src="/images/product_7.png" caption="Navigation & Interface - Easy access to all agile tools in the sidebar." />
    </Box>
);

const TamboAISection = () => (
    <Box>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 3, fontFamily: fontJakarta }}>
            Tambo AI Assistant
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            Tambo is more than just a chatbot. It's a deep integration that understands the context of your project, teams, and tasks.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 5, mb: 2, fontFamily: fontJakarta }}>
            Mastering Commands
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
            You can interact with Tambo for complex operations. Here are some advanced command patterns:
        </Typography>

        <CodeSnippet>
            {`// Task Management
"Create 3 tasks for the onboarding flow and assign them to @DevTeam"

// Sprint Operations
"Move all remaining tasks from Sprint 4 to the current Sprint and set goal to 'Code Freeze'"

// Reporting
"Give me a summary of blockers for the Backend team in the last 48 hours"

// Content Generation
"Draft a technical specification for the new GraphQL endpoint using our standard template"`}
        </CodeSnippet>

        <Callout type="info" title="Context Awareness">
            Tambo knows which page you are on. If you're looking at a bug, you can simply say <em>"Assign this to me"</em> without needing to specify the ID.
        </Callout>
    </Box>
);

const ShortcutsSection = () => (
    <Box>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 3, fontFamily: fontJakarta }}>
            Keyboard Shortcuts
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            Power users use keywords. Speed up your workflow with these global hotkeys.
        </Typography>

        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', my: 4 }}>
            {[
                { keys: ["Ctrl", "K"], desc: "Open Tambo AI Assistant", primary: true },
                { keys: ["Ctrl", "/"], desc: "Global Search Across Workspace", primary: true },
                { keys: ["Esc"], desc: "Close any modal or dialog" },
                { keys: ["P"], desc: "Quick navigate to Projects" },
                { keys: ["B"], desc: "Open Backlog view" },
                { keys: ["S"], desc: "Open active Sprint board" },
            ].map((item, i) => (
                <Box key={i} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    borderBottom: '1px solid #f1f5f9',
                    '&:last-child': { borderBottom: 'none' },
                    bgcolor: item.primary ? alpha(primaryMain, 0.02) : 'transparent'
                }}>
                    <Typography variant="body1" fontWeight={item.primary ? 700 : 500} color={item.primary ? '#0f172a' : '#475569'}>
                        {item.desc}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                        {item.keys.map(k => (
                            <Box key={k} sx={{
                                minWidth: 28, px: 1.2, py: 0.6,
                                bgcolor: 'white',
                                border: '1px solid #cbd5e1',
                                borderBottomWidth: 3,
                                borderRadius: 1.5,
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                color: '#1e293b',
                                textAlign: 'center',
                                boxShadow: '0 2px 0 rgba(0,0,0,0.05)'
                            }}>
                                {k}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Paper>
    </Box>
);

// --- Main Page Component ---

export default function UserGuidePage() {
    const [activeSection, setActiveSection] = useState('intro');
    const [scrolled, setScrolled] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Simple intersection detection could go here for sidebar auto-updating
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const sections = [
        { id: 'intro', title: 'Introduction', icon: Home },
        { id: 'getting-started', title: 'Getting Started', icon: Zap },
        { id: 'agile-core', title: 'Agile Core', icon: Layers },
        { id: 'tambo', title: 'Tambo AI', icon: MessageSquare },
        { id: 'shortcuts', title: 'Shortcuts', icon: Keyboard },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
            {/* Navigation Header */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                bgcolor: scrolled ? 'rgba(255,255,255,0.8)' : 'white',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: '1px solid',
                borderColor: scrolled ? '#e2e8f0' : 'transparent',
                transition: 'all 0.3s ease'
            }}>
                <Container maxWidth="xl">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" height={72}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Zap size={24} color={primaryMain} fill={primaryMain} />
                            <Typography variant="h6" fontWeight={800} sx={{ color: '#0f172a', fontFamily: fontJakarta, letterSpacing: '-0.02em' }}>
                                Orbit <Box component="span" sx={{ color: '#64748b', fontWeight: 500 }}>Resources</Box>
                            </Typography>
                        </Link>

                        <Stack direction="row" spacing={3} alignItems="center">
                            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        color: '#475569',
                                        borderColor: '#e2e8f0',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: 2.5,
                                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                                    }}
                                >
                                    Go to App
                                </Button>
                            </Link>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: primaryMain,
                                    color: 'white',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 2.5,
                                    px: 3,
                                    boxShadow: `0 8px 20px ${alpha(primaryMain, 0.2)}`,
                                    '&:hover': { bgcolor: '#1d4ed8' }
                                }}
                            >
                                Get Priority Support
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ pt: 12, pb: 10 }}>
                <Grid container spacing={6}>
                    {/* Fixed Sidebar */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="overline" fontWeight={800} color="primary" sx={{ letterSpacing: 1.5 }}>
                                    DOCUMENTATION
                                </Typography>
                                <Typography variant="h5" fontWeight={800} sx={{ mt: 1, fontFamily: fontJakarta, color: '#0f172a' }}>
                                    User Guide
                                </Typography>
                            </Box>

                            <List sx={{ p: 0 }}>
                                {sections.map((section) => (
                                    <SidebarItem
                                        key={section.id}
                                        icon={section.icon}
                                        title={section.title}
                                        active={activeSection === section.id}
                                        onClick={() => scrollToSection(section.id)}
                                    />
                                ))}
                            </List>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="overline" fontWeight={800} color="text.disabled" sx={{ letterSpacing: 1, mb: 2, display: 'block' }}>
                                COMMUNITY & HELP
                            </Typography>
                            <Stack spacing={1}>
                                <Button startIcon={<Twitter size={18} />} sx={{ justifyContent: 'flex-start', color: '#64748b', textTransform: 'none', py: 1 }}>Follow Updates</Button>
                                <Button startIcon={<Github size={18} />} sx={{ justifyContent: 'flex-start', color: '#64748b', textTransform: 'none', py: 1 }}>Source Code</Button>
                                <Button startIcon={<Settings size={18} />} sx={{ justifyContent: 'flex-start', color: '#64748b', textTransform: 'none', py: 1 }}>Version History</Button>
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Scrollable Content */}
                    <Grid size={{ xs: 12, md: 9 }}>
                        <Box ref={contentRef} sx={{ maxWidth: 840 }}>
                            <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 4, color: '#94a3b8' }}>
                                <Link href="/" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.85rem' }}>Home</Link>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>User Guide</Typography>
                            </Breadcrumbs>

                            <Box id="intro" sx={{ mb: 10 }}>
                                <IntroductionSection />
                            </Box>

                            <Divider sx={{ my: 10, borderColor: '#f1f5f9' }} />

                            <Box id="getting-started" sx={{ mb: 10 }}>
                                <GettingStartedSection />
                            </Box>

                            <Divider sx={{ my: 10, borderColor: '#f1f5f9' }} />

                            <Box id="agile-core" sx={{ mb: 10 }}>
                                <AgileCoreSection />
                            </Box>

                            <Divider sx={{ my: 10, borderColor: '#f1f5f9' }} />

                            <Box id="tambo" sx={{ mb: 10 }}>
                                <TamboAISection />
                            </Box>

                            <Divider sx={{ my: 10, borderColor: '#f1f5f9' }} />

                            <Box id="shortcuts" sx={{ mb: 10 }}>
                                <ShortcutsSection />
                            </Box>

                            {/* Footer */}
                            <Box sx={{
                                mt: 15, p: 6, borderRadius: 6,
                                bgcolor: '#0f172a', color: 'white',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Typography variant="h4" fontWeight={800} sx={{ mb: 2, fontFamily: fontJakarta }}>
                                        Ready to blast off?
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 4, opacity: 0.7, maxWidth: 500, mx: 'auto' }}>
                                        Experience the future of Agile. Join 10,000+ teams who have optimized their workflow with Orbit.
                                    </Typography>
                                    <Stack direction="row" spacing={2} justifyContent="center">
                                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                                            <Button variant="contained" sx={{ bgcolor: 'white', color: 'black', fontWeight: 700, px: 4, py: 1.5, borderRadius: 3, '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                Launch App Now
                                            </Button>
                                        </Link>
                                    </Stack>
                                </Box>
                                {/* Decorative Gradient */}
                                <Box sx={{
                                    position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%',
                                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
                                    zIndex: 0
                                }} />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

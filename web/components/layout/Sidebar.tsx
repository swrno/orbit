"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
    LayoutGrid, Search, Layers, Calendar, Users, Bug, TrendingUp,
    BarChart3, ListTodo, ChevronDown, FileText, Plus
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Typography, Box, Select, MenuItem, FormControl, Divider, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { SearchModal } from "@/components/search/SearchModal";

export default function Sidebar({ className }: { className?: string }) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;

    const { workspaces, createWorkspace } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId || 'ws-1');
    const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // Keyboard shortcut for search (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Standard navigation items for every workspace (like JIRA/Monday.com)
    const navItems = [
        {
            id: 'backlog',
            label: 'Backlog',
            icon: <ListTodo size={16} />,
            path: `/${selectedWorkspace}/backlog`
        },
        {
            id: 'sprints',
            label: 'Sprints',
            icon: <Calendar size={16} />,
            path: `/${selectedWorkspace}/sprints`
        },
        {
            id: 'epics',
            label: 'Epics',
            icon: <Layers size={16} />,
            path: `/${selectedWorkspace}/epics`
        },
        {
            id: 'bugs',
            label: 'Bugs Queue',
            icon: <Bug size={16} />,
            path: `/${selectedWorkspace}/bugs`
        },
        {
            id: 'roadmap',
            label: 'Roadmap',
            icon: <TrendingUp size={16} />,
            path: `/${selectedWorkspace}/roadmap`
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: <BarChart3 size={16} />,
            path: `/${selectedWorkspace}/reports`
        },
        {
            id: 'team',
            label: 'Team',
            icon: <Users size={16} />,
            path: `/${selectedWorkspace}/team`
        },
        {
            id: 'getting-started',
            label: 'Getting Started',
            icon: <FileText size={16} />,
            path: '/get-started'
        }
    ];

    const handleWorkspaceChange = (newWorkspaceId: string) => {
        setSelectedWorkspace(newWorkspaceId);
        router.push(`/${newWorkspaceId}/backlog`);
    };

    const handleCreateWorkspace = () => {
        if (newWorkspaceName.trim()) {
            const newId = `ws-${Date.now()}`;
            createWorkspace(newWorkspaceName.trim(), newId);
            setNewWorkspaceName('');
            setCreateWorkspaceOpen(false);
            // Navigate to new workspace
            setTimeout(() => {
                router.push(`/${newId}/backlog`);
            }, 100);
        }
    };

    if (!workspace) return null;

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: 260,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 260,
                        boxSizing: 'border-box',
                        bgcolor: '#f4f5f7',
                        border: 'none',
                        borderRight: '1px solid #DFE1E6'
                    }
                }}
                className={className}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #DFE1E6' }}>
                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '6px',
                                        bgcolor: '#0052CC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <LayoutGrid size={18} color="white" />
                                </Box>
                                <Typography variant="h6" fontWeight={600} sx={{ color: '#172B4D' }}>
                                    ForgeAI
                                </Typography>
                            </Box>
                        </Link>

                        {/* Workspace Selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#6B778C', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Workspace
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => setCreateWorkspaceOpen(true)}
                                sx={{
                                    minWidth: 'auto',
                                    p: 0.5,
                                    color: '#0052CC',
                                    '&:hover': {
                                        bgcolor: '#DEEBFF'
                                    }
                                }}
                            >
                                <Plus size={14} />
                            </Button>
                        </Box>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedWorkspace}
                                onChange={(e) => handleWorkspaceChange(e.target.value)}
                                sx={{
                                    bgcolor: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#DFE1E6'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#B3BAC5'
                                    },
                                    '& .MuiSelect-select': {
                                        py: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }
                                }}
                                IconComponent={ChevronDown}
                            >
                                {workspaces.map((ws) => (
                                    <MenuItem key={ws.id} value={ws.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '4px',
                                                    bgcolor: ws.color || '#0052CC',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {(ws.name || ws.title).charAt(0)}
                                            </Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                {ws.name || ws.title}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Search */}
                    <Box sx={{ p: 2 }}>
                        <Box
                            onClick={() => setSearchOpen(true)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                bgcolor: 'white',
                                border: '1px solid #DFE1E6',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                '&:hover': {
                                    borderColor: '#B3BAC5',
                                    bgcolor: '#FAFBFC'
                                }
                            }}
                        >
                            <Search size={16} color="#6B778C" />
                            <Typography variant="body2" sx={{ color: '#6B778C', flex: 1 }}>
                                Search...
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    bgcolor: '#F4F5F7',
                                    color: '#6B778C',
                                    px: 0.75,
                                    py: 0.25,
                                    borderRadius: '2px',
                                    border: '1px solid #DFE1E6',
                                    fontSize: '0.7rem'
                                }}
                            >
                                ⌘K
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: '#DFE1E6' }} />

                    {/* Navigation Items */}
                    <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                        <List sx={{ px: 2 }}>
                            {navItems.map((item) => {
                                const isActive = pathname === item.path ||
                                    (item.id !== 'getting-started' && pathname?.includes(`/${selectedWorkspace}/${item.id}`));

                                return (
                                    <ListItemButton
                                        key={item.id}
                                        component={Link}
                                        href={item.path}
                                        selected={isActive}
                                        sx={{
                                            borderRadius: '3px',
                                            mb: 0.5,
                                            py: 1,
                                            px: 1.5,
                                            '&.Mui-selected': {
                                                bgcolor: '#DEEBFF',
                                                color: '#0052CC',
                                                '& .MuiListItemIcon-root': {
                                                    color: '#0052CC'
                                                },
                                                '&:hover': {
                                                    bgcolor: '#DEEBFF'
                                                }
                                            },
                                            '&:hover': {
                                                bgcolor: 'white'
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#0052CC' : '#42526E' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: isActive ? 600 : 400,
                                                color: isActive ? '#0052CC' : '#172B4D'
                                            }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ p: 2, borderTop: '1px solid #DFE1E6' }}>
                        <Typography variant="caption" sx={{ color: '#6B778C', display: 'block', textAlign: 'center' }}>
                            ForgeAI v1.0
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B778C', display: 'block', textAlign: 'center', mt: 0.5 }}>
                            {workspace.name || workspace.title}
                        </Typography>
                    </Box>
                </Box>

                {/* Search Modal */}
                <SearchModal
                    open={searchOpen}
                    onClose={() => setSearchOpen(false)}
                    workspaceId={selectedWorkspace}
                />
            </Drawer>

            {/* Create Workspace Dialog */}
            <Dialog
                open={createWorkspaceOpen}
                onClose={() => setCreateWorkspaceOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#172B4D' }}>
                    Create New Workspace
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Workspace Name"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            placeholder="e.g., Marketing Team, Product Development"
                            autoFocus
                            helperText="Each workspace has its own tasks, sprints, and team"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setCreateWorkspaceOpen(false)} sx={{ color: '#42526E', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateWorkspace}
                        variant="contained"
                        disabled={!newWorkspaceName.trim()}
                        sx={{
                            bgcolor: '#0052CC',
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0747A6' }
                        }}
                    >
                        Create Workspace
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

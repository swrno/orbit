"use client";

import { useState } from "react";
import {
    Box, Tabs, Tab, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Typography, FormControl, InputLabel, Select, MenuItem as SelectItem
} from "@mui/material";
import {
    Plus, Table, Calendar, BarChart3, TrendingUp, Kanban, FileText,
    Layout, List, X
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface PageTab {
    id: string;
    label: string;
    type: 'board' | 'table' | 'gantt' | 'roadmap' | 'calendar' | 'chart' | 'list' | 'doc';
    path: string;
}

interface TabsHeaderProps {
    workspaceId: string;
    currentPath?: string;
}

export default function TabsHeader({ workspaceId, currentPath }: TabsHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newViewName, setNewViewName] = useState('');
    const [newViewType, setNewViewType] = useState<'board' | 'table' | 'gantt' | 'roadmap' | 'calendar' | 'chart' | 'list' | 'doc'>('table');

    // Map view types to existing pages
    const viewTypeToPath = (type: string) => {
        switch (type) {
            case 'table':
            case 'list':
                return `/${workspaceId}/backlog`;
            case 'board':
                return `/${workspaceId}/sprints`;
            case 'gantt':
                return `/${workspaceId}/gantt`;
            case 'roadmap':
                return `/${workspaceId}/roadmap`;
            case 'chart':
                return `/${workspaceId}/reports`;
            case 'calendar':
                return `/${workspaceId}/sprints`;
            case 'doc':
                return `/${workspaceId}/backlog`;
            default:
                return `/${workspaceId}/backlog`;
        }
    };

    // Default tabs for workspace (using existing pages)
    const defaultTabs: PageTab[] = [
        { id: 'backlog', label: 'Backlog', type: 'table', path: `/${workspaceId}/backlog` },
        { id: 'sprints', label: 'Sprints', type: 'board', path: `/${workspaceId}/sprints` },
        { id: 'roadmap', label: 'Roadmap', type: 'roadmap', path: `/${workspaceId}/roadmap` },
    ];

    const [tabs, setTabs] = useState<PageTab[]>(defaultTabs);

    const viewTypes = [
        { value: 'table', label: 'Table View', icon: <Table size={18} />, description: 'Spreadsheet-style table' },
        { value: 'board', label: 'Board View', icon: <Kanban size={18} />, description: 'Kanban-style workflow' },
        { value: 'gantt', label: 'Gantt Chart', icon: <Calendar size={18} />, description: 'Timeline and dependencies' },
        { value: 'roadmap', label: 'Roadmap', icon: <TrendingUp size={18} />, description: 'Strategic planning timeline' },
        { value: 'calendar', label: 'Calendar View', icon: <Calendar size={18} />, description: 'Calendar view' },
        { value: 'chart', label: 'Chart View', icon: <BarChart3 size={18} />, description: 'Data visualization' },
        { value: 'list', label: 'List View', icon: <List size={18} />, description: 'Simple list view' },
        { value: 'doc', label: 'Document', icon: <FileText size={18} />, description: 'Rich text document' }
    ];

    const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
        setAddMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAddMenuAnchor(null);
    };

    const handleCreateView = () => {
        handleCloseMenu();
        setCreateDialogOpen(true);
    };

    const handleCreateViewSubmit = () => {
        if (newViewName.trim()) {
            // Navigate to existing page based on view type
            const targetPath = viewTypeToPath(newViewType);

            // Create new tab pointing to existing page
            const newTab: PageTab = {
                id: `view-${Date.now()}`,
                label: newViewName,
                type: newViewType,
                path: targetPath
            };

            // Check if tab with same path already exists
            const existingTab = tabs.find(t => t.path === targetPath);
            if (!existingTab) {
                setTabs([...tabs, newTab]);
            }

            setNewViewName('');
            setNewViewType('table');
            setCreateDialogOpen(false);
            router.push(targetPath);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        const tab = tabs.find(t => t.path === newValue);
        if (tab) {
            router.push(tab.path);
        }
    };

    const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (tabs.length > 1) {
            setTabs(tabs.filter(t => t.id !== tabId));
        }
    };

    const currentTab = tabs.find(t => pathname?.includes(t.path)) || tabs[0];

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'white',
                    borderBottom: '1px solid #DFE1E6',
                    px: 2
                }}
            >
                <Tabs
                    value={currentTab?.path || false}
                    onChange={handleTabChange}
                    sx={{
                        flex: 1,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: 48,
                            color: '#6B778C',
                            fontWeight: 500,
                            '&.Mui-selected': {
                                color: '#0052CC'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#0052CC'
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            value={tab.path}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {viewTypes.find(v => v.value === tab.type)?.icon}
                                    <span>{tab.label}</span>
                                    {tabs.length > 1 && (
                                        <Box component="span"
                                            onClick={(e) => handleCloseTab(tab.id, e)}
                                            sx={{
                                                ml: 0.5,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.25,
                                                borderRadius: '2px',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <X size={14} />
                                        </Box>
                                    )}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>

                {/* Add Tab Button */}
                <Box component="span"
                    onClick={handleAddClick}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        height: 32,
                        bgcolor: '#F4F5F7',
                        '&:hover': {
                            bgcolor: '#DFE1E6'
                        }
                    }}
                >
                    <Plus size={18} />
                </Box>
            </Box>

            {/* Add Menu */}
            <Menu
                anchorEl={addMenuAnchor}
                open={Boolean(addMenuAnchor)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 280,
                        boxShadow: '0 8px 16px rgba(23,43,77,0.12)',
                        border: '1px solid #DFE1E6'
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #DFE1E6' }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#172B4D' }}>
                        Add View
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B778C' }}>
                        Create a new view for this workspace
                    </Typography>
                </Box>

                {viewTypes.map((type) => (
                    <MenuItem
                        key={type.value}
                        onClick={() => {
                            setNewViewType(type.value as any);
                            handleCreateView();
                        }}
                    >
                        <ListItemIcon>{type.icon}</ListItemIcon>
                        <ListItemText
                            primary={type.label}
                            secondary={type.description}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </MenuItem>
                ))}
            </Menu>

            {/* Create View Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#172B4D' }}>
                    Create New View
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="View Name"
                            value={newViewName}
                            onChange={(e) => setNewViewName(e.target.value)}
                            placeholder="e.g., Sprint Board, Bug Tracker"
                            sx={{ mb: 3 }}
                            autoFocus
                        />

                        <FormControl fullWidth>
                            <InputLabel>View Type</InputLabel>
                            <Select
                                value={newViewType}
                                label="View Type"
                                onChange={(e) => setNewViewType(e.target.value as any)}
                            >
                                {viewTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {type.icon}
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {type.label}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                                    {type.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </SelectItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="caption" sx={{ color: '#6B778C', display: 'block', mt: 2 }}>
                            Note: Views will navigate to existing pages based on type
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#42526E', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateViewSubmit}
                        variant="contained"
                        disabled={!newViewName.trim()}
                        sx={{
                            bgcolor: '#0052CC',
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0747A6' }
                        }}
                    >
                        Create View
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

"use client";

import { useAppStore, PageType } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
    BarChart3, ListTodo, ChevronDown, FileText, Plus, Kanban,
    LayoutGrid, Search, Layers, Calendar, Users, Bug, TrendingUp, Table, List as ListIcon,
    MoreHorizontal, Trash2, Edit, RotateCcw, CheckSquare, Zap, Target
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Typography, Box, Select, MenuItem, FormControl, Divider, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Menu, MenuItem as MuiMenuItem, InputLabel, IconButton
} from "@mui/material";
import { SearchModal } from "@/components/search/SearchModal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function Sidebar({ className }: { className?: string }) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const paramId = params.workspaceId as string;

    // Hydration fix for DragDropContext and store persistence
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { workspaces, createWorkspace, addPage, renamePage, deletePage, reorderPage, addGroup, renameGroup, deleteGroup } = useAppStore();

    // Fallback to first workspace if ID is invalid, preventing sidebar crash
    const workspace = workspaces.find(w => w.id === paramId) || workspaces[0];
    const workspaceId = workspace?.id || paramId;

    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceId || 'ws-1');

    // Keep selection in sync with URL
    useEffect(() => {
        if (workspaceId) setSelectedWorkspace(workspaceId);
    }, [workspaceId]);

    const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    // View Creation State
    const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newViewName, setNewViewName] = useState('');
    const [newViewType, setNewViewType] = useState<PageType>('table');
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');

    // View Management State (Context Menu, Rename, Delete)
    const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedPageForAction, setSelectedPageForAction] = useState<{ groupId: string, pageId: string, title: string } | null>(null);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const viewTypes = [
        { value: 'table', label: 'Table View', icon: <Table size={18} />, description: 'Spreadsheet-style table' },
        { value: 'document', label: 'Document', icon: <FileText size={18} />, description: 'Rich text document' }
    ];

    const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
    const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});

    const toggleTeamCollapse = (groupId: string) => {
        setCollapsedTeams(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
        setTargetGroupId(null); // Reset target group (global add)
        setAddMenuAnchor(event.currentTarget);
    };

    const handleGroupAddClick = (event: React.MouseEvent<HTMLElement>, groupId: string) => {
        event.stopPropagation();
        setTargetGroupId(groupId);
        setAddMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAddMenuAnchor(null);
    };

    const handleCreateView = () => {
        handleCloseMenu();
        // Set default group selection
        if (targetGroupId) {
            setSelectedGroupId(targetGroupId);
        } else if (workspace && workspace.groups.length > 0) {
            setSelectedGroupId(workspace.groups[0].id);
        }
        setCreateDialogOpen(true);
    };

    const handleCreateConfirm = () => {
        if (newViewName.trim() && workspaceId && selectedGroupId) {
            addPage(workspaceId, selectedGroupId, newViewName.trim(), newViewType);
            setNewViewName('');
            setCreateDialogOpen(false);
            setTargetGroupId(null);
            setSelectedGroupId('');

            // Navigate to the new page (optimistic)
            // Note: In a real app we'd wait for ID or use a deterministic ID
        }
    };

    // Context Menu Handlers
    const handleContextMenuOpen = (event: React.MouseEvent<HTMLElement>, groupId: string, pageId: string, title: string) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenuAnchor(event.currentTarget);
        setSelectedPageForAction({ groupId, pageId, title });
    };

    const handleContextMenuClose = () => {
        setContextMenuAnchor(null);
        // Don't clear selectedPageForAction immediately so dialogs can use it
    };

    const handleRenameClick = () => {
        if (selectedPageForAction) {
            setRenameValue(selectedPageForAction.title);
            setRenameDialogOpen(true);
            handleContextMenuClose();
        }
    };

    const handleRenameSubmit = () => {
        if (selectedPageForAction && renameValue.trim()) {
            renamePage(workspaceId, selectedPageForAction.groupId, selectedPageForAction.pageId, renameValue.trim());
            setRenameDialogOpen(false);
            setSelectedPageForAction(null);
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        handleContextMenuClose();
    };

    const handleDeleteConfirm = () => {
        if (selectedPageForAction) {
            deletePage(workspaceId, selectedPageForAction.groupId, selectedPageForAction.pageId);
            setDeleteDialogOpen(false);
            setSelectedPageForAction(null);

            // If we deleted the current page, navigate to backlog
            if (pathname?.includes(selectedPageForAction.pageId)) {
                router.push(`/${workspaceId}/backlog`);
            }
        }
    };

    // Team Management State
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [groupContextMenuAnchor, setGroupContextMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedGroupForAction, setSelectedGroupForAction] = useState<{ groupId: string, title: string } | null>(null);
    const [renameGroupOpen, setRenameGroupOpen] = useState(false);
    const [renameGroupValue, setRenameGroupValue] = useState('');
    const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);

    const handleCreateGroup = () => {
        if (newGroupName.trim() && workspaceId) {
            addGroup(workspaceId, newGroupName.trim());
            setNewGroupName('');
            setCreateGroupOpen(false);
        }
    };

    const handleGroupContextMenuOpen = (event: React.MouseEvent<HTMLElement>, groupId: string, title: string) => {
        event.preventDefault();
        event.stopPropagation();
        setGroupContextMenuAnchor(event.currentTarget);
        setSelectedGroupForAction({ groupId, title });
    };

    const handleGroupContextMenuClose = () => {
        setGroupContextMenuAnchor(null);
    };

    const handleRenameGroupClick = () => {
        if (selectedGroupForAction) {
            setRenameGroupValue(selectedGroupForAction.title);
            setRenameGroupOpen(true);
            handleGroupContextMenuClose();
        }
    };

    const handleRenameGroupSubmit = () => {
        if (selectedGroupForAction && renameGroupValue.trim()) {
            renameGroup(workspaceId, selectedGroupForAction.groupId, renameGroupValue.trim());
            setRenameGroupOpen(false);
            setSelectedGroupForAction(null);
        }
    };

    const handleDeleteGroupClick = () => {
        setDeleteGroupOpen(true);
        handleGroupContextMenuClose();
    };

    const handleDeleteGroupConfirm = () => {
        if (selectedGroupForAction) {
            deleteGroup(workspaceId, selectedGroupForAction.groupId);
            setDeleteGroupOpen(false);
            setSelectedGroupForAction(null);
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !workspace) return;

        const { source, destination } = result;

        // Extract group ID from droppableId (format: "group-[groupId]")
        const groupId = source.droppableId.replace('group-', '');

        // Ensure dropping in same group for now
        if (source.droppableId !== destination.droppableId) return;

        reorderPage(workspaceId, groupId, source.index, destination.index);
    };

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



    const handleWorkspaceChange = (newWorkspaceId: string) => {
        setSelectedWorkspace(newWorkspaceId);
        const targetWorkspace = workspaces.find(w => w.id === newWorkspaceId);
        if (targetWorkspace && targetWorkspace.groups.length > 0 && targetWorkspace.groups[0].pages.length > 0) {
            router.push(`/${newWorkspaceId}/${targetWorkspace.groups[0].pages[0].id}`);
        }
    };

    const handleCreateWorkspace = () => {
        if (newWorkspaceName.trim()) {
            const newId = `ws-${Date.now()}`;
            createWorkspace(newWorkspaceName.trim(), newId);
            setNewWorkspaceName('');
            setCreateWorkspaceOpen(false);
            // Navigate to first page of new workspace
            setTimeout(() => {
                const newWorkspace = workspaces.find(w => w.id === newId);
                if (newWorkspace && newWorkspace.groups.length > 0 && newWorkspace.groups[0].pages.length > 0) {
                    router.push(`/${newId}/${newWorkspace.groups[0].pages[0].id}`);
                }
            }, 100);
        }
    };

    if (!isMounted || !workspace) return null;

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
                                    Orbit AI Workspace
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

                    {/* Add Group Action */}
                    <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B778C' }}>
                            TEAMS
                        </Typography>
                        <Box
                            onClick={() => setCreateGroupOpen(true)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '3px',
                                cursor: 'pointer',
                                color: '#6B778C',
                                '&:hover': {
                                    bgcolor: '#DEEBFF',
                                    color: '#0052CC'
                                }
                            }}
                            title="Add Team"
                        >
                            <Plus size={16} />
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: '#DFE1E6' }} />

                    {/* Dynamic Groups & Pages */}
                    <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                        {workspace.groups && workspace.groups.length > 0 && (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Box sx={{ px: 2, py: 1 }}>
                                    {workspace.groups.map(group => (
                                        <Box key={group.id} sx={{ mb: 2 }}>
                                            <Box
                                                sx={{
                                                    px: 1.5,
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    '&:hover .group-actions': { opacity: 1 }
                                                }}
                                            >
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 0.5,
                                                        cursor: 'pointer',
                                                        flex: 1
                                                    }}
                                                    onClick={() => toggleTeamCollapse(group.id)}
                                                >
                                                    <ChevronDown 
                                                        size={14} 
                                                        style={{ 
                                                            transform: collapsedTeams[group.id] ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.2s',
                                                            color: '#6B778C'
                                                        }} 
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#6B778C',
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        {group.title}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Box
                                                        className="group-actions"
                                                        onClick={(e) => handleGroupAddClick(e, group.id)}
                                                        sx={{
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            cursor: 'pointer',
                                                            p: 0.5,
                                                            borderRadius: '3px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            color: '#6B778C',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(9, 30, 66, 0.08)',
                                                                color: '#0052CC'
                                                            }
                                                        }}
                                                        title="Add View to Group"
                                                    >
                                                        <Plus size={14} />
                                                    </Box>
                                                    <Box
                                                        className="group-actions"
                                                        onClick={(e) => handleGroupContextMenuOpen(e, group.id, group.title)}
                                                        sx={{
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            cursor: 'pointer',
                                                            p: 0.5,
                                                            borderRadius: '3px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            color: '#6B778C',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(9, 30, 66, 0.08)',
                                                                color: '#172B4D'
                                                            }
                                                        }}
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {!collapsedTeams[group.id] && (
                                            <Droppable droppableId={`group-${group.id}`}>
                                                {(provided) => (
                                                    <List disablePadding ref={provided.innerRef} {...provided.droppableProps}>
                                                        {group.pages.map((page, index) => {
                                                            const pagePath = `/${selectedWorkspace}/${page.id}`;
                                                            const isActive = pathname === pagePath;

                                                            // Determine icon based on page type
                                                            let PageIcon = FileText;
                                                            if (page.icon) {
                                                                if (page.icon === 'Bug') PageIcon = Bug;
                                                                else if (page.icon === 'RotateCcw') PageIcon = RotateCcw;
                                                                else if (page.icon === 'CheckSquare') PageIcon = CheckSquare;
                                                                else if (page.icon === 'Rabbit' || page.icon === 'Zap') PageIcon = Zap;
                                                                else if (page.icon === 'Layers') PageIcon = Layers;
                                                                else if (page.icon === 'FileText') PageIcon = FileText;
                                                                else if (page.icon === 'Target') PageIcon = Target;
                                                            } else {
                                                                if (page.type === 'board') PageIcon = Kanban;
                                                                if (page.type === 'table') PageIcon = ListTodo;
                                                                if (page.type === 'gantt' || page.type === 'calendar') PageIcon = Calendar;
                                                                if (page.type === 'roadmap') PageIcon = TrendingUp;
                                                                if (page.type === 'chart') PageIcon = BarChart3;
                                                                if (page.type === 'list') PageIcon = ListIcon;
                                                            }

                                                            return (
                                                                <Draggable key={page.id} draggableId={page.id} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <Box
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            sx={{ mb: 0.5 }}
                                                                        >
                                                                            <ListItemButton
                                                                                component={Link}
                                                                                href={pagePath}
                                                                                selected={isActive}
                                                                                sx={{
                                                                                    borderRadius: '3px',
                                                                                    py: 0.75,
                                                                                    px: 1.5,
                                                                                    // Add group for hover effect on More button
                                                                                    '&:hover .more-actions': {
                                                                                        opacity: 1
                                                                                    },
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
                                                                                        bgcolor: snapshot.isDragging ? '#DEEBFF' : 'white'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#0052CC' : '#42526E' }}>
                                                                                    <PageIcon size={16} />
                                                                                </ListItemIcon>
                                                                                <ListItemText
                                                                                    primary={page.title}
                                                                                    primaryTypographyProps={{
                                                                                        variant: 'body2',
                                                                                        fontWeight: isActive ? 500 : 400,
                                                                                        color: isActive ? '#0052CC' : '#172B4D',
                                                                                        noWrap: true
                                                                                    }}
                                                                                />
                                                                                <Box
                                                                                    component="div"
                                                                                    className="more-actions"
                                                                                    onClick={(e) => handleContextMenuOpen(e, group.id, page.id, page.title)}
                                                                                    sx={{
                                                                                        opacity: 0,
                                                                                        transition: 'opacity 0.2s',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        color: '#6B778C',
                                                                                        p: 0.5,
                                                                                        borderRadius: '3px',
                                                                                        '&:hover': {
                                                                                            bgcolor: 'rgba(9, 30, 66, 0.08)',
                                                                                            color: '#172B4D'
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <MoreHorizontal size={14} />
                                                                                </Box>
                                                                            </ListItemButton>
                                                                        </Box>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                        {provided.placeholder}
                                                    </List>
                                                )}
                                            </Droppable>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </DragDropContext>
                        )}
                    </Box>

                    {/* Footer */}
                    <Box sx={{ p: 2, borderTop: '1px solid #DFE1E6' }}>
                        <Typography variant="caption" sx={{ color: '#6B778C', display: 'block', textAlign: 'center' }}>
                            Orbit AI Workspace v1.0
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

            {/* Add View Menu */}
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

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Group</InputLabel>
                            <Select
                                value={selectedGroupId}
                                label="Group"
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                            >
                                {workspace && workspace.groups.map((group) => (
                                    <MenuItem key={group.id} value={group.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Layers size={16} />
                                            <Typography variant="body2">
                                                {group.title}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>View Type</InputLabel>
                            <Select
                                value={newViewType}
                                label="View Type"
                                onChange={(e) => setNewViewType(e.target.value as any)}
                            >
                                {viewTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
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
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#42526E', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateConfirm}
                        variant="contained"
                        disabled={!newViewName.trim() || !selectedGroupId}
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

            {/* Context Menu for Page Items */}
            <Menu
                anchorEl={contextMenuAnchor}
                open={Boolean(contextMenuAnchor)}
                onClose={handleContextMenuClose}
                PaperProps={{
                    sx: { minWidth: 160, boxShadow: '0 4px 8px rgba(9, 30, 66, 0.25)', border: '1px solid #DFE1E6' }
                }}
            >
                <MenuItem onClick={handleRenameClick} sx={{ gap: 1.5, py: 1 }}>
                    <Edit size={16} color="#42526E" />
                    <Typography variant="body2" color="#172B4D">Rename</Typography>
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ gap: 1.5, py: 1 }}>
                    <Trash2 size={16} color="#DE350B" />
                    <Typography variant="body2" color="#DE350B">Delete</Typography>
                </MenuItem>
            </Menu>

            {/* Rename Dialog */}
            <Dialog
                open={renameDialogOpen}
                onClose={() => setRenameDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#172B4D' }}>Rename View</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit();
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRenameDialogOpen(false)} sx={{ color: '#42526E' }}>Cancel</Button>
                    <Button
                        onClick={handleRenameSubmit}
                        variant="contained"
                        disabled={!renameValue.trim()}
                        sx={{ bgcolor: '#0052CC', '&:hover': { bgcolor: '#0747A6' } }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#DE350B', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Trash2 size={20} />
                    Delete View?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#172B4D">
                        Are you sure you want to delete <strong>{selectedPageForAction?.title}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#42526E' }}>Cancel</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{ bgcolor: '#DE350B', '&:hover': { bgcolor: '#BF2600' } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Group Context Menu */}
            <Menu
                anchorEl={groupContextMenuAnchor}
                open={Boolean(groupContextMenuAnchor)}
                onClose={handleGroupContextMenuClose}
                PaperProps={{
                    sx: { minWidth: 160, boxShadow: '0 4px 8px rgba(9, 30, 66, 0.25)', border: '1px solid #DFE1E6' }
                }}
            >
                <MenuItem onClick={handleRenameGroupClick} sx={{ gap: 1.5, py: 1 }}>
                    <Edit size={16} color="#42526E" />
                    <Typography variant="body2" color="#172B4D">Rename Team</Typography>
                </MenuItem>
                <MenuItem onClick={handleDeleteGroupClick} sx={{ gap: 1.5, py: 1 }}>
                    <Trash2 size={16} color="#DE350B" />
                    <Typography variant="body2" color="#DE350B">Delete Team</Typography>
                </MenuItem>
            </Menu>

            {/* Create Group Dialog */}
            <Dialog
                open={createGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#172B4D' }}>Create New Team</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Team Name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g., Marketing, QA"
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCreateGroupOpen(false)} sx={{ color: '#42526E' }}>Cancel</Button>
                    <Button
                        onClick={handleCreateGroup}
                        variant="contained"
                        disabled={!newGroupName.trim()}
                        sx={{ bgcolor: '#0052CC', '&:hover': { bgcolor: '#0747A6' } }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Rename Team Dialog */}
            <Dialog
                open={renameGroupOpen}
                onClose={() => setRenameGroupOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#172B4D' }}>Rename Team</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            value={renameGroupValue}
                            onChange={(e) => setRenameGroupValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameGroupSubmit();
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRenameGroupOpen(false)} sx={{ color: '#42526E' }}>Cancel</Button>
                    <Button
                        onClick={handleRenameGroupSubmit}
                        variant="contained"
                        disabled={!renameGroupValue.trim()}
                        sx={{ bgcolor: '#0052CC', '&:hover': { bgcolor: '#0747A6' } }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Team Dialog */}
            <Dialog
                open={deleteGroupOpen}
                onClose={() => setDeleteGroupOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#DE350B', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Trash2 size={20} />
                    Delete Team?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#172B4D">
                        Are you sure you want to delete <strong>{selectedGroupForAction?.title}</strong>? All pages within this team will be deleted.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteGroupOpen(false)} sx={{ color: '#42526E' }}>Cancel</Button>
                    <Button
                        onClick={handleDeleteGroupConfirm}
                        variant="contained"
                        color="error"
                        sx={{ bgcolor: '#DE350B', '&:hover': { bgcolor: '#BF2600' } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

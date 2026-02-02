"use client";

import { useAppStore, Task, TaskStatus, TaskPriority, Column, ColumnType, Sprint } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
    ChevronDown, ChevronRight, Plus, User, Calendar, GripVertical,
    MoreHorizontal, Trash2, Flag, Circle, Clock, CheckCircle2, AlertCircle,
    Filter, ArrowUpDown, Search
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
    Paper, Box, Typography, IconButton, Menu, MenuItem, Chip,
    TextField, Select, FormControl, InputLabel, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Avatar, Tooltip, Checkbox,
    ListItemIcon, ListItemText, Divider, InputAdornment
} from "@mui/material";

interface DataGridProps {
    workspaceId: string;
    pageId?: string;
    showBacklog?: boolean;
}

const STATUS_CONFIG: Record<TaskStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
    'Todo': { color: '#64748b', bgColor: '#f1f5f9', icon: <Circle size={12} /> },
    'In Progress': { color: '#f59e0b', bgColor: '#fef3c7', icon: <Clock size={12} /> },
    'In Review': { color: '#8b5cf6', bgColor: '#ede9fe', icon: <AlertCircle size={12} /> },
    'Done': { color: '#10b981', bgColor: '#d1fae5', icon: <CheckCircle2 size={12} /> },
    'Blocked': { color: '#ef4444', bgColor: '#fee2e2', icon: <AlertCircle size={12} /> },
};

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; bgColor: string }> = {
    'Low': { color: '#94a3b8', bgColor: '#f1f5f9' },
    'Medium': { color: '#3b82f6', bgColor: '#dbeafe' },
    'High': { color: '#f97316', bgColor: '#ffedd5' },
    'Critical': { color: '#ef4444', bgColor: '#fee2e2' },
};

const STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

const DEFAULT_COLUMNS: Column[] = [
    { id: 'c-1', title: 'Task Name', type: 'text', field: 'title', width: 320 },
    { id: 'c-2', title: 'Status', type: 'status', field: 'status', width: 130 },
    { id: 'c-3', title: 'Priority', type: 'priority', field: 'priority', width: 110 },
    { id: 'c-4', title: 'Owner', type: 'owner', field: 'owner', width: 140 },
    { id: 'c-5', title: 'Sprint', type: 'text', field: 'sprintId', width: 120 },
    { id: 'c-6', title: 'Est. SP', type: 'number', field: 'estimatedPoints', width: 80 },
    { id: 'c-7', title: 'Due Date', type: 'date', field: 'dueDate', width: 120 },
    { id: 'c-8', title: 'Epic', type: 'epic', field: 'epicId', width: 120 },
];

export function DataGrid({ workspaceId, pageId, showBacklog = false }: DataGridProps) {
    const { workspaces, addTask, updateTask, deleteTask, updatePage, assignTaskToSprint } = useAppStore();
    const workspace = workspaces.find((w) => w.id === workspaceId);

    // Find page and group
    let group = workspace?.groups.find(g => g.pages.some(p => p.id === pageId));
    let page = group?.pages.find(p => p.id === pageId);

    // Default to first page if no pageId provided or found
    if ((!group || !page) && !pageId && workspace?.groups.length) {
        group = workspace.groups[0];
        if (group?.pages.length) {
            page = group.pages[0];
        }
    }

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
    const [sortField, setSortField] = useState<string>('order');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [contextMenu, setContextMenu] = useState<{ task: Task; anchor: HTMLElement } | null>(null);
    const [bulkAssignDialog, setBulkAssignDialog] = useState(false);
    const [bulkSprintId, setBulkSprintId] = useState('');

    // Initialize columns if missing
    useEffect(() => {
        if (page && !page.columns && group) {
            updatePage(workspaceId, group.id, page.id, { columns: DEFAULT_COLUMNS });
        }
    }, [page, group, workspaceId, updatePage]);

    // Initialize expanded groups
    useEffect(() => {
        if (workspace) {
            const initialExpanded: Record<string, boolean> = { 'backlog': true };
            workspace.sprints.forEach(s => {
                initialExpanded[s.id] = true;
            });
            setExpandedGroups(initialExpanded);
        }
    }, [workspace?.sprints.length]);

    // Resizing State
    const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);

    if (!workspace || !page || !group) return null;

    const columns = page.columns || DEFAULT_COLUMNS;
    const allTasks = workspace.tasks || [];

    // Filter and sort tasks
    const filteredTasks = useMemo(() => {
        return allTasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
            return matchesSearch && matchesStatus && matchesPriority;
        }).sort((a, b) => {
            let aVal: any = (a as any)[sortField] || '';
            let bVal: any = (b as any)[sortField] || '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            if (sortDirection === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }, [allTasks, searchQuery, filterStatus, filterPriority, sortField, sortDirection]);

    // Group tasks by sprint
    const taskGroups = useMemo(() => {
        const groups: { id: string; name: string; tasks: Task[]; sprint?: Sprint }[] = [];

        // Add sprint groups
        workspace.sprints.forEach(sprint => {
            groups.push({
                id: sprint.id,
                name: sprint.name,
                tasks: filteredTasks.filter(t => t.sprintId === sprint.id),
                sprint
            });
        });

        // Add backlog
        groups.push({
            id: 'backlog',
            name: 'Backlog',
            tasks: filteredTasks.filter(t => t.sprintId === 'backlog' || !t.sprintId)
        });

        return groups;
    }, [filteredTasks, workspace.sprints]);

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const handleAddTask = (sprintId: string) => {
        if (!newTaskTitle.trim()) return;
        addTask(workspaceId, {
            title: newTaskTitle,
            status: 'Todo',
            priority: 'Medium',
            sprintId: sprintId,
            estimatedPoints: 0,
            owner: undefined,
            epicId: undefined
        });
        setNewTaskTitle("");
    };

    const handleUpdateCell = (taskId: string, field: string, value: any) => {
        const isStandard = ['title', 'status', 'priority', 'owner', 'epicId', 'estimatedPoints', 'sprintId', 'dueDate'].includes(field);

        if (isStandard) {
            updateTask(workspaceId, taskId, { [field]: value });
        } else {
            const currentTask = workspace.tasks.find(t => t.id === taskId);
            if (currentTask) {
                const customValues = { ...(currentTask.customValues || {}), [field]: value };
                updateTask(workspaceId, taskId, { customValues });
            }
        }
    };

    // Column resize handlers
    const startResize = (e: React.MouseEvent, columnId: string, width: number) => {
        e.preventDefault();
        e.stopPropagation();

        const onMouseMove = (moveEvent: MouseEvent) => { };

        const onMouseUp = (upEvent: MouseEvent) => {
            const diff = upEvent.clientX - e.clientX;
            const newWidth = Math.max(50, width + diff);

            if (group && page) {
                const newColumns = columns.map(c => c.id === columnId ? { ...c, width: newWidth } : c);
                updatePage(workspaceId, group.id, page.id, { columns: newColumns });
            }

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleAddColumn = () => {
        const name = prompt("Enter column name:");
        if (!name) return;

        const newColumn: Column = {
            id: `c-${Date.now()}`,
            title: name,
            type: 'text',
            field: `custom_${Date.now()}`,
            width: 150
        };

        updatePage(workspaceId, group.id, page.id, { columns: [...columns, newColumn] });
    };

    const handleRenameColumn = (columnId: string, currentTitle: string) => {
        const newTitle = prompt("Rename column:", currentTitle);
        if (newTitle && newTitle !== currentTitle) {
            const newColumns = columns.map(c => c.id === columnId ? { ...c, title: newTitle } : c);
            updatePage(workspaceId, group.id, page.id, { columns: newColumns });
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleSelectTask = (taskId: string, checked: boolean) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(taskId);
            } else {
                newSet.delete(taskId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (tasks: Task[], checked: boolean) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            tasks.forEach(t => {
                if (checked) {
                    newSet.add(t.id);
                } else {
                    newSet.delete(t.id);
                }
            });
            return newSet;
        });
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedTasks.size} selected tasks?`)) {
            selectedTasks.forEach(taskId => {
                deleteTask(workspaceId, taskId);
            });
            setSelectedTasks(new Set());
        }
    };

    const handleBulkAssignSprint = () => {
        if (bulkSprintId) {
            selectedTasks.forEach(taskId => {
                assignTaskToSprint(workspaceId, taskId, bulkSprintId);
            });
            setSelectedTasks(new Set());
            setBulkAssignDialog(false);
            setBulkSprintId('');
        }
    };

    const getSprintName = (sprintId: string | undefined) => {
        if (!sprintId || sprintId === 'backlog') return 'Backlog';
        const sprint = workspace.sprints.find(s => s.id === sprintId);
        return sprint?.name || 'Unknown';
    };

    // Calculate group stats
    const getGroupStats = (tasks: Task[]) => {
        const total = tasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        const done = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
        return { total, done, count: tasks.length };
    };

    return (
        <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', overflow: 'hidden', userSelect: 'none', borderRadius: 0 }}>
            {/* Toolbar */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap'
            }}>
                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 240 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} />
                            </InputAdornment>
                        )
                    }}
                />

                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                        native
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                        startAdornment={<Filter size={14} style={{ marginRight: 8 }} />}
                    >
                        <option value="all">All Status</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </FormControl>

                {/* Priority Filter */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <Select
                        native
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
                    >
                        <option value="all">All Priority</option>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </FormControl>

                <Box sx={{ flex: 1 }} />

                {/* Bulk Actions */}
                {selectedTasks.size > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={`${selectedTasks.size} selected`}
                            size="small"
                            onDelete={() => setSelectedTasks(new Set())}
                        />
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setBulkAssignDialog(true)}
                        >
                            Move to Sprint
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={handleBulkDelete}
                        >
                            Delete
                        </Button>
                    </Box>
                )}
            </Box>

            <Box className="flex flex-col h-full overflow-hidden">
                {/* Header Row */}
                <Box
                    className="flex items-stretch border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[11px] uppercase font-bold tracking-wide sticky top-0 z-20 shadow-sm min-w-max"
                >
                    <Box className="w-10 border-r border-zinc-200 flex items-center justify-center bg-zinc-100/50 flex-shrink-0">
                        <Checkbox
                            size="small"
                            sx={{ p: 0 }}
                            checked={selectedTasks.size > 0 && selectedTasks.size === filteredTasks.length}
                            indeterminate={selectedTasks.size > 0 && selectedTasks.size < filteredTasks.length}
                            onChange={(e) => handleSelectAll(filteredTasks, e.target.checked)}
                        />
                    </Box>
                    <Box className="w-8 border-r border-zinc-200 flex items-center justify-center bg-zinc-100/50 flex-shrink-0">#</Box>

                    {columns.map((col) => (
                        <Box
                            key={col.id}
                            className="border-r border-zinc-200 px-3 py-2 flex items-center relative group cursor-pointer hover:bg-zinc-100"
                            style={{ width: col.width }}
                            onClick={() => handleSort(col.field)}
                        >
                            <span onDoubleClick={(e) => { e.stopPropagation(); handleRenameColumn(col.id, col.title); }} className="truncate">
                                {col.title}
                            </span>
                            {sortField === col.field && (
                                <ArrowUpDown size={12} className={cn("ml-1", sortDirection === 'desc' && "rotate-180")} />
                            )}

                            {/* Resizer */}
                            <Box
                                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
                                onMouseDown={(e) => startResize(e, col.id, col.width)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Box>
                    ))}

                    <Box
                        className="w-12 flex items-center justify-center hover:bg-zinc-100 cursor-pointer text-zinc-400 hover:text-zinc-600 transition-colors border-r border-zinc-200"
                        onClick={handleAddColumn}
                        title="Add Column"
                    >
                        <Plus className="w-4 h-4" />
                    </Box>
                </Box>

                <Box className="flex-1 overflow-y-auto">
                    <Box className="min-w-max">
                        {taskGroups.map(taskGroup => {
                            const stats = getGroupStats(taskGroup.tasks);
                            const isExpanded = expandedGroups[taskGroup.id];

                            return (
                                <Box key={taskGroup.id}>
                                    {/* Group Header */}
                                    <Box
                                        className="flex items-center gap-2 px-2 py-2 bg-zinc-50/80 border-b border-zinc-200 hover:bg-zinc-100 cursor-pointer sticky top-0 z-10"
                                        onClick={() => toggleGroup(taskGroup.id)}
                                    >
                                        <Box className={cn("transition-transform duration-200 p-0.5 rounded hover:bg-zinc-200", isExpanded ? "rotate-90" : "")}>
                                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color={taskGroup.sprint?.status === 'active' ? 'primary.main' : 'text.primary'}>
                                            {taskGroup.name}
                                        </Typography>
                                        {taskGroup.sprint?.status === 'active' && (
                                            <Chip label="Active" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#dcfce7', color: '#166534' }} />
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            ({stats.count} tasks • {stats.done}/{stats.total} SP)
                                        </Typography>

                                        {/* Progress Bar */}
                                        {stats.total > 0 && (
                                            <Box sx={{ width: 60, height: 4, bgcolor: 'action.hover', borderRadius: 2, overflow: 'hidden', ml: 1 }}>
                                                <Box sx={{
                                                    width: `${(stats.done / stats.total) * 100}%`,
                                                    height: '100%',
                                                    bgcolor: 'success.main',
                                                    transition: 'width 0.3s'
                                                }} />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Tasks Rows */}
                                    {isExpanded && (
                                        <Box>
                                            {taskGroup.tasks.map((task, index) => (
                                                <TaskRow
                                                    key={task.id}
                                                    task={task}
                                                    index={index}
                                                    columns={columns}
                                                    workspace={workspace}
                                                    workspaceId={workspaceId}
                                                    isSelected={selectedTasks.has(task.id)}
                                                    onSelect={handleSelectTask}
                                                    onUpdateCell={handleUpdateCell}
                                                    onContextMenu={(e, t) => setContextMenu({ task: t, anchor: e.currentTarget })}
                                                    getSprintName={getSprintName}
                                                />
                                            ))}

                                            {/* New Task Row */}
                                            <Box className="flex items-stretch h-[38px] border-b border-zinc-200 bg-white">
                                                <Box className="w-10 border-r border-zinc-200 flex-shrink-0" />
                                                <Box className="w-8 border-r border-zinc-200 flex-shrink-0" />
                                                <Box className="px-3 flex items-center gap-2" style={{ width: columns[0]?.width || 320 }}>
                                                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                                                    <input
                                                        className="bg-transparent focus:outline-none text-sm w-full placeholder:text-zinc-400 text-zinc-700 h-full"
                                                        placeholder="Type to add a task..."
                                                        value={newTaskTitle}
                                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleAddTask(taskGroup.id);
                                                        }}
                                                    />
                                                </Box>
                                                {/* Empty cells to fill row */}
                                                {columns.slice(1).map(col => (
                                                    <Box key={col.id} className="border-r border-zinc-200 bg-zinc-50/20" style={{ width: col.width }} />
                                                ))}
                                                <Box className="w-12" />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>

            {/* Context Menu */}
            <Menu
                anchorEl={contextMenu?.anchor}
                open={Boolean(contextMenu)}
                onClose={() => setContextMenu(null)}
            >
                <MenuItem onClick={() => {
                    if (contextMenu) deleteTask(workspaceId, contextMenu.task.id);
                    setContextMenu(null);
                }}>
                    <ListItemIcon><Trash2 size={16} /></ListItemIcon>
                    <ListItemText>Delete Task</ListItemText>
                </MenuItem>
            </Menu>

            {/* Bulk Assign Dialog */}
            <Dialog open={bulkAssignDialog} onClose={() => setBulkAssignDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Move Tasks to Sprint</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Select Sprint</InputLabel>
                        <Select
                            native
                            value={bulkSprintId}
                            onChange={(e) => setBulkSprintId(e.target.value)}
                            label="Select Sprint"
                        >
                            <option value="">Select...</option>
                            {workspace.sprints.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                            <option value="backlog">Backlog</option>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkAssignDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkAssignSprint} variant="contained" disabled={!bulkSprintId}>
                        Move {selectedTasks.size} Tasks
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

// Task Row Component
function TaskRow({
    task,
    index,
    columns,
    workspace,
    workspaceId,
    isSelected,
    onSelect,
    onUpdateCell,
    onContextMenu,
    getSprintName
}: {
    task: Task;
    index: number;
    columns: Column[];
    workspace: any;
    workspaceId: string;
    isSelected: boolean;
    onSelect: (taskId: string, checked: boolean) => void;
    onUpdateCell: (taskId: string, field: string, value: any) => void;
    onContextMenu: (e: React.MouseEvent<HTMLButtonElement>, task: Task) => void;
    getSprintName: (sprintId: string | undefined) => string;
}) {
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<HTMLElement | null>(null);
    const [priorityMenuAnchor, setPriorityMenuAnchor] = useState<HTMLElement | null>(null);
    const [ownerMenuAnchor, setOwnerMenuAnchor] = useState<HTMLElement | null>(null);
    const [sprintMenuAnchor, setSprintMenuAnchor] = useState<HTMLElement | null>(null);

    return (
        <Box
            className={cn(
                "flex items-stretch border-b border-zinc-200 hover:bg-blue-50/50 group h-[38px] transition-colors",
                isSelected && "bg-blue-50"
            )}
        >
            {/* Checkbox */}
            <Box className="w-10 border-r border-zinc-200 flex items-center justify-center bg-zinc-50/30 flex-shrink-0">
                <Checkbox
                    size="small"
                    sx={{ p: 0 }}
                    checked={isSelected}
                    onChange={(e) => onSelect(task.id, e.target.checked)}
                />
            </Box>

            {/* Row Number */}
            <Box className="w-8 border-r border-zinc-200 flex items-center justify-center bg-zinc-50/30 text-zinc-400 text-xs flex-shrink-0">
                {index + 1}
            </Box>

            {/* Dynamic Cells */}
            {columns.map(col => {
                const val = ['title', 'status', 'owner', 'priority', 'epicId', 'estimatedPoints', 'sprintId', 'dueDate'].includes(col.field)
                    ? (task as any)[col.field]
                    : (task.customValues?.[col.field]);

                return (
                    <Box
                        key={col.id}
                        className="border-r border-zinc-200 px-3 flex items-center text-zinc-700 truncate relative"
                        style={{ width: col.width }}
                    >
                        {col.field === 'title' ? (
                            <input
                                className="w-full bg-transparent focus:outline-none font-medium text-zinc-700 text-sm"
                                value={val as string}
                                onChange={(e) => onUpdateCell(task.id, col.field, e.target.value)}
                            />
                        ) : col.field === 'status' ? (
                            <>
                                <Chip
                                    label={val}
                                    size="small"
                                    onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
                                    sx={{
                                        height: 24,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        bgcolor: STATUS_CONFIG[val as TaskStatus]?.bgColor || '#f1f5f9',
                                        color: STATUS_CONFIG[val as TaskStatus]?.color || '#64748b',
                                    }}
                                />
                                <Menu
                                    anchorEl={statusMenuAnchor}
                                    open={Boolean(statusMenuAnchor)}
                                    onClose={() => setStatusMenuAnchor(null)}
                                >
                                    {STATUSES.map(status => (
                                        <MenuItem
                                            key={status}
                                            onClick={() => {
                                                onUpdateCell(task.id, 'status', status);
                                                setStatusMenuAnchor(null);
                                            }}
                                            selected={val === status}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: STATUS_CONFIG[status].color
                                            }}>
                                                {STATUS_CONFIG[status].icon}
                                                <span>{status}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        ) : col.field === 'priority' ? (
                            <>
                                <Chip
                                    label={val || 'None'}
                                    size="small"
                                    icon={val ? <Flag size={12} /> : undefined}
                                    onClick={(e) => setPriorityMenuAnchor(e.currentTarget)}
                                    sx={{
                                        height: 24,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        bgcolor: val ? PRIORITY_CONFIG[val as TaskPriority]?.bgColor : '#f1f5f9',
                                        color: val ? PRIORITY_CONFIG[val as TaskPriority]?.color : '#94a3b8',
                                        '& .MuiChip-icon': { color: 'inherit' }
                                    }}
                                />
                                <Menu
                                    anchorEl={priorityMenuAnchor}
                                    open={Boolean(priorityMenuAnchor)}
                                    onClose={() => setPriorityMenuAnchor(null)}
                                >
                                    {PRIORITIES.map(priority => (
                                        <MenuItem
                                            key={priority}
                                            onClick={() => {
                                                onUpdateCell(task.id, 'priority', priority);
                                                setPriorityMenuAnchor(null);
                                            }}
                                            selected={val === priority}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Flag size={14} color={PRIORITY_CONFIG[priority].color} fill={PRIORITY_CONFIG[priority].color} />
                                                <span>{priority}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        ) : col.field === 'owner' ? (
                            <>
                                <Box
                                    onClick={(e) => setOwnerMenuAnchor(e.currentTarget)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        cursor: 'pointer',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    {val ? (
                                        <>
                                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                                                {(val as string).charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2" fontSize="0.8rem">{val}</Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">Assign</Typography>
                                    )}
                                </Box>
                                <Menu
                                    anchorEl={ownerMenuAnchor}
                                    open={Boolean(ownerMenuAnchor)}
                                    onClose={() => setOwnerMenuAnchor(null)}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            onUpdateCell(task.id, 'owner', undefined);
                                            setOwnerMenuAnchor(null);
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                                    </MenuItem>
                                    <Divider />
                                    {workspace.teamMembers.map((member: any) => (
                                        <MenuItem
                                            key={member.id}
                                            onClick={() => {
                                                onUpdateCell(task.id, 'owner', member.name);
                                                setOwnerMenuAnchor(null);
                                            }}
                                            selected={val === member.name}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                                                    {member.name.charAt(0)}
                                                </Avatar>
                                                <span>{member.name}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        ) : col.field === 'epicId' ? (
                            <Select
                                native
                                value={val || ''}
                                onChange={(e) => onUpdateCell(task.id, 'epicId', e.target.value || undefined)}
                                className="w-full bg-transparent focus:outline-none text-sm"
                                variant="standard"
                                disableUnderline
                                sx={{
                                    '& .MuiSelect-select': { py: 0, pr: '0 !important' },
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="">No Epic</option>
                                {workspace.epics?.map((epic: any) => (
                                    <option key={epic.id} value={epic.id}>
                                        {epic.name}
                                    </option>
                                ))}
                            </Select>
                        ) : col.field === 'sprintId' ? (
                            <>
                                <Chip
                                    label={getSprintName(val)}
                                    size="small"
                                    onClick={(e) => setSprintMenuAnchor(e.currentTarget)}
                                    sx={{
                                        height: 24,
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        bgcolor: val === 'backlog' || !val ? '#f1f5f9' : '#dbeafe',
                                        color: val === 'backlog' || !val ? '#64748b' : '#1e40af',
                                    }}
                                />
                                <Menu
                                    anchorEl={sprintMenuAnchor}
                                    open={Boolean(sprintMenuAnchor)}
                                    onClose={() => setSprintMenuAnchor(null)}
                                >
                                    {workspace.sprints.map((sprint: any) => (
                                        <MenuItem
                                            key={sprint.id}
                                            onClick={() => {
                                                onUpdateCell(task.id, 'sprintId', sprint.id);
                                                setSprintMenuAnchor(null);
                                            }}
                                            selected={val === sprint.id}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {sprint.status === 'active' && <Circle size={8} fill="#10b981" color="#10b981" />}
                                                <span>{sprint.name}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                    <Divider />
                                    <MenuItem
                                        onClick={() => {
                                            onUpdateCell(task.id, 'sprintId', 'backlog');
                                            setSprintMenuAnchor(null);
                                        }}
                                        selected={val === 'backlog' || !val}
                                    >
                                        Backlog
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : col.field === 'dueDate' ? (
                            <input
                                type="date"
                                className="w-full bg-transparent focus:outline-none text-sm"
                                value={val ? val.split('T')[0] : ''}
                                onChange={(e) => onUpdateCell(task.id, col.field, e.target.value)}
                            />
                        ) : col.field === 'estimatedPoints' ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-full bg-transparent focus:outline-none text-sm text-center"
                                value={val || ''}
                                placeholder="-"
                                onChange={(e) => onUpdateCell(task.id, col.field, parseInt(e.target.value) || 0)}
                            />
                        ) : (
                            <input
                                className="w-full bg-transparent focus:outline-none text-sm"
                                value={val || ''}
                                placeholder="-"
                                onChange={(e) => onUpdateCell(task.id, col.field, e.target.value)}
                            />
                        )}
                    </Box>
                );
            })}

            <Box className="w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                <IconButton size="small" onClick={(e) => onContextMenu(e, task)}>
                    <MoreHorizontal size={14} />
                </IconButton>
            </Box>
        </Box>
    );
}

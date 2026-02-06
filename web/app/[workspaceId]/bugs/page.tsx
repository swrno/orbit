"use client";

import { use } from "react";
import { useAppStore, Task, TaskPriority, TaskStatus } from "@/lib/store";
import { formatDate } from "@/lib/date-utils";
import {
    Box, Paper, Typography, Button, Chip, TextField,
    Select, MenuItem, FormControl, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, Checkbox, InputLabel
} from "@mui/material";
import {
    Plus, Search, ChevronDown, Bug, Clock, MessageSquare, Link as LinkIcon
} from "lucide-react";
import { useState, useMemo } from "react";

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
    'Critical': { bg: '#FFEBE6', text: '#BF2600' },
    'High': { bg: '#FFEBE6', text: '#DE350B' },
    'Medium': { bg: '#FFF0B3', text: '#FF8B00' },
    'Low': { bg: '#E3FCEF', text: '#006644' },
};

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
    'Todo': { bg: '#DFE1E6', text: '#42526E' },
    'In Progress': { bg: '#DEEBFF', text: '#0052CC' },
    'In Review': { bg: '#EAE6FF', text: '#5243AA' },
    'Done': { bg: '#E3FCEF', text: '#006644' },
    'Blocked': { bg: '#FFEBE6', text: '#BF2600' },
};

export default function BugsQueuePage({ params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = use(params);
    const { workspaces, addTask } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | TaskPriority>('all');
    const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'reporter'>('status');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedBugs, setSelectedBugs] = useState<Set<string>>(new Set());

    // New bug form
    const [newBugTitle, setNewBugTitle] = useState('');
    const [newBugDesc, setNewBugDesc] = useState('');
    const [newBugPriority, setNewBugPriority] = useState<TaskPriority>('Medium');
    const [newBugReporter, setNewBugReporter] = useState('');
    const [newBugAssignee, setNewBugAssignee] = useState('');

    if (!workspace) return null;

    // Filter bugs (tasks with Bug label or critical priority)
    const bugs = useMemo(() => {
        return workspace.tasks.filter(t =>
            t.labels?.includes('l-1') || // Bug label
            t.priority === 'Critical' ||
            t.status === 'Blocked'
        );
    }, [workspace.tasks]);

    // Apply filters and search
    const filteredBugs = useMemo(() => {
        return bugs.filter(bug => {
            const matchesSearch = !searchQuery ||
                bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bug.key.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'all' || bug.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || bug.priority === filterPriority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [bugs, searchQuery, filterStatus, filterPriority]);

    // Group bugs
    const groupedBugs = useMemo(() => {
        const groups: Record<string, Task[]> = {};

        filteredBugs.forEach(bug => {
            let key = '';
            if (groupBy === 'status') key = bug.status;
            else if (groupBy === 'priority') key = bug.priority || 'Medium';
            else if (groupBy === 'reporter') key = bug.reporter || 'Unassigned';

            if (!groups[key]) groups[key] = [];
            groups[key].push(bug);
        });

        return groups;
    }, [filteredBugs, groupBy]);

    const handleCreateBug = () => {
        if (!newBugTitle.trim()) return;

        addTask(workspaceId, {
            title: newBugTitle,
            description: newBugDesc || undefined,
            priority: newBugPriority,
            status: 'Todo',
            labels: ['l-1'], // Bug label
            reporter: newBugReporter || 'System',
            owner: newBugAssignee || undefined,
        });

        setCreateDialogOpen(false);
        setNewBugTitle('');
        setNewBugDesc('');
        setNewBugPriority('Medium');
        setNewBugReporter('');
        setNewBugAssignee('');
    };

    const getDaysUntilResolution = (dueDate?: string) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <Box sx={{ bgcolor: '#f4f5f7', minHeight: '100vh', p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Bug size={28} color="#BF2600" />
                        <Typography variant="h4" fontWeight={600} sx={{ color: '#172B4D' }}>
                            Bugs Queue
                        </Typography>
                        <Chip
                            label={`${filteredBugs.length} issues`}
                            size="small"
                            sx={{ bgcolor: '#DFE1E6', color: '#42526E', fontWeight: 500 }}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            bgcolor: '#0052CC',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#0747A6' }
                        }}
                    >
                        Create bug
                    </Button>
                </Box>

                {/* Toolbar */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search bugs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <Search size={16} style={{ marginRight: 8, color: '#6B778C' }} />,
                        }}
                        sx={{
                            minWidth: 300,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                '& fieldset': { borderColor: '#DFE1E6' },
                                '&:hover fieldset': { borderColor: '#B3BAC5' },
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            sx={{
                                bgcolor: 'white',
                                '& fieldset': { borderColor: '#DFE1E6' },
                                '&:hover fieldset': { borderColor: '#B3BAC5' },
                            }}
                            displayEmpty
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="Todo">To Do</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="In Review">In Review</MenuItem>
                            <MenuItem value="Done">Done</MenuItem>
                            <MenuItem value="Blocked">Blocked</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
                            sx={{
                                bgcolor: 'white',
                                '& fieldset': { borderColor: '#DFE1E6' },
                                '&:hover fieldset': { borderColor: '#B3BAC5' },
                            }}
                            displayEmpty
                        >
                            <MenuItem value="all">All Priority</MenuItem>
                            <MenuItem value="Critical">Critical</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                            sx={{
                                bgcolor: 'white',
                                '& fieldset': { borderColor: '#DFE1E6' },
                                '&:hover fieldset': { borderColor: '#B3BAC5' },
                            }}
                        >
                            <MenuItem value="status">Group by Status</MenuItem>
                            <MenuItem value="priority">Group by Priority</MenuItem>
                            <MenuItem value="reporter">Group by Reporter</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Bug Table */}
            <Box>
                {Object.entries(groupedBugs).map(([groupKey, groupBugs]) => (
                    <Box key={groupKey} sx={{ mb: 3 }}>
                        {/* Group Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <ChevronDown size={16} color="#42526E" />
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#172B4D' }}>
                                {groupKey}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                ({groupBugs.length})
                            </Typography>
                        </Box>

                        {/* Bugs Table */}
                        <TableContainer
                            component={Paper}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: '3px',
                                border: '1px solid #DFE1E6',
                                boxShadow: 'none'
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#FAFBFC' }}>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6', width: 50 }}>
                                            <Checkbox size="small" sx={{ color: '#6B778C' }} />
                                        </TableCell>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6' }}>Bug</TableCell>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6' }}>Reporter</TableCell>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6' }}>Due Date</TableCell>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6' }}>Status</TableCell>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6' }}>Priority</TableCell>
                                        <TableCell sx={{ color: '#6B778C', fontWeight: 600, borderColor: '#DFE1E6' }}>Key</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupBugs.map((bug) => {
                                        const daysLeft = getDaysUntilResolution(bug.dueDate);

                                        return (
                                            <TableRow
                                                key={bug.id}
                                                sx={{
                                                    '&:hover': { bgcolor: '#F4F5F7' },
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    <Checkbox
                                                        size="small"
                                                        checked={selectedBugs.has(bug.id)}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedBugs);
                                                            if (e.target.checked) newSet.add(bug.id);
                                                            else newSet.delete(bug.id);
                                                            setSelectedBugs(newSet);
                                                        }}
                                                        sx={{ color: '#6B778C' }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LinkIcon size={14} color="#6B778C" />
                                                        <MessageSquare size={14} color="#6B778C" />
                                                        <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 500 }}>
                                                            {bug.title}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#0052CC', fontSize: '0.75rem' }}>
                                                            {(bug.reporter || 'U').charAt(0)}
                                                        </Avatar>
                                                    </Box>
                                                </TableCell>

                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    {daysLeft !== null ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Clock size={14} color={daysLeft < 0 ? '#BF2600' : '#6B778C'} />
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: daysLeft < 0 ? '#BF2600' : '#42526E',
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : formatDate(bug.dueDate!)}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: '#6B778C' }}>-</Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    <Chip
                                                        label={bug.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: STATUS_COLORS[bug.status].bg,
                                                            color: STATUS_COLORS[bug.status].text,
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    <Chip
                                                        label={bug.priority || 'Medium'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: PRIORITY_COLORS[bug.priority || 'Medium'].bg,
                                                            color: PRIORITY_COLORS[bug.priority || 'Medium'].text,
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ borderColor: '#DFE1E6' }}>
                                                    <Typography variant="body2" sx={{ color: '#42526E', fontFamily: 'monospace' }}>
                                                        {bug.key}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))}

                {filteredBugs.length === 0 && (
                    <Paper sx={{ textAlign: 'center', py: 10, bgcolor: 'white', border: '1px solid #DFE1E6', borderRadius: '3px' }}>
                        <Bug size={48} style={{ opacity: 0.3, marginBottom: 16, color: '#6B778C' }} />
                        <Typography variant="h6" gutterBottom sx={{ color: '#172B4D' }}>
                            No Bugs Found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#42526E', mb: 3 }}>
                            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first bug report'
                            }
                        </Typography>
                        {!searchQuery && filterStatus === 'all' && filterPriority === 'all' && (
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={() => setCreateDialogOpen(true)}
                                sx={{ bgcolor: '#0052CC', textTransform: 'none', '&:hover': { bgcolor: '#0747A6' }, boxShadow: 'none' }}
                            >
                                Create Bug
                            </Button>
                        )}
                    </Paper>
                )}
            </Box>

            {/* Create Bug Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#172B4D', fontWeight: 600 }}>Create Bug</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Bug Title"
                            fullWidth
                            value={newBugTitle}
                            onChange={(e) => setNewBugTitle(e.target.value)}
                            placeholder="e.g., Login button not responding"
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={newBugDesc}
                            onChange={(e) => setNewBugDesc(e.target.value)}
                            placeholder="Steps to reproduce, expected behavior, actual behavior..."
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={newBugPriority}
                                onChange={(e) => setNewBugPriority(e.target.value as TaskPriority)}
                                label="Priority"
                            >
                                <MenuItem value="Low">Low</MenuItem>
                                <MenuItem value="Medium">Medium</MenuItem>
                                <MenuItem value="High">High</MenuItem>
                                <MenuItem value="Critical">Critical</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Reporter"
                                fullWidth
                                value={newBugReporter}
                                onChange={(e) => setNewBugReporter(e.target.value)}
                                placeholder="Your name"
                            />
                            <FormControl fullWidth>
                                <InputLabel>Assignee</InputLabel>
                                <Select
                                    value={newBugAssignee}
                                    onChange={(e) => setNewBugAssignee(e.target.value)}
                                    label="Assignee"
                                >
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {workspace?.teamMembers.map((member) => (
                                        <MenuItem key={member.id} value={member.name}>{member.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none', color: '#42526E' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateBug}
                        variant="contained"
                        disabled={!newBugTitle.trim()}
                        sx={{
                            bgcolor: '#0052CC',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0747A6' },
                            boxShadow: 'none'
                        }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

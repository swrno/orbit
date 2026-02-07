"use client";

import { useState } from "react";
import {
    Box, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem as SelectItem, Typography
} from "@mui/material";
import {
    Plus, CheckSquare, Filter, Search, Settings, MoreVertical
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAppStore, TaskStatus } from "@/lib/store";

export default function WorkspaceHeader() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const { workspaces, addTask } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [createTaskOpen, setCreateTaskOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assignee, setAssignee] = useState('');

    const handleCreateTask = () => {
        if (taskTitle.trim()) {
            addTask(workspaceId, {
                title: taskTitle.trim(),
                description: taskDescription || undefined,
                status: 'Todo',
                priority: 'Medium',
                owner: assignee || undefined
            });
            setTaskTitle('');
            setTaskDescription('');
            setAssignee('');
            setCreateTaskOpen(false);
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 1.5,
                    bgcolor: 'white',
                    borderBottom: '1px solid #DFE1E6'
                }}
            >
                {/* Left side - empty or breadcrumbs */}
                <Box />

                {/* Right side - Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Search */}
                    <IconButton
                        size="small"
                        sx={{
                            color: '#42526E',
                            '&:hover': {
                                bgcolor: '#F4F5F7'
                            }
                        }}
                    >
                        <Search size={18} />
                    </IconButton>

                    {/* Filter */}
                    <IconButton
                        size="small"
                        sx={{
                            color: '#42526E',
                            '&:hover': {
                                bgcolor: '#F4F5F7'
                            }
                        }}
                    >
                        <Filter size={18} />
                    </IconButton>

                    {/* Settings */}
                    <IconButton
                        size="small"
                        sx={{
                            color: '#42526E',
                            '&:hover': {
                                bgcolor: '#F4F5F7'
                            }
                        }}
                    >
                        <Settings size={18} />
                    </IconButton>

                    {/* More */}
                    <IconButton
                        size="small"
                        sx={{
                            color: '#42526E',
                            '&:hover': {
                                bgcolor: '#F4F5F7'
                            }
                        }}
                    >
                        <MoreVertical size={18} />
                    </IconButton>

                    {/* Create Button (JIRA-style) */}
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setCreateTaskOpen(true)}
                        sx={{
                            bgcolor: '#0052CC',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 2,
                            '&:hover': {
                                bgcolor: '#0747A6'
                            }
                        }}
                    >
                        Create
                    </Button>
                </Box>
            </Box>

            {/* Create Task Dialog */}
            <Dialog
                open={createTaskOpen}
                onClose={() => setCreateTaskOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#172B4D' }}>
                    Create Issue
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Summary *"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            sx={{ mb: 2 }}
                            autoFocus
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Assignee</InputLabel>
                            <Select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                label="Assignee"
                            >
                                <MenuItem value="">Unassigned</MenuItem>
                                {workspace?.teamMembers?.map((member) => (
                                    <MenuItem key={member.id} value={member.name}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    bgcolor: '#0052CC',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                {member.name.charAt(0)}
                                            </Box>
                                            {member.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Add more details..."
                            multiline
                            rows={4}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button
                        onClick={() => setCreateTaskOpen(false)}
                        sx={{ color: '#42526E', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateTask}
                        variant="contained"
                        disabled={!taskTitle.trim()}
                        sx={{
                            bgcolor: '#0052CC',
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#0747A6' }
                        }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

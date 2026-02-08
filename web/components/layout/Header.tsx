"use client"

import { Filter, MoreHorizontal, Plus, Bell, Search, Sparkles } from "lucide-react";
import { PageTabs } from "./PageTabs";
import {
  AppBar, Toolbar, Box, IconButton, Avatar, AvatarGroup, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  FormControl, InputLabel, Badge, Tooltip, InputAdornment
} from "@mui/material";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore, TaskPriority, TaskStatus } from "@/lib/store";
import { usePermissions } from "@/hooks/usePermissions";
import { Chip } from "@mui/material";

export function Header() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { workspaces, addTask } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);
  const { role, canEdit } = usePermissions(workspaceId);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('Todo');
  const [taskOwner, setTaskOwner] = useState('');
  const [taskSprintId, setTaskSprintId] = useState('');
  const [taskPoints, setTaskPoints] = useState(0);

  const handleCreateTask = () => {
    if (taskTitle.trim() && workspaceId) {
      addTask(workspaceId, {
        title: taskTitle,
        description: taskDescription || undefined,
        status: taskStatus,
        priority: taskPriority,
        owner: taskOwner || undefined,
        sprintId: taskSprintId || 'backlog',
        estimatedPoints: taskPoints,
      });
      resetForm();
      setCreateTaskOpen(false);
    }
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('Medium');
    setTaskStatus('Todo');
    setTaskOwner('');
    setTaskSprintId('');
    setTaskPoints(0);
  };

  // Get active sprint
  const activeSprint = workspace?.sprints?.find(s => s.status === 'active');

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ minHeight: '64px!important', px: 2, gap: 2 }}>
          {/* Left Side: Tabs */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <PageTabs />
          </Box>

          {/* Right Side: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Search Button */}
            <Tooltip title="Search (⌘K)">
              <IconButton size="small" onClick={() => setSearchOpen(true)}>
                <Search size={18} />
              </IconButton>
            </Tooltip>

            {/* AI Assistant */}
            <Tooltip title="AI Assistant">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <Sparkles size={18} />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton size="small">
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                  <Bell size={18} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem variant="middle" sx={{ height: 24, mx: 0.5 }} />

            {/* Team Avatars */}
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 11, border: '2px solid #fff' } }}>
              {workspace?.teamMembers && workspace.teamMembers.length > 0 ? (
                workspace.teamMembers.slice(0, 4).map((member) => (
                  <Tooltip key={member.id} title={member.name}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                      {member.name.charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))
              ) : (
                [
                  <Avatar key="u1" sx={{ bgcolor: 'action.selected', color: 'text.secondary' }}>U1</Avatar>,
                  <Avatar key="u2" sx={{ bgcolor: 'action.selected', color: 'text.secondary' }}>U2</Avatar>
                ]
              )}
            </AvatarGroup>

            <Tooltip title={`Current Role: ${role}`}>
              <Chip
                label={role}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderColor: role === 'OWNER' ? 'primary.main' : 'divider',
                  color: role === 'OWNER' ? 'primary.main' : 'text.secondary',
                  ml: 1
                }}
              />
            </Tooltip>

            <Divider orientation="vertical" flexItem variant="middle" sx={{ height: 24, mx: 0.5 }} />

            <IconButton size="small">
              <Filter size={16} />
            </IconButton>
            <IconButton size="small">
              <MoreHorizontal size={16} />
            </IconButton>

            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => setCreateTaskOpen(true)}
              disabled={!canEdit}
              sx={{ textTransform: 'none', boxShadow: 2, ml: 1 }}
            >
              New Task
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Plus size={20} />
          Create New Task
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Task Title"
              fullWidth
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Add more details..."
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  native
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                  label="Status"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  native
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  label="Priority"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sprint</InputLabel>
                <Select
                  native
                  value={taskSprintId}
                  onChange={(e) => setTaskSprintId(e.target.value)}
                  label="Sprint"
                >
                  <option value="">Backlog</option>
                  {workspace?.sprints?.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} {sprint.status === 'active' ? '(Active)' : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  native
                  value={taskOwner}
                  onChange={(e) => setTaskOwner(e.target.value)}
                  label="Assignee"
                >
                  <option value="">Unassigned</option>
                  {workspace?.teamMembers?.map((member) => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Story Points"
              type="number"
              size="small"
              value={taskPoints}
              onChange={(e) => setTaskPoints(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: 150 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateTaskOpen(false); resetForm(); }} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={!taskTitle.trim()}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { position: 'fixed', top: 100 }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search tasks, pages, sprints..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
              sx: {
                fontSize: '1.1rem',
                '& fieldset': { border: 'none' }
              }
            }}
            sx={{ p: 1 }}
          />
          <Divider />
          <Box sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
            <Sparkles size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <Box>Start typing to search across your workspace</Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

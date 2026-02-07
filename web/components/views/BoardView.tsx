"use client";

import { useAppStore, Task, TaskStatus, TaskPriority } from "@/lib/store";
import { formatDate } from "@/lib/date-utils";
import {
  Plus, MoreHorizontal, User, ChevronDown
} from "lucide-react";
import { useState } from "react";
import {
  Paper, Box, Typography, IconButton, Menu, MenuItem,
  Chip, Avatar, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Select, FormControl,
  InputLabel, Divider, ListItemIcon, ListItemText
} from "@mui/material";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";

interface BoardViewProps {
  workspaceId: string;
  sprintId?: string;
}

// Monday.com inspired status colors
const MONDAY_COLUMN_COLORS: Record<string, string> = {
  'Backlog': '#c4c4c4',
  'Product discovery': '#fdab3d',
  'Ready to design': '#e2445c',
  'Design WIP': '#ff158a',
  'Dev discovery': '#579bfc',
};

const STATUS_MAPPING: Record<TaskStatus, string> = {
  'Todo': 'Backlog',
  'In Progress': 'Product discovery',
  'In Review': 'Ready to design',
  'Done': 'Design WIP',
  'Blocked': 'Dev discovery',
};

const STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'];

export function BoardView({ workspaceId, sprintId }: BoardViewProps) {
  const { workspaces, addTask, deleteTask, moveTask } = useAppStore();
  const workspace = workspaces.find((w) => w.id === workspaceId);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState<{ el: HTMLElement; task: Task } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createInStatus, setCreateInStatus] = useState<TaskStatus>('Todo');
  const [taskDetailOpen, setTaskDetailOpen] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskOwner, setNewTaskOwner] = useState('');

  if (!workspace) return null;

  // Get active sprint or use provided sprintId
  const activeSprint = workspace.sprints.find(s => s.status === 'active');
  const targetSprintId = sprintId || activeSprint?.id || 'sprint-1';

  // Filter tasks for the current sprint
  const sprintTasks = workspace.tasks.filter(t => t.sprintId === targetSprintId);

  // Group tasks by status
  const tasksByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = sprintTasks
      .filter(t => t.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      moveTask(workspaceId, draggedTask.id, status);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Task menu handlers
  const handleTaskMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, task: Task) => {
    e.stopPropagation();
    setTaskMenuAnchor({ el: e.currentTarget, task });
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchor(null);
  };

  const handleDeleteTask = () => {
    if (taskMenuAnchor) {
      deleteTask(workspaceId, taskMenuAnchor.task.id);
      handleTaskMenuClose();
    }
  };

  // Create task handlers
  const handleOpenCreateDialog = (status: TaskStatus) => {
    setCreateInStatus(status);
    setCreateDialogOpen(true);
  };

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      addTask(workspaceId, {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        status: createInStatus,
        priority: newTaskPriority,
        owner: newTaskOwner || undefined,
        sprintId: targetSprintId,
        estimatedPoints: 0,
        order: tasksByStatus[createInStatus].length,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('Medium');
      setNewTaskOwner('');
      setCreateDialogOpen(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f6f7fb', p: 3 }}>
      {/* Kanban Board */}
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', height: '100%' }}>
        {STATUSES.map((status) => {
          const columnName = STATUS_MAPPING[status];
          const columnColor = MONDAY_COLUMN_COLORS[columnName];
          
          return (
            <Box
              key={status}
              sx={{
                width: 280,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: dragOverColumn === status ? '#e6e9ef' : 'transparent',
                borderRadius: 1,
                transition: 'background-color 0.2s',
              }}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header - Monday.com style */}
              <Box
                sx={{
                  bgcolor: columnColor,
                  color: 'white',
                  px: 2,
                  py: 1.5,
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {columnName}
                  <Box
                    component="span"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      px: 1,
                      py: 0.25,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {tasksByStatus[status].length}
                  </Box>
                </Box>
                <IconButton size="small" sx={{ color: 'white', p: 0.5 }}>
                  <Plus size={16} />
                </IconButton>
              </Box>

              {/* Task Cards */}
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1.5, 
                p: 1.5,
                bgcolor: '#f5f5f5',
                borderRadius: '0 0 8px 8px',
                minHeight: 200,
              }}>
                {tasksByStatus[status].map((task) => (
                  <Paper
                    key={task.id}
                    elevation={0}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setTaskDetailOpen(task)}
                    sx={{
                      p: 2,
                      border: '1px solid #e6e9ef',
                      borderRadius: '4px',
                      cursor: 'grab',
                      bgcolor: 'white',
                      opacity: draggedTask?.id === task.id ? 0.5 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        cursor: 'grabbing'
                      }
                    }}
                  >
                    {/* Task ID */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#676879',
                        fontSize: '11px',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {task.key || `TASK-${task.id.slice(-3)}`}
                    </Typography>

                    {/* Task Title */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: '#323338',
                        mb: 1.5,
                        lineHeight: 1.4,
                      }}
                    >
                      {task.title}
                    </Typography>

                    {/* Status Badges */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                      {task.priority && (
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '11px',
                            fontWeight: 600,
                            bgcolor: task.priority === 'Critical' ? '#e2445c' : 
                                     task.priority === 'High' ? '#fdab3d' : '#c4c4c4',
                            color: 'white',
                            borderRadius: '3px',
                          }}
                        />
                      )}
                      {task.labels && task.labels.length > 0 && (
                        <Chip
                          label="Product discovery"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '11px',
                            fontWeight: 600,
                            bgcolor: '#fdab3d',
                            color: 'white',
                            borderRadius: '3px',
                          }}
                        />
                      )}
                    </Box>

                    {/* Footer with Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {task.owner && (
                          <Tooltip title={task.owner}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '11px',
                                bgcolor: '#0073ea',
                                fontWeight: 600,
                              }}
                            >
                              {task.owner.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleTaskMenuOpen(e, task)}
                        sx={{ p: 0.5 }}
                      >
                        <MoreHorizontal size={14} color="#676879" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}

                {/* Add Card Button */}
                <Box
                  onClick={() => handleOpenCreateDialog(status)}
                  sx={{
                    p: 2,
                    border: '2px dashed #c7c7d1',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    color: '#676879',
                    bgcolor: 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#0073ea',
                      color: '#0073ea',
                      bgcolor: '#f6f7fb'
                    }
                  }}
                >
                  <Plus size={16} />
                  <Typography variant="body2" fontSize="13px">Add epic</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Task Context Menu */}
      <Menu
        anchorEl={taskMenuAnchor?.el}
        open={Boolean(taskMenuAnchor)}
        onClose={handleTaskMenuClose}
      >
        <MenuItem onClick={() => {
          setTaskDetailOpen(taskMenuAnchor?.task || null);
          handleTaskMenuClose();
        }}>
          <ListItemIcon><User size={16} /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Task Title"
              fullWidth
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Add more details..."
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  native
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  label="Priority"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  native
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  label="Assignee"
                >
                  <option value="">Unassigned</option>
                  {workspace.teamMembers.map((member) => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={!newTaskTitle.trim()}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Detail Modal */}
      {taskDetailOpen && (
        <TaskDetailModal
          open={Boolean(taskDetailOpen)}
          onClose={() => setTaskDetailOpen(null)}
          task={taskDetailOpen}
          workspaceId={workspaceId}
        />
      )}
    </Box>
  );
}

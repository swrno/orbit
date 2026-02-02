"use client";

import { useAppStore, Task, TaskStatus, TaskPriority, Sprint } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import {
  Plus, MoreHorizontal, Clock, AlertCircle, User,
  Calendar, MessageSquare, Tag, GripVertical, ChevronDown,
  Flag, Circle, CheckCircle2
} from "lucide-react";
import { useState, useRef } from "react";
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

const STATUS_CONFIG: Record<TaskStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
  'Todo': { color: '#64748b', bgColor: '#f1f5f9', icon: <Circle size={12} /> },
  'In Progress': { color: '#f59e0b', bgColor: '#fef3c7', icon: <Clock size={12} /> },
  'In Review': { color: '#8b5cf6', bgColor: '#ede9fe', icon: <AlertCircle size={12} /> },
  'Done': { color: '#10b981', bgColor: '#d1fae5', icon: <CheckCircle2 size={12} /> },
  'Blocked': { color: '#ef4444', bgColor: '#fee2e2', icon: <AlertCircle size={12} /> },
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  'Low': '#94a3b8',
  'Medium': '#3b82f6',
  'High': '#f97316',
  'Critical': '#ef4444',
};

const STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'];

const WIP_LIMITS: Partial<Record<TaskStatus, number>> = {
  'In Progress': 8,
  'In Review': 5
};

export function BoardView({ workspaceId, sprintId }: BoardViewProps) {
  const { workspaces, updateTask, addTask, deleteTask, moveTask } = useAppStore();
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

  // Get label by ID
  const getLabelById = (labelId: string) => workspace.labels.find(l => l.id === labelId);

  // Calculate sprint stats
  const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
  const donePoints = sprintTasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);
  const progressPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Sprint Header */}
      <Paper elevation={0} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {activeSprint?.name || 'Sprint Board'}
            </Typography>
            {activeSprint?.status === 'active' && (
              <Chip
                label="Active"
                size="small"
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Sprint Progress */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Box sx={{
                width: 120,
                height: 6,
                bgcolor: 'action.hover',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <Box sx={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  bgcolor: 'primary.main',
                  transition: 'width 0.3s ease'
                }} />
              </Box>
              <Typography variant="caption" fontWeight={600}>
                {progressPercent}%
              </Typography>
            </Box>
            {/* Sprint Stats */}
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {sprintTasks.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Tasks</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {donePoints}/{totalPoints}
                </Typography>
                <Typography variant="caption" color="text.secondary">Points</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {activeSprint?.goal && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            🎯 {activeSprint.goal}
          </Typography>
        )}
      </Paper>

      {/* Kanban Board */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, p: 3, overflow: 'auto' }}>
        {STATUSES.map((status) => (
          <Box
            key={status}
            sx={{
              width: 320,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: dragOverColumn === status ? 'action.selected' : 'transparent',
              borderRadius: 2,
              transition: 'background-color 0.2s',
            }}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: STATUS_CONFIG[status].bgColor,
                  color: STATUS_CONFIG[status].color
                }}>
                  {STATUS_CONFIG[status].icon}
                </Box>

                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  {status}
                </Typography>
                <Chip
                  label={
                    WIP_LIMITS[status]
                      ? `${tasksByStatus[status].length}/${WIP_LIMITS[status]}`
                      : tasksByStatus[status].length
                  }
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: WIP_LIMITS[status] && tasksByStatus[status].length > WIP_LIMITS[status]! ? 'error.main' : 'action.hover',
                    color: WIP_LIMITS[status] && tasksByStatus[status].length > WIP_LIMITS[status]! ? 'white' : 'inherit',
                    fontWeight: 600
                  }}
                />
              </Box>
              <IconButton size="small" onClick={() => handleOpenCreateDialog(status)}>
                <Plus size={16} />
              </IconButton>
            </Box>

            {/* Task Cards */}
            < Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
              {tasksByStatus[status].map((task) => (
                <Paper
                  key={task.id}
                  elevation={draggedTask?.id === task.id ? 4 : 0}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setTaskDetailOpen(task)}
                  sx={{
                    p: 2,
                    mx: 0.5,
                    border: '1px solid',
                    borderColor: draggedTask?.id === task.id ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    cursor: 'grab',
                    opacity: draggedTask?.id === task.id ? 0.5 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      cursor: 'grabbing'
                    }
                  }}
                >
                  {/* Task Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          color: 'primary.main',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      >
                        {task.key || task.id.toUpperCase().replace('T-', 'TASK-')}
                      </Typography>
                      {task.priority && (
                        <Tooltip title={`${task.priority} Priority`}>
                          <Flag
                            size={12}
                            fill={PRIORITY_COLORS[task.priority]}
                            color={PRIORITY_COLORS[task.priority]}
                          />
                        </Tooltip>
                      )}
                      {task.blockedBy && task.blockedBy.length > 0 && (
                        <Tooltip title="Blocked">
                          <AlertCircle size={12} color="#ef4444" />
                        </Tooltip>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleTaskMenuOpen(e, task)}
                      sx={{ ml: 'auto', mt: -0.5, mr: -0.5 }}
                    >
                      <MoreHorizontal size={14} />
                    </IconButton>
                  </Box>

                  {/* Task Title */}
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      mb: 2,
                      lineHeight: 1.4,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {task.title}
                  </Typography>

                  {/* Labels */}
                  {task.labels && task.labels.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                      {task.labels.slice(0, 3).map((labelId) => {
                        const label = getLabelById(labelId);
                        if (!label) return null;
                        return (
                          <Chip
                            key={labelId}
                            label={label.name}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              bgcolor: `${label.color}20`,
                              color: label.color,
                              borderRadius: 1,
                            }}
                          />
                        );
                      })}
                      {task.labels.length > 3 && (
                        <Chip
                          label={`+${task.labels.length - 3}`}
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem' }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Task Footer */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {task.epicId && workspace.epics?.find((e: any) => e.id === task.epicId) && (
                        <Chip
                          label={workspace.epics.find((e: any) => e.id === task.epicId)?.name}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: `${workspace.epics.find((e: any) => e.id === task.epicId)?.color}20`,
                            color: workspace.epics.find((e: any) => e.id === task.epicId)?.color,
                            borderRadius: 1,
                            fontWeight: 600
                          }}
                        />
                      )}
                      {task.estimatedPoints && task.estimatedPoints > 0 && (
                        <Tooltip title="Story Points">
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 0.75,
                            py: 0.25,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                          }}>
                            <Typography variant="caption" fontWeight={600}>
                              {task.estimatedPoints} SP
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <Tooltip title={`${task.subtasks.filter(s => s.status === 'Done').length}/${task.subtasks.length} subtasks done`}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 0.75,
                            py: 0.25,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                          }}>
                            <CheckCircle2 size={10} />
                            <Typography variant="caption" fontWeight={600}>
                              {task.subtasks.filter(s => s.status === 'Done').length}/{task.subtasks.length}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {task.dueDate && (
                        <Tooltip title={`Due: ${formatDate(task.dueDate)}`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <Calendar size={12} />
                          </Box>
                        </Tooltip>
                      )}
                      {task.comments && task.comments.length > 0 && (
                        <Tooltip title={`${task.comments.length} Comments`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <MessageSquare size={12} />
                            <Typography variant="caption">{task.comments.length}</Typography>
                          </Box>
                        </Tooltip>
                      )}
                      {task.owner && (
                        <Tooltip title={task.owner}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: '0.7rem',
                              bgcolor: 'primary.main'
                            }}
                          >
                            {task.owner.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}

              {/* Add Task Button */}
              <Box
                onClick={() => handleOpenCreateDialog(status)}
                sx={{
                  mx: 0.5,
                  p: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Plus size={16} />
                <Typography variant="body2">Add Task</Typography>
              </Box>
            </Box>
          </Box>
        ))
        }
      </Box >

      {/* Task Context Menu */}
      < Menu
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
          <ListItemIcon><AlertCircle size={16} color="red" /></ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu >

      {/* Create Task Dialog */}
      < Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth >
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
            <Chip
              label={`Status: ${createInStatus}`}
              size="small"
              sx={{ alignSelf: 'flex-start', bgcolor: STATUS_CONFIG[createInStatus].bgColor, color: STATUS_CONFIG[createInStatus].color }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={!newTaskTitle.trim()}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog >

      {/* Task Detail Modal */}
      {
        taskDetailOpen && (
          <TaskDetailModal
            open={Boolean(taskDetailOpen)}
            onClose={() => setTaskDetailOpen(null)}
            task={taskDetailOpen}
            workspaceId={workspaceId}
          />
        )
      }
    </Box >
  );
}

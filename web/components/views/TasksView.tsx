"use client";

import { useEffect, useState } from "react";
import { useAppStore, Task, TaskStatus, TaskPriority } from "@/lib/store";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Select,
  MenuItem,
  TextField,
  Button,
  Collapse
} from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  User,
  MoreHorizontal
} from "lucide-react";
import { TaskCreator } from "@/components/creators/TaskCreator";
import { BoardView } from "./BoardView";
import { GanttView } from "./GanttView";
import { CalendarView } from "./CalendarView";
import { ChartView } from "@/components/views/ChartView";
import { usePermissions } from "@/hooks/usePermissions";

interface TasksViewProps {
  workspaceId: string;
  pageId: string;
  viewType?: string;
}

// Monday.com-style colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Ready to start": { bg: "#c4c4c4", text: "#ffffff" },
  "In Progress": { bg: "#fdab3d", text: "#ffffff" },
  "Done": { bg: "#00c875", text: "#ffffff" }
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "Bug": { bg: "#e2445c", text: "#ffffff" },
  "Feature": { bg: "#579bfc", text: "#ffffff" },
  "Other": { bg: "#a25ddc", text: "#ffffff" }
};

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function TasksView({ workspaceId, pageId, viewType = 'table' }: TasksViewProps) {
  const { workspaces, updatePage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);
  // Find the page and group
  let page: any = null;
  let groupId: string | null = null;

  if (workspace) {
    if (workspace && workspace.teams) {
      for (const team of workspace.teams) {
        const p = team.pages.find(pg => pg.id === pageId);
        if (p) {
          page = p;
          groupId = team.id;
          break;
        }
      }
    }
  }

  const { canEdit } = usePermissions(workspaceId, groupId || undefined);

  const [tasks, setTasks] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, any[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<any>(null);

  // Initialize view state from page or defaults
  const views = (page?.views || ['table']).map((v: string) => ({
    id: v,
    label: v === 'table' ? 'Main table' : v.charAt(0).toUpperCase() + v.slice(1),
    type: v
  }));

  const activeView = page?.type || 'table';

  const handleSetActiveView = (viewId: string) => {
    if (workspaceId && groupId && page) {
      updatePage(workspaceId, groupId, page.id, { type: viewId as any });
    }
  };

  const handleRemoveView = (viewId: string) => {
    if (workspaceId && groupId && page) {
      const newViews = page.views?.filter((v: string) => v !== viewId) || [];
      const newActive = activeView === viewId ? (newViews[0] || 'table') : activeView;

      updatePage(workspaceId, groupId, page.id, {
        views: newViews,
        type: newActive as any
      });
    }
  };

  const handleAddView = (viewType: string) => {
    const current = page?.views || [];

    // Only add if not already present, otherwise just switch to it
    if (!current.includes(viewType)) {
      if (workspaceId && groupId && page) {
        updatePage(workspaceId, groupId, page.id, {
          views: [...current, viewType],
          type: viewType as any
        });
      }
    } else {
      handleSetActiveView(viewType);
    }
  };

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, [workspaceId, pageId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, sprintsRes] = await Promise.all([
        fetch(`/api/tasks?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${groupId}`),
        fetch(`/api/sprints?workspaceId=${workspaceId}&teamId=${groupId}`)
      ]);

      const tasksData = await tasksRes.json();
      const sprintsData = await sprintsRes.json();

      let currentSprints = [];
      if (sprintsData.success && Array.isArray(sprintsData.data)) {
        setSprints(sprintsData.data);
        currentSprints = sprintsData.data;
      }

      if (tasksData.success && Array.isArray(tasksData.data)) {
        setTasks(tasksData.data);
        groupTasksBySprint(tasksData.data, currentSprints);
      } else {
        console.error('Invalid tasks data format:', tasksData);
        setTasks([]);
        groupTasksBySprint([], currentSprints);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTask = async (taskData: any) => {
    try {
      if (!groupId) {
        console.error('No team/group selected');
        return;
      }

      if (taskData._id) {
        // Handle update
        await handleUpdateTask(taskData._id, taskData);
        setEditingTask(null);
      } else {
        // Handle create
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...taskData,
            workspaceId,
            pageId,
            teamId: groupId
          })
        });

        if (response.ok) {
          fetchTasks();
        }
      }
    } catch (error) {
      console.error('Error creating/updating task:', error);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingTask(null);
  };

  const groupTasksBySprint = (taskList: any[], sprintList: any[]) => {
    const grouped: Record<string, any[]> = {};
    
    // Initialize with all sprints (to show empty ones)
    sprintList.forEach(s => {
        if (s.sprint) grouped[s.sprint] = [];
    });
    
    // Always ensure Backlog exists
    if (!grouped['Backlog']) grouped['Backlog'] = [];

    taskList.forEach(task => {
      const sprint = task.group || task.sprint || 'Backlog';
      if (!grouped[sprint]) {
        grouped[sprint] = [];
      }
      grouped[sprint].push(task);
    });

    setGroupedTasks(grouped);
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, updates })
      });

      if (response.ok) {
        fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'board':
        return <BoardView workspaceId={workspaceId} teamId={groupId || undefined} />;
      case 'kanban':
        return (
          <Box sx={{ display: 'flex', gap: 2, p: 2, overflow: 'auto', height: '100%' }}>
            {Object.entries(groupedTasks).map(([sprintName, sprintTasks]) => (
              <Box key={sprintName} sx={{ minWidth: 320, maxWidth: 320 }}>
                <Box sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #e6e9ef', p: 2, mb: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>{sprintName}</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#676879' }}>{sprintTasks.length} tasks</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {sprintTasks.map((task, idx) => (
                    <Paper key={task._id || idx} onClick={() => handleEditTask(task)} sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>{task.task}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={task.status} size="small" sx={{ bgcolor: STATUS_COLORS[task.status]?.bg, color: STATUS_COLORS[task.status]?.text, fontSize: '11px' }} />
                        <Chip label={task.type} size="small" sx={{ bgcolor: TYPE_COLORS[task.type]?.bg, color: TYPE_COLORS[task.type]?.text, fontSize: '11px' }} />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        );
      case 'calendar':
        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Task Calendar</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>{day}</Box>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <Box key={i} sx={{ aspectRatio: '1', border: '1px solid #e6e9ef', borderRadius: 1, p: 1, fontSize: '12px' }}>{i + 1}</Box>
              ))}
            </Box>
          </Box>
        );
      case 'gantt':
        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Task Timeline</Typography>
            {tasks.map((task, idx) => (
              <Box key={task._id || idx} sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', mb: 0.5 }}>{task.task}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ height: 24, bgcolor: STATUS_COLORS[task.status]?.bg || '#e6e9ef', borderRadius: 1, width: `${Math.random() * 60 + 20}%`, display: 'flex', alignItems: 'center', px: 1 }}>
                    <Typography sx={{ fontSize: '11px', color: 'white' }}>{task.status}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        );
      case 'chart':
      case 'chart':
        return <ChartView workspaceId={workspaceId} pageId={pageId} viewType="chart" />;
      default:
        // Default table view
        return (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40} sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Task</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Task ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Estimated SP</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Epic</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>GitHub link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                  <>
                    {/* Group Header */}
                    <TableRow
                      key={`group-${groupName}`}
                      sx={{
                        bgcolor: groupName === 'Sprint 1' ? '#ffe5f0' : '#e6f7ff',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: groupName === 'Sprint 1' ? '#ffd6e7' : '#d6f0ff' }
                      }}
                      onClick={() => toggleGroup(groupName)}
                    >
                      <TableCell colSpan={9} sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {collapsedGroups[groupName] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#323338' }}>
                            {groupName}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#676879', ml: 1 }}>
                            {groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Group Tasks */}
                    {!collapsedGroups[groupName] && groupTasks.map((task, index) => (
                      <TableRow
                        key={task.id || index}
                        sx={{
                          '&:hover': { bgcolor: '#f6f7fb' },
                          borderLeft: groupName === 'Sprint 1' ? '4px solid #e2445c' : '4px solid #579bfc',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEditTask(task)}
                      >
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <TextField
                            variant="standard"
                            defaultValue={task.task}
                            onBlur={(e) => handleUpdateTask(task.id, { task: e.target.value })}
                            sx={{ '& .MuiInput-root': { fontSize: '14px' } }}
                            fullWidth
                            disabled={!canEdit}
                          />
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
                              {task.owner?.name?.[0] || 'U'}
                            </Avatar>
                            <Typography sx={{ fontSize: '13px' }}>{task.owner?.name || 'Unassigned'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Chip
                            label={task.status}
                            size="small"
                            sx={{
                              bgcolor: STATUS_COLORS[task.status]?.bg || '#c4c4c4',
                              color: STATUS_COLORS[task.status]?.text || '#ffffff',
                              fontSize: '12px',
                              fontWeight: 500,
                              height: '24px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Chip
                            label={task.type}
                            size="small"
                            sx={{
                              bgcolor: TYPE_COLORS[task.type]?.bg || '#a25ddc',
                              color: TYPE_COLORS[task.type]?.text || '#ffffff',
                              fontSize: '12px',
                              fontWeight: 500,
                              height: '24px'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#676879' }}>
                            {task.taskId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Typography sx={{ fontSize: '13px' }}>{task.estimatedSP || 0} SP</Typography>
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Chip
                            label={task.epic || 'No epic'}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '11px', height: '22px' }}
                          />
                        </TableCell>
                        <TableCell>
                          {task.githubLink ? (
                            <a href={task.githubLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#0073ea' }}>
                              View
                            </a>
                          ) : (
                            <Typography sx={{ fontSize: '13px', color: '#c4c4c4' }}>-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Add Task Row */}
                    {!collapsedGroups[groupName] && canEdit && (
                      <TableRow sx={{ bgcolor: '#fafbfc' }}>
                        <TableCell colSpan={9}>
                          <Button
                            startIcon={<Plus size={14} />}
                            sx={{ textTransform: 'none', fontSize: '13px', color: '#676879' }}
                            onClick={() => setIsCreatorOpen(true)}
                          >
                            Add task
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', bgcolor: '#f6f7fb', display: 'flex', flexDirection: 'column' }}>


      <ViewToolbar
        onSearch={() => { }}
        onFilter={() => { }}
        onCreate={() => {
          setEditingTask(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New task"
        createButtonColor="#579bfc"
        hideCreate={!canEdit}
      />

      <TaskCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateTask}
        workspaceId={workspaceId}
        pageId={pageId}
        teamId={groupId}
        initialData={editingTask}
      />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

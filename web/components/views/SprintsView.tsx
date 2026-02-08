"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Checkbox,
  LinearProgress,
  Popover,
  FormControl,
  Select,
  MenuItem,
  ListItemText
} from "@mui/material";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { SprintCreator } from "@/components/creators/SprintCreator";
import { BoardView } from "./BoardView";
import { GanttView } from "./GanttView";
import { CalendarView } from "./CalendarView";
import { ChartView } from "@/components/views/ChartView";
import { usePermissions } from "@/hooks/usePermissions";

interface SprintsViewProps {
  workspaceId: string;
  pageId: string;
  viewType?: string;
}

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function SprintsView({ workspaceId, pageId, viewType = 'table' }: SprintsViewProps) {
  const { workspaces, updatePage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);
  // Find the page and team
  let page: any = null;
  let teamId: string | null = null;

  if (workspace && workspace.teams) {
    for (const team of workspace.teams) {
      const p = team.pages.find(pg => pg.id === pageId);
      if (p) {
        page = p;
        teamId = team.id;
        break;
      }
    }
  }

  const { canEdit } = usePermissions(workspaceId, teamId || undefined);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get("q") || "";

  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialQuery);

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync URL -> State (Handle Back/Forward navigation)
  useEffect(() => {
    const currentQuery = searchParams.get("q") || "";
    if (currentQuery !== searchQuery) {
      setSearchQuery(currentQuery);
    }
  }, [searchParams]);

  // Sync State -> URL (Debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQueryInUrl = searchParams.get("q") || "";
      if (searchQuery !== currentQueryInUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        router.replace(`${pathname}?${params.toString()}`);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, router, pathname, searchParams]);

  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [editingSprint, setEditingSprint] = useState<any>(null);

  // Initialize view state from page or defaults
  const views = (page?.views || ['table']).map((v: string) => ({
    id: v,
    label: v === 'table' ? 'Main table' : v.charAt(0).toUpperCase() + v.slice(1),
    type: v
  }));

  const activeView = page?.type || 'table';

  const handleSetActiveView = (viewId: string) => {
    if (workspaceId && teamId && page) {
      updatePage(workspaceId, teamId, page.id, { type: viewId as any });
    }
  };

  const handleRemoveView = (viewId: string) => {
    if (workspaceId && teamId && page) {
      const newViews = page.views?.filter((v: string) => v !== viewId) || [];
      const newActive = activeView === viewId ? (newViews[0] || 'table') : activeView;

      updatePage(workspaceId, teamId, page.id, {
        views: newViews,
        type: newActive as any
      });
    }
  };

  const handleAddView = (viewType: string) => {
    const current = page?.views || [];
    if (!current.includes(viewType)) {
      if (workspaceId && teamId && page) {
        updatePage(workspaceId, teamId, page.id, {
          views: [...current, viewType],
          type: viewType as any
        });
      }
    } else {
      handleSetActiveView(viewType);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [workspaceId, pageId, debouncedSearchQuery]);

  const fetchSprints = async () => {
    // ... existing fetch logic
    try {
      setLoading(true);
      
      const queryParams = [`workspaceId=${workspaceId}`];
      if (!debouncedSearchQuery && teamId) {
        queryParams.push(`teamId=${teamId}`);
      }

      const response = await fetch(`/api/sprints?${queryParams.join('&')}`, { cache: 'no-store' });
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setSprints(data.data);
      } else {
        console.error('Invalid sprints data format:', data);
        setSprints([]);
      }
      try {
        const tResp = await fetch(`/api/tasks?workspaceId=${workspaceId}&teamId=${teamId}`, { cache: 'no-store' });
        const tData = await tResp.json();
        if (tData.success && Array.isArray(tData.data)) {
          setTasks(tData.data);
          groupTasksBySprint(tData.data);
        } else {
          setTasks([]);
          setGroupedTasks({});
        }
      } catch (err) {
        console.error('Error fetching tasks for sprints view:', err);
        setTasks([]);
        setGroupedTasks({});
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSprints = sprints.filter(s => {
    const q = debouncedSearchQuery.toLowerCase();
    const matchesSearch =
      s.sprint.toLowerCase().includes(q) ||
      (s.sprintGoals && s.sprintGoals.toLowerCase().includes(q)) ||
      (s.activeSprintStatus && s.activeSprintStatus.toLowerCase().includes(q));

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(s.activeSprintStatus);
    return matchesSearch && matchesStatus;
  });

  const groupTasksBySprint = (taskList: any[]) => {
    const grouped: Record<string, any[]> = {};
    taskList.forEach(task => {
      const sprintKey = task.group || task.sprint || task.sprintName || 'Backlog';
      if (!grouped[sprintKey]) grouped[sprintKey] = [];
      grouped[sprintKey].push(task);
    });
    setGroupedTasks(grouped);
  };

  const handleCreateOrUpdateSprint = async (sprintData: any) => {
    try {
      if (!teamId) {
        console.error('No team/group selected');
        return;
      }

      const isUpdate = !!sprintData._id;
      const url = '/api/sprints';
      const method = isUpdate ? 'PUT' : 'POST';

      const payload = {
        ...sprintData,
        workspaceId,
        pageId,
        teamId: teamId,
        id: isUpdate ? sprintData._id : undefined
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchSprints();
        setEditingSprint(null);
      }
    } catch (error) {
      console.error('Error saving sprint:', error);
    }
  };

  const handleEditSprint = (sprint: any) => {
    setEditingSprint(sprint);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingSprint(null);
  };

  const calculateProgress = (sprint: any) => {
    // Dynamic timeline-based progress
    if (!sprint.sprintTimeline && !sprint.sprintStartDate) return 0;

    const parseDate = (d: any) => {
      if (!d) return null;

      // Handle DD/MM/YYYY format (allow 1 or 2 digits)
      if (typeof d === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d)) {
        const [day, month, year] = d.split('/').map(num => parseInt(num, 10));
        // Month is 0-indexed in Date constructor
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
      }

      const date = new Date(d);
      if (isNaN(date.getTime())) return null; // Invalid date check

      // Reset to midnight to calculate pure day difference
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const start = parseDate(sprint.sprintTimeline?.start || sprint.sprintStartDate);
    const end = parseDate(sprint.sprintTimeline?.end || sprint.sprintEndDate);

    if (!start || !end) return 0;

    // Before sprint starts: 0%
    if (now < start) return 0;

    // After sprint ends: 100%
    if (now > end) return 100;

    const oneDay = 1000 * 60 * 60 * 24;
    const totalDuration = Math.round((end.getTime() - start.getTime()) / oneDay);
    const daysElapsed = Math.round((now.getTime() - start.getTime()) / oneDay);

    if (totalDuration <= 0) return 100; // Edge case: start date equals or is after end date

    // Calculate percentage based on days
    const percentage = Math.round((daysElapsed / totalDuration) * 100);
    return Math.min(Math.max(percentage, 0), 100);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading sprints...</Typography>
      </Box>
    );
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startStatus = source.droppableId;
    const finishStatus = destination.droppableId;

    if (startStatus === finishStatus) {
      return;
    }

    // Moving to another status
    const sprint = sprints.find(s => (s._id || s.id) === draggableId);
    if (sprint) {
      // Optimistic update
      const newSprints = sprints.map(s =>
        (s._id || s.id) === draggableId ? { ...s, activeSprintStatus: finishStatus } : s
      );
      setSprints(newSprints);

      // API Update
      await handleCreateOrUpdateSprint({
        _id: draggableId,
        activeSprintStatus: finishStatus
      });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'board':
      case 'kanban':
        return (
          <DragDropContext onDragEnd={onDragEnd}>
            <Box sx={{ display: 'flex', gap: 2, p: 2, overflow: 'auto', height: '100%' }}>
              {['Planned', 'Active', 'Completed'].map(status => {
                const statusSprints = sprints.filter(s => s.activeSprintStatus === status);
                return (
                  <Droppable key={status} droppableId={status}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          minWidth: 320,
                          maxWidth: 320,
                          bgcolor: snapshot.isDraggingOver ? '#f0f0f0' : 'transparent',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #e6e9ef', p: 2, mb: 1 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>{status}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#676879' }}>{statusSprints.length} sprints</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minHeight: 100 }}>
                          {statusSprints.map((sprint, idx) => {
                            const progress = calculateProgress(sprint);
                            return (
                              <Draggable key={sprint._id || sprint.id} draggableId={sprint._id || sprint.id} index={idx}>
                                {(provided, snapshot) => (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => handleEditSprint(sprint)}
                                    sx={{
                                      p: 2,
                                      cursor: 'pointer',
                                      '&:hover': { boxShadow: 2 },
                                      ...provided.draggableProps.style,
                                      bgcolor: snapshot.isDragging ? '#f8f9fa' : 'white'
                                    }}
                                  >
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>{sprint.sprint}</Typography>
                                    <Box sx={{ mb: 1 }}>
                                      <Typography sx={{ fontSize: '11px', color: '#676879', mb: 0.5 }}>{Math.round(progress)}%</Typography>
                                      <Box sx={{ height: 6, bgcolor: '#e6e9ef', borderRadius: 1, overflow: 'hidden' }}>
                                        <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: '#0073ea' }} />
                                      </Box>
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', color: '#676879' }}>
                                      {sprint.sprintStartDate ? new Date(sprint.sprintStartDate).toLocaleDateString() : '-'} - {sprint.sprintEndDate ? new Date(sprint.sprintEndDate).toLocaleDateString() : '-'}
                                    </Typography>
                                  </Paper>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </Box>
                      </Box>
                    )}
                  </Droppable>
                );
              })}
            </Box>
          </DragDropContext>
        );
      case 'calendar':
        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Sprint Calendar</Typography>
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
      case 'chart':
        return <ChartView workspaceId={workspaceId} pageId={pageId} viewType="chart" />;
      default:
        return (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef', mx: 2, my: 2, width: 'auto' }}>
            <Table>
              {/* ... Table content ... */}
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Sprint</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Sprint goals</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Active sprint status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', minWidth: 200, borderRight: '1px solid #e6e9ef' }}>Sprint timeline</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Connected tasks</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Completed?</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Sprint start date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Sprint end date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSprints.map((sprint, index) => {
                  const progress = calculateProgress(sprint);
                  return (
                    <TableRow
                      key={sprint.id || index}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f6f7fb' }
                      }}
                      onClick={() => handleEditSprint(sprint)}
                    >
                      <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{sprint.sprint}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                        <Typography sx={{ fontSize: '13px', color: '#676879' }}>{sprint.sprintGoals || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sprint.activeSprintStatus}
                          size="small"
                          sx={{
                            bgcolor: sprint.activeSprintStatus === 'Active' ? '#00c875' :
                              sprint.activeSprintStatus === 'Planned' ? '#fdab3d' : '#c4c4c4',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 500,
                            height: '24px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '11px', color: '#676879' }}>
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: '#e6e9ef',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#0073ea',
                              borderRadius: 1
                            }
                          }}
                        />

                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${sprint.connectedTasks?.length || 0} tasks`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '12px', height: '24px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={sprint.completed || false} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '13px', color: '#676879' }}>
                          {sprint.sprintStartDate ? new Date(sprint.sprintStartDate).toLocaleDateString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '13px', color: '#676879' }}>
                          {sprint.sprintEndDate ? new Date(sprint.sprintEndDate).toLocaleDateString() : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {sprints.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography sx={{ color: '#676879' }}>No sprints yet. Create your first sprint!</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  // Default table view
  return (
    <Box sx={{ height: '100%', bgcolor: '#f6f7fb', display: 'flex', flexDirection: 'column' }}>


      <ViewToolbar
        searchQuery={searchQuery}
        onSearch={(query) => setSearchQuery(query)}
        onFilter={(e) => setFilterAnchorEl(e.currentTarget)}
        onCreate={() => {
          setEditingSprint(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New sprint"
        hideCreate={!canEdit}
      />

      <SprintCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateSprint}
        initialData={editingSprint}
      />

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter Sprints</Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
              <Select
                multiple
                value={filterStatus}
                onChange={(e) => setFilterStatus(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => selected.length + ' statuses'}
                displayEmpty
              >
                {['Active', 'Planned', 'Completed'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={filterStatus.indexOf(status) > -1} size="small" />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Popover>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}
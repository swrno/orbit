"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
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
  Avatar,
  Button,
  Collapse,
  Popover,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ChevronDown, ChevronRight, Plus, CheckSquare } from "lucide-react";
import { EpicCreator } from "@/components/creators/EpicCreator";
import { BoardView } from "./BoardView";
import { GanttView } from "./GanttView";
import { CalendarView } from "./CalendarView";
import { ChartView } from "@/components/views/ChartView";
import { usePermissions } from "@/hooks/usePermissions";

interface EpicsViewProps {
  workspaceId: string;
  pageId: string;
  viewType?: string;
}

const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  "Dev WIP": { bg: "#579bfc", text: "#ffffff" },
  "Product discovery": { bg: "#fdab3d", text: "#ffffff" },
  "Backlog": { bg: "#c4c4c4", text: "#ffffff" },
  "Nice to Have": { bg: "#a25ddc", text: "#ffffff" },
  "Best Effort": { bg: "#784bd1", text: "#ffffff" }
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  "Must Have": { bg: "#e2445c", text: "#ffffff" },
  "Critical": { bg: "#ff6b00", text: "#ffffff" },
  "Nice to Have": { bg: "#00c875", text: "#ffffff" }
};

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function EpicsView({ workspaceId, pageId, viewType = 'table' }: EpicsViewProps) {
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
  const { user } = useAuth();
  const currentUserId = user?.uid;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get("q") || "";

  const [epics, setEpics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
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

  const [filterPhase, setFilterPhase] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [editingEpic, setEditingEpic] = useState<any>(null);

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
    fetchEpics();
  }, [workspaceId, pageId, debouncedSearchQuery]);

  const filteredEpics = epics.filter(e => {
    const q = debouncedSearchQuery.toLowerCase();
    const matchesSearch =
      e.epic.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.phase && e.phase.toLowerCase().includes(q)) ||
      (e.priority && e.priority.toLowerCase().includes(q));

    const matchesPhase = filterPhase.length === 0 || filterPhase.includes(e.phase);
    const matchesPriority = filterPriority.length === 0 || filterPriority.includes(e.priority);
    return matchesSearch && matchesPhase && matchesPriority;
  });

  const fetchEpics = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = { workspaceId };
      if (!debouncedSearchQuery && teamId) {
        params.teamId = teamId;
      }
      
      const [epicsRes, tasksRes] = await Promise.all([
        apiClient.fetchEpics(params, currentUserId),
        apiClient.fetchTasks({ workspaceId, teamId: teamId || '' }, currentUserId)
      ]);

      if (epicsRes.success && Array.isArray(epicsRes.data)) {
        setEpics(epicsRes.data);
      } else {
        setEpics([]);
      }

      if (tasksRes.success && Array.isArray(tasksRes.data)) {
        setTasks(tasksRes.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEpicTasks = (epic: any) => {
    const epicId = epic.id || epic._id;
    const epicName = epic.epic;

    return tasks.filter(t =>
      (t.epicId && t.epicId === epicId) || // Match by explicit ID if available
      (t.epic && t.epic === epicId) ||     // Match if 'epic' field somehow stores ID
      (t.epic && t.epic === epicName)      // Match if 'epic' field stores Name (matches TaskCreator)
    );
  };

  const handleCreateOrUpdateEpic = async (epicData: any) => {
    try {
      if (!teamId) {
        console.error('No team/group selected');
        return;
      }

      const isUpdate = !!epicData._id;
      const payload = {
        ...epicData,
        workspaceId,
        pageId,
        teamId: teamId,
        id: isUpdate ? epicData._id : undefined
      };

      const data = await (isUpdate 
        ? apiClient.updateEpic(payload, currentUserId)
        : apiClient.createEpic(payload, currentUserId));

      if (data.success) {
        fetchEpics();
        setEditingEpic(null);
      }
    } catch (error) {
      console.error('Error saving epic:', error);
    }
  };

  const handleEditEpic = (epic: any) => {
    setEditingEpic(epic);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingEpic(null);
  };

  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => ({
      ...prev,
      [epicId]: !prev[epicId]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading epics...</Typography>
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

    const startPhase = source.droppableId;
    const finishPhase = destination.droppableId;

    if (startPhase === finishPhase) {
      // Reordering within same column - optimistic only for now as order field might not exist
      return;
    }

    // Moving to another phase
    const epic = epics.find(e => (e._id || e.id) === draggableId);
    if (epic) {
      // Optimistic update
      const newEpics = epics.map(e =>
        (e._id || e.id) === draggableId ? { ...e, phase: finishPhase } : e
      );
      setEpics(newEpics);

      // API Update
      await handleCreateOrUpdateEpic({
        _id: draggableId,
        phase: finishPhase
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
              {['Backlog', 'Product discovery', 'Dev WIP', 'Nice to Have', 'Best Effort'].map(phase => {
                const phaseEpics = epics.filter(e => e.phase === phase);
                return (
                  <Droppable key={phase} droppableId={phase}>
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
                          <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>{phase}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#676879' }}>{phaseEpics.length} epics</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minHeight: 100 }}>
                          {phaseEpics.map((epic, idx) => (
                            <Draggable key={epic._id || epic.id} draggableId={epic._id || epic.id} index={idx}>
                              {(provided, snapshot) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleEditEpic(epic)}
                                  sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 2 },
                                    ...provided.draggableProps.style,
                                    bgcolor: snapshot.isDragging ? '#f8f9fa' : 'white'
                                  }}
                                >
                                  <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>{epic.epic}</Typography>
                                  <Chip
                                    label={epic.priority}
                                    size="small"
                                    sx={{
                                      fontSize: '11px',
                                      mb: 1,
                                      bgcolor: PRIORITY_COLORS[epic.priority]?.bg,
                                      color: PRIORITY_COLORS[epic.priority]?.text
                                    }}
                                  />
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography sx={{ fontSize: '11px', color: '#676879' }}>
                                      {epic.connectedTasks?.length || 0} connected tasks
                                    </Typography>
                                    {epic.owner && (
                                      <Avatar sx={{ width: 24, height: 24, fontSize: '10px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                                        {epic.owner.name?.[0] || 'U'}
                                      </Avatar>
                                    )}
                                  </Box>
                                </Paper>
                              )}
                            </Draggable>
                          ))}
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
            <Typography variant="h6" sx={{ mb: 2 }}>Epic Calendar</Typography>
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
            <Typography variant="h6" sx={{ mb: 2 }}>Epic Timeline</Typography>
            {epics.map((epic, idx) => (
              <Box key={epic._id || idx} sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', mb: 0.5 }}>{epic.epic}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ height: 24, bgcolor: '#0073ea', borderRadius: 1, width: `${Math.random() * 60 + 20}%`, display: 'flex', alignItems: 'center', px: 1 }}>
                    <Typography sx={{ fontSize: '11px', color: 'white' }}>{epic.phase}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        );
      case 'chart':
        return <ChartView workspaceId={workspaceId} pageId={pageId} viewType="chart" />;
      default:
        return (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef', mx: 2, my: 2, width: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40} sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Epic</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Phase</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEpics.map((epic, index) => {
                  const epicTasks = getEpicTasks(epic);
                  const hasChildren = epic.children?.length > 0 || epicTasks.length > 0;
                  const isExpanded = expandedEpics[epic.id || epic._id];

                  return (
                    // ... rest of row rendering logic ...
                    <React.Fragment key={epic.id || index}>
                      <TableRow
                        key={epic.id || index}
                        sx={{
                          '&:hover': { bgcolor: '#f6f7fb' },
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          // Prevent edit when clicking expand icon
                          if ((e.target as HTMLElement).closest('.expand-icon')) {
                            toggleEpic(epic.id || epic._id);
                            return;
                          }
                          handleEditEpic(epic);
                        }}
                      >
                        <TableCell className="expand-icon" sx={{ borderRight: '1px solid #e6e9ef', pr: 0 }}>
                          {hasChildren && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleEpic(epic.id || epic._id); }}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 500,
                              pl: (epic.hierarchy || 0) * 3
                            }}
                          >
                            {epic.epic}
                          </Typography>
                          {epic.description && (
                            <Typography sx={{ fontSize: '11px', color: '#676879', mt: 0.5, pl: (epic.hierarchy || 0) * 3 }}>{epic.description}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                              {epic.owner?.name?.[0] || 'U'}
                            </Avatar>
                            <Typography sx={{ fontSize: '13px' }}>{epic.owner?.name || 'Unassigned'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={epic.phase}
                            size="small"
                            sx={{
                              bgcolor: PHASE_COLORS[epic.phase]?.bg || '#c4c4c4',
                              color: PHASE_COLORS[epic.phase]?.text || '#ffffff',
                              fontSize: '12px',
                              fontWeight: 500,
                              height: '24px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={epic.priority}
                            size="small"
                            sx={{
                              bgcolor: PRIORITY_COLORS[epic.priority]?.bg || '#c4c4c4',
                              color: PRIORITY_COLORS[epic.priority]?.text || '#ffffff',
                              fontSize: '12px',
                              fontWeight: 500,
                              height: '24px'
                            }}
                          />
                        </TableCell>
                      </TableRow>

                      {/* Nested Sub-Epics */}
                      {epic.children?.length > 0 && isExpanded && epic.children.map((child: any, childIndex: number) => (
                        <TableRow
                          key={`${epic.id}-child-${childIndex}`}
                          sx={{ '&:hover': { bgcolor: '#f6f7fb' } }}
                        >
                          <TableCell></TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '13px', pl: 4, color: '#676879' }}>
                              └ {child.epic}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 20, height: 20, fontSize: '10px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                                {child.owner?.name?.[0] || 'U'}
                              </Avatar>
                              <Typography sx={{ fontSize: '12px' }}>{child.owner?.name || 'Unassigned'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={child.phase}
                              size="small"
                              sx={{
                                bgcolor: PHASE_COLORS[child.phase]?.bg || '#c4c4c4',
                                color: PHASE_COLORS[child.phase]?.text || '#ffffff',
                                fontSize: '11px',
                                height: '20px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={child.priority}
                              size="small"
                              sx={{
                                bgcolor: PRIORITY_COLORS[child.priority]?.bg || '#c4c4c4',
                                color: PRIORITY_COLORS[child.priority]?.text || '#ffffff',
                                fontSize: '11px',
                                height: '20px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Nested Tasks */}
                      {epicTasks.length > 0 && isExpanded && epicTasks.map((task: any, taskIndex: number) => (
                        <TableRow
                          key={`task-${task._id || task.id}`}
                          sx={{ '&:hover': { bgcolor: '#f6f7fb' } }}
                        >
                          <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                          <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 4 }}>
                              <CheckSquare size={14} color="#3B82F6" />
                              <Typography sx={{ fontSize: '13px', color: '#334155' }}>
                                {task.title || task.task}
                              </Typography>
                              <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                {task.key || task.taskId}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 20, height: 20, fontSize: '10px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                                {task.owner?.name?.[0] || 'U'}
                              </Avatar>
                              <Typography sx={{ fontSize: '12px' }}>{task.owner?.name || 'Unassigned'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: '#E2E8F0',
                                color: '#64748B',
                                fontSize: '11px',
                                height: '20px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                              {task.priority || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}


                {epics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography sx={{ color: '#676879' }}>No epics yet. Create your first epic!</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', bgcolor: '#f6f7fb', display: 'flex', flexDirection: 'column' }}>


      <ViewToolbar
        searchQuery={searchQuery}
        onSearch={(query) => setSearchQuery(query)}
        onFilter={(e) => setFilterAnchorEl(e.currentTarget)}
        onCreate={() => {
          setEditingEpic(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New epic"
        createButtonColor="#784bd1"
        hideCreate={!canEdit}
      />

      <EpicCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateEpic}
        initialData={editingEpic}
      />

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter Epics</Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Phase</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
              <Select
                multiple
                value={filterPhase}
                onChange={(e) => setFilterPhase(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => selected.length + ' phases'}
                displayEmpty
              >
                {Object.keys(PHASE_COLORS).map((phase) => (
                  <MenuItem key={phase} value={phase}>
                    <Checkbox checked={filterPhase.indexOf(phase) > -1} size="small" />
                    <ListItemText primary={phase} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Priority</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
              <Select
                multiple
                value={filterPriority}
                onChange={(e) => setFilterPriority(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => selected.length + ' priorities'}
                displayEmpty
              >
                {Object.keys(PRIORITY_COLORS).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    <Checkbox checked={filterPriority.indexOf(priority) > -1} size="small" />
                    <ListItemText primary={priority} />
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

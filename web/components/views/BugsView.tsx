"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, Button, Collapse, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Popover, List, ListItem, Switch
} from "@mui/material";
import { ChevronDown, ChevronRight, Plus, Filter, Layout, Calendar as CalendarIcon, X } from "lucide-react";
import { BugCreator } from "@/components/creators/BugCreator";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { BoardView } from "./BoardView";
import { GanttView } from "./GanttView";
import { CalendarView } from "./CalendarView";
import { ChartView } from "@/components/views/ChartView";
import { usePermissions } from "@/hooks/usePermissions";

interface BugsViewProps {
  workspaceId: string;
  pageId: string;
  viewType?: string;
}

const GROUP_COLORS: Record<string, string> = {
  "Incoming Bugs": "#fdab3d",
  "Development Work": "#579bfc",
  "Resolved": "#00c875"
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  "Critical": { bg: "#e2445c", text: "#ffffff" },
  "High": { bg: "#ff6b00", text: "#ffffff" },
  "Medium": { bg: "#fdab3d", text: "#ffffff" },
  "Low": { bg: "#00c875", text: "#ffffff" }
};

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function BugsView({ workspaceId, pageId, viewType = 'table' }: BugsViewProps) {
  const { workspaces, updatePage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);
  const { canEdit } = usePermissions(workspaceId);

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

  const [bugs, setBugs] = useState<any[]>([]);
  const [groupedBugs, setGroupedBugs] = useState<Record<string, any[]>>({
    "Incoming Bugs": [],
    "Development Work": [],
    "Resolved": []
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterAssignee, setFilterAssignee] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    bug: true,
    reporter: true,
    assignee: true,
    timeUntilResolution: true,
    status: true,
    priority: true,
    connectedTasks: true,
    bugId: true
  });
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<HTMLButtonElement | null>(null);

  const filteredBugs = React.useMemo(() => bugs.filter(b => {
    const matchesSearch =
      b.bug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.bugId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(b.status);
    const matchesPriority = filterPriority.length === 0 || filterPriority.includes(b.priority);
    const matchesAssignee = filterAssignee.length === 0 || (b.assignee?.id && filterAssignee.includes(b.assignee.id));

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  }), [bugs, searchQuery, filterStatus, filterPriority, filterAssignee]);

  useEffect(() => {
    groupBugsByStatus(filteredBugs);
  }, [bugs, searchQuery, filterStatus, filterPriority, filterAssignee]); // Re-group when bugs or filters change

  const [editingBug, setEditingBug] = useState<any>(null);

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
    fetchBugs();
  }, [workspaceId, pageId]);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bugs?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${teamId}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBugs(data.data);
      } else {
        console.error('Invalid bugs data format:', data);
        setBugs([]);
      }
    } catch (error) {
      console.error('Error fetching bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateBug = async (bugData: any) => {
    try {
      if (!teamId) {
        console.error('No team/group selected');
        return;
      }

      const isUpdate = !!bugData._id;
      const url = '/api/bugs';
      const method = isUpdate ? 'PUT' : 'POST';

      const payload = {
        ...bugData,
        workspaceId,
        pageId,
        teamId: teamId, // api expects 'id' for updates
        id: isUpdate ? bugData._id : undefined
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchBugs();
        setEditingBug(null);
      }
    } catch (error) {
      console.error('Error saving bug:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // IF dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Find the bug
    const bug = bugs.find(b => b._id === draggableId || b.id === draggableId);
    if (!bug) return;

    // Optimistic update
    const newGroup = destination.droppableId;
    const newStatus = getStatusForGroup(newGroup);

    // Update local state
    const updatedBugs = bugs.map(b => {
      if (b._id === draggableId || b.id === draggableId) {
        return { ...b, group: newGroup, status: newStatus };
      }
      return b;
    });

    setBugs(updatedBugs);
    groupBugsByStatus(updatedBugs);

    // API Update
    try {
      await handleCreateOrUpdateBug({
        ...bug,
        _id: bug._id || bug.id,
        group: newGroup,
        status: newStatus
      });
    } catch (error) {
      console.error("Failed to update bug position", error);
      // Revert on error would be ideal here
      fetchBugs();
    }
  };

  const getStatusForGroup = (group: string) => {
    switch (group) {
      case "Incoming Bugs": return "Awaiting Review";
      case "Development Work": return "In Progress";
      case "Resolved": return "Fixed";
      default: return "Awaiting Review";
    }
  };

  const handleEditBug = (bug: any) => {
    setEditingBug(bug);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingBug(null);
  };

  const groupBugsByStatus = (bugList: any[]) => {
    const grouped: Record<string, any[]> = {
      "Incoming Bugs": [],
      "Development Work": [],
      "Resolved": []
    };

    bugList.forEach(bug => {
      const group = bug.group || "Incoming Bugs";
      if (grouped[group]) {
        grouped[group].push(bug);
      }
    });

    setGroupedBugs(grouped);
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleUpdateBug = async (bugId: string, updates: any) => {
    const bug = bugs.find(b => b._id === bugId || b.id === bugId);
    if (!bug) return;

    const updatedBug = { ...bug, ...updates };

    // Optimistic update
    setBugs(prev => prev.map(b => (b._id === bugId || b.id === bugId ? updatedBug : b)));
    groupBugsByStatus(bugs.map(b => (b._id === bugId || b.id === bugId ? updatedBug : b)));

    try {
      await handleCreateOrUpdateBug(updatedBug);
    } catch (error) {
      console.error('Failed to update bug:', error);
      fetchBugs(); // Revert on error
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading bugs...</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'board':
      case 'kanban':
        return (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ display: 'flex', gap: 2, p: 2, overflowX: 'auto', height: '100%' }}>
              {Object.entries(groupedBugs).map(([groupName, groupBugs]) => (
                <Box key={groupName} sx={{ minWidth: 320, maxWidth: 320, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e6e9ef',
                    p: 2,
                    mb: 1,
                    borderTop: `3px solid ${GROUP_COLORS[groupName]}`
                  }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>
                      {groupName}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#676879' }}>
                      {groupBugs.length} bugs
                    </Typography>
                  </Box>

                  <Droppable droppableId={groupName}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          bgcolor: snapshot.isDraggingOver ? 'rgba(0, 82, 204, 0.04)' : 'transparent',
                          transition: 'background-color 0.2s',
                          borderRadius: 1,
                          minHeight: 100
                        }}
                      >
                        {groupBugs.map((bug, idx) => (
                          <Draggable key={bug._id || bug.id || idx} draggableId={bug._id || bug.id} index={idx} isDragDisabled={!canEdit}>
                            {(provided, snapshot) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleEditBug(bug)}
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  '&:hover': { boxShadow: 2 },
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1
                                }}
                              >
                                <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                                  {bug.bug}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                  <Chip label={bug.priority} size="small" sx={{
                                    bgcolor: PRIORITY_COLORS[bug.priority]?.bg,
                                    color: PRIORITY_COLORS[bug.priority]?.text,
                                    fontSize: '11px',
                                    height: 20
                                  }} />
                                  <Chip label={bug.status} size="small" sx={{ fontSize: '11px', height: 20 }} />
                                  {bug.dueDate && (
                                    <Chip
                                      label={new Date(bug.dueDate).toLocaleDateString()}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '11px', height: 20 }}
                                    />
                                  )}
                                </Box>
                                <Typography sx={{ fontSize: '11px', color: '#676879', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                  {bug.bugId}
                                </Typography>
                              </Paper>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              ))}
            </Box>
          </DragDropContext>
        );

      case 'calendar':
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysInMonth = endOfMonth.getDate();
        const startDay = startOfMonth.getDay(); // 0-6 (Sun-Sat)

        const days = [];
        // Fill empty slots for previous month
        for (let i = 0; i < startDay; i++) days.push(null);
        // Fill days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(today.getFullYear(), today.getMonth(), i));

        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef', height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">{today.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', bgcolor: '#e6e9ef', border: '1px solid #e6e9ef' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 600, fontSize: '13px', bgcolor: 'white' }}>
                  {day}
                </Box>
              ))}
              {days.map((date, i) => {
                const dayBugs = date ? filteredBugs.filter(b => {
                  if (!b.dueDate) return false;
                  const d = new Date(b.dueDate);
                  return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
                }) : [];

                return (
                  <Box key={i} sx={{
                    aspectRatio: '0.8',
                    bgcolor: 'white',
                    p: 1,
                    fontSize: '12px',
                    overflow: 'hidden'
                  }}>
                    {date && (
                      <>
                        <Typography sx={{ fontWeight: date.getDate() === today.getDate() ? 700 : 400, color: date.getDate() === today.getDate() ? 'primary.main' : 'inherit' }}>
                          {date.getDate()}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {dayBugs.map(b => (
                            <Box
                              key={b._id || b.id}
                              onClick={() => handleEditBug(b)}
                              sx={{
                                p: 0.5,
                                bgcolor: PRIORITY_COLORS[b.priority]?.bg,
                                color: 'white',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {b.bug}
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Box>
        );

      case 'gantt':
        const validBugs = filteredBugs.filter(b => b.createdAt);
        if (validBugs.length === 0) return <Box sx={{ p: 3 }}>No bugs to show in timeline.</Box>;

        const earliest = validBugs.reduce((min, b) => {
          const d = new Date(b.createdAt);
          return d < min ? d : min;
        }, new Date());

        // Add buffer
        earliest.setDate(earliest.getDate() - 2);

        const latest = validBugs.reduce((max, b) => {
          const d = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt);
          // If no due date, assume +7 days for viz
          if (!b.dueDate) d.setDate(d.getDate() + 7);
          return d > max ? d : max;
        }, new Date());

        // Add buffer
        latest.setDate(latest.getDate() + 5);

        const totalDuration = latest.getTime() - earliest.getTime();

        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Bug Timeline</Typography>
            <Box sx={{ position: 'relative', minWidth: 800 }}>
              {/* Header dates */}
              <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', mb: 2, pb: 1 }}>
                <Typography sx={{ width: 200, flexShrink: 0, fontWeight: 600, fontSize: '13px' }}>Bug</Typography>
                <Box sx={{ flex: 1, position: 'relative', height: 20 }}>
                  <Typography sx={{ position: 'absolute', left: 0, fontSize: '12px', color: '#666' }}>
                    {earliest.toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ position: 'absolute', right: 0, fontSize: '12px', color: '#666' }}>
                    {latest.toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {validBugs.map((bug) => {
                const start = new Date(bug.createdAt).getTime();
                const end = bug.dueDate
                  ? new Date(bug.dueDate).getTime()
                  : new Date(bug.createdAt).getTime() + (7 * 24 * 60 * 60 * 1000); // +7 days default

                const left = ((start - earliest.getTime()) / totalDuration) * 100;
                const width = ((end - start) / totalDuration) * 100;

                return (
                  <Box key={bug._id || bug.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, height: 32 }}>
                    <Typography sx={{ width: 200, flexShrink: 0, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 2 }}>
                      {bug.bug}
                    </Typography>
                    <Box sx={{ flex: 1, position: 'relative', height: '100%' }}>
                      <Box
                        onClick={() => handleEditBug(bug)}
                        sx={{
                          position: 'absolute',
                          left: `${left}%`,
                          width: `${Math.max(width, 1)}%`, // Ensure at least visible
                          height: 24,
                          bgcolor: PRIORITY_COLORS[bug.priority]?.bg || '#e6e9ef',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          px: 1,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.9 }
                        }}
                      >
                        <Typography sx={{ fontSize: '11px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {bug.status}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );

      case 'chart':
      case 'chart':
        return <ChartView workspaceId={workspaceId} pageId={pageId} viewType="chart" />;

      default:
        return (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef', mx: 2, my: 2, width: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40} sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                  {visibleColumns.bug && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Bug</TableCell>}
                  {visibleColumns.reporter && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Reporter</TableCell>}
                  {visibleColumns.assignee && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Assignee</TableCell>}
                  {visibleColumns.timeUntilResolution && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Time until resolution</TableCell>}
                  {visibleColumns.status && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Status</TableCell>}
                  {visibleColumns.priority && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Priority</TableCell>}
                  {visibleColumns.connectedTasks && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Connected tasks</TableCell>}
                  {visibleColumns.bugId && <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Bug ID</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedBugs).map(([groupName, groupBugs]) => {
                  // Filter group bugs based on global filter
                  const visibleGroupBugs = groupBugs.filter(b => filteredBugs.some(fb => fb._id === b._id || fb.id === b.id));

                  if (visibleGroupBugs.length === 0) return null;

                  return (
                    <React.Fragment key={`group-${groupName}`}>
                      <TableRow
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f0f0f0' }
                        }}
                        onClick={() => toggleGroup(groupName)}
                      >
                        <TableCell colSpan={8} sx={{ py: 1, borderLeft: `4px solid ${GROUP_COLORS[groupName]}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {collapsedGroups[groupName] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#323338' }}>
                              {groupName}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#676879', ml: 1 }}>
                              {visibleGroupBugs.length}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {!collapsedGroups[groupName] && visibleGroupBugs.map((bug, index) => (
                        <TableRow
                          key={bug.id || index}
                          sx={{
                            '&:hover': { bgcolor: '#f6f7fb' },
                            borderLeft: `4px solid ${GROUP_COLORS[groupName]}`,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleEditBug(bug)}
                        >
                          <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                          {visibleColumns.bug && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <TextField
                                variant="standard"
                                defaultValue={bug.bug}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={(e) => handleUpdateBug(bug._id || bug.id, { bug: e.target.value })}
                                sx={{ '& .MuiInput-root': { fontSize: '14px' } }}
                                fullWidth
                                disabled={!canEdit}
                              />
                            </TableCell>
                          )}
                          {visibleColumns.reporter && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
                                  {bug.reporter?.name?.[0] || 'U'}
                                </Avatar>
                                <Typography sx={{ fontSize: '13px' }}>{bug.reporter?.name || 'Unknown'}</Typography>
                              </Box>
                            </TableCell>
                          )}
                          {visibleColumns.assignee && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {bug.assignee?.name ? (
                                  <>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'primary.main' }}>
                                      {bug.assignee.name[0]}
                                    </Avatar>
                                    <Typography sx={{ fontSize: '13px' }}>{bug.assignee.name}</Typography>
                                  </>
                                ) : (
                                  <Typography sx={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>Unassigned</Typography>
                                )}
                              </Box>
                            </TableCell>
                          )}
                          {visibleColumns.timeUntilResolution && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <Typography sx={{ fontSize: '13px', color: '#676879' }}>
                                {bug.timeUntilResolution || (bug.dueDate ? new Date(bug.dueDate).toLocaleDateString() : '-')}
                              </Typography>
                            </TableCell>
                          )}
                          {visibleColumns.status && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <Chip
                                label={bug.status}
                                size="small"
                                sx={{
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  height: '24px'
                                }}
                              />
                            </TableCell>
                          )}
                          {visibleColumns.priority && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <Chip
                                label={bug.priority}
                                size="small"
                                sx={{
                                  bgcolor: PRIORITY_COLORS[bug.priority]?.bg || '#c4c4c4',
                                  color: PRIORITY_COLORS[bug.priority]?.text || '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  height: '24px'
                                }}
                              />
                            </TableCell>
                          )}
                          {visibleColumns.connectedTasks && (
                            <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                              <Typography sx={{ fontSize: '13px' }}>
                                {bug.connectedTasks?.length || 0} tasks
                              </Typography>
                            </TableCell>
                          )}
                          {visibleColumns.bugId && (
                            <TableCell>
                              <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#676879', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, display: 'block' }} title={bug.bugId}>
                                {bug.bugId}
                              </Typography>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}

                      {!collapsedGroups[groupName] && canEdit && (
                        <TableRow sx={{ bgcolor: '#fafbfc', borderLeft: `4px solid ${GROUP_COLORS[groupName]}` }}>
                          <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}>
                            <Button
                              startIcon={<Plus size={14} />}
                              sx={{ textTransform: 'none', fontSize: '13px', color: '#676879' }}
                              onClick={() => setIsCreatorOpen(true)}
                            >
                              Add bug
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', bgcolor: '#f6f7fb', display: 'flex', flexDirection: 'column' }}>


      <ViewToolbar
        onSearch={(query) => setSearchQuery(query)}
        onFilter={(e) => setFilterAnchorEl(e.currentTarget)}
        onCreate={() => {
          setEditingBug(null);
          setIsCreatorOpen(true);
        }}
        extraActions={
          <Button
            startIcon={<Layout size={16} />}
            variant="outlined"
            size="small"
            onClick={(e) => setColumnMenuAnchorEl(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            Columns
          </Button>
        }
        createButtonLabel="New bug"
        createButtonColor="#e2445c"
        hideCreate={!canEdit}
      />

      <BugCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateBug}
        initialData={editingBug}
        members={workspace?.teamMembers || []}
      />

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter Bugs</Typography>

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
                {['Awaiting Review', 'Pending Review', 'Ready for Dev', 'Fixed', 'Done'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={filterStatus.indexOf(status) > -1} size="small" />
                    <ListItemText primary={status} />
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
                {['Critical', 'High', 'Medium', 'Low'].map((p) => (
                  <MenuItem key={p} value={p}>
                    <Checkbox checked={filterPriority.indexOf(p) > -1} size="small" />
                    <ListItemText primary={p} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Assignee</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
              <Select
                multiple
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => selected.length + ' members'}
                displayEmpty
              >
                {workspace?.teamMembers?.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Checkbox checked={filterAssignee.indexOf(m.id) > -1} size="small" />
                    <ListItemText primary={m.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            fullWidth
            size="small"
            onClick={() => {
              setFilterStatus([]);
              setFilterPriority([]);
              setFilterAssignee([]);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Popover>

      {/* Column Visibility Popover */}
      <Popover
        open={Boolean(columnMenuAnchorEl)}
        anchorEl={columnMenuAnchorEl}
        onClose={() => setColumnMenuAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Columns</Typography>
          <List dense>
            {Object.keys(visibleColumns).map((col) => (
              <ListItem key={col} dense>
                <ListItemText primary={col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')} />
                <Switch
                  edge="end"
                  checked={visibleColumns[col as keyof typeof visibleColumns]}
                  onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col as keyof typeof visibleColumns] }))}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

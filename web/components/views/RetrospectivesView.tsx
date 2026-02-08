"use client";

import React, { useEffect, useState } from "react";
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
  Avatar,
  Button,
  IconButton,
  Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText,
  Popover, List, ListItem, Switch
} from "@mui/material";
import { ChevronDown, ChevronRight, Plus, ThumbsUp, Trash2, Edit } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { RetrospectiveCreator } from "@/components/creators/RetrospectiveCreator";
import { BoardView } from "./BoardView";
import { GanttView } from "./GanttView";
import { CalendarView } from "./CalendarView";
import { ChartView } from "@/components/views/ChartView";
import { usePermissions } from "@/hooks/usePermissions";
import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

interface RetrospectivesViewProps {
  workspaceId: string;
  pageId: string;
  viewType?: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "Discussion": { bg: "#fdab3d", text: "#ffffff" },
  "Improve": { bg: "#ff6b00", text: "#ffffff" },
  "Keep": { bg: "#00c875", text: "#ffffff" }
};

export function RetrospectivesView({ workspaceId, pageId, viewType = 'table' }: RetrospectivesViewProps) {
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

  const [retrospectives, setRetrospectives] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [groupedRetros, setGroupedRetros] = useState<Record<string, any[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [editingRetro, setEditingRetro] = useState<any>(null);

  // Initialize view state
  // Initialize view state
  const views = (page?.views || ['table', 'board']).map((v: string) => ({
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

  const filteredRetros = retrospectives.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.feedback.toLowerCase().includes(q) ||
      (r.submitter?.name && r.submitter.name.toLowerCase().includes(q)) ||
      (r.owner?.name && r.owner.name.toLowerCase().includes(q)) ||
      (r.type && r.type.toLowerCase().includes(q));

    const matchesType = filterType.length === 0 || filterType.includes(r.type);
    return matchesSearch && matchesType;
  });

  const [groupedRetrosByType, setGroupedRetrosByType] = useState<Record<string, any[]>>({});

  useEffect(() => {
    groupRetrosBySprint(filteredRetros, sprints);
    groupRetrosByType(filteredRetros);
  }, [retrospectives, searchQuery, filterType, sprints]);

  const groupRetrosByType = (retroList: any[]) => {
    const grouped: Record<string, any[]> = {
      "Keep": [],
      "Improve": [],
      "Discussion": []
    };

    retroList.forEach(retro => {
      if (grouped[retro.type]) {
        grouped[retro.type].push(retro);
      } else {
        grouped["Discussion"].push(retro);
      }
    });
    setGroupedRetrosByType(grouped);
  };

  useEffect(() => {
    fetchRetrospectives();
  }, [workspaceId, pageId]);

  const fetchRetrospectives = async () => {
    try {
      setLoading(true);
      const [retrosRes, sprintsRes] = await Promise.all([
        fetch(`/api/retrospectives?workspaceId=${workspaceId}&teamId=${teamId}`),
        fetch(`/api/sprints?workspaceId=${workspaceId}&teamId=${teamId}`)
      ]);

      const retrosData = await retrosRes.json();
      const sprintsData = await sprintsRes.json();

      let currentSprints = [];
      if (sprintsData.success && Array.isArray(sprintsData.data)) {
        setSprints(sprintsData.data);
        currentSprints = sprintsData.data;
      }

      if (retrosData.success && Array.isArray(retrosData.data)) {
        setRetrospectives(retrosData.data);
      } else {
        console.error('Invalid retrospectives data format:', retrosData);
        setRetrospectives([]);
      }
    } catch (error) {
      console.error('Error fetching retrospectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateRetro = async (retroData: any) => {
    try {
      if (!teamId) {
        console.error('No team/group selected');
        return;
      }

      const isUpdate = !!retroData._id;
      const url = '/api/retrospectives';
      const method = isUpdate ? 'PUT' : 'POST';

      const payload = {
        ...retroData,
        workspaceId,
        pageId,
        teamId: teamId,
        id: isUpdate ? retroData._id : undefined
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchRetrospectives();
        setEditingRetro(null);
      }
    } catch (error) {
      console.error('Error saving retrospective:', error);
    }
  };

  const handleDeleteRetro = async (retroId: string) => {
    if (!confirm('Are you sure you want to delete this retrospective item?')) return;

    try {
      const response = await fetch(`/api/retrospectives?id=${retroId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRetrospectives();
      }
    } catch (error) {
      console.error('Error deleting retrospective:', error);
    }
  };

  const handleEditRetro = (retro: any) => {
    setEditingRetro(retro);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingRetro(null);
  };

  const groupRetrosBySprint = (retroList: any[], sprintList: any[]) => {
    const grouped: Record<string, any[]> = {};

    // Initialize with all sprints
    sprintList.forEach(s => {
      if (s.sprint) grouped[s.sprint] = [];
    });

    // Default group
    if (!grouped['General']) grouped['General'] = [];

    retroList.forEach(retro => {
      const sprint = retro.sprint || 'General';
      if (!grouped[sprint]) {
        grouped[sprint] = [];
      }
      grouped[sprint].push(retro);
    });

    setGroupedRetros(grouped);
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleVote = async (retroId: string) => {
    try {
      const response = await fetch('/api/retrospectives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: retroId, incrementVote: true })
      });

      if (response.ok) {
        fetchRetrospectives(); // Refresh data
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Find retro
    const retro = retrospectives.find(r => r._id === draggableId || r.id === draggableId);
    if (!retro) return;

    const newType = destination.droppableId;

    // Optimistic update
    const updatedRetros = retrospectives.map(r => {
      if (r._id === draggableId || r.id === draggableId) {
        return { ...r, type: newType };
      }
      return r;
    });

    setRetrospectives(updatedRetros);

    // API Update
    try {
      const response = await fetch('/api/retrospectives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: retro._id || retro.id, type: newType })
      });
      if (!response.ok) fetchRetrospectives();
    } catch (e) {
      console.error("Failed to move retro", e);
      fetchRetrospectives();
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading retrospectives...</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'chart':
        return <ChartView workspaceId={workspaceId} pageId={pageId} viewType="chart" />;
      case 'board':
      case 'kanban':
        return (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box sx={{ display: 'flex', gap: 2, p: 2, overflowX: 'auto', height: '100%' }}>
              {Object.entries(groupedRetrosByType).map(([groupName, groupRetros]) => (
                <Box key={groupName} sx={{ minWidth: 320, maxWidth: 320, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e6e9ef',
                    p: 2,
                    mb: 1,
                    borderTop: `3px solid ${TYPE_COLORS[groupName]?.bg || '#ccc'}`
                  }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>
                      {groupName}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#676879' }}>
                      {groupRetros.length} items
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
                        {groupRetros.map((retro, idx) => (
                          <Draggable key={retro._id || retro.id || idx} draggableId={retro._id || retro.id} index={idx} isDragDisabled={!canEdit}>
                            {(provided, snapshot) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleEditRetro(retro)}
                                sx={{
                                  p: 2,
                                  cursor: 'pointer',
                                  '&:hover': { boxShadow: 2 },
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1
                                }}
                              >
                                <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                                  {retro.feedback}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '10px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                                    {retro.submitter?.name?.[0] || 'U'}
                                  </Avatar>
                                  <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                    {retro.submitter?.name || 'Unknown'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ThumbsUp size={12} color="#666" />
                                    <Typography sx={{ fontSize: '12px', color: '#666' }}>{retro.vote || 0}</Typography>
                                  </Box>
                                  {retro.repeating && <Chip label="Repeating" size="small" variant="outlined" sx={{ height: 18, fontSize: '10px' }} />}
                                </Box>
                              </Paper>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                  <Button
                    startIcon={<Plus size={14} />}
                    sx={{ mt: 1, textTransform: 'none', color: '#676879', fontSize: '13px', justifyContent: 'flex-start' }}
                    onClick={() => {
                      setEditingRetro(null);
                      setIsCreatorOpen(true);
                    }}
                  >
                    Add card
                  </Button>
                </Box>
              ))}
            </Box>
          </DragDropContext>
        );
      default:
        return (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40} sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Feedback</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Submitter</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Repeating?</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Vote</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', borderRight: '1px solid #e6e9ef' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedRetros).map(([groupName, groupRetros]) => (
                  <React.Fragment key={`group-${groupName}`}>
                    <TableRow
                      sx={{
                        bgcolor: '#e6f7ff',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#d6f0ff' }
                      }}
                      onClick={() => toggleGroup(groupName)}
                    >
                      <TableCell colSpan={8} sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {collapsedGroups[groupName] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#323338' }}>
                            {groupName}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#676879', ml: 1 }}>
                            {groupRetros.length} {groupRetros.length === 1 ? 'item' : 'items'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {!collapsedGroups[groupName] && groupRetros.map((retro, index) => (
                      <TableRow
                        key={retro.id || index}
                        sx={{ '&:hover': { bgcolor: '#f6f7fb' } }}
                      >
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}></TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e6e9ef' }}>
                          <Typography sx={{ fontSize: '14px' }}>{retro.feedback}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                              {retro.submitter?.name?.[0] || 'U'}
                            </Avatar>
                            <Typography sx={{ fontSize: '13px' }}>{retro.submitter?.name || 'Anonymous'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={retro.type}
                            size="small"
                            sx={{
                              bgcolor: TYPE_COLORS[retro.type]?.bg || '#c4c4c4',
                              color: TYPE_COLORS[retro.type]?.text || '#ffffff',
                              fontSize: '12px',
                              fontWeight: 500,
                              height: '24px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={retro.repeating ? 'Yes' : 'No'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '11px',
                              height: '22px',
                              borderColor: retro.repeating ? '#e2445c' : '#c4c4c4',
                              color: retro.repeating ? '#e2445c' : '#676879'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleVote(retro.id)}
                              sx={{
                                color: '#0073ea',
                                '&:hover': { bgcolor: '#e6f2ff' }
                              }}
                            >
                              <ThumbsUp size={16} />
                            </IconButton>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0073ea' }}>
                              {retro.vote || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: 'primary.main', border: '2px solid white', boxShadow: '0 0 0 1px #e6e9ef' }}>
                              {retro.owner?.name?.[0] || 'U'}
                            </Avatar>
                            <Typography sx={{ fontSize: '13px' }}>{retro.owner?.name || 'Unassigned'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRetro(retro);
                              }}
                              sx={{ color: '#64748B', '&:hover': { color: '#3B82F6', bgcolor: '#EFF6FF' } }}
                            >
                              <Edit size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRetro(retro._id || retro.id);
                              }}
                              sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!collapsedGroups[groupName] && (
                      <TableRow sx={{ bgcolor: '#fafbfc' }}>
                        <TableCell colSpan={8}>
                          <Button
                            startIcon={<Plus size={14} />}
                            sx={{ textTransform: 'none', fontSize: '13px', color: '#676879' }}
                            onClick={() => setIsCreatorOpen(true)}
                          >
                            Add feedback
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
        onSearch={(query) => setSearchQuery(query)}
        onFilter={(e) => setFilterAnchorEl(e.currentTarget)}
        onCreate={() => {
          setEditingRetro(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New feedback"
        createButtonColor="#ff6b00"
      />

      <RetrospectiveCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateRetro}
        initialData={editingRetro}
      />

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter Feedback</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
              <Select
                multiple
                value={filterType}
                onChange={(e) => setFilterType(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                renderValue={(selected) => selected.length + ' types'}
                displayEmpty
              >
                {Object.keys(TYPE_COLORS).map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={filterType.indexOf(type) > -1} size="small" />
                    <ListItemText primary={type} />
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

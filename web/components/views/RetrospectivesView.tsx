"use client";

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
  Avatar,
  Button,
  IconButton,
  Collapse
} from "@mui/material";
import { ChevronDown, ChevronRight, Plus, ThumbsUp, Trash2, Edit } from "lucide-react";
import { RetrospectiveCreator } from "@/components/creators/RetrospectiveCreator";
import { BoardView } from "./BoardView";
import { GanttView } from "./GanttView";
import { CalendarView } from "./CalendarView";
import { ChartView } from "@/components/views/ChartView";

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

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function RetrospectivesView({ workspaceId, pageId, viewType = 'table' }: RetrospectivesViewProps) {
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

  const [retrospectives, setRetrospectives] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [groupedRetros, setGroupedRetros] = useState<Record<string, any[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [editingRetro, setEditingRetro] = useState<any>(null);

  // Initialize view state - Retrospectives only support Table view for now
  const views = [{ id: 'table', label: 'Main table', type: 'table' }];

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
    fetchRetrospectives();
  }, [workspaceId, pageId]);

  const fetchRetrospectives = async () => {
    try {
      setLoading(true);
      const [retrosRes, sprintsRes] = await Promise.all([
        fetch(`/api/retrospectives?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${teamId}`),
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
        groupRetrosBySprint(retrosData.data, currentSprints);
      } else {
        console.error('Invalid retrospectives data format:', retrosData);
        setRetrospectives([]);
        groupRetrosBySprint([], currentSprints);
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
      default:
        return (
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Feedback</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Submitter</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Repeating?</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Vote</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedRetros).map(([groupName, groupRetros]) => (
                  <>
                    <TableRow
                      key={`group-${groupName}`}
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
                        <TableCell></TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '14px' }}>{retro.feedback}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
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
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
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

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

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
import { ChevronDown, ChevronRight, Plus, ThumbsUp } from "lucide-react";
import { RetrospectiveCreator } from "@/components/creators/RetrospectiveCreator";

interface RetrospectivesViewProps {
  workspaceId: string;
  pageId: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "Discussion": { bg: "#fdab3d", text: "#ffffff" },
  "Improve": { bg: "#ff6b00", text: "#ffffff" },
  "Keep": { bg: "#00c875", text: "#ffffff" }
};

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function RetrospectivesView({ workspaceId, pageId }: RetrospectivesViewProps) {
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
  const [groupedRetros, setGroupedRetros] = useState<Record<string, any[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [editingRetro, setEditingRetro] = useState<any>(null);

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
    fetchRetrospectives();
  }, [workspaceId, pageId]);

  const fetchRetrospectives = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/retrospectives?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${teamId}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setRetrospectives(data.data);
        groupRetrosBySprint(data.data);
      } else {
        console.error('Invalid retrospectives data format:', data);
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

  const handleEditRetro = (retro: any) => {
    setEditingRetro(retro);
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingRetro(null);
  };

  const groupRetrosBySprint = (retroList: any[]) => {
    const grouped: Record<string, any[]> = {};

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
      case 'gantt':
      case 'kanban':
      case 'calendar':
        return (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography color="text.secondary">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)} view is coming soon
            </Typography>
          </Box>
        );
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
                      <TableCell colSpan={7} sx={{ py: 1 }}>
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
                      </TableRow>
                    ))}

                    {!collapsedGroups[groupName] && (
                      <TableRow sx={{ bgcolor: '#fafbfc' }}>
                        <TableCell colSpan={7}>
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
      <ViewTabs
        views={views}
        activeViewId={activeView}
        onViewChange={handleSetActiveView}
        onAddView={handleAddView}
        onRemoveView={handleRemoveView}
      />

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
                  <TableCell colSpan={7} sx={{ py: 1 }}>
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
                  </TableRow>
                ))}

                {!collapsedGroups[groupName] && (
                  <TableRow sx={{ bgcolor: '#fafbfc' }}>
                    <TableCell colSpan={7}>
                      <Button
                        startIcon={<Plus size={14} />}
                        sx={{ textTransform: 'none', fontSize: '13px', color: '#676879' }}
                      >
                        Add feedback
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}

            {retrospectives.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: '#676879' }}>No retrospective items yet. Add your first feedback!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

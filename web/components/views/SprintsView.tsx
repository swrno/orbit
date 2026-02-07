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
  Button,
  Checkbox,
  LinearProgress
} from "@mui/material";
import { Plus } from "lucide-react";

import { SprintCreator } from "@/components/creators/SprintCreator";

interface SprintsViewProps {
  workspaceId: string;
  pageId: string;
}

import { ViewTabs } from "@/components/ui/ViewTabs";
import { ViewToolbar } from "@/components/ui/ViewToolbar";

export function SprintsView({ workspaceId, pageId }: SprintsViewProps) {
  const { workspaces, updatePage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);
  
  // Find the page and group
  let page: any = null;
  let groupId: string | null = null;
  
  if (workspace) {
    for (const group of workspace.groups) {
      const p = group.pages.find(pg => pg.id === pageId);
      if (p) {
        page = p;
        groupId = group.id;
        break;
      }
    }
  }

  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [editingSprint, setEditingSprint] = useState<any>(null);

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

  useEffect(() => {
    fetchSprints();
  }, [workspaceId, pageId]);

  const fetchSprints = async () => {
    // ... existing fetch logic
    try {
      setLoading(true);
      const response = await fetch(`/api/sprints?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${groupId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setSprints(data.data);
      } else {
        console.error('Invalid sprints data format:', data);
        setSprints([]);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateSprint = async (sprintData: any) => {
    try {
      if (!groupId) {
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
        teamId: groupId,
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
    if (!sprint.sprintTimeline) return 0;
    const now = new Date();
    const start = new Date(sprint.sprintTimeline.start);
    const end = new Date(sprint.sprintTimeline.end);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading sprints...</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'gantt':
        return (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography color="text.secondary">Gantt view is coming soon</Typography>
          </Box>
        );
      case 'kanban':
        return (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography color="text.secondary">Kanban board is coming soon</Typography>
          </Box>
        );
      case 'calendar':
        return (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography color="text.secondary">Calendar view is coming soon</Typography>
          </Box>
        );
      default:
        return (
           <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef', mx: 2, my: 2, width: 'auto' }}>
            <Table>
              {/* ... Table content ... */}
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Sprint</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Sprint goals</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Active sprint status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338', minWidth: 200 }}>Sprint timeline</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Connected tasks</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Completed?</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Sprint start date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Sprint end date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sprints.map((sprint, index) => {
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
                      <TableCell>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{sprint.sprint}</Typography>
                      </TableCell>
                      <TableCell>
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
                        <Box sx={{ width: '100%' }}>
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
                        </Box>
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
        onSearch={() => {}}
        onFilter={() => {}}
        onCreate={() => {
          setEditingSprint(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New sprint"
      />

      <SprintCreator 
        open={isCreatorOpen} 
        onClose={handleCloseCreator} 
        onSubmit={handleCreateOrUpdateSprint}
        initialData={editingSprint}
      />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

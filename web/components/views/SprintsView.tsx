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
  const [tasks, setTasks] = useState<any[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, any[]>>({});
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
      // After loading sprints, also load tasks for this workspace/page/team
      try {
        const tResp = await fetch(`/api/tasks?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${groupId}`);
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
    // Dynamic timeline-based progress
    if (!sprint.sprintTimeline && !sprint.sprintStartDate) return 0;
    
    const now = new Date();
    const start = new Date(sprint.sprintTimeline?.start || sprint.sprintStartDate);
    const end = new Date(sprint.sprintTimeline?.end || sprint.sprintEndDate);
    
    // Before sprint starts: 0%
    if (now < start) return 0;
    
    // After sprint ends: 100%
    if (now > end) return 100;
    
    // During sprint: calculate based on elapsed time
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
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
      case 'kanban':
        return (
          <Box sx={{ display: 'flex', gap: 2, p: 2, overflow: 'auto', height: '100%' }}>
            {['Planned', 'Active', 'Completed'].map(status => {
              const statusSprints = sprints.filter(s => s.activeSprintStatus === status);
              return (
                <Box key={status} sx={{ minWidth: 320, maxWidth: 320 }}>
                  <Box sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #e6e9ef', p: 2, mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.5 }}>{status}</Typography>
                    <Typography sx={{ fontSize: '12px', color: '#676879' }}>{statusSprints.length} sprints</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {statusSprints.map((sprint, idx) => {
                      const progress = calculateProgress(sprint);
                      return (
                        <Paper key={sprint._id || idx} onClick={() => handleEditSprint(sprint)} sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 2 } }}>
                          <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>{sprint.sprint}</Typography>
                          <Box sx={{ mb: 1 }}>
                            <Typography sx={{ fontSize: '11px', color: '#676879', mb: 0.5 }}>{Math.round(progress)}%</Typography>
                            <Box sx={{ height: 6, bgcolor: '#e6e9ef', borderRadius: 1, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: '#0073ea' }} />
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: '11px', color: '#676879' }}>
                            {new Date(sprint.sprintStartDate).toLocaleDateString()} - {new Date(sprint.sprintEndDate).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
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
        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Sprint Statistics</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>By Status</Typography>
                {['Planned', 'Active', 'Completed'].map(status => {
                  const count = sprints.filter(s => s.activeSprintStatus === status).length;
                  const colors: Record<string, string> = { Planned: '#fdab3d', Active: '#00c875', Completed: '#c4c4c4' };
                  return (
                    <Box key={status} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '13px' }}>{status}</Typography>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{count}</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: '#e6e9ef', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${sprints.length ? (count / sprints.length) * 100 : 0}%`, bgcolor: colors[status] }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>Sprint Progress</Typography>
                {sprints.slice(0, 5).map(sprint => {
                  const progress = calculateProgress(sprint);
                  return (
                    <Box key={sprint._id} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '13px' }}>{sprint.sprint}</Typography>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{Math.round(progress)}%</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: '#e6e9ef', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: '#0073ea' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
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

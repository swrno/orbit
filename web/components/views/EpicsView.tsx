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
  Collapse
} from "@mui/material";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { EpicCreator } from "@/components/creators/EpicCreator";

interface EpicsViewProps {
  workspaceId: string;
  pageId: string;
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

export function EpicsView({ workspaceId, pageId }: EpicsViewProps) {
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

  const [epics, setEpics] = useState<any[]>([]);
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [editingEpic, setEditingEpic] = useState<any>(null);

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
    fetchEpics();
  }, [workspaceId, pageId]);

  const fetchEpics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/epics?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${groupId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setEpics(data.data);
      } else {
        console.error('Invalid epics data format:', data);
        setEpics([]);
      }
    } catch (error) {
      console.error('Error fetching epics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateEpic = async (epicData: any) => {
    try {
      if (!groupId) {
        console.error('No team/group selected');
        return;
      }
      
      const isUpdate = !!epicData._id;
      const url = '/api/epics';
      const method = isUpdate ? 'PUT' : 'POST';

      const payload = {
        ...epicData,
        workspaceId,
        pageId,
        teamId: groupId,
        id: isUpdate ? epicData._id : undefined
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
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
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef', mx: 2, my: 2, width: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Epic</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Phase</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {epics.map((epic, index) => (
                  <>
                    <TableRow
                      key={epic.id || index}
                      sx={{
                        '&:hover': { bgcolor: '#f6f7fb' },
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        // Prevent edit when clicking expand icon
                        if ((e.target as HTMLElement).closest('.expand-icon')) {
                           toggleEpic(epic.id);
                           return;
                        }
                        handleEditEpic(epic);
                      }}
                    >
                      <TableCell className="expand-icon">
                        {epic.children?.length > 0 && (
                          expandedEpics[epic.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            pl: (epic.hierarchy || 0) * 3
                          }}
                        >
                          {epic.epic}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
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
    
                    {/* Nested Children */}
                    {epic.children?.length > 0 && expandedEpics[epic.id] && epic.children.map((child: any, childIndex: number) => (
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
                            <Avatar sx={{ width: 20, height: 20, fontSize: '10px' }}>
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
                  </>
                ))}
    
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
          setEditingEpic(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New epic"
        createButtonColor="#784bd1"
      />

      <EpicCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateEpic}
        initialData={editingEpic}
      />

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f6f7fb' }}>
              <TableCell width={40}></TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Epic</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Phase</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Priority</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {epics.map((epic, index) => (
              <>
                <TableRow
                  key={epic.id || index}
                  sx={{
                    '&:hover': { bgcolor: '#f6f7fb' },
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('.expand-icon')) {
                        toggleEpic(epic.id);
                        return;
                    }
                    handleEditEpic(epic);
                  }}
                >
                  <TableCell className="expand-icon">
                    {epic.children?.length > 0 && (
                      expandedEpics[epic.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        pl: (epic.hierarchy || 0) * 3
                      }}
                    >
                      {epic.epic}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
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

                {/* Nested Children */}
                {epic.children?.length > 0 && expandedEpics[epic.id] && epic.children.map((child: any, childIndex: number) => (
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
                        <Avatar sx={{ width: 20, height: 20, fontSize: '10px' }}>
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
              </>
            ))}

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
    </Box>
  );
}

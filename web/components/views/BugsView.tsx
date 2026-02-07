"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
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
  Button,
  Collapse
} from "@mui/material";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { BugCreator } from "@/components/creators/BugCreator";

interface BugsViewProps {
  workspaceId: string;
  pageId: string;
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

export function BugsView({ workspaceId, pageId }: BugsViewProps) {
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

  const [bugs, setBugs] = useState<any[]>([]);
  const [groupedBugs, setGroupedBugs] = useState<Record<string, any[]>>({
    "Incoming Bugs": [],
    "Development Work": [],
    "Resolved": []
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const [editingBug, setEditingBug] = useState<any>(null);

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
    fetchBugs();
  }, [workspaceId, pageId]);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bugs?workspaceId=${workspaceId}&pageId=${pageId}&teamId=${groupId}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBugs(data.data);
        groupBugsByStatus(data.data);
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
      if (!groupId) {
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
        teamId: groupId,
        id: isUpdate ? bugData._id : undefined // api expects 'id' for updates
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

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading bugs...</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'kanban':
        return (
          <Box sx={{ display: 'flex', gap: 2, p: 2, overflow: 'auto', height: '100%' }}>
            {Object.entries(groupedBugs).map(([groupName, groupBugs]) => (
              <Box key={groupName} sx={{ minWidth: 320, maxWidth: 320 }}>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {groupBugs.map((bug, idx) => (
                    <Paper
                      key={bug._id || idx}
                      onClick={() => handleEditBug(bug)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 }
                      }}
                    >
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, mb: 1 }}>
                        {bug.bug}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={bug.priority} size="small" sx={{
                          bgcolor: PRIORITY_COLORS[bug.priority]?.bg,
                          color: PRIORITY_COLORS[bug.priority]?.text,
                          fontSize: '11px'
                        }} />
                        <Chip label={bug.status} size="small" sx={{ fontSize: '11px' }} />
                      </Box>
                      <Typography sx={{ fontSize: '11px', color: '#676879', fontFamily: 'monospace' }}>
                        {bug.bugId}
                      </Typography>
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
            <Typography variant="h6" sx={{ mb: 2 }}>Bug Calendar View</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Box key={day} sx={{ p: 1, textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>
                  {day}
                </Box>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <Box key={i} sx={{
                  aspectRatio: '1',
                  border: '1px solid #e6e9ef',
                  borderRadius: 1,
                  p: 1,
                  fontSize: '12px'
                }}>
                  {i + 1}
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 'gantt':
        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Bug Timeline (Gantt)</Typography>
            {bugs.map((bug, idx) => (
              <Box key={bug._id || idx} sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '13px', mb: 0.5 }}>{bug.bug}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    height: 24,
                    bgcolor: PRIORITY_COLORS[bug.priority]?.bg || '#e6e9ef',
                    borderRadius: 1,
                    width: `${Math.random() * 60 + 20}%`,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1
                  }}>
                    <Typography sx={{ fontSize: '11px', color: 'white' }}>
                      {bug.status}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 'chart':
        return (
          <Box sx={{ p: 3, bgcolor: 'white', m: 2, borderRadius: 1, border: '1px solid #e6e9ef' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Bug Statistics</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>By Priority</Typography>
                {Object.keys(PRIORITY_COLORS).map(priority => {
                  const count = bugs.filter(b => b.priority === priority).length;
                  return (
                    <Box key={priority} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '13px' }}>{priority}</Typography>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{count}</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: '#e6e9ef', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{
                          height: '100%',
                          width: `${(count / bugs.length) * 100}%`,
                          bgcolor: PRIORITY_COLORS[priority].bg
                        }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2 }}>By Status</Typography>
                {Object.keys(groupedBugs).map(group => {
                  const count = groupedBugs[group].length;
                  return (
                    <Box key={group} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '13px' }}>{group}</Typography>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{count}</Typography>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: '#e6e9ef', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{
                          height: '100%',
                          width: `${(count / bugs.length) * 100}%`,
                          bgcolor: GROUP_COLORS[group]
                        }} />
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
              <TableHead>
                <TableRow sx={{ bgcolor: '#f6f7fb' }}>
                  <TableCell width={40}></TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Bug</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Reporter</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Time until resolution</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Connected tasks</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '13px', color: '#323338' }}>Bug ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedBugs).map(([groupName, groupBugs]) => (
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
                            {groupBugs.length}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {!collapsedGroups[groupName] && groupBugs.map((bug, index) => (
                      <TableRow
                        key={bug.id || index}
                        sx={{
                          '&:hover': { bgcolor: '#f6f7fb' },
                          borderLeft: `4px solid ${GROUP_COLORS[groupName]}`
                        }}
                      >
                        <TableCell></TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '14px' }}>{bug.bug}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
                              {bug.reporter?.name?.[0] || 'U'}
                            </Avatar>
                            <Typography sx={{ fontSize: '13px' }}>{bug.reporter?.name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', color: '#676879' }}>
                            {bug.timeUntilResolution || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
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
                        <TableCell>
                          <Typography sx={{ fontSize: '13px' }}>
                            {bug.connectedTasks?.length || 0} tasks
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '13px', fontFamily: 'monospace', color: '#676879' }}>
                            {bug.bugId}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!collapsedGroups[groupName] && (
                      <TableRow sx={{ bgcolor: '#fafbfc', borderLeft: `4px solid ${GROUP_COLORS[groupName]}` }}>
                        <TableCell colSpan={8}>
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
          setEditingBug(null);
          setIsCreatorOpen(true);
        }}
        createButtonLabel="New bug"
        createButtonColor="#e2445c"
      />

      <BugCreator
        open={isCreatorOpen}
        onClose={handleCloseCreator}
        onSubmit={handleCreateOrUpdateBug}
        initialData={editingBug}
      />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

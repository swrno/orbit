"use client";

import { useEffect, useState } from "react";
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
                  <>
                    <TableRow
                      key={`group-${groupName}`}
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
        onSearch={() => {}}
        onFilter={() => {}}
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

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e6e9ef' }}>
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
              <>
                <TableRow
                  key={`group-${groupName}`}
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
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f6f7fb' },
                      borderLeft: `4px solid ${GROUP_COLORS[groupName]}`
                    }}
                    onClick={() => handleEditBug(bug)}
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
                          onClick={() => {
                            setEditingBug(null);
                            setIsCreatorOpen(true);
                          }}
                        >
                          Add bug
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

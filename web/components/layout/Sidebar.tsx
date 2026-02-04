"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, LayoutGrid, Plus, Search, Settings, Sparkles, Table, Kanban, FileText, Trash2, Home, Pencil, Folder, Layers, Calendar, Users, Bug } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";
import { SearchModal } from "@/components/search/SearchModal";

export function Sidebar() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;

  const { workspaces, addGroup, addPage, deleteGroup, renameGroup, renamePage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; groupId: string | null; groupTitle: string }>({
    open: false,
    groupId: null,
    groupTitle: ''
  });

  const [addGroupDialog, setAddGroupDialog] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');

  const [addPageDialog, setAddPageDialog] = useState<{ open: boolean; groupId: string | null }>({
    open: false,
    groupId: null
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPageType, setNewPageType] = useState<'board' | 'table' | 'document'>('board');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageGroup, setNewPageGroup] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [pageType, setPageType] = useState<'board' | 'table' | 'document'>('document');


  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(workspace?.groups.map(g => g.id) || []));




  if (!workspace) return null;

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleGroupClick = (group: any) => {
    toggleGroupExpansion(group.id);
  };

  const handleAddGroup = () => {
    setAddGroupDialog(true);
  };

  const confirmAddGroup = () => {
    if (groupTitle.trim()) {
      addGroup(workspace.id, groupTitle.trim());
      setGroupTitle('');
      setAddGroupDialog(false);
    }
  };

  const cancelAddGroup = () => {
    setGroupTitle('');
    setAddGroupDialog(false);
  };

  const handleAddPage = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setAddPageDialog({ open: true, groupId });
  };

  const confirmAddPage = () => {
    if (pageTitle.trim() && addPageDialog.groupId) {
      addPage(workspaceId, addPageDialog.groupId, pageTitle.trim(), pageType);
      setPageTitle('');
      setPageType('document');
      setAddPageDialog({ open: false, groupId: null });
    }
  };

  const cancelAddPage = () => {
    setPageTitle('');
    setPageType('document');
    setAddPageDialog({ open: false, groupId: null });
  };

  const handleStartRename = (e: React.MouseEvent, groupId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingGroupId(groupId);
    setEditingGroupTitle(currentTitle);
  };

  const handleConfirmRename = () => {
    if (editingGroupId && editingGroupTitle.trim()) {
      renameGroup(workspaceId, editingGroupId, editingGroupTitle.trim());
      setEditingGroupId(null);
      setEditingGroupTitle('');
    }
  };

  const handleCancelRename = () => {
    setEditingGroupId(null);
    setEditingGroupTitle('');
  };

  const handleStartPageRename = (e: React.MouseEvent, groupId: string, pageId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingPageId(pageId);
    setEditingPageTitle(currentTitle);
  };

  const handleConfirmPageRename = (groupId: string) => {
    if (editingPageId && editingPageTitle.trim()) {
      renamePage(workspaceId, groupId, editingPageId, editingPageTitle.trim());
      setEditingPageId(null);
      setEditingPageTitle('');
    }
  };

  const handleCancelPageRename = () => {
    setEditingPageId(null);
    setEditingPageTitle('');
  };

  const handleDeleteGroup = (e: React.MouseEvent, groupId: string, groupTitle: string) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, groupId, groupTitle });
  };

  const confirmDelete = () => {
    if (deleteDialog.groupId) {
      deleteGroup(workspaceId, deleteDialog.groupId);
      setDeleteDialog({ open: false, groupId: null, groupTitle: '' });
      // Navigate to first available page if current group is deleted
      const firstGroup = workspace.groups.find((g: { id: string; pages: any[] }) => g.id !== deleteDialog.groupId && g.pages.length > 0);
      if (firstGroup && firstGroup.pages.length > 0) {
        router.push(`/${workspaceId}/${firstGroup.pages[0].id}`);
      } else {
        router.push(`/${workspaceId}`);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, groupId: null, groupTitle: '' });
  };

  const activeGroupId = workspace.groups.find(g => g.pages.some(p => p.id === pageId))?.id;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Workspace Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          component={Link}
          href="/dashboard"
          prefetch={true}
          sx={{ borderRadius: 2, px: 2, py: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: 1,
              bgcolor: 'primary.main', color: 'primary.contrastText',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', boxShadow: 2
            }}>
              {workspace.title.charAt(0)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {workspace.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {workspace.plan} Plan
              </Typography>
            </Box>
            <LayoutGrid size={16} className="text-zinc-400" />
          </Box>
        </ListItemButton>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<Search size={16} />}
          onClick={() => setSearchOpen(true)}
          sx={{
            justifyContent: 'flex-start',
            color: 'text.secondary',
            borderColor: 'divider',
            textTransform: 'none',
            backgroundColor: 'action.hover',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.selected'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span>Search or ask AI...</span>
            <Typography variant="caption" sx={{ border: '1px solid', borderColor: 'divider', px: 0.5, borderRadius: 0.5 }}>⌘K</Typography>
          </Box>
        </Button>
      </Box>

      {/* Index Navigation */}
      <List sx={{ px: 2, pb: 1 }}>
        <ListItemButton
          component={Link}
          href={`/${workspaceId}`}
          prefetch={true}
          selected={!pageId}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.selected' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <Home size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Index"
            primaryTypographyProps={{ variant: 'body2', fontWeight: !pageId ? 600 : 400 }}
          />
          {!pageId && <ChevronRight size={16} className="opacity-50" />}
        </ListItemButton>

        <ListItemButton
          component={Link}
          href={`/${workspaceId}/backlog`}
          prefetch={true}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.selected' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <Layers size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Backlog"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          href={`/${workspaceId}/epics`}
          prefetch={true}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.selected' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <LayoutGrid size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Epics"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          href={`/${workspaceId}/sprints`}
          prefetch={true}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.selected' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <Calendar size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Sprints"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>
        <ListItemButton
          component={Link}
          href={`/${workspaceId}/bugs`}
          prefetch={true}
          sx={{
            borderRadius: 1,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              "&:hover": { bgcolor: "action.selected" }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <Bug size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Bugs"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItemButton>


        <ListItemButton
          component={Link}
          href={`/${workspaceId}/reports`}
          prefetch={true}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.selected' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <Sparkles size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Reports"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          href={`/${workspaceId}/team`}
          prefetch={true}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
              '&:hover': { bgcolor: 'action.selected' }
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <Users size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Team"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>
      </List>

      {/* Group List - Folder Style */}
      <List sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ px: 2, mb: 1, display: 'block', letterSpacing: 1 }}>
          GROUPS
        </Typography>

        {workspace.groups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const isEditing = editingGroupId === group.id;

          return (
            <Box key={group.id} sx={{ mb: 0.5 }}>
              {/* Group Header */}
              {isEditing ? (
                // Inline Edit Mode for Group
                <Box sx={{ px: 2, py: 1 }}>
                  <TextField
                    autoFocus
                    size="small"
                    fullWidth
                    value={editingGroupTitle}
                    onChange={(e) => setEditingGroupTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmRename();
                      } else if (e.key === 'Escape') {
                        handleCancelRename();
                      }
                    }}
                    onBlur={handleConfirmRename}
                    sx={{
                      '& .MuiInputBase-input': {
                        py: 0.5,
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                </Box>
              ) : (
                // Normal Display Mode for Group
                <Box sx={{ position: 'relative' }}>
                  <ListItemButton
                    onClick={() => handleGroupClick(group)}
                    sx={{
                      borderRadius: 1,
                      pr: 6,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Folder size={16} />
                    </ListItemIcon>
                    <ListItemText
                      primary={group.title}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500, noWrap: true }}
                    />
                  </ListItemButton>

                  <Box sx={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '.MuiBox-root:hover &': { opacity: 1 }
                  }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleStartRename(e, group.id, group.title)}
                      sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleAddPage(e, group.id)}
                      sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <Plus size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteGroup(e, group.id, group.title)}
                      sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Pages under this group */}
              {isExpanded && group.pages.length > 0 && (
                <List sx={{ pl: 4, py: 0 }}>
                  {group.pages.map((page) => {
                    const isPageEditing = editingPageId === page.id;
                    const isPageActive = pageId === page.id;
                    const PageIcon = page.type === 'board' ? Kanban : page.type === 'table' ? Table : FileText;

                    return (
                      <Box key={page.id} sx={{ position: 'relative', mb: 0.5 }}>
                        {isPageEditing ? (
                          // Inline Edit Mode for Page
                          <Box sx={{ px: 2, py: 0.5 }}>
                            <TextField
                              autoFocus
                              size="small"
                              fullWidth
                              value={editingPageTitle}
                              onChange={(e) => setEditingPageTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleConfirmPageRename(group.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelPageRename();
                                }
                              }}
                              onBlur={() => handleConfirmPageRename(group.id)}
                              sx={{
                                '& .MuiInputBase-input': {
                                  py: 0.5,
                                  fontSize: '0.875rem'
                                }
                              }}
                            />
                          </Box>
                        ) : (
                          // Normal Display Mode for Page
                          <>
                            <ListItemButton
                              component={Link}
                              href={`/${workspaceId}/${page.id}`}
                              selected={isPageActive}
                              sx={{
                                borderRadius: 1,
                                pr: 4,
                                '&.Mui-selected': {
                                  bgcolor: 'action.selected',
                                  '&:hover': { bgcolor: 'action.selected' }
                                }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <PageIcon size={16} />
                              </ListItemIcon>
                              <ListItemText
                                primary={page.title}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: isPageActive ? 600 : 400, noWrap: true }}
                              />
                              {isPageActive && <ChevronRight size={16} className="opacity-50" />}
                            </ListItemButton>

                            <Box sx={{
                              position: 'absolute',
                              right: 4,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              display: 'flex',
                              gap: 0.5,
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '.MuiBox-root:hover &': { opacity: 1 }
                            }}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleStartPageRename(e, group.id, page.id, page.title)}
                                sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                              >
                                <Pencil size={14} />
                              </IconButton>
                            </Box>
                          </>
                        )}
                      </Box>
                    );
                  })}
                </List>
              )}
            </Box>
          );
        })}


        <ListItemButton onClick={handleAddGroup} sx={{ borderRadius: 1, color: 'text.secondary', mt: 1 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Plus size={16} />
          </ListItemIcon>
          <ListItemText primary="Add Group" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItemButton>
      </List>


      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <List dense disablePadding>
          <ListItemButton sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Settings size={16} />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Sparkles size={16} />
            </ListItemIcon>
            <ListItemText primary="Templates" primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
        </List>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Group?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the group "{deleteDialog.groupTitle}"? This action cannot be undone and will delete all pages within this group.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={addGroupDialog} onClose={cancelAddGroup} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Title"
            type="text"
            fullWidth
            variant="outlined"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                confirmAddGroup();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAddGroup} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmAddGroup} variant="contained" disabled={!groupTitle.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Page Dialog */}
      <Dialog open={addPageDialog.open} onClose={cancelAddPage} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Page</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Page Title"
            type="text"
            fullWidth
            variant="outlined"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                confirmAddPage();
              }
            }}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Document Type
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={pageType === 'board' ? 'contained' : 'outlined'}
              onClick={() => setPageType('board')}
              startIcon={<Kanban size={18} />}
              sx={{ flex: 1 }}
            >
              Board
            </Button>
            <Button
              variant={pageType === 'table' ? 'contained' : 'outlined'}
              onClick={() => setPageType('table')}
              startIcon={<Table size={18} />}
              sx={{ flex: 1 }}
            >
              Table
            </Button>
            <Button
              variant={pageType === 'document' ? 'contained' : 'outlined'}
              onClick={() => setPageType('document')}
              startIcon={<FileText size={18} />}
              sx={{ flex: 1 }}
            >
              Document
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelAddPage} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmAddPage} variant="contained" disabled={!pageTitle.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {/* Search Modal */}
      <SearchModal 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        workspaceId={workspaceId} 
      />

    </Drawer>
  );
}

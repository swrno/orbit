"use client";

import { Header } from "@/components/layout/Header";
import { useParams } from "next/navigation";
import { RecentGroups } from "@/components/dashboard/RecentGroups";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { BoardList } from "@/components/dashboard/BoardList";
import { Box, Container, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, InputLabel } from "@mui/material";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FolderPlus, FilePlus, Kanban, Table as TableIcon, FileText } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [currentTab, setCurrentTab] = useState('boards');
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  
  const [addGroupDialog, setAddGroupDialog] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  
  const [addPageDialog, setAddPageDialog] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageType, setPageType] = useState<'board' | 'table' | 'document'>('document');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  
  const { addGroup, addPage, workspaces } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateGroup = () => {
    setAddGroupDialog(true);
    handleCloseMenu();
  };

  const confirmAddGroup = () => {
    if (groupTitle.trim()) {
      addGroup(workspaceId, groupTitle.trim());
      setGroupTitle('');
      setAddGroupDialog(false);
    }
  };

  const cancelAddGroup = () => {
    setGroupTitle('');
    setAddGroupDialog(false);
  };

  const handleCreatePage = () => {
    if (!workspace || workspace.groups.length === 0) {
      alert("Please create a group first before adding pages.");
      handleCloseMenu();
      return;
    }
    setSelectedGroupId(workspace.groups[0].id);
    setAddPageDialog(true);
    handleCloseMenu();
  };

  const confirmAddPage = () => {
    if (pageTitle.trim() && selectedGroupId) {
      addPage(workspaceId, selectedGroupId, pageTitle.trim(), pageType);
      setPageTitle('');
      setPageType('document');
      setSelectedGroupId('');
      setAddPageDialog(false);
    }
  };

  const cancelAddPage = () => {
    setPageTitle('');
    setPageType('document');
    setSelectedGroupId('');
    setAddPageDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Header />
      <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
        <Container maxWidth="lg">
            
            {/* Page Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h5" fontWeight={600}>
                    For you
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCreateClick}
                >
                    Create
                </Button>
                <Menu
                  anchorEl={createMenuAnchor}
                  open={Boolean(createMenuAnchor)}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleCreateGroup}>
                    <ListItemIcon>
                      <FolderPlus size={18} />
                    </ListItemIcon>
                    <ListItemText primary="New Group" />
                  </MenuItem>
                  <MenuItem onClick={handleCreatePage}>
                    <ListItemIcon>
                      <FilePlus size={18} />
                    </ListItemIcon>
                    <ListItemText primary="New Page" />
                  </MenuItem>
                </Menu>
            </Box>

            <RecentGroups workspaceId={workspaceId} />

            <DashboardTabs currentTab={currentTab} onTabChange={setCurrentTab} />

            {currentTab === 'boards' && (
                <BoardList workspaceId={workspaceId} />
            )}
        </Container>
      </Box>

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
      <Dialog open={addPageDialog} onClose={cancelAddPage} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Page</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Select Group</InputLabel>
            <Select
              native
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value as string)}
              label="Select Group"
            >
              {workspace?.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <TextField
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
              startIcon={<TableIcon size={18} />}
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
          <Button onClick={confirmAddPage} variant="contained" disabled={!pageTitle.trim() || !selectedGroupId}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

"use client";

import { Header } from "@/components/layout/Header";
import { useParams } from "next/navigation";
import { RecentGroups } from "@/components/dashboard/RecentGroups";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { BoardList } from "@/components/dashboard/BoardList";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { SprintManagement } from "@/components/dashboard/SprintManagement";
import { Box, Container, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, InputLabel, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FolderPlus, FilePlus, Kanban, Table as TableIcon, FileText, Calendar, LayoutGrid, Users, Settings } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [currentTab, setCurrentTab] = useState(0);
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

  const tabs = [
    { label: 'Overview', icon: <LayoutGrid size={18} /> },
    { label: 'Sprints', icon: <Calendar size={18} /> },
    { label: 'Team', icon: <Users size={18} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <Header />
      <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
        <Container maxWidth="lg">

          {/* Page Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              {workspace?.title || 'Workspace'}
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

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, v) => setCurrentTab(v)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 48,
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.icon}
                      {tab.label}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          {currentTab === 0 && (
            <>
              <QuickStats workspaceId={workspaceId} />
              <RecentGroups workspaceId={workspaceId} />
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
                  All Boards & Tables
                </Typography>
                <BoardList workspaceId={workspaceId} />
              </Box>
            </>
          )}

          {currentTab === 1 && (
            <SprintManagement workspaceId={workspaceId} />
          )}

          {currentTab === 2 && (
            <TeamManagement workspaceId={workspaceId} />
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

// Team Management Component
function TeamManagement({ workspaceId }: { workspaceId: string }) {
  const { workspaces, addTeamMember, updateTeamMember, removeTeamMember } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');

  if (!workspace) return null;

  const handleAdd = () => {
    if (name.trim() && email.trim()) {
      addTeamMember(workspaceId, { name, email, role });
      closeDialog();
    }
  };

  const handleUpdate = () => {
    if (editingMember && name.trim() && email.trim()) {
      updateTeamMember(workspaceId, editingMember.id, { name, email, role });
      closeDialog();
    }
  };

  const handleRemove = (memberId: string) => {
    if (confirm('Remove this team member?')) {
      removeTeamMember(workspaceId, memberId);
    }
  };

  const openEdit = (member: any) => {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingMember(null);
    setName('');
    setEmail('');
    setRole('member');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Team Members
        </Typography>
        <Button
          variant="contained"
          startIcon={<Users size={18} />}
          onClick={() => setDialogOpen(true)}
        >
          Add Member
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {workspace.teamMembers.map((member) => (
          <Box
            key={member.id}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.light',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1.2rem'
              }}
            >
              {member.name.charAt(0)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {member.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {member.email}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: member.role === 'admin' ? '#fee2e2' : member.role === 'member' ? '#dbeafe' : '#f1f5f9',
                    color: member.role === 'admin' ? '#991b1b' : member.role === 'member' ? '#1e40af' : '#475569',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                >
                  {member.role}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => openEdit(member)}>Edit</Button>
              <Button size="small" color="error" onClick={() => handleRemove(member.id)}>Remove</Button>
            </Box>
          </Box>
        ))}
      </Box>

      {workspace.teamMembers.length === 0 && (
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom>
            No Team Members Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add team members to collaborate on this workspace.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Users size={18} />}
            onClick={() => setDialogOpen(true)}
          >
            Add First Member
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMember ? 'Edit Member' : 'Add Team Member'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                native
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                label="Role"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="inherit">Cancel</Button>
          <Button
            onClick={editingMember ? handleUpdate : handleAdd}
            variant="contained"
            disabled={!name.trim() || !email.trim()}
          >
            {editingMember ? 'Save Changes' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

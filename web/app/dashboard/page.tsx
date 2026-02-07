"use client";

import { useAppStore, Workspace } from "@/lib/store";
import { Plus, LayoutGrid, ArrowRight, MoreVertical, Star, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Navbar } from "@/components/layout/Navbar";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

export default function Dashboard() {
  const { workspaces, createWorkspace, selectWorkspace, updateWorkspace, deleteWorkspace } = useAppStore();
  const router = useRouter();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; workspaceId: string } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; workspaceId: string; name: string }>({
    open: false,
    workspaceId: "",
    name: ""
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      setIsCreating(false);
    }
  };

  const handleSelect = (id: string) => {
    selectWorkspace(id);
    router.push(`/${id}`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workspaceId: string) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, workspaceId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleRenameClick = () => {
    if (menuAnchor) {
      const workspace = workspaces.find(w => w.id === menuAnchor.workspaceId);
      if (workspace) {
        setRenameDialog({ open: true, workspaceId: workspace.id, name: workspace.title });
      }
    }
    handleMenuClose();
  };

  const handleRenameSubmit = () => {
    if (renameDialog.name.trim()) {
      updateWorkspace(renameDialog.workspaceId, {
        title: renameDialog.name,
        name: renameDialog.name
      });
      setRenameDialog({ open: false, workspaceId: "", name: "" });
    }
  };

  const handleDeleteClick = () => {
    if (menuAnchor) {
      const workspace = workspaces.find(w => w.id === menuAnchor.workspaceId);
      if (workspace && confirm(`Are you sure you want to delete "${workspace.title}"? This cannot be undone.`)) {
        deleteWorkspace(menuAnchor.workspaceId);
      }
    }
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Workspaces Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Your Workspaces
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 3
            }}
          >
            {workspaces.map((ws: Workspace) => (
              <Paper
                key={ws.id}
                elevation={0}
                onClick={() => handleSelect(ws.id)}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Top Border Accent */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: '8px 8px 0 0',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '.MuiPaper-root:hover &': {
                      opacity: 1
                    }
                  }}
                />

                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.25rem'
                    }}
                  >
                    {ws.title.charAt(0)}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {ws.plan === 'Pro' && (
                      <Chip
                        label="PRO"
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, ws.id)}
                    >
                      <MoreVertical size={16} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Content */}
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {ws.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {ws.groups.length} Groups • {ws.groups.reduce((acc, g) => acc + g.pages.length, 0)} Pages
                </Typography>

                {/* Footer */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'primary.main',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  Open Workspace
                  <ArrowRight
                    size={16}
                    style={{
                      marginLeft: 8,
                      transition: 'transform 0.2s'
                    }}
                  />
                </Box>
              </Paper>
            ))}

            {/* Create New Workspace Card */}
            {isCreating ? (
              <Paper
                component="form"
                onSubmit={handleCreate}
                elevation={0}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <TextField
                  autoFocus
                  fullWidth
                  placeholder="Workspace Name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="small"
                  >
                    Create
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    size="small"
                    color="inherit"
                  >
                    Cancel
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                onClick={() => setIsCreating(true)}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <Plus size={28} />
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  Create New Workspace
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Recent Activity */}
        <RecentActivity />
      </Container>

      {/* Workspace Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <Pencil size={16} />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={16} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false, workspaceId: "", name: "" })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Rename Workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Workspace Name"
            value={renameDialog.name}
            onChange={(e) => setRenameDialog({ ...renameDialog, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setRenameDialog({ open: false, workspaceId: "", name: "" });
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog({ open: false, workspaceId: "", name: "" })}>
            Cancel
          </Button>
          <Button onClick={handleRenameSubmit} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

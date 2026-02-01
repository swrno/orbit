"use client";

import { Header } from "@/components/layout/Header";
import { useParams } from "next/navigation";
import { RecentGroups } from "@/components/dashboard/RecentGroups";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { BoardList } from "@/components/dashboard/BoardList";
import { Box, Container, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FolderPlus, FilePlus } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [currentTab, setCurrentTab] = useState('boards');
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  
  const { addGroup, addPage, workspaces } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateGroup = () => {
    const title = prompt("Enter group title:");
    if (title) {
      addGroup(workspaceId, title);
    }
    handleCloseMenu();
  };

  const handleCreatePage = () => {
    if (!workspace || workspace.groups.length === 0) {
      alert("Please create a group first before adding pages.");
      handleCloseMenu();
      return;
    }
    
    const groupTitle = prompt("Select a group by entering its title:");
    if (!groupTitle) {
      handleCloseMenu();
      return;
    }
    
    const group = workspace.groups.find(g => g.title.toLowerCase() === groupTitle.toLowerCase());
    if (!group) {
      alert(`Group "${groupTitle}" not found.`);
      handleCloseMenu();
      return;
    }
    
    const pageTitle = prompt("Enter page title:");
    if (pageTitle) {
      addPage(workspaceId, group.id, pageTitle, 'document');
    }
    handleCloseMenu();
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
    </div>
  );
}

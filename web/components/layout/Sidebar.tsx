"use client";

import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronRight, LayoutGrid, Plus, Search, Settings, Sparkles, Table, Kanban, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, IconButton, Button } from "@mui/material";

export function Sidebar() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;
  
  const { workspaces, addGroup, addPage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) return null;

  const handleGroupClick = (group: any) => {
    if (group.pages.length > 0) {
        router.push(`/${workspaceId}/${group.pages[0].id}`);
    } else {
        alert("This group has no pages. Please add one via the + button.");
    }
  };

  const handleAddGroup = () => {
    const title = prompt("Enter group title:");
    if (title) {
        addGroup(workspace.id, title);
    }
  };

  const handleAddPage = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    const title = prompt("Enter page title:");
    if (title) {
        addPage(workspaceId, groupId, title, 'document');
    }
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

      {/* Group List */}
      <List sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ px: 2, mb: 1, display: 'block', letterSpacing: 1 }}>
            GROUPS
        </Typography>
        
        {workspace.groups.map((group) => {
            const isActive = group.id === activeGroupId;
            return (
                <Box key={group.id} sx={{ position: 'relative', mb: 0.5 }}>
                   <ListItemButton
                        onClick={() => handleGroupClick(group)}
                        selected={isActive}
                        sx={{ 
                            borderRadius: 1, 
                            pr: 6,
                            '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', '&:hover': { bgcolor: 'primary.light' } }
                        }}
                   >
                        <ListItemText 
                            primary={group.title} 
                            primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 600 : 400, noWrap: true }} 
                        />
                        {isActive && <ChevronRight size={16} className="opacity-50" />}
                   </ListItemButton>
                   
                   <IconButton
                        size="small"
                        onClick={(e) => handleAddPage(e, group.id)}
                        sx={{ 
                            position: 'absolute', 
                            right: 4, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '.MuiBox-root:hover &': { opacity: 1 } 
                        }}
                   >
                        <Plus size={14} />
                   </IconButton>
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
    </Drawer>
  );
}

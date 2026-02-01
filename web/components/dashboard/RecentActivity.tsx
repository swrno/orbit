"use client";

import { useAppStore, Workspace, Group, Page } from "@/lib/store";
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Chip } from "@mui/material";
import { Clock, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function RecentActivity() {
  const { workspaces } = useAppStore();
  const router = useRouter();
  
  // Flatten all pages from all workspaces with their workspace context
  const allPages: Array<{ page: Page; workspace: Workspace; group: Group }> = [];
  
  workspaces.forEach((ws: Workspace) => {
    ws.groups.forEach((g: Group) => {
      g.pages.forEach((p: Page) => {
        allPages.push({ page: p, workspace: ws, group: g });
      });
    });
  });

  // For now, show the first 5 pages as "recent"
  // In a real app, this would be based on actual access timestamps
  const recentItems = allPages.slice(0, 5);

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Recent Activity
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <List sx={{ p: 0 }}>
          {recentItems.map(({ page, workspace, group }, index) => (
            <ListItem
              key={`${workspace.id}-${group.id}-${page.id}`}
              disablePadding
              sx={{
                borderBottom: index < recentItems.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              <ListItemButton
                onClick={() => router.push(`/${workspace.id}/${page.id}`)}
                sx={{ py: 2 }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}
                  >
                    <FileText size={20} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={500}>
                      {page.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={workspace.title}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {group.title}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <Clock size={14} />
                  <Typography variant="caption">Just now</Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

"use client";

import { useAppStore, Workspace } from "@/lib/store";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import { useRouter } from "next/navigation";

interface RecentGroupsProps {
  workspaceId: string;
}

export function RecentGroups({ workspaceId }: RecentGroupsProps) {
  const { workspaces } = useAppStore();
  const workspace = workspaces.find((w: Workspace) => w.id === workspaceId);
  const router = useRouter();

  if (!workspace) return null;

  // Get groups from the workspace
  const groups = workspace.groups;

  if (groups.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          Recent groups
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No groups yet. Create your first group to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Recent groups
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {groups.map((group: { id: string; title: string; pages: { id: string; title: string; type: string }[] }) => {
          // Count pages in this group
          const pageCount = group.pages.length;
          
          // Count tasks for different page types
          const boardPages = group.pages.filter((p: { type: string }) => p.type === 'board').length;
          const tablePages = group.pages.filter((p: { type: string }) => p.type === 'table').length;
          const docPages = group.pages.filter((p: { type: string }) => p.type === 'document').length;

          return (
            <Box 
              key={group.id}
              sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}
            >
              <Paper 
                elevation={0}
                onClick={() => {
                  // Navigate to first page in the group if it exists
                  if (group.pages.length > 0) {
                    const firstPage = group.pages[0];
                    router.push(`/${workspaceId}/${firstPage.id}`);
                  }
                }}
                sx={{ 
                  p: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar 
                    variant="rounded" 
                    sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                  >
                    {group.title.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                      {group.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Quick links
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    Board pages <span>{boardPages}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    Table pages <span>{tablePages}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    Document pages <span>{docPages}</span>
                  </Typography>
                </Box>
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

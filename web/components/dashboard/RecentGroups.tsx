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

  // Get teams from the workspace
  const teams = workspace.teams || [];

  if (teams.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
          Recent Teams
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No teams yet. Create your first team to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Recent Teams
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {teams.map((team: { id: string; title: string; pages: { id: string; title: string; type: string }[] }) => {
          // Count pages in this team
          const pageCount = team.pages.length;
          
          // Count tasks for different page types
          const boardPages = team.pages.filter((p: { type: string }) => p.type === 'board').length;
          const tablePages = team.pages.filter((p: { type: string }) => p.type === 'table').length;
          const docPages = team.pages.filter((p: { type: string }) => p.type === 'document').length;

          return (
            <Box 
              key={team.id}
              sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}
            >
              <Paper 
                elevation={0}
                onClick={() => {
                  // Navigate to first page in the group if it exists
                  if (team.pages.length > 0) {
                    const firstPage = team.pages[0];
                    router.push(`/${workspaceId}/${team.id}/${firstPage.id}`);
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
                    {team.title.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                      {team.title}
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

"use client";

import { useAppStore, Workspace } from "@/lib/store";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import { useRouter } from "next/navigation";

interface RecentSpacesProps {
  workspaceId: string;
}

export function RecentSpaces({ workspaceId }: RecentSpacesProps) {
  const { workspaces } = useAppStore();
  const workspace = workspaces.find((w: Workspace) => w.id === workspaceId);
  const router = useRouter();

  if (!workspace) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Recent spaces
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
          <Paper 
            elevation={0}
            onClick={() => {}}
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
                    src="/placeholder-logo.png" // Ideally this would be dynamic
                    sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                >
                    {workspace.title.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                        {workspace.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Team-managed software
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                 <Typography variant="caption" color="text.secondary" display="block">
                    Quick links
                 </Typography>
                 <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    My open work items <span>0</span>
                 </Typography>
                 <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    Done work items <span>0</span>
                 </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

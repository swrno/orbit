"use client";

import { useAppStore, Workspace, Team, Page } from "@/lib/store";
import { Box, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, Avatar } from "@mui/material";
import { Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface BoardListProps {
  workspaceId: string;
}

export function BoardList({ workspaceId }: BoardListProps) {
  const { workspaces } = useAppStore();
  const workspace = workspaces.find((w: Workspace) => w.id === workspaceId);
  const router = useRouter();

  if (!workspace) return null;

  // Flatten pages from teams
  const allPages = workspace.teams?.flatMap((g: Team) => g.pages.map((p: Page) => ({ ...p, teamName: g.title }))) || [];

  return (
    <Box>
      <Box sx={{ mb: 3, maxWidth: 300 }}>
        <TextField
            fullWidth
            placeholder="Search boards"
            size="small"
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search size={16} />
                    </InputAdornment>
                ),
            }}
        />
      </Box>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="boards table">
            <TableHead>
                <TableRow>
                    <TableCell width={50}></TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">Name</Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">Location</Typography>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {allPages.map((page: Page & { teamName: string }) => (
                    <TableRow
                        key={page.id}
                        hover
                        sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                        onClick={() => router.push(`/${workspaceId}/${page.id}`)}
                    >
                        <TableCell>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
                                <Star size={16} strokeWidth={1.5} />
                            </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight={500} color="primary.main">
                                {page.title}
                            </Typography>
                        </TableCell>
                         <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar 
                                    sx={{ width: 20, height: 20, bgcolor: 'primary.main', fontSize: 10 }}
                                    variant="rounded"
                                >
                                    {workspace.title.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" color="text.primary">
                                    {workspace.title} ({page.teamName?.toUpperCase()})
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
                {allPages.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                No boards found
                            </Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

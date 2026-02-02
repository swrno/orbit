"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

import { EpicManagement } from "@/components/dashboard/EpicManagement";
import { Box, Typography } from "@mui/material";

export default function EpicsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    if (!workspace) {
        return <Typography>Workspace not found</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>

            <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
                <EpicManagement workspaceId={workspaceId} />
            </Box>
        </Box>
    );
}

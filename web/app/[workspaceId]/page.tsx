"use client";

import { Header } from "@/components/layout/Header";
import { useParams } from "next/navigation";
import { RecentSpaces } from "@/components/dashboard/RecentSpaces";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { BoardList } from "@/components/dashboard/BoardList";
import { Box, Container, Typography, Button } from "@mui/material";
import { useState } from "react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [currentTab, setCurrentTab] = useState('boards');

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
                <Button variant="contained" color="primary">
                    Create
                </Button>
            </Box>

            <RecentSpaces workspaceId={workspaceId} />

            <DashboardTabs currentTab={currentTab} onTabChange={setCurrentTab} />

            {currentTab === 'boards' && (
                <BoardList workspaceId={workspaceId} />
            )}
        </Container>
      </Box>
    </div>
  );
}

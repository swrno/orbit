"use client";

import { Box, Tabs, Tab } from "@mui/material";
import { useState } from "react";

interface DashboardTabsProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

export function DashboardTabs({ currentTab, onTabChange }: DashboardTabsProps) {
  
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={currentTab} 
        onChange={handleChange} 
        aria-label="dashboard tabs"
        sx={{
            '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
            }
        }}
    >
        <Tab label="Worked on" value="worked-on" />
        <Tab label="Viewed" value="viewed" />
        <Tab label="Assigned to me" value="assigned" />
        <Tab label="Starred" value="starred" />
        <Tab label="Boards" value="boards" />
      </Tabs>
    </Box>
  );
}

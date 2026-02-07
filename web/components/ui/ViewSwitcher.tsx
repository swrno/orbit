"use client";

import { Box, Button } from "@mui/material";
import { 
  Table, 
  Kanban, 
  Calendar, 
  BarChart3, 
  List,
  TrendingUp 
} from "lucide-react";
import React from "react";

export type ViewType = 'table' | 'board' | 'gantt' | 'chart' | 'calendar' | 'roadmap' | 'list';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  availableViews?: ViewType[];
}

const VIEW_CONFIG: Record<ViewType, { icon: React.ReactNode; label: string }> = {
  table: { icon: <Table size={16} />, label: 'Main Table' },
  board: { icon: <Kanban size={16} />, label: 'Kanban' },
  gantt: { icon: <Calendar size={16} />, label: 'Gantt' },
  chart: { icon: <BarChart3 size={16} />, label: 'Chart' },
  calendar: { icon: <Calendar size={16} />, label: 'Calendar' },
  roadmap: { icon: <TrendingUp size={16} />, label: 'Roadmap' },
  list: { icon: <List size={16} />, label: 'List' },
};

export function ViewSwitcher({ 
  currentView, 
  onViewChange,
  availableViews = ['table', 'gantt', 'board', 'chart']
}: ViewSwitcherProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        borderBottom: '1px solid #e6e9ef',
        bgcolor: 'white',
        px: 2,
      }}
    >
      {availableViews.map((view) => {
        const config = VIEW_CONFIG[view];
        const isActive = currentView === view;
        
        return (
          <Button
            key={view}
            onClick={() => onViewChange(view)}
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 1,
              textTransform: 'none',
              color: isActive ? '#0073ea' : '#676879',
              fontWeight: isActive ? 600 : 400,
              fontSize: '14px',
              borderRadius: 0,
              borderBottom: isActive ? '2px solid #0073ea' : '2px solid transparent',
              bgcolor: 'transparent',
              gap: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#f6f7fb',
                color: '#0073ea',
              },
            }}
          >
            {config.icon}
            {config.label}
          </Button>
        );
      })}
    </Box>
  );
}

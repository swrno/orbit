"use client";

import { Box, Typography, Button, IconButton, Breadcrumbs } from "@mui/material";
import { 
  ChevronDown, 
  Search, 
  Filter,
  MoreHorizontal,
  Sparkles,
  Lightbulb,
  Zap,
  User,
  Plus
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface PageHeaderProps {
  workspaceName: string;
  teamName?: string;
  pageName: string;
}

export function PageHeader({ 
  workspaceName, 
  teamName,
  pageName, 
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e6e9ef',
        px: 3,
        py: 2,
        height: '65px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: '12px', color: '#676879' }}>
            {workspaceName} {teamName ? `/ ${teamName}` : ''} / {pageName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#323338',
              lineHeight: 1.2
            }}
          >
            {pageName}
          </Typography>
          <IconButton size="small" sx={{ color: '#676879', p: 0.5 }}>
            <ChevronDown size={16} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

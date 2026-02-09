"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { UserMenu } from '@/components/auth/UserMenu';
import Link from 'next/link';

export function Navbar() {
  const { user } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e6e9ef',
        zIndex: 1300
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: 3 }}>
        {/* Logo and Brand */}
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '20px',
                color: '#323338',
                letterSpacing: '-0.5px'
              }}
            >
              Orbit AI Workspace
            </Typography>
          </Box>
        </Link>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* User Menu */}
        {user && <UserMenu />}
      </Toolbar>
    </AppBar>
  );
}

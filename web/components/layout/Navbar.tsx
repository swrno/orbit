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
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.2, color: '#323338' }}>
                {user.displayName || 'User'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#676879', lineHeight: 1.2 }}>
                {user.email}
              </Typography>
            </Box>
            <UserMenu />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

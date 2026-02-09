"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { UserMenu } from '@/components/auth/UserMenu';
import Link from 'next/link';
import { Zap } from 'lucide-react';

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
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={24} color="#2563eb" fill="#2563eb" />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#0f172a',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-plus-jakarta)'
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

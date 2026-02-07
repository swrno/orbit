"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';
import { LogOut, Settings, User } from 'lucide-react';
import { useState } from 'react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    handleClose();
  };

  if (!user) return null;

  return (
    <Box>
      <IconButton onClick={handleClick} sx={{ p: 0.5 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#0073ea',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
            {user.displayName || 'User'}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#676879' }}>
            {user.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
          <User size={16} style={{ marginRight: 8 }} />
          Profile
        </MenuItem>
        
        <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
          <Settings size={16} style={{ marginRight: 8 }} />
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ fontSize: '14px', py: 1, color: '#e2445c' }}>
          <LogOut size={16} style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

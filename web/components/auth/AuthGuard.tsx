"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppStore } from '@/lib/store';

const publicRoutes = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { fetchWorkspaces } = useAppStore();

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && !isPublicRoute) {
        router.push('/login');
      } else if (user) {
        fetchWorkspaces();
        if (isPublicRoute) {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router, fetchWorkspaces]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#f6f7fb'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show public routes without authentication check
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Only render protected routes if user is authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

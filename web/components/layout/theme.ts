"use client";

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // blue-600
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#475569', // slate-600
    },
    background: {
      default: '#f8fafc', // slate-50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#64748b', // slate-500
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
    h1: {
      fontFamily: 'var(--font-inter), sans-serif',
    },
    h2: {
      fontFamily: 'var(--font-inter), sans-serif',
    },
    h3: {
      fontFamily: 'var(--font-inter), sans-serif',
    },
    h6: {
      fontFamily: 'var(--font-inter), sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0', // slate-200
        },
      },
    },
  },
});

export default theme;
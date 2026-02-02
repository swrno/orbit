"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Shell } from "@/components/layout/Shell";
import { Box, Typography, CircularProgress, Paper, Button } from "@mui/material";
import { LayoutDashboard, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { workspaces } = useAppStore();

  useEffect(() => {
    // Redirect to dashboard after a short delay for better UX
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Shell>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 3,
          bgcolor: 'background.default'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: 400
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <LayoutDashboard size={32} />
          </Box>

          <Typography variant="h5" fontWeight={600} gutterBottom>
            Welcome to ForgeAI
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your corporate task management and sprint planning solution.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
          </Box>

          <Button
            suppressHydrationWarning
            variant="text"
            endIcon={<ArrowRight size={16} />}
            onClick={() => router.push('/dashboard')}
            sx={{ mt: 1 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Shell>
  );
}

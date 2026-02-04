"use client";

import { Box, Button, Typography, Container, Grid, Paper, Chip } from "@mui/material";
import {
  Zap, ArrowRight, CheckCircle2, BarChart3, Target, Users,
  Layout, Shield, Sparkles, TrendingUp
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Layout size={28} />,
      title: "Agile Boards",
      description: "Scrum & Kanban boards with drag-and-drop for seamless project management"
    },
    {
      icon: <Target size={28} />,
      title: "Roadmap Planning",
      description: "Visual timeline for strategic planning and milestone tracking"
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Analytics & Reports",
      description: "Velocity charts, burndown, and capacity planning for data-driven decisions"
    },
    {
      icon: <Users size={28} />,
      title: "Team Collaboration",
      description: "Real-time updates, comments, and team workload management"
    },
    {
      icon: <Shield size={28} />,
      title: "Bug Tracking",
      description: "Dedicated bugs queue with priority management and SLA tracking"
    },
    {
      icon: <Sparkles size={28} />,
      title: "AI-Powered",
      description: "Smart suggestions and intelligent task recommendations"
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f4f5f7', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #dfe1e6', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Zap size={28} color="#0052CC" />
              <Typography variant="h5" fontWeight={600} sx={{ color: '#172B4D' }}>
                ForgeAI
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="/get-started" style={{ textDecoration: 'none' }}>
                <Button sx={{ color: '#42526E', textTransform: 'none', fontWeight: 500 }}>
                  Documentation
                </Button>
              </Link>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#0052CC',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    '&:hover': { bgcolor: '#0747A6' },
                    boxShadow: 'none'
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 500,
                mb: 2,
                color: '#172B4D',
                lineHeight: 1.2
              }}
            >
              Project management for modern teams
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: '#42526E',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              Plan, track, and manage agile projects with powerful boards, roadmaps,
              and real-time analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    bgcolor: '#0052CC',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#0747A6' },
                    boxShadow: 'none'
                  }}
                >
                  Try ForgeAI free
                </Button>
              </Link>
              <Link href="/get-started" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#DFE1E6',
                    color: '#42526E',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#B3BAC5',
                      bgcolor: '#F4F5F7'
                    }
                  }}
                >
                  View demo
                </Button>
              </Link>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 6, justifyContent: 'center', mt: 8, flexWrap: 'wrap' }}>
            {[
              { value: '10K+', label: 'Teams' },
              { value: '99.9%', label: 'Uptime' },
              { value: '50M+', label: 'Tasks' }
            ].map((stat, idx) => (
              <Box key={idx} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} sx={{ color: '#172B4D', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B778C' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: '#f4f5f7' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="Features"
              sx={{
                bgcolor: '#DEEBFF',
                color: '#0052CC',
                fontWeight: 500,
                mb: 2,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}
            />
            <Typography variant="h3" fontWeight={500} sx={{ mb: 2, color: '#172B4D' }}>
              Everything you need to ship faster
            </Typography>
            <Typography variant="body1" sx={{ color: '#42526E', maxWidth: 600, mx: 'auto' }}>
              Powerful features built for agile teams who demand speed and flexibility
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: 'white',
                    border: '1px solid #DFE1E6',
                    borderRadius: '3px',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(23,43,77,0.08)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '3px',
                      bgcolor: '#DEEBFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0052CC',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#172B4D' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#42526E', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={500} sx={{ mb: 2, color: '#172B4D' }}>
              Ready to get started?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#42526E' }}>
              Join thousands of teams already using ForgeAI
            </Typography>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  bgcolor: '#0052CC',
                  color: 'white',
                  px: 5,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  '&:hover': { bgcolor: '#0747A6' },
                  boxShadow: 'none'
                }}
              >
                Start free trial
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#f4f5f7', borderTop: '1px solid #DFE1E6', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Zap size={20} color="#0052CC" />
              <Typography variant="body2" fontWeight={600} sx={{ color: '#172B4D' }}>
                ForgeAI
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6B778C' }}>
              © 2026 ForgeAI. Built for modern teams.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

"use client";

import { Box, Button, Typography, Container, Grid, Paper } from "@mui/material";
import {
  Zap, ArrowRight, CheckCircle2, BarChart3, Target, Users,
  Layout, Calendar, Bug, TrendingUp, Layers
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Layers size={32} />,
      title: "Product Backlog",
      description: "Centralized repository for all work items with intelligent prioritization and story point estimation"
    },
    {
      icon: <Calendar size={32} />,
      title: "Sprint Planning",
      description: "Time-boxed iterations with capacity planning, velocity tracking, and burndown charts"
    },
    {
      icon: <Layout size={32} />,
      title: "Scrum Boards",
      description: "Visual workflow management with drag-and-drop, swimlanes, and WIP limits"
    },
    {
      icon: <Target size={32} />,
      title: "Epic Management",
      description: "Strategic roadmap planning with epic-to-story hierarchy and progress tracking"
    },
    {
      icon: <Bug size={32} />,
      title: "Bug Tracking",
      description: "Comprehensive defect management with severity levels, SLAs, and resolution metrics"
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Analytics & Reports",
      description: "Data-driven insights with velocity charts, CFD, burndown, and team capacity reports"
    }
  ];

  const stats = [
    { value: "100%", label: "Agile Methodology" },
    { value: "Real-time", label: "Collaboration" },
    { value: "∞", label: "Scalability" }
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
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 500,
                mb: 3,
                color: '#172B4D',
                lineHeight: 1.2
              }}
            >
              Agile Project Management
              <Box component="span" sx={{ display: 'block', color: '#0052CC', mt: 1 }}>
                Built for Modern Teams
              </Box>
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                color: '#42526E',
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Complete agile workflow from backlog to delivery. Plan sprints, track progress,
              manage bugs, and generate insights with enterprise-grade project management.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    bgcolor: '#0052CC',
                    color: 'white',
                    px: 5,
                    py: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#0747A6' },
                    boxShadow: 'none'
                  }}
                >
                  Start Planning
                </Button>
              </Link>
              <Link href="/get-started" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#DFE1E6',
                    color: '#42526E',
                    px: 5,
                    py: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: '#B3BAC5',
                      bgcolor: '#F4F5F7'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Link>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: { xs: 4, md: 8 }, justifyContent: 'center', mt: 10, flexWrap: 'wrap' }}>
            {stats.map((stat, idx) => (
              <Box key={idx} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={600} sx={{ color: '#0052CC', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B778C', fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: '#f4f5f7' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#0052CC', fontWeight: 600, fontSize: '0.875rem', letterSpacing: 1 }}>
              FEATURES
            </Typography>
            <Typography variant="h3" fontWeight={500} sx={{ mt: 2, mb: 2, color: '#172B4D' }}>
              Everything You Need for Agile Delivery
            </Typography>
            <Typography variant="body1" sx={{ color: '#42526E', maxWidth: 600, mx: 'auto' }}>
              Complete workflow coverage from strategic planning to tactical execution
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'white',
                    border: '1px solid #DFE1E6',
                    borderRadius: '3px',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(23,43,77,0.12)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '8px',
                      bgcolor: '#DEEBFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0052CC',
                      mb: 3
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#172B4D', mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#42526E', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Workflow Section */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#0052CC', fontWeight: 600, fontSize: '0.875rem', letterSpacing: 1 }}>
              WORKFLOW
            </Typography>
            <Typography variant="h3" fontWeight={500} sx={{ mt: 2, color: '#172B4D' }}>
              From Backlog to Delivery
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
            {[
              { num: "1", title: "Plan", desc: "Prioritize backlog" },
              { num: "2", title: "Sprint", desc: "Commit to work" },
              { num: "3", title: "Track", desc: "Monitor progress" },
              { num: "4", title: "Review", desc: "Analyze metrics" }
            ].map((step, idx) => (
              <Box key={idx} sx={{ flex: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#0052CC',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {step.num}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#172B4D' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B778C' }}>
                  {step.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, bgcolor: '#f4f5f7' }}>
        <Container maxWidth="md">
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'white', border: '1px solid #DFE1E6', boxShadow: 'none' }}>
            <Typography variant="h3" fontWeight={500} sx={{ mb: 2, color: '#172B4D' }}>
              Start Your First Sprint Today
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#42526E' }}>
              Join teams using ForgeAI to deliver better software, faster
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
                  py: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: '#0747A6' },
                  boxShadow: 'none'
                }}
              >
                Get Started Free
              </Button>
            </Link>
          </Paper>
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
              <Typography variant="caption" sx={{ color: '#6B778C', ml: 2 }}>
                Agile Project Management Platform
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#6B778C' }}>
              © 2026 ForgeAI. Built for agile teams.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

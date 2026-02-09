"use client";

import { Box, Button, Typography, Container, Stack, IconButton, Divider } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import {
  Zap, Twitter, Github, Shield
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

import DocumentationSection from "@/components/landing/DocumentationSection";

const FullWidthFeatureSection = ({
  title,
  description,
  productImage,
  componentImage,
  elements,
  buttons,
  reverse = false
}: {
  title: string;
  description: string;
  productImage: string;
  componentImage: string;
  elements: string[];
  buttons: string[];
  reverse?: boolean;
}) => {
  return (
    <Box sx={{ py: 15, position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              fontFamily: 'var(--font-plus-jakarta)',
              mb: 3,
              color: "#0f172a",
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '-0.02em'
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 500
            }}
          >
            {description}
          </Typography>
        </Box>

        <Box sx={{
          position: 'relative',
          width: '100%',
          borderRadius: '48px',
          overflow: 'visible',
          bgcolor: '#f8fafc',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 60px 120px rgba(0,0,0,0.05)',
          p: { xs: 2, md: 8 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '2000px',
          minHeight: { xs: 400, md: 650 }
        }}>
          {/* Base Product Image */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              width: '95%',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.5)',
              transformStyle: 'preserve-3d',
              rotateX: 5
            }}
          >
            <Image src={productImage} alt="Product Dashboard" width={1200} height={750} layout="responsive" />
          </MotionBox>

          {/* Floating Component Overlay */}
          <MotionBox
            initial={{ opacity: 0, x: reverse ? -50 : 50, y: 50 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            animate={{ y: [0, -15, 0] }}
            whileHover={{ scale: 1.05, zIndex: 30, transition: { duration: 0.3 } }}
            sx={{
              position: 'absolute',
              top: '10%',
              [reverse ? 'left' : 'right']: '-12%',
              zIndex: 20,
              width: { xs: '50%', md: '28%' },
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.9)',
              bgcolor: 'white'
            }}
          >
            <Image src={componentImage} alt="Tool Component" width={500} height={350} layout="responsive" />
          </MotionBox>

          {/* Floating 3D Elements */}
          {elements.map((el, idx) => (
            <MotionBox
              key={idx}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              animate={{
                y: [0, idx % 2 === 0 ? -30 : 30, 0],
                rotate: [0, idx % 2 === 0 ? 15 : -15, 0],
                rotateY: [0, 20, 0]
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.4 + (idx * 0.1) },
                scale: { duration: 0.8, delay: 0.4 + (idx * 0.1) },
                default: { duration: 6 + idx, repeat: Infinity, ease: "easeInOut" }
              }}
              sx={{
                position: 'absolute',
                zIndex: 25,
                width: { xs: 120, md: idx === 1 ? 240 : 180 },
                top: idx === 0 ? '-10%' : idx === 1 ? '60%' : '80%',
                [idx % 2 === 0 ? 'left' : 'right']: idx === 0 ? '5%' : idx === 1 ? '-5%' : '15%',
                filter: idx === 1 ? 'none' : 'blur(1px)'
              }}
            >
              <Image src={el} alt="3D Visual" width={240} height={240} style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }} />
            </MotionBox>
          ))}

          {/* Floating Buttons */}
          {buttons.map((btn, idx) => (
            <MotionBox
              key={`btn-${idx}`}
              whileHover={{ scale: 1.1, y: -5 }}
              animate={{ y: [0, idx % 2 === 0 ? 12 : -12, 0] }}
              transition={{ duration: 3 + idx, repeat: Infinity, ease: "easeInOut" }}
              sx={{
                position: 'absolute',
                zIndex: 40,
                width: { xs: 120, md: 160 },
                bottom: idx === 0 ? '5%' : idx === 1 ? '18%' : '30%',
                [reverse ? 'right' : 'left']: idx === 0 ? '-5%' : idx === 1 ? '5%' : '15%',
                bgcolor: 'white',
                p: 1,
                borderRadius: '16px',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                src={btn}
                alt="Button"
                width={160}
                height={45}
                style={{ borderRadius: '12px' }}
              />
            </MotionBox>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax offsets
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Software Matching colors from theme.ts
  const primaryMain = "#2563eb";
  const bgSlate = "#f8fafc";
  const slate900 = "#0f172a";
  const slate600 = "#475569";
  const slate500 = "#64748b";


  return (
    <Box ref={containerRef} sx={{ bgcolor: 'white', minHeight: '100vh', overflow: 'hidden', color: slate900 }}>
      {/* Navigation */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)'
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" py={2}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={28} color={primaryMain} fill={primaryMain} />
              <Typography variant="h6" fontWeight={800} sx={{
                color: slate900,
                fontFamily: 'var(--font-plus-jakarta)',
                letterSpacing: '-0.03em',
                fontSize: '1.4rem'
              }}>
                Orbit AI Workspace
              </Typography>
            </Link>

            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: primaryMain,
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  borderRadius: '10px',
                  boxShadow: `0 10px 20px ${alpha(primaryMain, 0.2)}`,
                  '&:hover': { bgcolor: '#1d4ed8', boxShadow: `0 15px 30px ${alpha(primaryMain, 0.3)}` },
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                Launch Workspace
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ pt: { xs: 12, md: 20 }, pb: { xs: 10, md: 15 }, position: 'relative' }}>
        {/* Decorative elements */}
        <MotionBox
          style={{ y: y1, rotate: rotate1 }}
          sx={{ position: 'absolute', top: '15%', right: '10%', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}
        >
          <Image src="/elements/3d_element_2.png" alt="3D Glass" width={350} height={350} />
        </MotionBox>
        <MotionBox
          style={{ y: y3, rotate: rotate2 }}
          sx={{ position: 'absolute', top: '40%', left: '5%', zIndex: 0, opacity: 0.4, pointerEvents: 'none', filter: 'blur(4px)' }}
        >
          <Image src="/elements/3d_element_2.png" alt="3D Glass" width={200} height={200} />
        </MotionBox>
        {/* New 3D elements */}
        <MotionBox
          style={{ y: y2 }}
          sx={{ position: 'absolute', top: '70%', right: '5%', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }}
        >
          <Image src="/elements/3d_element_3.png" alt="3D Sphere" width={250} height={250} />
        </MotionBox>
        <MotionBox
          style={{ y: y1, rotate: -30 }}
          sx={{ position: 'absolute', bottom: '10%', left: '10%', zIndex: 0, opacity: 0.3, pointerEvents: 'none', filter: 'blur(2px)' }}
        >
          <Image src="/elements/3d_element_4.png" alt="3D Torus" width={300} height={300} />
        </MotionBox>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 10 }}>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3.5rem', md: '5.5rem' },
                fontWeight: 900,
                color: slate900,
                lineHeight: 1.1,
                mb: 3,
                fontFamily: 'var(--font-plus-jakarta)',
                letterSpacing: '-0.03em'
              }}
            >
              Agile Project Management <br />
              <Box component="span" sx={{ color: primaryMain }}>
                Built for Modern Teams
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: slate600,
                fontWeight: 500,
                lineHeight: 1.6,
                mb: 6,
                maxWidth: 800,
                mx: 'auto',
                fontFamily: 'var(--font-plus-jakarta)',
                fontSize: { xs: '1.2rem', md: '1.35rem' }
              }}
            >
              Complete agile workflow from backlog to delivery. Plan sprints, track progress,
              manage bugs, and generate insights with enterprise-grade project management.
            </Typography>
            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 10 }}>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: primaryMain,
                    px: 5,
                    py: 2,
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: `0 20px 40px ${alpha(primaryMain, 0.2)}`,
                    '&:hover': { bgcolor: '#1d4ed8', transform: 'translateY(-2px)' },
                    transition: 'all 0.3s ease',
                    fontFamily: 'var(--font-plus-jakarta)',
                  }}
                >
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/guide" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#e2e8f0',
                    color: slate900,
                    px: 5,
                    py: 2,
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    bgcolor: 'white',
                    fontFamily: 'var(--font-plus-jakarta)',
                    '&:hover': { bgcolor: bgSlate, borderColor: '#cbd5e1' }
                  }}
                >
                  User Guide
                </Button>
              </Link>
            </Stack>

            {/* Hero Stats */}
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Grid container spacing={4} justifyContent="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="h3" fontWeight={800} sx={{ color: primaryMain, mb: 1, fontFamily: 'var(--font-plus-jakarta)' }}>
                    100%
                  </Typography>
                  <Typography variant="body1" sx={{ color: slate600, fontWeight: 500 }}>
                    Agile Methodology
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="h3" fontWeight={800} sx={{ color: primaryMain, mb: 1, fontFamily: 'var(--font-plus-jakarta)' }}>
                    Real-time
                  </Typography>
                  <Typography variant="body1" sx={{ color: slate600, fontWeight: 500 }}>
                    Collaboration
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ color: primaryMain, mb: 1, fontFamily: 'var(--font-plus-jakarta)' }}>
                      ∞
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: slate600, fontWeight: 500 }}>
                    Scalability
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Full-Width Feature Sections */}
          <FullWidthFeatureSection
            title="Unified Delivery Engine"
            description="Consolidate your entire tech stack into a single, intelligent command center. Orbit's AI orchestrates your workflow, from initial commit to final deployment."
            productImage="/images/product_3.png"
            componentImage="/components/compo1.png"
            elements={["/elements/3d_element_1.png", "/elements/3d_element_2.png", "/elements/3d_element_3.png"]}
            buttons={["/buttons/button1.png", "/buttons/button2.png"]}
          />

          <FullWidthFeatureSection
            title="Predictive Team Velocity"
            description="Stop guessing, start shipping. Orbit analyzes historical data and real-time signals to provide hyper-accurate delivery forecasts for every sprint."
            productImage="/images/product_1.png"
            componentImage="/components/compo2.png"
            elements={["/elements/3d_element_4.png", "/elements/3d_element_2.png"]}
            buttons={["/buttons/button3.png", "/buttons/button4.png"]}
            reverse={true}
          />

          <FullWidthFeatureSection
            title="Strategic Engineering Insights"
            description="Unlock deep-level visibility into your engineering organization. Identify bottlenecks before they happen and optimize resource allocation with ease."
            productImage="/images/product_2.png"
            componentImage="/components/compo3.png"
            elements={["/elements/3d_element_1.png", "/elements/3d_element_3.png", "/elements/3d_element_4.png"]}
            buttons={["/buttons/button5.png", "/buttons/button1.png"]}
          />

          <FullWidthFeatureSection
            title="Automated Quality Assurance"
            description="Orbit's intelligent QA engine identifies regression risks across your entire codebase, ensuring every release meets the highest performance standards."
            productImage="/images/product_6.png"
            componentImage="/components/compo2.png"
            elements={["/elements/3d_element_2.png", "/elements/3d_element_4.png"]}
            buttons={["/buttons/button2.png", "/buttons/button3.png"]}
            reverse={true}
          />

          <FullWidthFeatureSection
            title="Next-Gen Resource Orchestration"
            description="Dynamically balance team load and infrastructure costs with AI-driven allocation. Scale your operations without increasing complexity."
            productImage="/images/product_7.png"
            componentImage="/components/compo3.png"
            elements={["/elements/3d_element_1.png", "/elements/3d_element_3.png"]}
            buttons={["/buttons/button4.png", "/buttons/button5.png"]}
          />
        </Container>
      </Box>





      {/* Documentation Section */}
      <DocumentationSection />

      {/* FAQ Section */}
      <Box sx={{ py: 20, bgcolor: '#ffffff' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900} textAlign="center" sx={{ fontFamily: 'var(--font-plus-jakarta)', mb: 10, letterSpacing: '-0.02em' }}>
            Frequently Asked <span style={{ color: primaryMain }}>Questions</span>
          </Typography>
          <Stack spacing={3}>
            {[
              {
                q: "What makes Tambo AI different from other assistants?",
                a: "Tambo isn't just a chatbot; it's a deep workspace integration. It has full context of your teams, tasks, and sprints, allowing it to perform complex operations like 'Reassign all blocked bugs to the backend team' or 'Draft a retrospective for Sprint 4' instantly."
              },
              {
                q: "Can I manage my entire Agile workflow through Tambo?",
                a: "Yes. From creating epics and backlog items to starting sprints and moving Kanban cards, Tambo can handle the entire agile lifecycle. Just press ⌘K and tell Orbit what you need."
              },
              {
                q: "How does Orbit ensure data security for my team?",
                a: "Security is built into Orbit's core. We use enterprise-grade encryption, SOC2-compliant data handling, and isolated workspace environments. Your project intelligence is strictly private and accessible only by your authorized team members."
              },
              {
                q: "Does Orbit support real-time collaboration?",
                a: "Absolutely. Orbit features a live sync engine. When a task status changes, a comment is added, or Tambo executes a command, every team member sees the update in milliseconds without ever needing to refresh the page."
              }
            ].map((faq, idx) => (
              <Box key={idx} sx={{
                p: 4,
                borderRadius: '24px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: alpha(primaryMain, 0.3),
                  bgcolor: '#ffffff',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
                }
              }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, color: '#0f172a', fontFamily: 'var(--font-plus-jakarta)' }}>{faq.q}</Typography>
                <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7 }}>{faq.a}</Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA Final */}
      <Box sx={{ py: 25, textAlign: 'center', position: 'relative' }}>
        <MotionBox
          style={{ y: y3 }}
          sx={{ position: 'absolute', top: '0', left: '10%', opacity: 0.3, zIndex: 0 }}
        >
          <Image src="/elements/3d_element_3.png" alt="3D" width={400} height={400} />
        </MotionBox>

        <Container maxWidth="md">
          <AnimatePresence>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography variant="h2" fontWeight={900} sx={{ fontFamily: 'var(--font-plus-jakarta)', mb: 4, letterSpacing: '-0.04em', color: slate900 }}>
                Ready to launch?
              </Typography>
              <Typography variant="h6" sx={{ color: slate600, mb: 8, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}>
                Join thousands of teams scaling their velocity with Orbit AI Workspace.
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: primaryMain,
                    px: 8,
                    py: 2.5,
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    textTransform: 'none',
                    boxShadow: `0 25px 60px ${alpha(primaryMain, 0.3)}`,
                    '&:hover': { bgcolor: '#1d4ed8', transform: 'scale(1.05)' }
                  }}
                >
                  Get Started for Free
                </Button>
              </Stack>
            </MotionBox>
          </AnimatePresence>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: '#0f172a', pt: 15, pb: 8, color: '#94a3b8' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} sx={{ mb: 12 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                <Zap size={28} color={primaryMain} fill={primaryMain} />
                <Typography variant="h5" fontWeight={900} sx={{
                  fontFamily: 'var(--font-plus-jakarta)',
                  color: 'white',
                  letterSpacing: '-0.03em'
                }}>
                  Orbit
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 5, lineHeight: 1.8, maxWidth: 320 }}>
                The next generation of agile intelligence. Ship faster, smarter, and together with Tambo AI.
              </Typography>
              <Stack direction="row" spacing={2}>
                {[Twitter, Github, Shield].map((Icon, i) => (
                  <IconButton key={i} size="small" sx={{
                    color: '#94a3b8',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    '&:hover': { bgcolor: primaryMain, color: 'white' }
                  }}>
                    <Icon size={18} />
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 4, color: 'white' }}>Product</Typography>
              <Stack spacing={2.5}>
                {['Features', 'Tambo AI', 'Pricing', 'Guide', 'API Docs'].map(item => (
                  <Typography key={item} variant="body2" sx={{
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    '&:hover': { color: primaryMain }
                  }}>{item}</Typography>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 4, color: 'white' }}>Company</Typography>
              <Stack spacing={2.5}>
                {['About', 'Careers', 'Privacy', 'Terms', 'Security'].map(item => (
                  <Typography key={item} variant="body2" sx={{
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    '&:hover': { color: primaryMain }
                  }}>{item}</Typography>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 4, color: 'white' }}>Join the orbit</Typography>
              <Typography variant="body2" sx={{ mb: 4, lineHeight: 1.7 }}>
                Get the latest updates on AI-powered management and product releases.
              </Typography>
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                p: 1,
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <Box component="input" placeholder="Email address" sx={{
                  flex: 1,
                  bgcolor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  px: 2,
                  fontFamily: 'inherit'
                }} />
                <Button variant="contained" sx={{
                  bgcolor: primaryMain,
                  px: 3,
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1d4ed8' }
                }}>
                  Join
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 6 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              © 2026 Orbit AI. Built with intelligence for elite engineering teams.
            </Typography>
            <Stack direction="row" spacing={4}>
              {['Status', 'Privacy Policy', 'Cookie Settings'].map(item => (
                <Typography key={item} variant="caption" sx={{
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { color: 'white' }
                }}>{item}</Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

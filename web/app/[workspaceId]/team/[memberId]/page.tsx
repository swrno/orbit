"use client";

import { useAppStore } from "@/lib/store";
import { Avatar, Box, Button, Chip, Container, Divider, Paper, Typography } from "@mui/material";
import { ArrowLeft, Mail, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function TeamMemberPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    const memberId = params.memberId as string;

    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    // Find member by ID
    const member = workspace?.teamMembers.find(m => m.id === memberId);

    if (!workspace) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary">Workspace not found</Typography>
                <Button onClick={() => router.push('/')} sx={{ mt: 2 }}>Go Home</Button>
            </Container>
        );
    }

    if (!member) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Team Member Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    The team member with ID "{memberId}" does not exist in this workspace.
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowLeft size={16} />}
                    onClick={() => router.back()}
                >
                    Back to Team
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowLeft size={16} />}
                onClick={() => router.back()}
                sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
                Back to Team List
            </Button>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
                    <Avatar
                        src={member.avatar}
                        alt={member.name}
                        sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}
                    >
                        {member.name.charAt(0)}
                    </Avatar>

                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                            {member.name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 2 }}>
                            <Chip
                                label={member.role}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 500 }}
                            />
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            <Mail size={18} />
                            <Typography variant="body1">{member.email}</Typography>
                        </Box>

                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            <User size={18} />
                            <Typography variant="body1">ID: {member.id}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

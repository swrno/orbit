"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore, TeamMember } from "@/lib/store";

import {
    Box, Paper, Typography, Button, IconButton, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, FormControl, InputLabel, Grid, Card, CardContent,
    LinearProgress, Tooltip
} from "@mui/material";
import {
    Plus, Users, Mail, UserCog, Trash2, Edit,
    MoreVertical, Target, CheckCircle2, Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";

const ROLE_COLORS = {
    'Admin': '#8b5cf6',
    'Developer': '#3b82f6',
    'Designer': '#ec4899',
    'QA': '#10b981',
    'Product Manager': '#f59e0b',
    'Member': '#64748b'
};

export default function TeamPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;

    const { workspaces, addTeamMember, updateTeamMember, removeTeamMember } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Developer');
    const [avatar, setAvatar] = useState('');

    if (!workspace) {
        return <Typography>Workspace not found</Typography>;
    }

    // Calculate member stats
    const memberStats = useMemo(() => {
        const stats: Record<string, { assigned: number; completed: number; inProgress: number; points: number }> = {};
        workspace.teamMembers?.forEach(member => {
            const memberTasks = workspace.tasks.filter(t => t.owner === member.name);
            const completedTasks = memberTasks.filter(t => t.status === 'Done');
            const inProgressTasks = memberTasks.filter(t => t.status === 'In Progress');
            stats[member.id] = {
                assigned: memberTasks.length,
                completed: completedTasks.length,
                inProgress: inProgressTasks.length,
                points: memberTasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0)
            };
        });
        return stats;
    }, [workspace]);

    const handleSave = () => {
        if (name.trim()) {
            if (editingMember) {
                updateTeamMember(workspaceId, editingMember.id, {
                    name: name.trim(),
                    email: email || '',
                    role: role as any,
                    avatar: avatar || undefined
                });
            } else {
                addTeamMember(workspaceId, {
                    name: name.trim(),
                    email: email || '',
                    role: role as any,
                    avatar: avatar || undefined
                });
            }
            closeDialog();
        }
    };

    const handleDelete = (memberId: string) => {
        if (confirm('Remove this team member?')) {
            removeTeamMember(workspaceId, memberId);
        }
    };

    const openEdit = (member: TeamMember) => {
        setEditingMember(member);
        setName(member.name);
        setEmail(member.email || '');
        setRole(member.role || 'Developer');
        setAvatar(member.avatar || '');
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingMember(null);
        setName('');
        setEmail('');
        setRole('Developer');
        setAvatar('');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>

            <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                {/* Header */}
                <PageHeader
                    workspaceName={workspace?.name || 'Workspace'}
                    pageName="Team"
                />
                
                <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setDialogOpen(true)}
                        >
                            Add Member
                        </Button>
                    </Box>

                {/* Team Stats Summary */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Team Size</Typography>
                        <Typography variant="h4" fontWeight={700}>{workspace.teamMembers?.length || 0}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Total Tasks Assigned</Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {workspace.tasks.filter(t => t.owner).length}
                        </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Completed This Sprint</Typography>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                            {workspace.tasks.filter(t => t.status === 'Done' && t.sprintId === workspace.sprints?.find(s => s.status === 'active')?.id).length}
                        </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Total Story Points</Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                            {workspace.tasks.reduce((sum, t) => sum + (t.estimatedPoints || 0), 0)}
                        </Typography>
                    </Paper>
                </Box>

                {/* Team Members Grid */}
                {workspace.teamMembers && workspace.teamMembers.length > 0 ? (
                    <Grid container spacing={3}>
                        {workspace.teamMembers.map((member) => {
                            const stats = memberStats[member.id] || { assigned: 0, completed: 0, inProgress: 0, points: 0 };
                            const completionRate = stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0;

                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s',
                                            '&:hover': { borderColor: 'primary.main' }
                                        }}
                                        onClick={() => {
                                            const teamId = workspace.teams?.[0]?.id || 'main';
                                            router.push(`/${workspaceId}/${teamId}/team/${member.id}`);
                                        }}
                                    >
                                        <CardContent>
                                            {/* Header */}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                                <Avatar
                                                    src={member.avatar}
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        bgcolor: ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] || '#3b82f6',
                                                        fontSize: '1.25rem'
                                                    }}
                                                >
                                                    {member.name.charAt(0)}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                                        {member.name}
                                                    </Typography>
                                                    <Chip
                                                        label={member.role || 'Member'}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 600,
                                                            bgcolor: `${ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] || '#64748b'}20`,
                                                            color: ROLE_COLORS[member.role as keyof typeof ROLE_COLORS] || '#64748b'
                                                        }}
                                                    />
                                                    {member.email && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                            {member.email}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(member); }}>
                                                    <Edit size={14} />
                                                </IconButton>
                                            </Box>

                                            {/* Stats */}
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
                                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                    <Typography variant="h6" fontWeight={700}>{stats.assigned}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Assigned</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                    <Typography variant="h6" fontWeight={700} color="warning.main">{stats.inProgress}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Active</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                    <Typography variant="h6" fontWeight={700} color="success.main">{stats.completed}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Done</Typography>
                                                </Box>
                                            </Box>

                                            {/* Completion Rate */}
                                            <Box sx={{ mb: 1.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                                                    <Typography variant="caption" fontWeight={600}>{completionRate}%</Typography>
                                                </Box>
                                                <LinearProgress
                                                    value={completionRate}
                                                    variant="determinate"
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>

                                            {/* Points */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Target size={14} />
                                                    <Typography variant="caption">{stats.points} story points</Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                                                >
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <Typography variant="h6" gutterBottom>No Team Members</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Add team members to assign tasks and track workload.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={() => setDialogOpen(true)}
                        >
                            Add First Member
                        </Button>
                    </Paper>
                )}
            </Box>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Full Name"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., John Smith"
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                native
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                label="Role"
                            >
                                <option value="Developer">Developer</option>
                                <option value="Designer">Designer</option>
                                <option value="QA">QA</option>
                                <option value="Product Manager">Product Manager</option>
                                <option value="Admin">Admin</option>
                                <option value="Member">Member</option>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Avatar URL"
                            fullWidth
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            placeholder="https://..."
                            helperText="Optional: URL to profile picture"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>
                        {editingMember ? 'Save Changes' : 'Add Member'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    </Box>
    );
}

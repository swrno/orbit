"use client";

import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Box, Paper, Typography, Button, IconButton, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Alert, Divider
} from "@mui/material";
import {
    Plus, Trash2, Crown, Edit2, Eye, UserCog, Shield
} from "lucide-react";
import { useState } from "react";

import { TeamRole } from "@/lib/types";


interface TeamMember {
    id: string;
    name: string;
    email: string;
    role?: string;
    teamRole?: TeamRole;
    addedAt: Date;
}

const ROLE_ICONS = {
    LEADER: Crown,
    EDITOR: Edit2,
    VIEWER: Eye
};

const ROLE_COLORS = {
    LEADER: '#f59e0b',
    EDITOR: '#3b82f6',
    VIEWER: '#64748b'
};

const ROLE_DESCRIPTIONS = {
    LEADER: 'Can manage team members and all team settings',
    EDITOR: 'Can view and edit all team content, cannot manage members',
    VIEWER: 'Can view all team content in read-only mode'
};

interface TeamAccessViewProps {
    workspaceId: string;
    pageId: string;
}

export function TeamAccessView({ workspaceId, pageId }: TeamAccessViewProps) {
    const { user } = useAuth();
    const { workspaces, updateWorkspace } = useAppStore();
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    
    // Find the current team
    let currentTeam: any = null;
    if (workspace && workspace.teams) {
        for (const team of workspace.teams) {
            const page = team.pages.find((p: any) => p.id === pageId);
            if (page) {
                currentTeam = team;
                break;
            }
        }
    }

    const { canManageAccess, isReadOnly, role } = usePermissions(workspaceId, currentTeam?.id);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [memberRole, setMemberRole] = useState<TeamRole>('VIEWER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!workspace) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    if (!currentTeam) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Team not found</Typography>
            </Box>
        );
    }

    // Get team members (for now using teamMembers field, will integrate with backend)
    const teamMembers: TeamMember[] = currentTeam.members || [];

    const handleAddMember = async () => {
        if (!memberEmail.trim() || !memberName.trim()) {
            setError('Name and email are required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/teams/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user?.uid || '',
                    'X-User-Email': user?.email || ''
                },
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    teamId: currentTeam.id,
                    userId: memberEmail, // Using email as temporary ID
                    name: memberName,
                    email: memberEmail,
                    teamRole: memberRole,
                    currentUserId: user?.uid
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add member');
            }

            // Refresh workspace data
            if (data.data) {
                updateWorkspace(workspaceId, data.data);
            }

            setSuccess('Member added successfully');
            setDialogOpen(false);
            setMemberName('');
            setMemberEmail('');
            setMemberRole('VIEWER');
            
        } catch (err: any) {
            setError(err.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member from the team?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(
                `/api/teams/members?workspaceId=${workspace.id}&teamId=${currentTeam.id}&userId=${memberId}&currentUserId=${user?.uid}`, 
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': user?.uid || '',
                        'X-User-Email': user?.email || ''
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove member');
            }

            // Refresh workspace data
            if (data.data) {
                updateWorkspace(workspaceId, data.data);
            }

            setSuccess('Member removed successfully');
            
        } catch (err: any) {
            setError(err.message || 'Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/teams/members', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user?.uid || '',
                    'X-User-Email': user?.email || ''
                },
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    teamId: currentTeam.id,
                    userId: memberId,
                    teamRole: newRole,
                    currentUserId: user?.uid
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update role');
            }

            // Refresh workspace data
            if (data.data) {
                updateWorkspace(workspaceId, data.data);
            }

            setSuccess('Role updated successfully');
            
        } catch (err: any) {
            setError(err.message || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (role: TeamRole) => {
        const Icon = ROLE_ICONS[role] || ROLE_ICONS.VIEWER;
        return <Icon size={16} color={ROLE_COLORS[role] || ROLE_COLORS.VIEWER} />;
    };

    return (
        <Box sx={{ height: '100%', bgcolor: '#f6f7fb', p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 3 }}>
                    {canManageAccess && (
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={() => setDialogOpen(true)}
                            disabled={loading}
                        >
                            Add Member
                        </Button>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Alerts */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {/* Permission Notice */}
                {!canManageAccess && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Only team leaders and workspace owners can manage team access.
                        You are currently a <strong>{role}</strong>.
                    </Alert>
                )}


                {/* Members Table */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Team Members ({teamMembers.length})
                </Typography>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Member</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Added</TableCell>
                                {canManageAccess && <TableCell align="right">Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teamMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canManageAccess ? 5 : 4} align="center">
                                        <Typography color="text.secondary" sx={{ py: 3 }}>
                                            No team members yet. Add members to collaborate.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teamMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6' }}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2">{member.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            {canManageAccess && member.teamRole !== 'LEADER' ? (
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={member.teamRole || 'VIEWER'}
                                                        onChange={(e) => handleUpdateRole(member.id, e.target.value as TeamRole)}
                                                        disabled={loading}
                                                    >
                                                        <MenuItem value="EDITOR">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {getRoleIcon('EDITOR')}
                                                                Editor
                                                            </Box>
                                                        </MenuItem>
                                                        <MenuItem value="VIEWER">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {getRoleIcon('VIEWER')}
                                                                Viewer
                                                            </Box>
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <Chip
                                                    icon={getRoleIcon(member.teamRole || 'VIEWER')}
                                                    label={member.teamRole || 'VIEWER'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: (ROLE_COLORS[member.teamRole || 'VIEWER'] || ROLE_COLORS.VIEWER) + '20',
                                                        color: ROLE_COLORS[member.teamRole || 'VIEWER'] || ROLE_COLORS.VIEWER,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {member.addedAt ? new Date(member.addedAt).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        {canManageAccess && (
                                            <TableCell align="right">
                                                {member.teamRole !== 'LEADER' && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        disabled={loading}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Role Descriptions */}
                <Box sx={{ mt: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Role Permissions
                    </Typography>
                    {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                        <Box key={role} sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 1 }}>
                            {getRoleIcon(role as TeamRole)}
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {role}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

            {/* Add Member Dialog */}
            <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            disabled={loading}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={memberRole}
                                label="Role"
                                onChange={(e) => setMemberRole(e.target.value as TeamRole)}
                                disabled={loading}
                            >
                                <MenuItem value="EDITOR">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getRoleIcon('EDITOR')}
                                        Editor - {ROLE_DESCRIPTIONS.EDITOR}
                                    </Box>
                                </MenuItem>
                                <MenuItem value="VIEWER">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getRoleIcon('VIEWER')}
                                        Viewer - {ROLE_DESCRIPTIONS.VIEWER}
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Alert severity="info">
                            Adding a team member will automatically add them to the workspace with Viewer access if they're not already a member.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddMember} variant="contained" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

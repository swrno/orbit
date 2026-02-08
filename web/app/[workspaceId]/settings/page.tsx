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
    Alert, Tab, Tabs, Divider
} from "@mui/material";
import {
    Plus, Trash2, Crown, Edit2, Eye, UserCog
} from "lucide-react";
import { useState, useEffect } from "react";
import { WorkspaceMember, WorkspaceRole } from "@/lib/types";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const ROLE_ICONS = {
    OWNER: Crown,
    EDITOR: Edit2,
    VIEWER: Eye
};

const ROLE_COLORS = {
    OWNER: '#f59e0b',
    EDITOR: '#3b82f6',
    VIEWER: '#64748b'
};

export default function WorkspaceSettingsPage() {
    const params = useParams();
    const { user } = useAuth();
    const workspaceId = params.workspaceId as string;

    const { workspaces, updateWorkspace } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const { canManageAccess, isOwner, role } = usePermissions(workspaceId);

    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [memberRole, setMemberRole] = useState<WorkspaceRole>('VIEWER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!workspace) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    const members = workspace.members || [];

    const handleAddMember = async () => {
        if (!memberEmail.trim() || !memberName.trim()) {
            setError('Name and email are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/workspaces/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user?.uid || '',
                    'X-User-Email': user?.email || ''
                },
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    userId: memberEmail, // Using email as temporary ID
                    name: memberName,
                    email: memberEmail,
                    role: memberRole,
                    currentUserId: user?.uid
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add member');
            }

            // Update local state by refreshing workspace data
            if (data.data) {
                updateWorkspace(workspaceId, data.data);
            }

            setDialogOpen(false);
            setMemberName('');
            setMemberEmail('');
            setMemberRole('VIEWER');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Remove this member from the workspace?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/workspaces/members?workspaceId=${workspace.id}&userId=${memberId}&currentUserId=${user?.uid}`,
                {
                    method: 'DELETE',
                    headers: {
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
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: WorkspaceRole) => {
        try {
            const response = await fetch('/api/workspaces/members', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user?.uid || '',
                    'X-User-Email': user?.email || ''
                },
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    userId: memberId,
                    role: newRole,
                    currentUserId: user?.uid
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update member role');
            }

            // Refresh workspace data
            if (data.data) {
                updateWorkspace(workspaceId, data.data);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Workspace Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Manage your workspace settings and member access
            </Typography>

            <Paper sx={{ mt: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="General" />
                    <Tab label="Access Control" />
                    <Tab label="Teams" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>General Settings</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Workspace Name: <strong>{workspace.name}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Project Key: <strong>{workspace.key}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Plan: <strong>{workspace.plan}</strong>
                        </Typography>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Workspace Members</Typography>
                            {canManageAccess && (
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={18} />}
                                    onClick={() => setDialogOpen(true)}
                                >
                                    Add Member
                                </Button>
                            )}
                        </Box>

                        {!canManageAccess && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Only the workspace owner can manage member access.
                                You are currently a <strong>{role}</strong>.
                            </Alert>
                        )}

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Member</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Added</TableCell>
                                        {canManageAccess && <TableCell>Actions</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members.map((member: WorkspaceMember) => {
                                        const roleColor = ROLE_COLORS[member.role] || ROLE_COLORS.VIEWER;
                                        const RoleIcon = ROLE_ICONS[member.role] || ROLE_ICONS.VIEWER;
                                        const isCurrentOwner = member.id === workspace.ownerId;

                                        return (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar src={member.avatar} sx={{ width: 32, height: 32 }}>
                                                            {member.name[0]}
                                                        </Avatar>
                                                        {member.name}
                                                        {isCurrentOwner && <Crown size={14} color="#f59e0b" />}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{member.email}</TableCell>
                                                <TableCell>
                                                    {canManageAccess && !isCurrentOwner ? (
                                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                                            <Select
                                                                value={member.role}
                                                                onChange={(e) => handleUpdateRole(member.id, e.target.value as WorkspaceRole)}
                                                            >
                                                                <MenuItem value="OWNER">Owner</MenuItem>
                                                                <MenuItem value="EDITOR">Editor</MenuItem>
                                                                <MenuItem value="VIEWER">Viewer</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    ) : (
                                                        <Chip
                                                            icon={<RoleIcon size={14} />}
                                                            label={member.role}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: roleColor + '20',
                                                                color: roleColor
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {member.addedAt ? new Date(member.addedAt).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                {canManageAccess && (
                                                    <TableCell>
                                                        {!isCurrentOwner && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveMember(member.id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Access Levels
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Crown size={16} color="#f59e0b" />
                                    <Typography variant="body2">
                                        <strong>Owner:</strong> Full access, can manage members and settings
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Edit2 size={16} color="#3b82f6" />
                                    <Typography variant="body2">
                                        <strong>Editor:</strong> Can view and edit all content, cannot manage access
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Eye size={16} color="#64748b" />
                                    <Typography variant="body2">
                                        <strong>Viewer:</strong> Can only view content, cannot make changes
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Team Access Management</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Configure access for individual teams within this workspace.
                        </Typography>
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Team-specific access controls coming soon. Team leaders will be able to manage their team members.
                        </Alert>
                    </Box>
                </TabPanel>
            </Paper>

            {/* Add Member Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Workspace Member</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Name"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={memberRole}
                            label="Role"
                            onChange={(e) => setMemberRole(e.target.value as WorkspaceRole)}
                        >
                            <MenuItem value="VIEWER">Viewer (View only)</MenuItem>
                            <MenuItem value="EDITOR">Editor (View and edit)</MenuItem>
                            <MenuItem value="OWNER">Owner (Full access)</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAddMember}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

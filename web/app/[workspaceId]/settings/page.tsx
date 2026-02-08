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
    // Custom Tab Panel
    const CustomTabPanel = (props: TabPanelProps) => {
        const { children, value, index, ...other } = props;
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`settings-tabpanel-${index}`}
                aria-labelledby={`settings-tab-${index}`}
                {...other}
                style={{ height: '100%' }}
            >
                {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
            </div>
        );
    };

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 4, width: 1000, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#172B4D', mb: 1 }}>
                        Workspace Settings
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B778C' }}>
                        Manage your workspace settings, members, and permissions.
                    </Typography>
                </Box>

                {/* Main Content Card */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid #DFE1E6',
                        overflow: 'hidden'
                    }}
                >
                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, v) => setTabValue(v)}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    color: '#6B778C',
                                    minHeight: 48,
                                    px: 1,
                                    mr: 4,
                                    '&.Mui-selected': {
                                        color: '#0052CC',
                                        fontWeight: 600
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#0052CC',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab label="General" />
                            <Tab label="Access Control" />
                            <Tab label="Teams" />
                        </Tabs>
                    </Box>

                    {/* General Settings */}
                    <CustomTabPanel value={tabValue} index={0}>
                        <Box sx={{ px: 4, pb: 2 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#172B4D' }}>
                                    Workspace Details
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B778C', mb: 3 }}>
                                    View and manage your workspace information.
                                </Typography>

                                <Box sx={{ display: 'grid', gap: 3, maxWidth: 600 }}>
                                    <Box>
                                        <InputLabel sx={{ color: '#42526E', fontWeight: 500, mb: 1, fontSize: '0.875rem' }}>Workspace Name</InputLabel>
                                        <Typography variant="body1" sx={{ p: 1.5, bgcolor: '#F4F5F7', borderRadius: 1.5, border: '1px solid #DFE1E6', color: '#172B4D', fontWeight: 500 }}>
                                            {workspace.name}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                        <Box>
                                            <InputLabel sx={{ color: '#42526E', fontWeight: 500, mb: 1, fontSize: '0.875rem' }}>Project Key</InputLabel>
                                            <Typography variant="body1" sx={{ p: 1.5, bgcolor: '#F4F5F7', borderRadius: 1.5, border: '1px solid #DFE1E6', color: '#172B4D', fontFamily: 'monospace' }}>
                                                {workspace.key}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <InputLabel sx={{ color: '#42526E', fontWeight: 500, mb: 1, fontSize: '0.875rem' }}>Current Plan</InputLabel>
                                            <Box sx={{ p: 1.5, bgcolor: '#F4F5F7', borderRadius: 1.5, border: '1px solid #DFE1E6', display: 'flex', alignItems: 'center' }}>
                                                <Chip
                                                    label={workspace.plan}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: workspace.plan === 'Pro' ? '#DEEBFF' : '#EAE6FF',
                                                        color: workspace.plan === 'Pro' ? '#0052CC' : '#403294',
                                                        fontWeight: 600,
                                                        height: 24
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            <Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#DE350B' }}>
                                    Danger Zone
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B778C', mb: 2 }}>
                                    Irreversible actions for this workspace.
                                </Typography>
                                <Button variant="outlined" color="error" startIcon={<Trash2 size={16} />}>
                                    Delete Workspace
                                </Button>
                            </Box>
                        </Box>
                    </CustomTabPanel>

                    {/* Access Control */}
                    <CustomTabPanel value={tabValue} index={1}>
                        <Box sx={{ px: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ color: '#172B4D' }}>
                                        Workspace Members
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                        Manage access and roles for your team members.
                                    </Typography>
                                </Box>
                                {canManageAccess && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Plus size={18} />}
                                        onClick={() => setDialogOpen(true)}
                                        sx={{
                                            bgcolor: '#0052CC',
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            boxShadow: 'none',
                                            '&:hover': { bgcolor: '#0065FF', boxShadow: 'none' }
                                        }}
                                    >
                                        Add Member
                                    </Button>
                                )}
                            </Box>

                            {!canManageAccess && (
                                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                    Only the workspace owner can manage member access.
                                    You are currently a <strong>{role}</strong>.
                                </Alert>
                            )}

                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #DFE1E6', borderRadius: 2 }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F4F5F7' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, color: '#42526E', py: 1.5 }}>Member</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#42526E', py: 1.5 }}>Email</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#42526E', py: 1.5 }}>Role</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#42526E', py: 1.5 }}>Added</TableCell>
                                            {canManageAccess && <TableCell sx={{ fontWeight: 600, color: '#42526E', py: 1.5 }} align="right">Actions</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {members.map((member: WorkspaceMember) => {
                                            const roleColor = ROLE_COLORS[member.role] || ROLE_COLORS.VIEWER;
                                            const RoleIcon = ROLE_ICONS[member.role] || ROLE_ICONS.VIEWER;
                                            const isCurrentOwner = member.id === workspace.ownerId;

                                            return (
                                                <TableRow key={member.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar
                                                                src={member.avatar}
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    bgcolor: '#0052CC',
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {member.name[0]}
                                                            </Avatar>
                                                            <Box>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <Typography variant="body2" fontWeight={500} sx={{ color: '#172B4D' }}>
                                                                        {member.name}
                                                                    </Typography>
                                                                    {isCurrentOwner && <Crown size={14} color="#f59e0b" fill="#f59e0b" />}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: '#42526E' }}>
                                                            {member.email}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {canManageAccess && !isCurrentOwner ? (
                                                            <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                                                                <Select
                                                                    value={member.role}
                                                                    onChange={(e) => handleUpdateRole(member.id, e.target.value as WorkspaceRole)}
                                                                    sx={{ height: 32, fontSize: '0.875rem' }}
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
                                                                    bgcolor: roleColor + '15',
                                                                    color: roleColor,
                                                                    fontWeight: 600,
                                                                    border: `1px solid ${roleColor}30`,
                                                                    height: 24
                                                                }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                                            {member.addedAt ? new Date(member.addedAt).toLocaleDateString() : '—'}
                                                        </Typography>
                                                    </TableCell>
                                                    {canManageAccess && (
                                                        <TableCell align="right">
                                                            {!isCurrentOwner && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleRemoveMember(member.id)}
                                                                    sx={{ color: '#FF5630', '&:hover': { bgcolor: '#FF563015' } }}
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

                            {/* Access Levels Legend */}
                            <Box sx={{ mt: 4, p: 2.5, bgcolor: '#F4F5F7', borderRadius: 2, border: '1px solid #DFE1E6' }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: '#172B4D', mb: 2 }}>
                                    Access Levels
                                </Typography>
                                <Box sx={{ display: 'grid', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 0.5, bgcolor: '#FFF7E6', borderRadius: 1, display: 'flex' }}>
                                            <Crown size={16} color="#f59e0b" />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500} sx={{ color: '#172B4D' }}>Owner</Typography>
                                            <Typography variant="caption" sx={{ color: '#6B778C' }}>Full access, can manage members, billing, and workspace settings.</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 0.5, bgcolor: '#DEEBFF', borderRadius: 1, display: 'flex' }}>
                                            <Edit2 size={16} color="#0052CC" />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500} sx={{ color: '#172B4D' }}>Editor</Typography>
                                            <Typography variant="caption" sx={{ color: '#6B778C' }}>Can create and edit content, but cannot manage workspace users.</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 0.5, bgcolor: '#EBECF0', borderRadius: 1, display: 'flex' }}>
                                            <Eye size={16} color="#505F79" />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500} sx={{ color: '#172B4D' }}>Viewer</Typography>
                                            <Typography variant="caption" sx={{ color: '#6B778C' }}>Read-only access to all workspace content.</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </CustomTabPanel>

                    {/* Teams */}
                    <CustomTabPanel value={tabValue} index={2}>
                        <Box sx={{ px: 4, textAlign: 'center', py: 8 }}>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%', bgcolor: '#DEEBFF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
                            }}>
                                <UserCog size={32} color="#0052CC" />
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#172B4D' }}>
                                Advanced Team Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                                Configure granular access controls for individual teams within this workspace.
                            </Typography>
                            <Chip label="Coming Soon" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                        </Box>
                    </CustomTabPanel>
                </Paper>

                {/* Add Member Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 600, color: '#172B4D', borderBottom: '1px solid #DFE1E6', px: 3, py: 2 }}>
                        Add Workspace Member
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, py: 3 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box sx={{ display: 'grid', gap: 2.5 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                placeholder="e.g. John Doe"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                placeholder="e.g. john@example.com"
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="role-select-label" shrink>Role</InputLabel>
                                <Select
                                    labelId="role-select-label"
                                    value={memberRole}
                                    label="Role"
                                    onChange={(e) => setMemberRole(e.target.value as WorkspaceRole)}
                                    displayEmpty
                                >
                                    <MenuItem value="VIEWER">
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>Viewer</Typography>
                                            <Typography variant="caption" color="text.secondary">Read-only access</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="EDITOR">
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>Editor</Typography>
                                            <Typography variant="caption" color="text.secondary">Can edit content</Typography>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="OWNER">
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>Owner</Typography>
                                            <Typography variant="caption" color="text.secondary">Full admin access</Typography>
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid #DFE1E6', pt: 2 }}>
                        <Button
                            onClick={() => setDialogOpen(false)}
                            sx={{ color: '#42526E', textTransform: 'none', fontWeight: 500 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddMember}
                            variant="contained"
                            disabled={loading}
                            sx={{
                                bgcolor: '#0052CC',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': { bgcolor: '#0065FF' }
                            }}
                        >
                            {loading ? 'Adding...' : 'Add Member'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

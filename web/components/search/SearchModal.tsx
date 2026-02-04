"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Dialog, DialogContent, TextField, List, ListItem, ListItemButton,
    ListItemText, Typography, Box, Chip, InputAdornment
} from "@mui/material";
import { Search, FileText, LayoutGrid, Calendar, Users, Bug, Layers } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
}

export function SearchModal({ open, onClose, workspaceId }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);
    const router = useRouter();

    // Reset query when modal closes
    useEffect(() => {
        if (!open) setQuery('');
    }, [open]);

    // Search across tasks, epics, sprints, pages
    const searchResults = useMemo(() => {
        if (!workspace || !query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const results: Array<{
            type: 'task' | 'epic' | 'sprint' | 'page' | 'member';
            id: string;
            title: string;
            subtitle?: string;
            path: string;
        }> = [];

        // Search tasks
        workspace.tasks.forEach(task => {
            if (
                task.title.toLowerCase().includes(lowerQuery) ||
                task.key.toLowerCase().includes(lowerQuery) ||
                task.description?.toLowerCase().includes(lowerQuery)
            ) {
                results.push({
                    type: 'task',
                    id: task.id,
                    title: task.title,
                    subtitle: `${task.key} • ${task.status}`,
                    path: `/${workspaceId}/backlog`
                });
            }
        });

        // Search epics
        workspace.epics?.forEach(epic => {
            if (
                epic.name.toLowerCase().includes(lowerQuery) ||
                epic.description?.toLowerCase().includes(lowerQuery)
            ) {
                results.push({
                    type: 'epic',
                    id: epic.id,
                    title: epic.name,
                    subtitle: `Epic • ${epic.status}`,
                    path: `/${workspaceId}/epics`
                });
            }
        });

        // Search sprints
        workspace.sprints?.forEach(sprint => {
            if (
                sprint.name.toLowerCase().includes(lowerQuery) ||
                sprint.goal?.toLowerCase().includes(lowerQuery)
            ) {
                results.push({
                    type: 'sprint',
                    id: sprint.id,
                    title: sprint.name,
                    subtitle: `Sprint • ${sprint.status}`,
                    path: `/${workspaceId}/sprints`
                });
            }
        });

        // Search pages
        workspace.groups?.forEach(group => {
            group.pages.forEach(page => {
                if (page.title.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        type: 'page',
                        id: page.id,
                        title: page.title,
                        subtitle: `${page.type.charAt(0).toUpperCase() + page.type.slice(1)} • ${group.title}`,
                        path: `/${workspaceId}/${page.id}`
                    });
                }
            });
        });

        // Search team members
        workspace.teamMembers?.forEach(member => {
            if (member.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'member',
                    id: member.id,
                    title: member.name,
                    subtitle: `${member.role} • Team Member`,
                    path: `/${workspaceId}/team`
                });
            }
        });

        return results.slice(0, 20); // Limit to 20 results
    }, [workspace, query, workspaceId]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'task':
                return <Bug size={16} color="#42526E" />;
            case 'epic':
                return <LayoutGrid size={16} color="#42526E" />;
            case 'sprint':
                return <Calendar size={16} color="#42526E" />;
            case 'page':
                return <FileText size={16} color="#42526E" />;
            case 'member':
                return <Users size={16} color="#42526E" />;
            default:
                return <Layers size={16} color="#42526E" />;
        }
    };

    const handleSelect = (path: string) => {
        router.push(path);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* Search Input */}
                <Box sx={{ p: 2, borderBottom: '1px solid #DFE1E6' }}>
                    <TextField
                        autoFocus
                        fullWidth
                        placeholder="Search tasks, epics, sprints, pages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} color="#6B778C" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { border: 'none' },
                            },
                            '& input': {
                                fontSize: '1rem',
                                color: '#172B4D',
                                '&::placeholder': {
                                    color: '#6B778C',
                                    opacity: 1
                                }
                            }
                        }}
                    />
                </Box>

                {/* Results */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {!query.trim() ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Search size={32} color="#DFE1E6" style={{ marginBottom: 8 }} />
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Type to search across tasks, epics, sprints, and more
                            </Typography>
                        </Box>
                    ) : searchResults.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                No results found for "{query}"
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 1 }}>
                            {searchResults.map((result) => (
                                <ListItem key={`${result.type}-${result.id}`} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSelect(result.path)}
                                        sx={{
                                            borderRadius: '3px',
                                            mb: 0.5,
                                            '&:hover': {
                                                bgcolor: '#F4F5F7'
                                            }
                                        }}
                                    >
                                        <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                                            {getIcon(result.type)}
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 500 }}>
                                                    {result.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                                    {result.subtitle}
                                                </Typography>
                                            }
                                        />
                                        <Chip
                                            label={result.type}
                                            size="small"
                                            sx={{
                                                bgcolor: '#F4F5F7',
                                                color: '#42526E',
                                                fontSize: '0.7rem',
                                                height: 20,
                                                textTransform: 'capitalize'
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Footer */}
                {searchResults.length > 0 && (
                    <Box sx={{ p: 1.5, borderTop: '1px solid #DFE1E6', bgcolor: '#F4F5F7' }}>
                        <Typography variant="caption" sx={{ color: '#6B778C' }}>
                            {searchResults.length} result{searchResults.length !== 1 && 's'} found
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

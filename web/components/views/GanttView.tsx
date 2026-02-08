"use client";

import { useState } from "react";
import {
    Box, Typography, Button, IconButton, Menu, MenuItem,
    FormControl, InputLabel, Select, Divider, Chip
} from "@mui/material";
import {
    ChevronDown, Download, Filter, ZoomIn, ZoomOut, MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface GanttViewProps {
    workspaceId: string;
}

export function GanttView({ workspaceId }: GanttViewProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    const [zoom, setZoom] = useState<'week' | 'month'>('week');
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

    if (!workspace) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    // Generate week headers for February 2026
    const weeks = [
        { label: 'W4 12 - 18', range: 'Jan 30 - Feb 12' },
        { label: 'W5 19 - 25', range: 'Feb 27 - Mar 12' },
        { label: 'W6 2 - 8', range: 'W6 2 - 8' },
        { label: 'W7 9 - 15', range: 'W7 9 - 15' },
        { label: 'W8 16 - 22', range: 'W8 16 - 22' },
    ];

    // Group tasks by epic or project
    const teams = [
        {
            id: 'q1-2026',
            name: 'Q1 2026',
            tasks: [
                { id: '1', name: 'Infrastructure', dateRange: 'Jan 30 - Feb 12', progress: 65 },
                { id: '2', name: 'Database Maintenance', dateRange: 'Feb 27 - Mar 12', progress: 40 },
            ]
        },
        {
            id: 'epics-backlog',
            name: 'Epics Backlog',
            tasks: [
                { id: '3', name: 'Automation - Website Services', dateRange: '', progress: 0 },
                { id: '4', name: 'Operations', dateRange: '', progress: 0 },
            ]
        }
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            {/* Controls Bar */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                px: 3, 
                py: 1.5, 
                borderBottom: '1px solid #e6e9ef',
                bgcolor: 'white'
            }}>
                {/* Gantt Title with Dropdown */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#323338', fontSize: '14px' }}>
                        Gantt
                    </Typography>
                    <IconButton size="small" sx={{ p: 0 }}>
                        <ChevronDown size={16} color="#676879" />
                    </IconButton>
                </Box>

                <Divider orientation="vertical" flexItem />

                {/* Controls */}
                <Button
                    size="small"
                    sx={{
                        textTransform: 'none',
                        color: '#676879',
                        fontSize: '13px',
                        fontWeight: 400,
                        minWidth: 'auto',
                        px: 1.5,
                        '&:hover': { bgcolor: '#f6f7fb' }
                    }}
                >
                    Baseline
                </Button>

                <Button
                    size="small"
                    sx={{
                        textTransform: 'none',
                        color: '#676879',
                        fontSize: '13px',
                        fontWeight: 400,
                        minWidth: 'auto',
                        px: 1.5,
                        '&:hover': { bgcolor: '#f6f7fb' }
                    }}
                >
                    Auto fit
                </Button>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                        value={zoom}
                        onChange={(e) => setZoom(e.target.value as 'week' | 'month')}
                        sx={{ fontSize: '13px', height: 32 }}
                    >
                        <MenuItem value="week" sx={{ fontSize: '13px' }}>Week</MenuItem>
                        <MenuItem value="month" sx={{ fontSize: '13px' }}>Month</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <IconButton size="small" sx={{ color: '#676879' }}>
                        <ChevronLeft size={18} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#676879' }}>
                        <ChevronRight size={18} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#676879' }}>
                        <MoreHorizontal size={18} />
                    </IconButton>
                </Box>
            </Box>

            {/* Gantt Chart */}
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#fafbfc' }}>
                {/* Timeline Header */}
                <Box sx={{ 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 2, 
                    bgcolor: 'white',
                    borderBottom: '1px solid #e6e9ef'
                }}>
                    <Box sx={{ display: 'flex' }}>
                        {/* Left column header */}
                        <Box sx={{ 
                            width: 250, 
                            px: 2, 
                            py: 1.5, 
                            borderRight: '1px solid #e6e9ef',
                            bgcolor: '#fafbfc'
                        }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#676879', fontSize: '12px' }}>
                                February 2026
                            </Typography>
                        </Box>

                        {/* Week headers */}
                        <Box sx={{ display: 'flex', flex: 1 }}>
                            {weeks.map((week, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        flex: 1,
                                        px: 2,
                                        py: 1.5,
                                        borderRight: idx < weeks.length - 1 ? '1px solid #e6e9ef' : 'none',
                                        textAlign: 'center',
                                        bgcolor: '#fafbfc'
                                    }}
                                >
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#323338', fontSize: '11px' }}>
                                        {week.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Gantt Rows */}
                {teams.map((team) => (
                    <Box key={team.id}>
                        {/* Group Header */}
                        <Box sx={{ 
                            display: 'flex', 
                            bgcolor: 'white',
                            borderBottom: '1px solid #e6e9ef',
                            '&:hover': { bgcolor: '#f6f7fb' }
                        }}>
                            <Box sx={{ 
                                width: 250, 
                                px: 2, 
                                py: 2, 
                                borderRight: '1px solid #e6e9ef',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <IconButton size="small" sx={{ p: 0 }}>
                                    <ChevronDown size={14} color="#676879" />
                                </IconButton>
                                <Typography sx={{ fontWeight: 600, color: team.id === 'epics-backlog' ? '#e2445c' : '#323338', fontSize: '14px' }}>
                                    {team.name}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }} />
                        </Box>

                        {/* Tasks */}
                        {team.tasks.map((task, taskIdx) => (
                            <Box 
                                key={task.id}
                                sx={{ 
                                    display: 'flex', 
                                    bgcolor: 'white',
                                    borderBottom: '1px solid #e6e9ef',
                                    '&:hover': { bgcolor: '#f6f7fb' }
                                }}
                            >
                                {/* Task Name */}
                                <Box sx={{ 
                                    width: 250, 
                                    px: 2, 
                                    py: 2, 
                                    borderRight: '1px solid #e6e9ef',
                                    display: 'flex',
                                    alignItems: 'center',
                                    pl: 5
                                }}>
                                    <Typography sx={{ color: '#323338', fontSize: '14px' }}>
                                        {task.name}
                                    </Typography>
                                </Box>

                                {/* Timeline */}
                                <Box sx={{ 
                                    flex: 1, 
                                    display: 'flex',
                                    position: 'relative',
                                    minHeight: 48
                                }}>
                                    {/* Grid lines */}
                                    {weeks.map((_, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                flex: 1,
                                                borderRight: idx < weeks.length - 1 ? '1px solid #f4f5f7' : 'none',
                                            }}
                                        />
                                    ))}

                                    {/* Task Bar */}
                                    {task.dateRange && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                left: taskIdx === 0 ? '10%' : '30%',
                                                width: taskIdx === 0 ? '45%' : '55%',
                                                height: 28,
                                                bgcolor: '#0073ea',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                px: 1.5,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: '#0060b9',
                                                }
                                            }}
                                        >
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: 'white', 
                                                    fontWeight: 600,
                                                    fontSize: '12px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {task.dateRange}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ))}

                {/* Add Group Button */}
                <Box sx={{ 
                    p: 2, 
                    pl: 5,
                    bgcolor: 'white',
                    borderBottom: '1px solid #e6e9ef',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f6f7fb' }
                }}>
                    <Button
                        size="small"
                        sx={{
                            textTransform: 'none',
                            color: '#676879',
                            fontSize: '14px',
                            fontWeight: 400,
                            '&:hover': { bgcolor: 'transparent' }
                        }}
                    >
                        + Add new group
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

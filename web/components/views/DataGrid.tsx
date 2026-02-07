"use client";

import { useAppStore, Task, TaskStatus, TaskPriority } from "@/lib/store";
import {
    Plus, ChevronDown, User, MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import {
    Box, Typography, IconButton, Menu, MenuItem,
    Chip, Avatar, Tooltip, Button
} from "@mui/material";

interface DataGridProps {
    workspaceId: string;
    pageId?: string;
}

// Monday.com status colors
const MONDAY_STATUS_COLORS: Record<string, { text: string; bg: string }> = {
    'Dev WIP': { text: '#ffffff', bg: '#579bfc' },
    'Product discovery': { text: '#ffffff', bg: '#fdab3d' },
    'Critical': { text: '#ffffff', bg: '#e2445c' },
};

export function DataGrid({ workspaceId, pageId }: DataGridProps) {
    const { workspaces, addTask, updateTask, deleteTask } = useAppStore();
    const workspace = workspaces.find((w) => w.id === workspaceId);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'q1-2026': true, 'epics-backlog': true });
    const [newTaskTitle, setNewTaskTitle] = useState("");

    if (!workspace) return null;

    // Hardcoded data matching Monday.com screenshot
    const groups = [
        {
            id: 'q1-2026',
            name: 'Q1 2026',
            color: '#323338',
            tasks: [
                {
                    id: '1',
                    name: 'Infrastructure',
                    owner: 'SM',
                    plannedTimeline: 'Feb 29 - May 13',
                    phase: 'Dev WIP',
                    priority: 'Critical',
                    productRequirements: '',
                    connectedTasks: 3,
                    estimatedEffort: 3,
                    epicId: 'EABC-001',
                    timelineBar: { start: 10, width: 60, color: '#0073ea' }
                },
                {
                    id: '2',
                    name: 'Database Maintenance',
                    owner: '',
                    plannedTimeline: 'Feb 27 - Mar 12',
                    phase: 'Product discovery',
                    priority: 'Critical',
                    productRequirements: 'Critical',
                    connectedTasks: 0,
                    estimatedEffort: 0,
                    epicId: 'EABC-003',
                    timelineBar: { start: 30, width: 45, color: '#c4c4c4' }
                },
            ]
        },
        {
            id: 'epics-backlog',
            name: 'Epics Backlog',
            color: '#e2445c',
            tasks: [
                {
                    id: '3',
                    name: 'Automation - Website Services',
                    owner: '',
                    plannedTimeline: '',
                    phase: 'Backlog',
                    priority: 'Best Effort',
                    productRequirements: '',
                    connectedTasks: 0,
                    estimatedEffort: 0,
                    epicId: 'EABC-003',
                    timelineBar: null
                },
                {
                    id: '4',
                    name: 'Operations',
                    owner: '',
                    plannedTimeline: '',
                    phase: 'Backlog',
                    priority: 'Best Effort',
                    productRequirements: '',
                    connectedTasks: 0,
                    estimatedEffort: 0,
                    epicId: 'EABC-004',
                    timelineBar: null
                },
            ]
        }
    ];

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white'}}>
            {/* Toolbar */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                px: 2.5, 
                py: 1.5,
                borderBottom: '1px solid #e6e9ef'
            }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Plus size={14} />}
                    sx={{
                        bgcolor: '#0073ea',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '13px',
                        px: 2,
                        py: 0.75,
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: '#0060b9',
                            boxShadow: 'none'
                        }
                    }}
                >
                    New epic
                </Button>

                <Button
                    startIcon={<Plus size={14} />}
                    size="small"
                    sx={{
                        textTransform: 'none',
                        color: '#676879',
                        fontSize: '13px',
                        fontWeight: 500,
                        px: 2,
                        py: 0.75,
                        border: '1px solid #e6e9ef',
                        '&:hover': {
                            bgcolor: '#f6f7fb',
                            borderColor: '#c7c7d1'
                        }
                    }}
                >
                    Add widget
                </Button>
            </Box>

            {/* Table */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {/* Header Row */}
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: '40px 300px 120px 180px 120px 150px 120px 150px 1fr',
                    bgcolor: '#fafbfc',
                    borderBottom: '2px solid #e6e9ef',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }} />
                    
                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, borderRight: '1px solid #e6e9ef' }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#323338' }}>Epic</Typography>
                        <IconButton size="small" sx={{ p: 0 }}>
                            <ChevronDown size={14} color="#676879" />
                        </IconButton>
                    </Box>

                    {['Owner', 'Planned timeline', 'Phase', 'Priority', 'Product requirements', 'Connected tasks', 'Estimated of...'].map((col) => (
                        <Box key={col} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, borderRight: '1px solid #e6e9ef' }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#323338' }}>{col}</Typography>
                            <IconButton size="small" sx={{ p: 0 }}>
                                <ChevronDown size={14} color="#676879" />
                            </IconButton>
                        </Box>
                    ))}
                </Box>

                {/* Groups and Rows */}
                {groups.map((group) => {
                    const isExpanded = expandedGroups[group.id];
                    
                    return (
                        <Box key={group.id}>
                            {/* Group Header */}
                            <Box
                                onClick={() => toggleGroup(group.id)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 1.5,
                                    bgcolor: 'white',
                                    borderBottom: '1px solid #e6e9ef',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: '#f6f7fb'
                                    }
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        width: 6,
                                        height: 32,
                                        bgcolor: group.color,
                                        borderRadius: '3px',
                                        mr: 0.5
                                    }} 
                                />
                                <IconButton size="small" sx={{ p: 0 }}>
                                    <ChevronDown 
                                        size={16} 
                                        color="#676879"
                                        style={{ 
                                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            transition: 'transform 0.2s' 
                                        }} 
                                    />
                                </IconButton>
                                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: group.id === 'epics-backlog' ? group.color : '#323338' }}>
                                    {group.name}
                                </Typography>
                            </Box>

                            {/* Task Rows */}
                            {isExpanded && group.tasks.map((task) => (
                                <Box
                                    key={task.id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '40px 300px 120px 180px 120px 150px 120px 150px 1fr',
                                        borderBottom: '1px solid #e6e9ef',
                                        '&:hover': {
                                            bgcolor: '#f6f7fb'
                                        }
                                    }}
                                >
                                    {/* Check */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        <Box sx={{ width: 16, height: 16, border: '2px solid #c7c7d1', borderRadius: '3px' }} />
                                    </Box>

                                    {/* Epic Name */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderRight: '1px solid #e6e9ef' }}>
                                        <Typography sx={{ fontSize: '14px', color: '#323338', fontWeight: 400 }}>
                                            {task.name}
                                        </Typography>
                                    </Box>

                                    {/* Owner */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        {task.owner ? (
                                            <Chip
                                                avatar={<Avatar sx={{ width: 20, height: 20, fontSize: '10px', bgcolor: '#0073ea', fontWeight: 600 }}>{task.owner}</Avatar>}
                                                label={task.owner}
                                                sx={{
                                                    height: 24,
                                                    fontSize: '12px',
                                                    bgcolor: 'transparent',
                                                    '& .MuiChip-avatar': { ml: 0 }
                                                }}
                                            />
                                        ) : null}
                                    </Box>

                                    {/* Planned Timeline */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        {task.plannedTimeline && (
                                            <Typography sx={{ fontSize: '13px', color: '#323338' }}>
                                                {task.plannedTimeline}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Phase */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        {MONDAY_STATUS_COLORS[task.phase] ? (
                                            <Chip
                                                label={task.phase}
                                                sx={{
                                                    height: 26,
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    bgcolor: MONDAY_STATUS_COLORS[task.phase].bg,
                                                    color: MONDAY_STATUS_COLORS[task.phase].text,
                                                    borderRadius: '4px',
                                                    px: 0.5
                                                }}
                                            />
                                        ) : (
                                            <Chip
                                                label={task.phase}
                                                sx={{
                                                    height: 26,
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    bgcolor: '#c4c4c4',
                                                    color: '#ffffff',
                                                    borderRadius: '4px',
                                                    px: 0.5
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Priority */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        {task.priority === 'Critical' ? (
                                            <Chip
                                                label={task.priority}
                                                sx={{
                                                    height: 26,
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    bgcolor: '#e2445c',
                                                    color: '#ffffff',
                                                    borderRadius: '4px',
                                                    px: 0.5
                                                }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontSize: '13px', color: '#676879' }}>
                                                {task.priority}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Product Requirements */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        {task.productRequirements === 'Critical' && (
                                            <Chip
                                                label="Critical"
                                                sx={{
                                                    height: 26,
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    bgcolor: '#e2445c',
                                                    color: '#ffffff',
                                                    borderRadius: '4px',
                                                    px: 0.5
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Connected Tasks */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRight: '1px solid #e6e9ef' }}>
                                        {task.connectedTasks > 0 && (
                                            <Typography sx={{ fontSize: '13px', color: '#323338' }}>
                                                {task.connectedTasks}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Timeline Bar */}
                                    <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', position: 'relative', minHeight: 44 }}>
                                        {task.timelineBar && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    left: `${task.timelineBar.start}%`,
                                                    width: `${task.timelineBar.width}%`,
                                                    height: 28,
                                                    bgcolor: task.timelineBar.color,
                                                    borderRadius: '4px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            ))}

                            {/* Add Epic Button */}
                            {isExpanded && (
                                <Box sx={{ 
                                    p: 1.5, 
                                    pl: 7,
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
                                        + Add epic
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    );
                })}

                {/* Add Group */}
                <Box sx={{ 
                    p: 2, 
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

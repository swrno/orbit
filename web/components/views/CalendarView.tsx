"use client";

import { use, useState } from "react";
import {
    Box, Container, Typography, Paper, Button, Grid, IconButton, Tooltip,
    Card, CardContent, Chip
} from "@mui/material";
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface CalendarViewProps {
    workspaceId: string;
}

export function CalendarView({ workspaceId }: CalendarViewProps) {
    const { workspaces } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);
    
    const [currentDate, setCurrentDate] = useState(new Date());

    if (!workspace) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography>Workspace not found</Typography>
            </Box>
        );
    }

    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Mock events derived from tasks for demonstration
    const getEventsForDay = (day: number) => {
        // Deterministic pseudo-random distribution based on day number
        const events = workspace.tasks
            .filter((_, idx) => (idx + day) % 7 === 0) 
            .slice(0, 3);
        return events;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f4f5f7' }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #DFE1E6', p: 3 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={600} sx={{ color: '#172B4D', mb: 0.5 }}>
                                Calendar
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                Schedule and events
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            sx={{
                                bgcolor: '#0052CC',
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#0747A6' },
                                boxShadow: 'none'
                            }}
                        >
                            Add Event
                        </Button>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', border: '1px solid #DFE1E6', borderRadius: 1 }}>
                            <IconButton onClick={handlePrevMonth} size="small">
                                <ChevronLeft size={20} />
                            </IconButton>
                            <Typography variant="body1" fontWeight={600} sx={{ minWidth: 150, textAlign: 'center', px: 2 }}>
                                {monthName}
                            </Typography>
                            <IconButton onClick={handleNextMonth} size="small">
                                <ChevronRight size={20} />
                            </IconButton>
                        </Box>
                        
                        <Button variant="outlined" sx={{ color: '#42526E', borderColor: '#DFE1E6', textTransform: 'none' }} onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Container maxWidth="xl" sx={{ height: '100%' }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 'none', border: '1px solid #DFE1E6' }}>
                        {/* Days Header */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #DFE1E6' }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <Box key={day} sx={{ p: 2, textAlign: 'center', bgcolor: '#FAFBFC', borderRight: '1px solid #DFE1E6' }}>
                                    <Typography variant="subtitle2" sx={{ color: '#6B778C' }}>{day}</Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Days Grid */}
                        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr' }}>
                            {/* Empty cells for previous month */}
                            {Array.from({ length: firstDay }).map((_, idx) => (
                                <Box key={`prev-${idx}`} sx={{ bgcolor: '#F9F9F9', borderRight: '1px solid #DFE1E6', borderBottom: '1px solid #DFE1E6' }} />
                            ))}

                            {/* Current month days */}
                            {Array.from({ length: days }).map((_, idx) => {
                                const day = idx + 1;
                                const events = getEventsForDay(day);
                                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

                                return (
                                    <Box 
                                        key={`day-${day}`} 
                                        sx={{ 
                                            p: 1, 
                                            borderRight: '1px solid #DFE1E6', 
                                            borderBottom: '1px solid #DFE1E6',
                                            bgcolor: isToday ? '#E6F0FF' : 'white',
                                            minHeight: 120,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            fontWeight={isToday ? 700 : 400}
                                            sx={{ 
                                                mb: 1, 
                                                color: isToday ? '#0052CC' : '#172B4D',
                                                bgcolor: isToday ? 'white' : 'transparent',
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {day}
                                        </Typography>

                                        {events.map(event => (
                                            <Tooltip key={event.id} title={`${event.title} - ${event.status}`}>
                                                <Box 
                                                    sx={{ 
                                                        p: 0.5, 
                                                        borderRadius: 1, 
                                                        bgcolor: event.status === 'Done' ? '#E3FCEF' : event.status === 'In Progress' ? '#DEEBFF' : '#EAE6FF',
                                                        color: event.status === 'Done' ? '#006644' : event.status === 'In Progress' ? '#0052CC' : '#5243AA',
                                                        fontSize: '0.75rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        cursor: 'pointer',
                                                        borderLeft: `3px solid ${event.status === 'Done' ? '#36B37E' : event.status === 'In Progress' ? '#0052CC' : '#6554C0'}`
                                                    }}
                                                >
                                                    {event.title}
                                                </Box>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                );
                            })}
                            
                            {/* Remaining cells to fill grid if needed */}
                            {Array.from({ length: 42 - (days + firstDay) }).map((_, idx) => (
                                <Box key={`next-${idx}`} sx={{ bgcolor: '#F9F9F9', borderRight: '1px solid #DFE1E6', borderBottom: '1px solid #DFE1E6' }} />
                            ))}
                        </Box>
                    </Card>
                </Container>
            </Box>
        </Box>
    );
}

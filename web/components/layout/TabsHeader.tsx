"use client";

import { useState } from "react";
import {
    Box, Tabs, Tab, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Typography, FormControl, InputLabel, Select, MenuItem as SelectItem
} from "@mui/material";
import {
    Plus, Table, Calendar, BarChart3, TrendingUp, Kanban, FileText,
    Layout, List, X
} from "lucide-react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useAppStore, PageType } from "@/lib/store";
import { useEffect } from "react";

interface PageTab {
    id: string;
    label: string;
    type: PageType;
    path: string;
}

interface TabsHeaderProps {
    workspaceId: string;
    currentPath?: string;
}

export default function TabsHeader({ workspaceId, currentPath }: TabsHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    // State for view creation removed


    // Map view types to existing pages
    const viewTypeToPath = (type: string) => {
        switch (type) {
            case 'table':
            case 'list':
                return `/${workspaceId}/backlog`;
            case 'board':
                return `/${workspaceId}/sprints`;
            case 'gantt':
                return `/${workspaceId}/gantt`;
            case 'roadmap':
                return `/${workspaceId}/roadmap`;
            case 'chart':
                return `/${workspaceId}/reports`;
            case 'calendar':
                return `/${workspaceId}/sprints`;
            case 'document':
                return `/${workspaceId}/backlog`;
            default:
                return `/${workspaceId}/backlog`;
        }
    };

    const params = useParams();
    // const workspaceId = params.workspaceId as string; // Already passed as prop

    const { workspaces, addPage } = useAppStore();
    const workspace = workspaces.find(w => w.id === workspaceId);

    // Default tabs for workspace (using existing pages)
    const defaultTabs: PageTab[] = [
        { id: 'backlog', label: 'Backlog', type: 'table', path: `/${workspaceId}/backlog` },
        { id: 'sprints', label: 'Sprints', type: 'board', path: `/${workspaceId}/sprints` },
        { id: 'roadmap', label: 'Roadmap', type: 'roadmap', path: `/${workspaceId}/roadmap` },
    ];

    const [tabs, setTabs] = useState<PageTab[]>(defaultTabs);

    // Sync tabs with current path/page
    useEffect(() => {
        if (!pathname || !workspace) return;

        // Check if current path matches a dynamic page
        // Format: /[workspaceId]/[pageId]
        const pathParts = pathname.split('/');
        const pageId = pathParts[pathParts.length - 1];

        // Check if it's a known static page
        const isStatic = ['backlog', 'sprints', 'roadmap', 'reports', 'team', 'bugs', 'get-started'].includes(pageId);

        if (!isStatic) {
            // Try to find the page in workspace groups
            let foundPage = null;
            for (const group of workspace.groups) {
                const page = group.pages.find(p => p.id === pageId);
                if (page) {
                    foundPage = page;
                    break;
                }
            }

            if (foundPage) {
                // Check if already in tabs
                const existingTab = tabs.find(t => t.path === pathname);
                if (!existingTab) {
                    setTabs(prev => [...prev, {
                        id: foundPage!.id,
                        label: foundPage!.title,
                        type: foundPage!.type as PageType,
                        path: pathname
                    }]);
                }
            }
        } else {
            // Handle static pages not in default tabs (like reports, team, get-started)
            const existingTab = tabs.find(t => t.path === pathname);
            if (!existingTab) {
                const staticPageConfig: Record<string, { label: string, type: PageType }> = {
                    'reports': { label: 'Reports', type: 'chart' },
                    'team': { label: 'Team', type: 'list' },
                    'bugs': { label: 'Bugs Queue', type: 'list' },
                    'get-started': { label: 'Getting Started', type: 'document' },
                    'epics': { label: 'Epics', type: 'list' },
                    'backlog': { label: 'Backlog', type: 'table' },
                    'sprints': { label: 'Sprints', type: 'board' },
                    'roadmap': { label: 'Roadmap', type: 'roadmap' }
                };

                const config = staticPageConfig[pageId];
                if (config) {
                     setTabs(prev => [...prev, {
                        id: pageId,
                        label: config.label,
                        type: config.type,
                        path: pathname
                    }]);
                }
            }
        }
    }, [pathname, workspace, tabs]);

    // View creation logic removed and moved to Sidebar as per request
    const viewTypes = [
        { value: 'table', label: 'Table View', icon: <Table size={18} />, description: 'Spreadsheet-style table' },
        { value: 'document', label: 'Document', icon: <FileText size={18} />, description: 'Rich text document' }
    ];
    
    // ...

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        const tab = tabs.find(t => t.path === newValue);
        if (tab) {
            router.push(tab.path);
        }
    };

    const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (tabs.length > 1) {
            setTabs(tabs.filter(t => t.id !== tabId));
        }
    };

    const currentTab = tabs.find(t => pathname?.includes(t.path)) || tabs[0];

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'white',
                    borderBottom: '1px solid #DFE1E6',
                    px: 2
                }}
            >
                <Tabs
                    value={currentTab?.path || false}
                    onChange={handleTabChange}
                    sx={{
                        flex: 1,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: 48,
                            color: '#6B778C',
                            fontWeight: 500,
                            '&.Mui-selected': {
                                color: '#0052CC'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#0052CC'
                        }
                    }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.id}
                            value={tab.path}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {viewTypes.find(v => v.value === tab.type)?.icon}
                                    <span>{tab.label}</span>
                                    {tabs.length > 1 && (
                                        <Box component="span"
                                            onClick={(e) => handleCloseTab(tab.id, e)}
                                            sx={{
                                                ml: 0.5,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.25,
                                                borderRadius: '2px',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <X size={14} />
                                        </Box>
                                    )}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Box>
        </>
    );
}

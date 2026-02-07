import { Box, Typography, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Plus, X, Table, Kanban, Calendar, BarChart2, List, FileText } from "lucide-react";
import { useState } from "react";

export interface ViewTab {
  id: string;
  label: string;
  type: 'table' | 'gantt' | 'kanban' | 'calendar' | 'chart' | 'roadmap';
}

interface ViewTabsProps {
  views: ViewTab[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onAddView?: (viewType: string) => void;
  onRemoveView?: (viewId: string) => void;
}

export function ViewTabs({ views, activeViewId, onViewChange, onAddView, onRemoveView }: ViewTabsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectView = (viewType: string) => {
    if (onAddView) {
      onAddView(viewType);
    }
    handleClose();
  };

  const VIEW_OPTIONS = [
    { type: 'table', label: 'Table', icon: <Table size={16} /> },
    { type: 'kanban', label: 'Kanban', icon: <Kanban size={16} /> },
    { type: 'gantt', label: 'Gantt', icon: <BarChart2 size={16} style={{ transform: 'rotate(90deg)' }} /> },
    { type: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
    { type: 'chart', label: 'Chart', icon: <BarChart2 size={16} /> },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      borderBottom: '1px solid #e6e9ef',
      bgcolor: 'white',
      px: 3,
      pt: 1
    }}>
      {views.map((view) => (
        <Box
          key={view.id}
          onClick={() => onViewChange(view.id)}
          sx={{
            px: 2,
            py: 1,
            cursor: 'pointer',
            borderBottom: activeViewId === view.id ? '2px solid #0073ea' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: activeViewId === view.id ? '#323338' : '#676879',
            '&:hover': {
              bgcolor: '#f6f7fb',
              color: '#323338',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              '& .close-icon': { opacity: 1 }
            }
          }}
        >
          <Typography sx={{ fontSize: '14px', fontWeight: activeViewId === view.id ? 500 : 400 }}>
            {view.label}
          </Typography>
          
          {onRemoveView && view.id !== 'table' && (
            <IconButton 
              size="small" 
              className="close-icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveView(view.id);
              }}
              sx={{ 
                p: 0.5, 
                ml: 0.5, 
                opacity: activeViewId === view.id ? 1 : 0, 
                transition: 'opacity 0.2s',
                '&:hover': { bgcolor: '#e6e9ef' }
              }}
            >
              <X size={12} />
            </IconButton>
          )}
        </Box>
      ))}
      
      <IconButton 
        size="small" 
        onClick={handleAddClick}
        sx={{ 
          ml: 1, 
          mb: 0.5,
          color: '#676879',
          '&:hover': { bgcolor: '#f6f7fb', color: '#323338' } 
        }}
      >
        <Plus size={16} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 200, mt: 1 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#676879' }}>
            ADD VIEW
          </Typography>
        </Box>
        {VIEW_OPTIONS.map((option) => (
          <MenuItem 
            key={option.type} 
            onClick={() => handleSelectView(option.type)}
            sx={{ fontSize: '14px', gap: 1.5 }}
          >
            {option.icon}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

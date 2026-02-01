import { Filter, MoreHorizontal, Plus } from "lucide-react";
import { PageTabs } from "./PageTabs";
import { AppBar, Toolbar, Box, IconButton, Avatar, AvatarGroup, Button, Divider } from "@mui/material";

export function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ minHeight: '64px!important', px: 2, gap: 2 }}>
        {/* Left Side: Tabs */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
           <PageTabs />
        </Box>

        {/* Right Side: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12, border: '2px solid #fff' } }}>
            {[1, 2, 3].map((i) => (
              <Avatar key={i} sx={{ bgcolor: 'action.selected', color: 'text.secondary' }}>U{i}</Avatar>
            ))}
          </AvatarGroup>
          
          <Divider orientation="vertical" flexItem variant="middle" sx={{ height: 20 }} />
          
          <IconButton size="small">
            <Filter size={16} />
          </IconButton>
          <IconButton size="small">
            <MoreHorizontal size={16} />
          </IconButton>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<Plus size={16} />}
            sx={{ textTransform: 'none', boxShadow: 2 }}
          >
            New Task
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

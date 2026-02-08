import { Box, Button, IconButton, TextField, InputAdornment } from "@mui/material";
import { Search, Filter, Eye, MoreHorizontal, Plus } from "lucide-react";

interface ViewToolbarProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  onCreate: () => void;
  createButtonLabel: string;
  createButtonColor?: string;
  hideCreate?: boolean;
}

export function ViewToolbar({
  onSearch,
  onFilter,
  onCreate,
  createButtonLabel,
  createButtonColor = '#0073ea',
  hideCreate = false
}: ViewToolbarProps) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 3,
      py: 1.5,
      bgcolor: 'white',
      borderBottom: '1px solid #e6e9ef'
    }}>
      <Button
        variant="contained"
        startIcon={<Plus size={16} />}
        onClick={onCreate}
        disabled={hideCreate}
        sx={{
          bgcolor: createButtonColor,
          '&:hover': { bgcolor: createButtonColor, filter: 'brightness(0.9)' },
          textTransform: 'none',
          borderRadius: '4px',
          boxShadow: 'none',
          height: '32px',
          opacity: hideCreate ? 0.5 : 1,
          pointerEvents: hideCreate ? 'none' : 'auto'
        }}
      >
        {createButtonLabel}
      </Button>

      <TextField
        placeholder="Search"
        size="small"
        onChange={(e) => onSearch(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '32px',
            '& fieldset': { border: 'none' }, // Clean monday.com style look
            '&:hover fieldset': { border: '1px solid #e6e9ef' },
            '&.Mui-focused fieldset': { border: '1px solid #0073ea' }
          },
          '& .MuiInputBase-input': { fontSize: '14px' }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} color="#676879" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        startIcon={<Filter size={16} />}
        onClick={onFilter}
        sx={{
          textTransform: 'none',
          color: '#676879',
          fontSize: '14px',
          fontWeight: 400,
          '&:hover': { bgcolor: '#f6f7fb', color: '#323338' }
        }}
      >
        Filter
      </Button>

      <Button
        startIcon={<Eye size={16} />}
        sx={{
          textTransform: 'none',
          color: '#676879',
          fontSize: '14px',
          fontWeight: 400,
          '&:hover': { bgcolor: '#f6f7fb', color: '#323338' }
        }}
      >
        Hide
      </Button>

      <IconButton size="small" sx={{ color: '#676879', ml: 'auto' }}>
        <MoreHorizontal size={18} />
      </IconButton>
    </Box>
  );
}

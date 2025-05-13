import React from 'react';
import { 
  Box, 
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';

const CollapsedProcessPanel = ({ currentProcess, historicalProcesses = [], onToggleVisibility }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      py: 2,
      height: '100%',
      borderLeft: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper'
    }}>
      <Tooltip title="Expand process panel" placement="left">
        <IconButton 
          onClick={onToggleVisibility}
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            }
          }}
        >
          <VisibilityIcon color="primary" fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Divider sx={{ width: '60%', mb: 2 }} />
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        {currentProcess && (
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              bgcolor: 'primary.main',
              boxShadow: '0 0 4px rgba(25, 118, 210, 0.8)'
            }} 
          />
        )}
        
        {historicalProcesses.length > 0 && (
          <Tooltip title={`${historicalProcesses.length} historical processes`} placement="left">
            <Box sx={{ position: 'relative', mt: 1 }}>
              <HistoryIcon color="action" fontSize="small" />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -2, 
                  right: -2, 
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {historicalProcesses.length}
              </Box>
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default CollapsedProcessPanel; 
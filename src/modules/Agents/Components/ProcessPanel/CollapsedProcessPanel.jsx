import React from 'react';
import { 
  Box, 
  Tooltip,
  Divider,
  useMediaQuery,
  keyframes
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// Define a subtle pulse animation for the collapsed panel
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.2);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const CollapsedProcessPanel = ({ currentProcess, historicalProcesses = [], onToggleVisibility }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box 
      onClick={onToggleVisibility}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        py: 2,
        height: '100%',
        width: '100%', // Use 100% of the container width
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        // Ensure the collapsed panel doesn't exceed necessary space on mobile
        maxWidth: isMobile ? '36px' : '40px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        // Add a subtle pulsing border effect on the left side to indicate interactivity
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '40px',
          backgroundColor: theme.palette.primary.main,
          opacity: 0.6,
          borderRadius: '0 2px 2px 0',
          animation: `${pulseAnimation} 2s infinite`,
        }
      }}
    >
      
      {/* Add chevron icon to indicate clickability */}
      <Box sx={{ mb: 2 }}>
        <ChevronLeftIcon color="action" fontSize="small" />
      </Box>
      
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
            <Box 
              // Stop propagation to prevent tooltip from closing immediately
              onClick={(e) => e.stopPropagation()}
              sx={{ position: 'relative', mt: 1 }}
            >
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
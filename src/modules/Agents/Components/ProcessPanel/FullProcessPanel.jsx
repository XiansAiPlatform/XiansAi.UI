import { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import ProcessStep from './ProcessStep';
import ProcessItem from './ProcessItem';

const FullProcessPanel = ({ selectedAgent, currentProcess, historicalProcesses = [], onToggleVisibility }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        maxHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        bgcolor: 'background.default'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64 // Match the chat header height
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {selectedAgent?.name || 'No Agent Selected'}
          </Typography>
          {selectedAgent && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              - Activity Details
            </Typography>
          )}
        </Box>
        
        <Tooltip title="Collapse panel">
          <IconButton 
            size="small" 
            onClick={onToggleVisibility}
            aria-label="Collapse process panel"
          >
            <VisibilityOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Tabs for Current/History */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: 'background.paper',
        height: 48 // Match the consistent height for the tabs bar
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ height: '100%' }}
        >
          <Tab 
            label="Current" 
            icon={<PlayArrowIcon fontSize="small" />} 
            iconPosition="start"
            disabled={!currentProcess}
            sx={{ minHeight: 48, textTransform: 'none' }}
          />
          <Tab 
            label="History" 
            icon={<HistoryIcon fontSize="small" />} 
            iconPosition="start"
            disabled={historicalProcesses.length === 0}
            sx={{ minHeight: 48, textTransform: 'none' }}
          />
        </Tabs>
      </Box>
      
      {/* Visualization Content */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
        }}
      >
        {selectedAgent ? (
          <>
            {/* Current Process Tab */}
            {activeTab === 0 && (
              currentProcess ? (
                <Box>
                  {currentProcess.steps.map((step, index) => {
                    const isActive = step.name === currentProcess.currentStep;
                    const isPending = !step.completed && !isActive;
                    
                    return (
                      <ProcessStep 
                        key={step.id}
                        step={step}
                        isActive={isActive}
                        isPending={isPending}
                      />
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={24} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading process data...
                  </Typography>
                </Box>
              )
            )}
            
            {/* Historical Processes Tab */}
            {activeTab === 1 && (
              historicalProcesses.length > 0 ? (
                <Box>
                  {historicalProcesses.map(process => (
                    <ProcessItem 
                      key={process.id} 
                      process={process} 
                      isCurrent={false} 
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                  <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No historical processes found
                  </Typography>
                </Box>
              )
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              No Agent Selected
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Select an agent to view the process visualization.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FullProcessPanel; 
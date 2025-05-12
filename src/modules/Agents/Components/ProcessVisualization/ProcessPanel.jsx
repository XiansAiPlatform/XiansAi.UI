import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 

  Tabs,
  Tab,
  Divider,

  Collapse,
  IconButton,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Helper to detect if a string looks like JSON
const isJsonString = (str) => {
  try {
    const json = JSON.parse(str);
    return typeof json === 'object' && json !== null;
  } catch (e) {
    return false;
  }
};

// Helper to detect if a string looks like a URL
const isUrl = (str) => {
  try {
    return Boolean(new URL(str));
  } catch (e) {
    return false;
  }
};

// Helper to format JSON with syntax highlighting (simple version)
const JsonView = ({ data }) => {
  const jsonString = JSON.stringify(data, null, 2);
  
  // Handle copy action
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        whiteSpace: 'pre-wrap',
        bgcolor: 'rgba(0,0,0,0.04)',
        p: 1.5,
        borderRadius: 1,
        maxHeight: '300px',
        overflow: 'auto',
        '&:hover .copy-button': {
          opacity: 1
        }
      }}
    >
      <Tooltip title="Copy to clipboard">
        <IconButton 
          size="small" 
          onClick={handleCopy}
          className="copy-button"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {jsonString}
    </Box>
  );
};

// Component to render input/output data
const StepDataDisplay = ({ label, icon, data }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate if data is large based on content
  const isLargeData = useMemo(() => {
    if (!data) return false;
    // Convert data to string for size estimation
    const dataStr = JSON.stringify(data);
    // If data is more than 150 characters or has nested objects
    return dataStr.length > 150 || dataStr.includes('{"');
  }, [data]);
  
  // Check if data is a simple JSON object that should be displayed as JSON
  const isJsonObject = useMemo(() => {
    if (!data) return false;
    return typeof data === 'object' && data !== null && Object.keys(data).length > 3;
  }, [data]);
  
  // If data is null or undefined, don't display anything
  if (!data) return null;
  
  // Function to render different types of data
  const renderData = (data, indent = 0) => {
    // Special case: if this is a large JSON object, render it as formatted JSON
    if (isJsonObject && expanded) {
      return <JsonView data={data} />;
    }
    
    if (typeof data === 'object' && data !== null) {
      // Handle arrays differently
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return <Typography variant="body2" color="text.disabled">Empty array</Typography>;
        }
        
        if (typeof data[0] === 'string' && data.length <= 10) {
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {data.map((item, index) => (
                <Chip 
                  key={index} 
                  label={item} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          );
        }
        
        return (
          <Box sx={{ ml: indent > 0 ? 2 : 0 }}>
            {data.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 'medium' }}>
                  [{index}]:
                </Typography>
                {typeof item === 'object' && item !== null ? (
                  renderData(item, indent + 1)
                ) : (
                  <Typography variant="body2" component="span" sx={{ wordBreak: 'break-word' }}>
                    {String(item)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        );
      }
      
      // Handle objects
      return (
        <Box sx={{ ml: indent > 0 ? 2 : 0 }}>
          {Object.entries(data).map(([key, value]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 'medium' }}>
                {key}:
              </Typography>
              {typeof value === 'object' && value !== null ? (
                renderData(value, indent + 1)
              ) : (
                <FieldValue value={value} />
              )}
            </Box>
          ))}
        </Box>
      );
    } else if (data === null) {
      return <Typography variant="body2" color="text.disabled">None</Typography>;
    } else {
      return <FieldValue value={data} />;
    }
  };
  
  // Component to render field values with special handling for different types
  const FieldValue = ({ value }) => {
    // Handle different value types
    if (typeof value === 'string') {
      // Handle URLs (especially image URLs)
      if (isUrl(value)) {
        const url = new URL(value);
        const isImage = /\.(jpg|jpeg|png|gif|bmp|svg)$/.test(url.pathname);
        
        if (isImage) {
          return (
            <Box>
              <Box 
                component="img"
                src={value}
                alt="Image"
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: '150px',
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 0.5
                }}
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {value}
              </Typography>
            </Box>
          );
        }
        
        return (
          <Button 
            variant="text" 
            size="small" 
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<TextSnippetIcon fontSize="small" />}
            sx={{ ml: -1 }}
          >
            {url.pathname.split('/').pop() || url.hostname}
          </Button>
        );
      }
      
      // Handle potential JSON strings
      if (isJsonString(value)) {
        try {
          const parsed = JSON.parse(value);
          return <JsonView data={parsed} />;
        } catch (e) {
          // Fall back to regular string display
        }
      }
    }
    
    // Default text display
    return (
      <Typography variant="body2" component="span" sx={{ wordBreak: 'break-word' }}>
        {String(value)}
      </Typography>
    );
  };

  // Function to copy data to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => {
        console.log('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Get a preview version of the data for collapsed state
  const getPreview = () => {
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return (
          <Box>
            <Typography variant="body2">
              Array ({data.length} item{data.length !== 1 ? 's' : ''})
            </Typography>
            {data.length > 0 && data.length <= 3 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {data.slice(0, 3).map((item, index) => (
                  <Chip 
                    key={index} 
                    label={typeof item === 'object' ? '{ ... }' : String(item)} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
                {data.length > 3 && (
                  <Typography variant="caption" color="text.secondary">...</Typography>
                )}
              </Box>
            )}
          </Box>
        );
      }
      
      const keys = Object.keys(data).slice(0, 3);
      const preview = {};
      keys.forEach(key => {
        let value = data[key];
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            value = `[${value.length} item${value.length !== 1 ? 's' : ''}]`;
          } else {
            value = '{...}';
          }
        } else if (typeof value === 'string' && value.length > 30) {
          value = value.substring(0, 30) + '...';
        }
        preview[key] = value;
      });
      
      const remaining = Object.keys(data).length - keys.length;
      return (
        <Box>
          {keys.map(key => (
            <Box key={key} sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 'medium' }}>
                {key}:
              </Typography>
              <Typography variant="body2" component="span">
                {typeof preview[key] === 'object' ? JSON.stringify(preview[key]) : String(preview[key])}
              </Typography>
            </Box>
          ))}
          {remaining > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              + {remaining} more field{remaining > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      );
    }
    
    // If data is a string, truncate it
    if (typeof data === 'string' && data.length > 50) {
      return <Typography variant="body2">{data.substring(0, 50)}...</Typography>;
    }
    
    return renderData(data);
  };
  
  // Determine what icon to show based on data type
  const getDataTypeIcon = () => {
    if (isJsonObject) {
      return <DataObjectIcon fontSize="small" color="info" />;
    }
    
    if (Array.isArray(data)) {
      return <DataObjectIcon fontSize="small" color="info" />;
    }
    
    if (typeof data === 'string' && data.length > 100) {
      return <TextSnippetIcon fontSize="small" color="info" />;
    }
    
    return null;
  };
  
  const dataTypeIcon = getDataTypeIcon();
  
  return (
    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.default' }}>
      <CardHeader
        avatar={icon}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2">{label}</Typography>
            {dataTypeIcon && (
              <Tooltip title={isJsonObject ? 'JSON Object' : Array.isArray(data) ? 'Array' : 'Long Text'}>
                <Box sx={{ display: 'inline-flex', ml: 1 }}>
                  {dataTypeIcon}
                </Box>
              </Tooltip>
            )}
          </Box>
        }
        action={
          isLargeData && (
            <IconButton 
              size="small" 
              onClick={handleToggle}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )
        }
        sx={{ 
          p: 1, 
          '& .MuiCardHeader-content': { display: 'flex', alignItems: 'center' } 
        }}
      />
      
      <CardContent sx={{ py: isLargeData ? 0 : 1, px: 1.5 }}>
        {isLargeData ? (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {renderData(data)}
          </Collapse>
        ) : (
          renderData(data)
        )}
        
        {isLargeData && !expanded && getPreview()}
      </CardContent>
      
      {isLargeData && (
        <CardActions disableSpacing sx={{ pt: 0, px: 1, pb: 1 }}>
          <Button 
            size="small" 
            onClick={handleToggle} 
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
          <Button 
            size="small" 
            startIcon={<ContentCopyIcon />} 
            onClick={handleCopy}
            sx={{ ml: 'auto' }}
          >
            Copy
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

// Process step with hidden details
const ProcessStep = ({ step, isActive, isPending }) => {
  const [detailsTab, setDetailsTab] = useState(null);
  
  const handleTabChange = (event, newValue) => {
    setDetailsTab(newValue === detailsTab ? null : newValue);
  };
  
  return (
    <Box sx={{ mb: 1.5, pl: 1 }}>
      {/* Step header with inline tabs */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        py: 0.75,
        borderRadius: 1,
        bgcolor: isActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
      }}>
        {/* Step status icon */}
        {step.completed ? (
          <CheckCircleIcon sx={{ mr: 1.5, fontSize: 20, color: 'success.main' }} />
        ) : isActive ? (
          <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} thickness={4} />
          </Box>
        ) : (
          <RadioButtonUncheckedIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.disabled' }} />
        )}
        
        {/* Step name */}
        <Typography 
          variant="body1" 
          color={isPending ? 'text.disabled' : 'text.primary'}
          sx={{ flex: 1 }}
        >
          {step.name}
        </Typography>
        
        {/* Status label for active step */}
        {isActive && (
          <Typography variant="caption" sx={{ color: 'primary.main', mr: 2, fontSize: '0.7rem' }}>
            In progress
          </Typography>
        )}
        
        {/* Inline tabs for inputs/outputs */}
        {(step.inputs || step.outputs) && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {step.inputs && (
              <Button
                size="small"
                disableElevation
                variant="text"
                color={detailsTab === 'inputs' ? 'primary' : 'inherit'}
                onClick={() => handleTabChange(null, 'inputs')}
                startIcon={<InputIcon fontSize="small" />}
                sx={{ 
                  minWidth: 0,
                  fontSize: '0.7rem',
                  color: detailsTab === 'inputs' ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: detailsTab === 'inputs' ? 'primary.main' : 'text.primary'
                  },
                  p: 0.5
                }}
              >
                Inputs
              </Button>
            )}
            
            {step.outputs && (
              <Button
                size="small"
                disableElevation
                variant="text"
                color={detailsTab === 'outputs' ? 'primary' : 'inherit'}
                onClick={() => handleTabChange(null, 'outputs')}
                startIcon={<OutputIcon fontSize="small" />}
                sx={{ 
                  minWidth: 0,
                  fontSize: '0.7rem',
                  color: detailsTab === 'outputs' ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: detailsTab === 'outputs' ? 'primary.main' : 'text.primary'
                  },
                  p: 0.5
                }}
              >
                Outputs
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      {/* Content panel - only visible when a tab is selected */}
      <Collapse in={detailsTab !== null}>
        <Box sx={{ mt: 0.5, ml: 4, mb: 1 }}>
          {/* Render appropriate content based on selected tab */}
          {detailsTab === 'inputs' && step.inputs && (
            <StepDataDisplay 
              label="Inputs" 
              icon={<InputIcon fontSize="small" color="primary" />} 
              data={step.inputs}
            />
          )}
          
          {detailsTab === 'outputs' && step.outputs && (
            <StepDataDisplay 
              label="Outputs" 
              icon={<OutputIcon fontSize="small" color="success" />} 
              data={step.outputs}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

// Process item component (works for both current and historical processes)
const ProcessItem = ({ process, isCurrent = false }) => {
  const [expanded, setExpanded] = useState(isCurrent);
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Format the timestamp as a relative time (e.g., "1 hour ago")
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };
  
  return (
    <Box
      sx={{ 
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        overflow: 'hidden'
      }}
    >
      {/* Process header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: 1.5,
          px: 2,
          bgcolor: isCurrent ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          cursor: 'pointer'
        }}
        onClick={handleToggleExpand}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isCurrent ? (
            <PlayArrowIcon sx={{ mr: 1.5, fontSize: 20, color: 'primary.main' }} />
          ) : (
            <CheckCircleIcon sx={{ mr: 1.5, fontSize: 20, color: 'success.main' }} />
          )}
          <Box>
            <Typography variant="subtitle2">{process.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {isCurrent ? 'Current process' : formatRelativeTime(process.timestamp)}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpand();
          }}
          aria-expanded={expanded}
          aria-label={expanded ? 'collapse' : 'expand'}
          sx={{ color: 'action.active' }}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      
      {/* Process steps */}
      <Collapse in={expanded}>
        <Box sx={{ py: 1.5, px: 1 }}>
          {process.steps.map((step) => {
            const isActive = isCurrent && step.name === process.currentStep;
            const isPending = isCurrent && !step.completed && !isActive;
            
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
      </Collapse>
    </Box>
  );
};

const ProcessPanel = ({ selectedAgent, currentProcess, historicalProcesses = [], onToggleVisibility, collapsed = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Collapsed panel content - just a narrow strip with icon
  const collapsedPanelContent = (
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
  
  // Full panel content
  const fullPanelContent = (
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
          <Typography variant="subtitle1" fontWeight="medium">Process Visualization</Typography>
          {selectedAgent && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({selectedAgent.name})
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
  
  // Choose which content to display based on collapsed state
  return collapsed ? collapsedPanelContent : fullPanelContent;
};

export default ProcessPanel; 
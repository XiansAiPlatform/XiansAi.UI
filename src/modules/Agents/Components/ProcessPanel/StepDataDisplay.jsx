import { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Tooltip,
  Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import JsonView from './JsonView';

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

export default StepDataDisplay; 
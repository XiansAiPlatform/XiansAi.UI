import React from 'react';
import { 
  Box, 
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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

export default JsonView; 
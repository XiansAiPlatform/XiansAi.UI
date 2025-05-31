import React from 'react';
import { Box } from '@mui/material';

const JsonDisplay = ({ data }) => {
  const formattedJson = JSON.stringify(data, null, 2);
  
  return (
    <Box
      component="pre"
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 'var(--radius-sm)',
        padding: 2,
        margin: 0,
        overflow: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        maxHeight: '400px',
      }}
    >
      {formattedJson}
    </Box>
  );
};

export default JsonDisplay; 
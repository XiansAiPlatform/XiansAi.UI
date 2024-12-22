import React, { useState } from 'react';
import { Box, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const JsonViewer = ({ data, initialDepth = 2 }) => {
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
  };

  const toggleExpand = (path) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderValue = (value, path = '', depth = 0) => {
    const isExpanded = expandedPaths.has(path);
    
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      const isArray = Array.isArray(value);
      const isEmpty = Object.keys(value).length === 0;
      
      if (isEmpty) {
        return <span style={{ color: '#98c379' }}>{isArray ? '[]' : '{}'}</span>;
      }

      const shouldAutoExpand = depth < initialDepth;
      if (!isExpanded && !shouldAutoExpand) {
        return (
          <div 
            onClick={() => toggleExpand(path)}
            style={{ 
              cursor: 'pointer',
              display: 'inline-flex', 
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span style={{ color: '#98c379' }}>
              {isArray ? '[...]' : '{...}'}
            </span>
            <IconButton 
              size="small"
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </div>
        );
      }

      return (
        <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
          <div 
            onClick={() => toggleExpand(path)}
            style={{ 
              cursor: 'pointer',
              display: 'inline-flex', 
              alignItems: 'center' 
            }}
          >
            <span style={{ color: '#98c379' }}>{isArray ? '[' : '{'}</span>
            {!isEmpty && (
              <IconButton 
                size="small"
                sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            )}
          </div>
          <Collapse in={isExpanded || shouldAutoExpand}>
            {Object.entries(value).map(([key, val], index) => (
              <div key={key} style={{ marginLeft: 20 }}>
                <span style={{ color: '#e06c75' }}>
                  {isArray ? '' : `"${key}": `}
                </span>
                {renderValue(val, `${path}.${key}`, depth + 1)}
                {index < Object.keys(value).length - 1 && <span>,</span>}
              </div>
            ))}
          </Collapse>
          <span style={{ color: '#98c379' }}>{isArray ? ']' : '}'}</span>
        </div>
      );
    }

    if (typeof value === 'string') {
      return <span style={{ color: '#98c379' }}>"{value}"</span>;
    }
    if (typeof value === 'number') {
      return <span style={{ color: '#d19a66' }}>{value}</span>;
    }
    if (typeof value === 'boolean') {
      return <span style={{ color: '#c678dd' }}>{value.toString()}</span>;
    }
    if (value === null) {
      return <span style={{ color: '#c678dd' }}>null</span>;
    }
    return <span>{String(value)}</span>;
  };

  return (
    <Box 
      sx={{ 
        bgcolor: '#282c34',
        color: '#abb2bf',
        p: 2,
        borderRadius: 1,
        fontFamily: 'monospace',
        position: 'relative'
      }}
    >
      <IconButton 
        size="small" 
        onClick={() => copyToClipboard(data)}
        sx={{ 
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#abb2bf'
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
      {renderValue(data)}
    </Box>
  );
};

export default JsonViewer;
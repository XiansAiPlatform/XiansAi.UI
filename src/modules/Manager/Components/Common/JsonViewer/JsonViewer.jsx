import React, { useState } from 'react';
import { Box, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import './JsonViewer.css';

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
        return <span className="json-viewer__value--string">{isArray ? '[]' : '{}'}</span>;
      }

      const shouldAutoExpand = depth < initialDepth;
      if (!isExpanded && !shouldAutoExpand) {
        return (
          <div 
            onClick={() => toggleExpand(path)}
            className="json-viewer__expandable"
          >
            <span className="json-viewer__value--string">
              {isArray ? '[...]' : '{...}'}
            </span>
            <IconButton 
              size="small"
              className={`json-viewer__expand-button ${isExpanded ? 'json-viewer__expand-button--expanded' : 'json-viewer__expand-button--collapsed'}`}
              sx={{ color: '#ffffff' }}
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
            className="json-viewer__expandable"
          >
            <span className="json-viewer__value--string">{isArray ? '[' : '{'}</span>
            {!isEmpty && (
              <IconButton 
                size="small"
                className={`json-viewer__expand-button ${isExpanded ? 'json-viewer__expand-button--expanded' : 'json-viewer__expand-button--collapsed'}`}
                sx={{ color: '#ffffff' }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            )}
          </div>
          <Collapse in={isExpanded || shouldAutoExpand}>
            {Object.entries(value).map(([key, val], index) => (
              <div key={key} className="json-viewer__row">
                <span className="json-viewer__key">
                  {isArray ? '' : `"${key}": `}
                </span>
                {renderValue(val, `${path}${isArray ? `[${key}]` : `.${key}`}`, depth + 1)}
                {index < Object.keys(value).length - 1 && <span>,</span>}
              </div>
            ))}
          </Collapse>
          <span className="json-viewer__value--string">{isArray ? ']' : '}'}</span>
        </div>
      );
    }

    if (typeof value === 'string') {
      return <span className="json-viewer__value--string">"{value}"</span>;
    }
    if (typeof value === 'number') {
      return <span className="json-viewer__value--number">{value}</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="json-viewer__value--boolean">{value.toString()}</span>;
    }
    if (value === null) {
      return <span className="json-viewer__value--null">null</span>;
    }
    return <span>{String(value)}</span>;
  };

  return (
    <Box className="json-viewer" sx={{ position: 'relative' }}>
      <IconButton 
        size="small" 
        onClick={() => copyToClipboard(data)}
        className="json-viewer__copy-button"
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#fff',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
      {renderValue(data)}
    </Box>
  );
};

export default JsonViewer;
import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Paper,
  Stack,
  Tooltip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Delete } from '@mui/icons-material';
import MarkdownDisplay from '../Common/MarkdownDisplay';
import JsonDisplay from '../Common/JsonDisplay';

const KnowledgeViewer = ({ knowledge, onEdit, onDelete, title }) => {
  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const renderContent = () => {
    if (!knowledge.content) {
      return <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No content provided</Typography>;
    }

    if (knowledge.type?.toLowerCase() === 'markdown') {
      return <MarkdownDisplay content={knowledge.content} />;
    }

    if (knowledge.type?.toLowerCase() === 'json') {
      try {
        const jsonContent = typeof knowledge.content === 'string' 
          ? JSON.parse(knowledge.content) 
          : knowledge.content;
        return <JsonDisplay data={jsonContent} />;
      } catch (error) {
        return (
          <Box sx={{ color: 'error.main', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            Error parsing JSON: {error.message}
            <Box sx={{ mt: 2 }}>Raw content:</Box>
            {knowledge.content}
          </Box>
        );
      }
    }

    // Default to plain text display
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 'var(--radius-md)',
          maxHeight: '400px',
          overflow: 'auto'
        }}
      >
        {knowledge.content}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 'medium' }}>
            {knowledge.name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              size="small" 
              label={knowledge.type || 'No Type'} 
              variant="outlined"
              sx={{
                color: 'var(--tag-text)',
                borderColor: 'divider',
                fontWeight: 500
              }}
            />
            {knowledge.agent && (
              <Chip 
                size="small" 
                label={knowledge.agent}
                variant="outlined" 
                sx={{
                  color: 'var(--tag-text)',
                  borderColor: 'divider',
                  fontWeight: 500
                }}
              />
            )}
            <Chip 
              size="small" 
              label={`v.${knowledge.version?.substring(0, 7) || 'unknown'}`} 
              variant="outlined"
              sx={{
                color: 'text.secondary',
                borderColor: 'divider',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem'
              }}
            />
          </Stack>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mt: 1.5,
            color: 'text.secondary',
            fontSize: '0.85rem'
          }}>
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                mr: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              Created {formatDateTime(knowledge.createdAt)}
            </Typography>
            <Typography 
              variant="body2"
              component="span"
              sx={{ 
                mx: 0.5,
                color: 'text.disabled',
                fontSize: '0.75rem',
                fontStyle: 'italic'
              }}
            >
              ({formatTimeAgo(knowledge.createdAt)})
            </Typography>
            
            {knowledge.createdBy && (
              <>
                <Box 
                  component="span" 
                  sx={{ 
                    mx: 1,
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    bgcolor: 'divider',
                    display: 'inline-block'
                  }}
                />
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    ml: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  By <Box component="span" sx={{ fontWeight: 500 }}>{knowledge.createdBy}</Box>
                </Typography>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              onClick={onEdit}
              size="small"
              sx={{
                color: 'primary.main',
                width: 28,
                height: 28,
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton
              onClick={() => onDelete(knowledge)}
              size="small"
              sx={{
                color: 'error.main',
                width: 28,
                height: 28,
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'error.lighter',
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
          Content
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default KnowledgeViewer; 
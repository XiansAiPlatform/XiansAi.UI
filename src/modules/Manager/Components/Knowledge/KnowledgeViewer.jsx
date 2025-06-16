import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Paper,
  Stack,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Delete } from '@mui/icons-material';
import MarkdownDisplay from '../Common/MarkdownDisplay';
import JsonDisplay from '../Common/JsonDisplay';
import { useKnowledgeApi } from '../../services/knowledge-api';

const KnowledgeViewer = ({ knowledge, knowledgeId, onEdit, onDelete, title }) => {
  const [knowledgeData, setKnowledgeData] = useState(knowledge || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const knowledgeApi = useKnowledgeApi();

  useEffect(() => {
    // If knowledge is provided directly, use it
    if (knowledge) {
      setKnowledgeData(knowledge);
      return;
    }

    // If knowledgeId is provided, fetch the knowledge
    if (knowledgeId) {
      const fetchKnowledge = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedKnowledge = await knowledgeApi.getKnowledge(knowledgeId);
          setKnowledgeData(fetchedKnowledge);
        } catch (err) {
          console.error('Error fetching knowledge:', err);
          setError('Failed to load knowledge');
        } finally {
          setIsLoading(false);
        }
      };

      fetchKnowledge();
    }
  }, [knowledge, knowledgeId, knowledgeApi]);

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
    if (!knowledgeData?.content) {
      return <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No content provided</Typography>;
    }

    if (knowledgeData.type?.toLowerCase() === 'markdown') {
      return <MarkdownDisplay content={knowledgeData.content} />;
    }

    if (knowledgeData.type?.toLowerCase() === 'json') {
      try {
        const jsonContent = typeof knowledgeData.content === 'string'
          ? JSON.parse(knowledgeData.content)
          : knowledgeData.content;
        return <JsonDisplay data={jsonContent} />;
      } catch (error) {
        return (
          <Box sx={{ color: 'error.main', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            Error parsing JSON: {error.message}
            <Box sx={{ mt: 2 }}>Raw content:</Box>
            {knowledgeData.content}
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
        {knowledgeData.content}
      </Paper>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading knowledge...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!knowledgeData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No knowledge data available
        </Typography>
      </Box>
    );
  }

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
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              size="small"
              label={knowledgeData.type || 'No Type'}
              variant="outlined"
              sx={{
                color: 'var(--tag-text)',
                borderColor: 'divider',
                fontWeight: 500
              }}
            />
            {knowledgeData.agent && (
              <Chip
                size="small"
                label={knowledgeData.agent}
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
              label={`v.${knowledgeData.version?.substring(0, 7) || 'unknown'}`}
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
              Created {formatDateTime(knowledgeData.createdAt)}
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
              ({formatTimeAgo(knowledgeData.createdAt)})
            </Typography>

            {knowledgeData.createdBy && (
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
                  By <Box component="span" sx={{ fontWeight: 500 }}>{knowledgeData.createdBy}</Box>
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
              disabled={knowledgeData.permissionLevel !== 'edit'}
              className={`icon-button ${knowledgeData.permissionLevel !== 'edit' ? 'disabled' : ''}`}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              onClick={() => onDelete(knowledgeData)}
              size="small"
              disabled={knowledgeData.permissionLevel !== 'edit'}
              className={`icon-button ${knowledgeData.permissionLevel !== 'edit' ? 'disabled' : ''}`}
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
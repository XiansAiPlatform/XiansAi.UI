import React from 'react';
import { Box, IconButton, Tooltip, TextField } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import AddIcon from '@mui/icons-material/Add';
import DeleteVersionIcon from '@mui/icons-material/DeleteForever';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const InstructionViewer = ({ instruction, onEdit, onDelete, isHistoricalVersion = false }) => {
  const handleDelete = () => {
    onDelete(instruction);
  };

  const renderContent = () => {
    switch (instruction.type) {
      case 'json':
        return (
          <pre>
            {JSON.stringify(JSON.parse(instruction.content), null, 2)}
          </pre>
        );
      case 'markdown':
        return <ReactMarkdown>{instruction.content}</ReactMarkdown>;
      default:
        return <pre>{instruction.content}</pre>;
    }
  };

  const [detailsOpen, setDetailsOpen] = React.useState(false);

  return (
    <Box>
      <Box className="instruction-header-container" sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2
      }}>
        <Tooltip title="Toggle Details">
          <IconButton 
            onClick={() => setDetailsOpen(!detailsOpen)}
            size="small"
            sx={{
              border: '1px solid var(--border-color)',
              borderRadius: 1,
              backgroundColor: detailsOpen ? 'var(--bg-highlight)' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'var(--bg-highlight)',
              }
            }}
          >
            {detailsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Tooltip>
        
        <Box sx={{ 
          typography: 'body2', 
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center'
        }}>
          {detailsOpen ? 'Hide Details' : 'Show Details'}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box className="instruction-actions" sx={{ 
          display: 'flex',
          gap: 1
        }}>
          <Tooltip title="Create New Version">
            <IconButton 
              onClick={onEdit}
              color="primary"
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete This Version">
            <IconButton 
              onClick={handleDelete}
              size="small"
            >
              <DeleteVersionIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box className="instruction-item-content">
        {detailsOpen && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={instruction.name}
                className="instruction-name-field"
                disabled
                sx={{
                  '& .MuiInputBase-input': {
                    color: 'var(--text-primary)'
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Type"
                value={instruction.type || 'No Type'}
                className="instruction-type-field"
                disabled
                sx={{
                  mt: 2,
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: 'var(--text-primary)'
                  }
                }}
              />
              <TextField
                label="Created At"
                value={instruction.createdAt ? new Date(instruction.createdAt).toLocaleString() : 'Unknown'}
                className="instruction-created-at-field"
                disabled
                sx={{
                  mt: 2,
                  mb: 2,
                  minWidth: '200px',
                  flex: 1,
                  '& .MuiInputBase-input': {
                    color: 'var(--text-primary)'
                  }
                }}
              />
            </Box>

            <TextField
              label="Version"
              value={instruction.version || 'v1'}
              className="instruction-version-field"
              disabled
              sx={{
                width: '100%',
                '& .MuiInputBase-input': {
                  color: 'var(--text-primary)'
                }
              }}
            />
          </Box>
        )}

        <Box className="content-viewer" sx={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          '& pre': {
            fontFamily: 'var(--font-mono)'
          }
        }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default InstructionViewer; 
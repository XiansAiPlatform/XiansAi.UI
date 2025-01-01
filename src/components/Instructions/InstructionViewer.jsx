import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip, TextField } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import AddIcon from '@mui/icons-material/Add';
import DeleteVersionIcon from '@mui/icons-material/DeleteForever';

const InstructionViewer = ({ instruction, onEdit, onDelete }) => {
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

  return (
    <Box className="instruction-item">
      <Box className="instruction-header-container">
        <Typography 
          variant="h6"
          sx={{
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-tight)'
          }}
        >
          View Instruction
        </Typography>
        <Box className="instruction-actions">
          <Tooltip title="Create New Version">
            <IconButton 
              onClick={onEdit}
              color="primary"
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Instruction">
            <IconButton 
              onClick={onDelete}
              size="small"
            >
              <DeleteVersionIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box className="instruction-item-content">
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
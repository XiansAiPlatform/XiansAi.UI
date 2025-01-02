import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Chip,
  Collapse,
  Tooltip,
  Paper
} from '@mui/material';
import { Delete, KeyboardArrowDown } from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import InstructionEditor from './InstructionEditor';
import InstructionViewer from './InstructionViewer';
import '../Instructions/Instructions.css';

const InstructionItem = ({ 
  instruction,
  onUpdateInstruction,
  onDeleteInstruction
}) => {
  const { openSlider, closeSlider } = useSlider();
  const [expanded, setExpanded] = useState(false);

  const handleEdit = () => {
    openSlider(
      <InstructionEditor 
        mode="edit"
        instruction={instruction}
        onSave={(updatedInstruction) => {
          onUpdateInstruction(updatedInstruction);
          closeSlider();
        }}
        onClose={closeSlider}
      />
    );
  };

  const handleView = () => {
    openSlider(
      <InstructionViewer 
        instruction={instruction} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  const handleDelete = () => {
    onDeleteInstruction(instruction);
  };

  const handleVersions = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Box 
      className={`instruction-item ${expanded ? 'instruction-item-expanded' : ''}`}
      sx={{ width: '100%' }}
    >
      <ListItem 
        onClick={handleView}
        component={Paper}
        elevation={0}
        className="instruction-list-item"
        disableGutters
        sx={{
          '& .MuiListItemText-primary': {
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-medium)'
          }
        }}
      >
        <ListItemText primary={instruction.name} />
        
        <Box className="instruction-metadata" sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          mr: 6
        }}>
          <Chip 
            size="small" 
            label={instruction.type || 'No Type'} 
            className="type-chip"
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              size="small" 
              label={`v.${instruction.version?.substring(0, 7) || 'draft'}`}
              className="version-chip"
            />
            <IconButton 
              size="small"
              onClick={handleVersions}
              className="version-toggle-btn"
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <KeyboardArrowDown fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <ListItemSecondaryAction>
          <Tooltip title="Delete All Versions" placement="top">
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="delete-btn"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
      
      <Collapse in={expanded} timeout="auto">
        <Paper 
          elevation={0}
          className="version-history"
          sx={{
            bgcolor: 'var(--bg-main)',
            '& .version-chip': {
              bgcolor: 'var(--bg-hover)',
              color: 'var(--text-secondary)'
            },
            '& .version-chip-current': {
              bgcolor: 'var(--primary-light)',
              color: 'var(--primary)'
            }
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 1 }}>
            <Chip
              size="small"
              label="v.abc1234 - Current"
              className="version-chip version-chip-current"
            />
            <Chip
              size="small"
              label="v.def5678 - 2 days ago"
              className="version-chip"
            />
            <Chip
              size="small"
              label="v.ghi9012 - 5 days ago"
              className="version-chip"
            />
            <Chip
              size="small"
              label="v.jkl3456 - 1 week ago"
              className="version-chip"
            />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default InstructionItem; 
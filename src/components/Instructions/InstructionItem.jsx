import React, { useState, useEffect } from 'react';
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
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { useInstructionsApi } from '../../services/instructions-api';
const InstructionItem = ({ 
  instruction,
  onUpdateInstruction,
  onDeleteAllInstruction,
  onDeleteOneInstruction
}) => {
  const { openSlider, closeSlider } = useSlider();
  const [expanded, setExpanded] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteOneDialogOpen, setDeleteOneDialogOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const instructionsApi = useInstructionsApi();

  useEffect(() => {
    const fetchVersions = async () => {
      if (expanded) {
        setIsLoading(true);
        try {
          const response = await instructionsApi.getInstructionVersions(instruction.name);
          setVersions(response);
        } catch (error) {
          console.error('Failed to fetch versions:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchVersions();
  }, [expanded, instruction, instructionsApi]);

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
      />,
      `${instruction.name}`
    );
  };

  const handleView = () => {
    openSlider(
      <InstructionViewer 
        instruction={instruction} 
        onEdit={handleEdit}
        onDelete={(instructionToDelete) => handleDeleteOne(instructionToDelete)}
        title={`View: ${instruction.name}`}
      />,
      `${instruction.name}`
    );
  };

  const handleDeleteAllClick = (e) => {
    e.stopPropagation();
    setDeleteAllDialogOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    await onDeleteAllInstruction(instruction);
    setDeleteAllDialogOpen(false);
  };

  const handleDeleteOneConfirm = () => {
    console.log('handleDeleteOneConfirm', versionToDelete);
    onDeleteOneInstruction(versionToDelete);
    setVersions(versions.filter(v => v.version !== versionToDelete.version));
    setDeleteOneDialogOpen(false);
    closeSlider();
  };

  const handleDeleteCancel = () => {
    setDeleteAllDialogOpen(false);
    setDeleteOneDialogOpen(false);
  };

  const handleVersions = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleDeleteOne = (versionToDelete) => {
    const instructionToDelete = versionToDelete || instruction;
    setDeleteOneDialogOpen(true);
    setVersionToDelete(instructionToDelete);
  };

  const handleVersionSelect = (version) => {
    openSlider(
      <InstructionViewer 
        instruction={{ ...instruction, ...version }}
        onEdit={handleEdit}
        onDelete={(instructionToDelete) => handleDeleteOne(instructionToDelete)}
        title={`View Instruction (v.${version.version.substring(0, 7)})`}
        isHistoricalVersion={version.version !== instruction.version}
      />,
      `View Instruction (v.${version.version.substring(0, 7)})`
    );
  };

  const formatDate = (date) => {
    const now = new Date();
    const versionDate = new Date(date);
    const diffDays = Math.floor((now - versionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
      return `Yesterday at ${versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays < 7) {
      return `${diffDays} days ago at ${versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago at ${versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${versionDate.toLocaleDateString()} ${versionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
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
            },
            '& .MuiListItemText-secondary': {
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          <ListItemText 
            primary={instruction.name}
            secondary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                {`v.${instruction.version?.substring(0, 7) || 'draft'}`}
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVersions(e);
                  }}
                >
                  {` • All versions `}
                  <KeyboardArrowDown 
                    fontSize="small" 
                    sx={{
                      transform: expanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontSize: '1rem'
                    }}
                  />
                </Box>
              </Box>
            }
          />
          
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
          </Box>

          <ListItemSecondaryAction>
            <Tooltip title="Delete All Versions" placement="top">
              <IconButton 
                size="small"
                onClick={handleDeleteAllClick}
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
              {isLoading ? (
                <Chip size="small" label="Loading..." className="version-chip" />
              ) : (
                versions.map((version) => {
                  const latestVersion = versions.reduce((latest, current) => 
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                  );
                  
                  return (
                    <Chip
                      key={version.id}
                      size="small"
                      label={`v.${version.version.substring(0, 7)} - ${formatDate(version.createdAt)}`}
                      className={`version-chip ${version.id === latestVersion.id ? 'version-chip-current' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVersionSelect(version);
                      }}
                    />
                  );
                })
              )}
            </Box>
          </Paper>
        </Collapse>
      </Box>

      <ConfirmationDialog
        open={deleteAllDialogOpen}
        title="Delete All Versions"
        message={`Are you sure you want to delete all versions of "${instruction.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteAllConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
      <ConfirmationDialog
        open={deleteOneDialogOpen}
        title="Delete This Version"
        message={`Are you sure you want to delete version "${versionToDelete?.version || instruction.version}" of "${instruction.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteOneConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </>
  );
};

export default InstructionItem; 
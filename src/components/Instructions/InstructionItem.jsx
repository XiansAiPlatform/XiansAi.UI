import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Box,
  Chip,
  Collapse,
  Tooltip,
  Typography
} from '@mui/material';
import { Delete, KeyboardArrowDown } from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import InstructionEditor from './InstructionEditor';
import InstructionViewer from './InstructionViewer';
import '../Instructions/Instructions.css';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { useInstructionsApi } from '../../services/instructions-api';
import { ReactComponent as AgentKnowledgeIcon } from '../../theme/agent-knowledge.svg';
import { keyframes } from '@emotion/react';

const InstructionItem = ({ 
  instruction,
  onUpdateInstruction,
  onDeleteAllInstruction,
  onDeleteOneInstruction,
  isExpanded,
  onToggleExpand
}) => {
  const { openSlider, closeSlider } = useSlider();
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteOneDialogOpen, setDeleteOneDialogOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const instructionsApi = useInstructionsApi();

  console.log(instruction);

  // Define a keyframe animation for the pulsing effect
  const pulse = keyframes`
    0% {
      box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(var(--success-rgb), 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0);
    }
  `;

  const isRecentlyUpdated = (date) => {
    try {
      const now = new Date();
      const lastUpdated = new Date(date);
      const diffInHours = Math.floor((now - lastUpdated) / (1000 * 60 * 60));
      return diffInHours < 24;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const fetchVersions = async () => {
      if (isExpanded) {
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
  }, [isExpanded, instruction, instructionsApi]);

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
    onToggleExpand();
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

  const formatInstructionName = (name) => {
    return name.trim();
  };

  const wasRecentlyUpdated = isRecentlyUpdated(instruction.updatedAt || instruction.createdAt);

  return (
    <>
      <Box 
        className="instruction-card"
        onClick={handleView}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
          mb: 2,
          border: '1px solid',
          borderColor: wasRecentlyUpdated ? 'var(--success)' : 'divider',
          cursor: 'pointer',
          backgroundColor: wasRecentlyUpdated ? 'var(--success-ultralight)' : 'background.paper',
        }}
      >
        <Box>
          <Box className="card-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                mr: 0,
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '50%',
                p: '5px',
                boxShadow: wasRecentlyUpdated 
                  ? '0 0 0 1px var(--success)' 
                  : '0 0 0 1px var(--border-light)',
                ...(wasRecentlyUpdated && {
                  animation: `${pulse} 2s infinite`,
                })
              }}>
                <AgentKnowledgeIcon style={{ 
                  width: 32, 
                  height: 32,
                  opacity: wasRecentlyUpdated ? 1 : 0.85 
                }} />
              </Box>
              <Typography 
                variant="h6" 
                className="instruction-name"
                sx={{
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  color: 'text.primary'
                }}
              >
                {formatInstructionName(instruction.name)}
              </Typography>
              <Chip 
                size="small" 
                label={instruction.type || 'No Type'} 
                className="type-chip"
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                  fontWeight: 500
                }}
              />
              {wasRecentlyUpdated && (
                <Chip
                  label="New"
                  size="small"
                  color="success"
                  sx={{ 
                    height: '22px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    borderRadius: '10px',
                    background: 'linear-gradient(45deg, var(--success) 0%, var(--success-light) 100%)',
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 1
                    },
                    animation: `${pulse} 2s infinite`
                  }}
                />
              )}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVersions(e);
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  Current Version: 
                  <span style={{ 
                    color: 'var(--text-primary)',
                    fontWeight: 500 
                  }}>
                    v.{instruction.version?.substring(0, 7) || 'draft'}
                  </span>
                </Typography>
                <KeyboardArrowDown 
                  fontSize="small" 
                  className={`version-arrow ${isExpanded ? 'expanded' : ''}`}
                  sx={{
                    transition: 'transform 0.2s ease',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </Box>
              {instruction.createdAt && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  Created: 
                  <span style={{ 
                    color: 'var(--text-primary)',
                    fontWeight: 500 
                  }}>
                    {formatDate(instruction.createdAt)}
                  </span>
                </Typography>
              )}
            </Box>
            
            <Box className="card-actions" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Delete All Versions" placement="top">
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAllClick(e);
                  }}
                  className="delete-btn"
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.lighter'
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Collapse in={isExpanded} timeout="auto">
          <Box 
            className="version-history"
            sx={{ p: 2, bgcolor: 'background.paper' }}
          >
            <Box 
              className="version-chips"
              sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {isLoading ? (
                <Chip 
                  size="small" 
                  label="Loading..." 
                  className="version-chip"
                  sx={{ bgcolor: 'action.hover' }}
                />
              ) : (
                versions.map((version) => {
                  const isLatest = version.id === versions.reduce((latest, current) => 
                    new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
                  ).id;
                  
                  return (
                    <Chip
                      key={version.id}
                      size="small"
                      label={`v.${version.version.substring(0, 7)} - ${formatDate(version.createdAt)}`}
                      className={`version-chip ${isLatest ? 'version-chip-current' : ''}`}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isLatest ? 'primary.lighter' : 'background.neutral',
                        color: isLatest ? 'primary.dark' : 'text.primary',
                        fontWeight: isLatest ? 500 : 400,
                        '&:hover': {
                          bgcolor: isLatest ? 'primary.light' : 'action.hover'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVersionSelect(version);
                      }}
                    />
                  );
                })
              )}
            </Box>
          </Box>
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
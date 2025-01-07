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
  Paper,
  Typography
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
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <>
      <Box className="instruction-card">
        <Box 
          onClick={handleView} 
          sx={{ cursor: 'pointer' }}
        >
          <Box className="card-header">
            <Typography variant="h6" className="instruction-name">
              {formatInstructionName(instruction.name)}
            </Typography>
            
            <Box className="card-actions">
              <Tooltip title="Delete All Versions" placement="top">
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAllClick(e);
                  }}
                  className="delete-btn"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box className="card-metadata">
            <Chip 
              size="small" 
              label={instruction.type || 'No Type'} 
              className="type-chip"
            />
          </Box>
        </Box>

        <Box className="version-section">
          <Box 
            className="version-info"
            onClick={(e) => {
              e.stopPropagation();
              handleVersions(e);
            }}
          >
            <Box className="version-header">
              <Typography variant="caption">
                Current Version: v.{instruction.version?.substring(0, 7) || 'draft'}
              </Typography>
              <KeyboardArrowDown 
                fontSize="small" 
                className={`version-arrow ${isExpanded ? 'expanded' : ''}`}
              />
            </Box>
          </Box>

          <Collapse in={isExpanded} timeout="auto">
            <Box className="version-history">
              <Box className="version-chips">
                {isLoading ? (
                  <Chip size="small" label="Loading..." className="version-chip" />
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
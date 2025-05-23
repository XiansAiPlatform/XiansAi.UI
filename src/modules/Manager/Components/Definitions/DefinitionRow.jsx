import React, { useState } from 'react';
import { TableRow, TableCell, IconButton, Box, Typography, Button, Stack, Collapse, Tooltip, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import DefinitionActivities from './DefinitionActivities';
import DefinitionParameters from './DefinitionParameters';
import { useSlider } from '../../contexts/SliderContext';
import MermaidDiagram from '../Runs/WorkflowDetails/MermaidDiagram';
import NewWorkflowForm from '../Runs/NewWorkflowForm';
import { useLoading } from '../../contexts/LoadingContext';
import './Definitions.css';
import { useAuth } from '../../auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useDefinitionsApi } from '../../services/definitions-api';

const DefinitionRow = ({ definition, isOpen, previousRowOpen, onToggle, onDeleteSuccess }) => {
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();
  const { user } = useAuth();
  const definitionsApi = useDefinitionsApi();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(menuAnchorEl);
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setMenuAnchorEl(null);
  };
  
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = (event) => {
    if (event) event.stopPropagation();
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async (event) => {
    if (event) event.stopPropagation();
    setDeleteDialogOpen(false);
    
    try {
      setLoading(true);
      await definitionsApi.deleteDefinition(definition.id);
      
      // Notify parent component that delete was successful
      if (onDeleteSuccess) {
        onDeleteSuccess(definition.id);
      }
    } catch (error) {
      console.error('Failed to delete definition:', error);
      // Handle error (could show a toast notification here)
    } finally {
      setLoading(false);
    }
  };

  const formatTypeName = (typeName) => {
    return typeName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/^\w/, c => c.toUpperCase());
  };

  const handleActivate = async () => {
    const formContent = (
      <NewWorkflowForm 
        definition={definition}
        onSuccess={async () => {
          setLoading(true);
          try {
            await closeSlider();
          } finally {
            setLoading(false);
          }
        }}
        onCancel={async () => {
          setLoading(true);
          try {
            await closeSlider();
          } finally {
            setLoading(false);
          }
        }}
      />
    );
    setLoading(true);
    try {
      await openSlider(formContent, `Activate '${definition.workflowType}'`);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = async () => {
    const diagramContent = (
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <MermaidDiagram diagram={definition.markdown} source={definition.source} />
      </Box>
    );
    setLoading(true);
    try {
      await openSlider(diagramContent, `Visualization of '${definition.workflowType}'`);
    } finally {
      setLoading(false);
    }
  };

  const hasMarkdown = definition.markdown && definition.markdown.trim().length > 0;

  const isCurrentUser = user?.id === definition.owner;

  const getPermissionLevel = () => {
    if (!user?.id) return 'Read';
    if (definition.permissions?.ownerAccess?.includes(user.id)) return 'Owner';
    if (definition.permissions?.writeAccess?.includes(user.id)) return 'Write';
    if (definition.permissions?.readAccess?.includes(user.id)) return 'Read';
    return 'Read'; // Default to Read if no explicit permissions
  };

  const formatCreatedTime = (date) => {
    try {
      return `Created ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch (error) {
      return 'Created at unknown time';
    }
  };

  const formatUpdatedTime = (date) => {
    try {
      return `Updated ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch (error) {
      return 'Updated at unknown time';
    }
  };

  return (
    <>
      <TableRow 
        className={`definition-row ${isOpen ? 'expanded' : ''} ${previousRowOpen ? 'previous-expanded' : ''}`}
        onClick={() => onToggle(definition.id)}
      >
        <TableCell className="definition-content-cell">
          <div className="definition-content-wrapper">
            <Box>
              <Typography 
                className="definition-title"
              >
                {formatTypeName(definition.workflowType)}
              </Typography>
              <Typography variant="caption">
                <span className="definition-stat">
                  <span className="stat-value">{definition.activityDefinitions?.length || 0}</span> Activities
                </span>
                <span className="definition-stat">
                  <span className="stat-value">{definition.parameterDefinitions?.length || 0}</span> Inputs
                </span>
                <span className="definition-stat">
                  {formatCreatedTime(definition.createdAt)}
                </span>
                {definition.updatedAt && 
                  definition.updatedAt !== definition.createdAt && 
                  new Date(definition.updatedAt) > new Date(definition.createdAt) && (
                  <span className="definition-stat">
                    {formatUpdatedTime(definition.updatedAt)}
                  </span>
                )}
                <span className="definition-stat">
                  Permission: <span style={{ 
                    color: isCurrentUser ? 'var(--primary)' : 'inherit',
                    fontWeight: isCurrentUser ? 600 : 'inherit'
                  }}>
                    {getPermissionLevel()}
                  </span>
                </span>
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ marginRight: 2 }}>
              <Tooltip title={!hasMarkdown ? 'Flow code not available' : ''}>
                <span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisualize();
                    }}
                    className="button-base button-outlined-primary visualize-btn"
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    disabled={!hasMarkdown}
                  >
                    Visualize
                  </Button>
                </span>
              </Tooltip>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleActivate();
                }}
                className="button-base button-primary start-btn"
                size="small"
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
              >
                Activate
              </Button>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                aria-controls={menuOpen ? "definition-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? "true" : undefined}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="definition-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem 
                  onClick={handleDeleteClick}
                  disabled={getPermissionLevel() !== 'Owner'}
                  sx={{
                    opacity: getPermissionLevel() === 'Owner' ? 1 : 0.5,
                    '&.Mui-disabled': {
                      color: 'text.disabled',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                  {getPermissionLevel() !== 'Owner' && (
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.7rem' }}>
                      (Not owner)
                    </Typography>
                  )}
                </MenuItem>
              </Menu>
            </Stack>
          </div>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell 
            colSpan={2}
            className="definition-collapse-cell"
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <div className="definition-collapse-content">
                {definition.activityDefinitions?.length > 0 ? (
                  <DefinitionActivities 
                    activities={definition.activityDefinitions} 
                    agentName={definition.agent}
                  />
                ) : (
                  <div className="definition-section">
                    <Typography variant="h6" className="section-title">
                      Activities <span className="section-count">(0)</span>
                    </Typography>
                    <Box sx={{ padding: '8px 16px' }}>
                      <Typography color="text.secondary" variant="body2">No activities to show</Typography>
                    </Box>
                  </div>
                )}
                {definition.parameterDefinitions?.length > 0 ? (
                  <DefinitionParameters parameters={definition.parameterDefinitions} />
                ) : (
                  <div className="definition-section">
                    <Typography variant="h6" className="section-title">
                      Inputs <span className="section-count">(0)</span>
                    </Typography>
                    <Box sx={{ padding: '8px 16px' }}>
                      <Typography color="text.secondary" variant="body2">No inputs to show</Typography>
                    </Box>
                  </div>
                )}
              </div>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Definition?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete "{formatTypeName(definition.workflowType)}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DefinitionRow; 
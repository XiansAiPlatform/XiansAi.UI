import React, { useState } from 'react';
import { TableRow, TableCell, IconButton, Box, Typography, Button, Stack, Collapse, Tooltip, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
import DefinitionAgents from './DefinitionAgents';
import { useAuth0 } from '@auth0/auth0-react';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { useDefinitionsApi } from '../../services/definitions-api';

const DefinitionRow = ({ definition, isOpen, previousRowOpen, onToggle, onDeleteSuccess }) => {
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();
  const { user } = useAuth0();
  const theme = useTheme();
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

  const handleStartNew = async () => {
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
      await openSlider(formContent, `Start New ${definition.typeName}`);
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
      await openSlider(diagramContent, `${definition.typeName} Visualization`);
    } finally {
      setLoading(false);
    }
  };

  const hasMarkdown = definition.markdown && definition.markdown.trim().length > 0;

  const isCurrentUser = user?.sub === definition.owner;

  const formatCreatedTime = (date) => {
    try {
      return `Created ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch (error) {
      return 'Created at unknown time';
    }
  };

  return (
    <>
      <TableRow 
        onClick={() => onToggle(definition.id)}
        className="definition-row"
        sx={{ 
          '&:last-child td, &:last-child th': { border: 0 },
          borderTop: previousRowOpen ? '1px solid rgba(224, 224, 224, 1)' : 'none',
          borderBottom: isOpen ? '1px solid rgba(224, 224, 224, 1)' : 'inherit',
          backgroundColor: isOpen ? theme.palette.action.hover : 'inherit',
          transition: 'background-color 0.3s',
        }}
      >
        <TableCell className="definition-toggle-cell">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(definition.id);
            }}
            className={`definition-toggle-button ${isOpen ? 'open' : ''}`}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </TableCell>
        <TableCell className="definition-content-cell">
          <div className="definition-content-wrapper">
            <Box>
              <Typography 
                
                className="definition-title"
              >
                {formatTypeName(definition.typeName)}
              </Typography>
              <Typography variant="caption">
                <span className="definition-stat">
                  <span className="stat-value">{definition.activities.length}</span> Activities
                </span>
                <span className="definition-stat">
                  <span className="stat-value">{definition.parameters.length}</span> Inputs
                </span>
                <span className="definition-stat">
                  {formatCreatedTime(definition.createdAt)}
                </span>
                <span className="definition-stat">
                  Owner: <span style={{ 
                    color: isCurrentUser ? 'var(--primary)' : 'inherit',
                    fontWeight: isCurrentUser ? 600 : 'inherit'
                  }}>
                    {definition.owner || 'Unknown'} 
                    {isCurrentUser && ' (me)'}
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
                    className="button-base visualize-btn"
                    size="small"
                    variant="text"
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
                  handleStartNew();
                }}
                className="button-base start-btn"
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
              >
                Start New
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
                  disabled={!isCurrentUser}
                  sx={{
                    opacity: isCurrentUser ? 1 : 0.5,
                    '&.Mui-disabled': {
                      color: 'text.disabled',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                  {!isCurrentUser && (
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
                <DefinitionAgents activities={definition.activities} />
                <DefinitionActivities activities={definition.activities} />
                <DefinitionParameters parameters={definition.parameters} />
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
            Are you sure you want to delete "{formatTypeName(definition.typeName)}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
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
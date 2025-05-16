import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Box,
  Chip,
  Collapse,
  Tooltip,
  Typography,
  Button
} from '@mui/material';
import { Delete, KeyboardArrowDown, Edit } from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import KnowledgeEditor from './KnowledgeEditor';
import KnowledgeViewer from './KnowledgeViewer';
import './Knowledge.css';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { useKnowledgeApi } from '../../services/knowledge-api';
import { ReactComponent as AgentKnowledgeIcon } from '../../theme/agent-knowledge.svg';
import { keyframes } from '@emotion/react';

const KnowledgeItem = ({
  knowledge,
  onUpdateKnowledge,
  onDeleteAllKnowledge,
  onDeleteOneKnowledge,
  isExpanded,
  onToggleExpand,
  permissionLevel
}) => {
  const { openSlider, closeSlider } = useSlider();
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteOneDialogOpen, setDeleteOneDialogOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const knowledgeApi = useKnowledgeApi();

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
          const response = await knowledgeApi.getKnowledgeVersions(knowledge.name, knowledge.agent);
          setVersions(response);
        } catch (error) {
          console.error('Failed to fetch versions:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchVersions();
  }, [isExpanded, knowledge, knowledgeApi]);

  const handleEdit = () => {
    openSlider(
      <KnowledgeEditor
        mode="edit"
        knowledge={knowledge}
        onSave={(updatedKnowledge) => {
          onUpdateKnowledge(updatedKnowledge);
          closeSlider();
        }}
        onClose={closeSlider}
      />,
      `${knowledge.name}`
    );
  };

  const handleView = async () => {
    try {
      // Fetch the latest version from server by ID
      const knowledgeDetails = await knowledgeApi.getKnowledge(knowledge.id);

      openSlider(
        <KnowledgeViewer
          knowledge={knowledgeDetails}
          onEdit={handleEdit}
          onDelete={(knowledgeToDelete) => handleDeleteOne(knowledgeToDelete)}
          title={`View: ${knowledge.name}`}
        />,
        `${knowledge.name}`
      );
    } catch (error) {
      console.error('Error fetching knowledge details:', error);
      // Fallback to existing data if fetch fails
      openSlider(
        <KnowledgeViewer
          knowledge={knowledge}
          onEdit={handleEdit}
          onDelete={(knowledgeToDelete) => handleDeleteOne(knowledgeToDelete)}
          title={`View: ${knowledge.name}`}
        />,
        `${knowledge.name}`
      );
    }
  };

  const handleDeleteAllClick = (e) => {
    e.stopPropagation();
    setDeleteAllDialogOpen(true);
  };

  const handleDeleteAllConfirm = async () => {
    await onDeleteAllKnowledge(knowledge);
    setDeleteAllDialogOpen(false);
  };

  const handleDeleteOneConfirm = () => {
    onDeleteOneKnowledge(versionToDelete);
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
    const knowledgeToDelete = versionToDelete || knowledge;
    setDeleteOneDialogOpen(true);
    setVersionToDelete(knowledgeToDelete);
  };

  const handleVersionSelect = async (version) => {
    try {
      // Fetch the specific version by ID
      const versionDetails = await knowledgeApi.getKnowledge(version.id);

      openSlider(
        <KnowledgeViewer
          knowledge={versionDetails}
          onEdit={handleEdit}
          onDelete={(knowledgeToDelete) => handleDeleteOne(knowledgeToDelete)}
          title={`View Knowledge (v.${version.version.substring(0, 7)})`}
        />,
        `View Knowledge (v.${version.version.substring(0, 7)})`
      );
    } catch (error) {
      console.error('Error fetching knowledge version:', error);
      // Continue with existing data as fallback
      openSlider(
        <KnowledgeViewer
          knowledge={{ ...knowledge, ...version }}
          onEdit={handleEdit}
          onDelete={(knowledgeToDelete) => handleDeleteOne(knowledgeToDelete)}
          title={`View Knowledge (v.${version.version.substring(0, 7)})`}
        />,
        `View Knowledge (v.${version.version.substring(0, 7)})`
      );
    }
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

  const formatKnowledgeName = (name) => {
    return name.trim();
  };

  const wasRecentlyUpdated = isRecentlyUpdated(knowledge.updatedAt || knowledge.createdAt);

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
                {formatKnowledgeName(knowledge.name)}
              </Typography>
              {wasRecentlyUpdated && (
                <Chip
                  label="New"
                  size="small"
                  color="success"
                  sx={{
                    height: '22px',
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Box>
            {permissionLevel === 'edit' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Edit" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    sx={{
                      color: 'primary.main',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      mr: 2,
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Delete all versions" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleDeleteAllClick}
                    sx={{
                      color: 'error.main',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      '&:hover': {
                        bgcolor: 'error.light',
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ) : null}

          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, ml: 8 }}>
            <Chip
              size="small"
              label={knowledge.type || 'No Type'}
              className="type-chip"
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
                className="agent-chip"
                variant="outlined"
                sx={{
                  color: 'var(--tag-text)',
                  borderColor: 'divider',
                  fontWeight: 500
                }}
              />
            )}
            <Button
              size="small"
              onClick={handleVersions}
              endIcon={
                <KeyboardArrowDown
                  sx={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              }
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                minWidth: 'auto',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {isExpanded ? "Hide versions" : "See versions"}
            </Button>
          </Box>

          <Collapse
            in={isExpanded}
            timeout={300}
            unmountOnExit
            style={{
              transformOrigin: 'top center',
              willChange: 'height, opacity'
            }}
          >
            <Box
              className="versions-panel"
              sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 'medium',
                  color: 'text.secondary'
                }}
              >
                Version History
              </Typography>

              {isLoading ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Loading versions...
                </Typography>
              ) : versions.length > 0 ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {versions.map((version, index) => (
                    <Box
                      key={version.version}
                      onClick={() => handleVersionSelect(version)}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        bgcolor: index === 0 ? 'primary.ultralight' : 'background.paper',
                        border: '1px solid',
                        borderColor: index === 0 ? 'primary.main' : 'divider',
                        '&:hover': {
                          bgcolor: index === 0 ? 'primary.ultralight' : 'action.hover',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', color: 'text.secondary' }}>
                          {version.version.substring(0, 7)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {index === 0 ? (
                            <Box component="span" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                              Current version
                            </Box>
                          ) : (
                            `Created ${formatDate(version.createdAt)}`
                          )}
                        </Typography>
                      </Box>

                      {permissionLevel === 'edit' ? (
                        <Tooltip title="Delete this version" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOne(version);
                              }}
                              sx={{
                                color: 'error.main',
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                '&:hover': {
                                  bgcolor: 'error.light',
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                         ) : null} 
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No versions found.
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>

      <ConfirmationDialog
        open={deleteAllDialogOpen}
        title="Delete All Versions"
        message={`Are you sure you want to delete all versions of "${knowledge.name}"? This action cannot be undone.`}
        confirmButtonText="Delete All"
        cancelButtonText="Cancel"
        severity="error"
        onConfirm={handleDeleteAllConfirm}
        onCancel={handleDeleteCancel}
      />

      <ConfirmationDialog
        open={deleteOneDialogOpen}
        title="Delete Version"
        message={`Are you sure you want to delete this version of "${knowledge.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        severity="error"
        onConfirm={handleDeleteOneConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default KnowledgeItem;
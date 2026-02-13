import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Paper,
  Divider
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  KeyboardArrowDown,
  FolderOpen,
  CloudOutlined,
  BusinessOutlined,
  ExtensionOutlined
} from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import KnowledgeEditor from './KnowledgeEditor';
import KnowledgeViewer from './KnowledgeViewer';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { ReactComponent as AgentKnowledgeIcon } from '../../theme/agent-knowledge.svg';

const KnowledgeScopeItem = ({ 
  knowledge, 
  scopeType, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const getScopeIcon = () => {
    switch(scopeType) {
      case 'system':
        return <CloudOutlined fontSize="small" sx={{ color: 'var(--info)' }} />;
      case 'tenant':
        return <BusinessOutlined fontSize="small" sx={{ color: 'var(--primary)' }} />;
      case 'activation':
        return <ExtensionOutlined fontSize="small" sx={{ color: 'var(--success)' }} />;
      default:
        return null;
    }
  };

  const getScopeLabel = () => {
    switch(scopeType) {
      case 'system':
        return 'System Template';
      case 'tenant':
        return 'Tenant Default';
      case 'activation':
        return knowledge.activationName ? `Activation: ${knowledge.activationName}` : 'Activation';
      default:
        return '';
    }
  };

  const getScopeBgColor = () => {
    switch(scopeType) {
      case 'system':
        return 'rgba(var(--info-rgb), 0.05)';
      case 'tenant':
        return 'rgba(var(--primary-rgb), 0.05)';
      case 'activation':
        return 'rgba(var(--success-rgb), 0.05)';
      default:
        return 'transparent';
    }
  };

  const getScopeBorderColor = () => {
    switch(scopeType) {
      case 'system':
        return 'var(--info)';
      case 'tenant':
        return 'var(--primary)';
      case 'activation':
        return 'var(--success)';
      default:
        return 'var(--border-color)';
    }
  };

  const canEdit = knowledge.permissionLevel === 'edit';

  return (
    <Box
      onClick={() => onView(knowledge)}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        borderColor: getScopeBorderColor(),
        bgcolor: getScopeBgColor(),
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transform: 'translateY(-1px)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getScopeIcon()}
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          >
            {getScopeLabel()}
          </Typography>
          <Chip 
            size="small" 
            label={knowledge.type || 'text'} 
            sx={{ 
              height: '20px', 
              fontSize: '0.7rem',
              bgcolor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)'
            }} 
          />
        </Box>
        {canEdit && (
          <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Edit" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(knowledge);
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: 'var(--primary)',
                  '&:hover': { bgcolor: 'rgba(var(--primary-rgb), 0.1)' }
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(knowledge);
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: 'var(--error)',
                  '&:hover': { bgcolor: 'rgba(var(--error-rgb), 0.1)' }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      {knowledge.content && (
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 1,
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {knowledge.content.substring(0, 100)}...
        </Typography>
      )}
    </Box>
  );
};

const KnowledgeGroupItem = ({
  group,
  onUpdateKnowledge,
  onDeleteKnowledge,
  isSystemScoped,
  selectedAgent
}) => {
  const { openSlider, closeSlider } = useSlider();
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [knowledgeToDelete, setKnowledgeToDelete] = useState(null);

  const handleView = (knowledge) => {
    openSlider(
      <KnowledgeViewer
        knowledgeId={knowledge.id}
        onEdit={() => handleEdit(knowledge)}
        onDelete={() => handleDeleteClick(knowledge)}
        title={`View: ${knowledge.name}`}
      />,
      knowledge.name
    );
  };

  const handleEdit = (knowledge) => {
    openSlider(
      <KnowledgeEditor
        mode="edit"
        knowledge={knowledge}
        isSystemScoped={knowledge.systemScoped}
        onSave={(updatedKnowledge) => {
          onUpdateKnowledge(updatedKnowledge);
          closeSlider();
        }}
        onClose={closeSlider}
      />,
      `Edit: ${knowledge.name}`
    );
  };

  const handleDeleteClick = (knowledge) => {
    setKnowledgeToDelete(knowledge);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDeleteKnowledge(knowledgeToDelete);
    setDeleteDialogOpen(false);
    setKnowledgeToDelete(null);
    closeSlider();
  };

  const hasSystemScoped = group.system_scoped !== null;
  const hasTenantDefault = group.tenant_default !== null;
  const hasActivations = group.activations && group.activations.length > 0;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }
        }}
      >
        <Box
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            p: 2.5,
            cursor: 'pointer',
            bgcolor: 'var(--bg-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover': {
              bgcolor: 'var(--bg-subtle)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '50%',
              p: '6px',
              boxShadow: '0 0 0 1px var(--border-light)',
            }}>
              <AgentKnowledgeIcon style={{ width: 28, height: 28 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--text-primary)'
                }}
              >
                {group.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                {hasSystemScoped && (
                  <Chip 
                    size="small" 
                    icon={<CloudOutlined />}
                    label="System" 
                    sx={{ 
                      height: '22px', 
                      fontSize: '0.7rem',
                      bgcolor: 'rgba(var(--info-rgb), 0.1)',
                      color: 'var(--info)',
                      '& .MuiChip-icon': { color: 'var(--info)' }
                    }} 
                  />
                )}
                {hasTenantDefault && (
                  <Chip 
                    size="small" 
                    icon={<BusinessOutlined />}
                    label="Tenant" 
                    sx={{ 
                      height: '22px', 
                      fontSize: '0.7rem',
                      bgcolor: 'rgba(var(--primary-rgb), 0.1)',
                      color: 'var(--primary)',
                      '& .MuiChip-icon': { color: 'var(--primary)' }
                    }} 
                  />
                )}
                {hasActivations && (
                  <Chip 
                    size="small" 
                    icon={<ExtensionOutlined />}
                    label={`${group.activations.length} Activation${group.activations.length > 1 ? 's' : ''}`}
                    sx={{ 
                      height: '22px', 
                      fontSize: '0.7rem',
                      bgcolor: 'rgba(var(--success-rgb), 0.1)',
                      color: 'var(--success)',
                      '& .MuiChip-icon': { color: 'var(--success)' }
                    }} 
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton
            size="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
        </Box>

        <Collapse in={isExpanded} timeout={300}>
          <Divider />
          <Box sx={{ p: 2.5, bgcolor: 'var(--bg-light)' }}>
            {hasSystemScoped && (
              <>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1.5, 
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                  }}
                >
                  System Template
                </Typography>
                <KnowledgeScopeItem
                  knowledge={group.system_scoped}
                  scopeType="system"
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              </>
            )}

            {hasTenantDefault && (
              <>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1.5,
                    mt: hasSystemScoped ? 2 : 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                  }}
                >
                  Tenant Default
                </Typography>
                <KnowledgeScopeItem
                  knowledge={group.tenant_default}
                  scopeType="tenant"
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onView={handleView}
                />
              </>
            )}

            {hasActivations && (
              <>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1.5,
                    mt: (hasSystemScoped || hasTenantDefault) ? 2 : 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 600
                  }}
                >
                  Activations
                </Typography>
                {group.activations.map((activation) => (
                  <KnowledgeScopeItem
                    key={activation.id}
                    knowledge={activation}
                    scopeType="activation"
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onView={handleView}
                  />
                ))}
              </>
            )}
          </Box>
        </Collapse>
      </Paper>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Knowledge"
        message={`Are you sure you want to delete this knowledge item? This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setKnowledgeToDelete(null);
        }}
      />
    </>
  );
};

export default KnowledgeGroupItem;

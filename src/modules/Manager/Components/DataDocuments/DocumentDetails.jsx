import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  IconButton
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import { useDocumentsApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useSlider } from '../../contexts/SliderContext';
import { handleApiError } from '../../utils/errorHandler';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import DocumentEdit from './DocumentEdit';

const DocumentDetails = ({ document, onUpdate, onDelete, onClose }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { setLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const { openSlider, closeSlider } = useSlider();
  const documentsApi = useDocumentsApi();

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess(`${label} copied to clipboard`);
    }).catch(() => {
      showError('Failed to copy to clipboard');
    });
  };

  const handleEditClick = () => {
    openSlider(
      <DocumentEdit
        document={document}
        onUpdate={async () => {
          if (onUpdate) await onUpdate();
          closeSlider();
          if (onClose) onClose();
        }}
        onCancel={closeSlider}
      />,
      'Edit Document'
    );
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await documentsApi.deleteDocument(document.id);
      showSuccess('Document deleted successfully');
      setDeleteDialogOpen(false);
      if (onDelete) onDelete(document);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to delete document:', error);
      const errorMessage = handleApiError(error, 'deleting document');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderDetailRow = (label, value, copyable = false) => {
    if (!value && value !== 0 && value !== false) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
            {label}
          </Typography>
          {copyable && (
            <IconButton
              size="small"
              onClick={() => handleCopyToClipboard(typeof value === 'string' ? value : JSON.stringify(value), label)}
              sx={{ p: 0.5 }}
            >
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
        {typeof value === 'string' && value.length < 100 ? (
          <Typography variant="body2" sx={{ fontFamily: label === 'ID' || label === 'Key' ? 'monospace' : 'inherit' }}>
            {value}
          </Typography>
        ) : (
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'var(--bg-muted)', 
            borderRadius: 'var(--radius-sm)',
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid var(--border-color)'
          }}>
            <pre style={{ 
              margin: 0, 
              fontSize: '0.75rem', 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            </pre>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--primary)',
            borderRadius: '50%',
            p: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <DescriptionIcon sx={{ 
              width: 28, 
              height: 28,
              color: 'white'
            }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {document.key || document.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={document.type}
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              />
              {document.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Created {formatTimeAgo(document.createdAt)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            sx={{ textTransform: 'none' }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
              Document Information
            </Typography>
            
            {renderDetailRow('ID', document.id, true)}
            {document.key && renderDetailRow('Key', document.key, true)}
            {document.type && renderDetailRow('Type', document.type)}
            {document.createdAt && renderDetailRow('Created At', new Date(document.createdAt).toLocaleString())}
            {document.updatedAt && renderDetailRow('Updated At', new Date(document.updatedAt).toLocaleString())}
          </CardContent>
        </Card>

        {document.content && (
          <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
                Content
              </Typography>
              {renderDetailRow('Document Content', document.content, true)}
            </CardContent>
          </Card>
        )}

        {document.metadata && Object.keys(document.metadata).length > 0 && (
          <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
                Metadata
              </Typography>
              {renderDetailRow('Document Metadata', document.metadata, true)}
            </CardContent>
          </Card>
        )}

        {document.data && !document.content && !document.metadata && (
          <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
                Raw Data
              </Typography>
              {renderDetailRow('Full Document Data', document.data, true)}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message={`Are you sure you want to delete this document? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default DocumentDetails;

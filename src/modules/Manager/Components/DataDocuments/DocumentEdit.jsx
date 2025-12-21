import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { useDocumentsApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { handleApiError } from '../../utils/errorHandler';

const DocumentEdit = ({ document, onUpdate, onCancel }) => {
  const [editedDocument, setEditedDocument] = useState({ ...document });
  const [jsonError, setJsonError] = useState(null);

  const { setLoading, isLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const documentsApi = useDocumentsApi();

  const validateJSON = (value, field) => {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError(`Invalid JSON in ${field}: ${error.message}`);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate JSON fields before saving
      if (editedDocument.metadata !== undefined) {
        const metadataStr = typeof editedDocument.metadata === 'string' 
          ? editedDocument.metadata 
          : JSON.stringify(editedDocument.metadata);
        if (!validateJSON(metadataStr, 'metadata')) {
          setLoading(false);
          return;
        }
      }

      if (editedDocument.data !== undefined && !editedDocument.content && !editedDocument.metadata) {
        const dataStr = typeof editedDocument.data === 'string' 
          ? editedDocument.data 
          : JSON.stringify(editedDocument.data);
        if (!validateJSON(dataStr, 'data')) {
          setLoading(false);
          return;
        }
      }

      await documentsApi.updateDocument(editedDocument.id, editedDocument);
      showSuccess('Document updated successfully');
      if (onUpdate) await onUpdate();
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to update document:', error);
      const errorMessage = handleApiError(error, 'updating document');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid var(--border-color)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--primary)',
            borderRadius: '50%',
            p: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <EditIcon sx={{ 
              width: 28, 
              height: 28,
              color: 'white'
            }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Edit Document
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {document.key || document.id}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading || !!jsonError}
            sx={{ textTransform: 'none' }}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isLoading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {jsonError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {jsonError}
          </Alert>
        )}

        <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
              Document Information
            </Typography>
            
            <TextField
              fullWidth
              label="Document ID"
              value={editedDocument.id || ''}
              disabled
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Document Type"
              value={editedDocument.type || ''}
              disabled
              size="small"
              sx={{ mb: 2 }}
            />

            {editedDocument.key !== undefined && (
              <TextField
                fullWidth
                label="Key"
                value={editedDocument.key || ''}
                onChange={(e) => setEditedDocument({ ...editedDocument, key: e.target.value })}
                size="small"
                sx={{ mb: 2 }}
              />
            )}
          </CardContent>
        </Card>

        {editedDocument.content !== undefined && (
          <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
                Content
              </Typography>
              
              <TextField
                fullWidth
                label="Document Content"
                multiline
                rows={8}
                value={typeof editedDocument.content === 'string' 
                  ? editedDocument.content 
                  : JSON.stringify(editedDocument.content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditedDocument({ ...editedDocument, content: parsed });
                    setJsonError(null);
                  } catch (error) {
                    setEditedDocument({ ...editedDocument, content: e.target.value });
                  }
                }}
                sx={{ 
                  '& textarea': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {editedDocument.metadata !== undefined && (
          <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
                Metadata
              </Typography>
              
              <TextField
                fullWidth
                label="Metadata (JSON)"
                multiline
                rows={8}
                value={JSON.stringify(editedDocument.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditedDocument({ ...editedDocument, metadata: parsed });
                    setJsonError(null);
                  } catch (error) {
                    setJsonError(`Invalid JSON in metadata: ${error.message}`);
                  }
                }}
                error={!!jsonError && jsonError.includes('metadata')}
                helperText={jsonError && jsonError.includes('metadata') ? jsonError : 'Must be valid JSON'}
                sx={{ 
                  '& textarea': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {editedDocument.data !== undefined && !editedDocument.content && !editedDocument.metadata && (
          <Card elevation={0} sx={{ border: '1px solid var(--border-color)', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'var(--primary)' }}>
                Raw Data
              </Typography>
              
              <TextField
                fullWidth
                label="Data (JSON)"
                multiline
                rows={12}
                value={JSON.stringify(editedDocument.data, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditedDocument({ ...editedDocument, data: parsed });
                    setJsonError(null);
                  } catch (error) {
                    setJsonError(`Invalid JSON in data: ${error.message}`);
                  }
                }}
                error={!!jsonError && jsonError.includes('data')}
                helperText={jsonError && jsonError.includes('data') ? jsonError : 'Must be valid JSON'}
                sx={{ 
                  '& textarea': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default DocumentEdit;

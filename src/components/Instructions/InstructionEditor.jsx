import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Editor } from '@monaco-editor/react';

const InstructionEditor = ({ mode = 'add', instruction, onSave, onClose }) => {
  const [formData, setFormData] = useState(instruction || {
    name: '',
    content: '',
    type: null,
  });
  const [jsonError, setJsonError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const normalizeType = (type) => {
    if (!type) return '';
    const normalized = type.toLowerCase();
    if (['text', 'markdown', 'json'].includes(normalized)) {
      return normalized;
    }
    return '';
  };

  useEffect(() => {
    if (instruction?.type) {
      setFormData(prev => ({
        ...prev,
        type: normalizeType(instruction.type)
      }));
    }
  }, [instruction]);

  const validateJSON = (content) => {
    if (!content) return null;
    try {
      JSON.parse(content);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    
    if (formData.type === 'json') {
      const error = validateJSON(formData.content);
      if (error) {
        setJsonError(error);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving instruction:', error);
      setSubmitError(error.message || 'Failed to save instruction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (value) => {
    setFormData({ ...formData, content: value });
    if (formData.type === 'json') {
      setJsonError(validateJSON(value));
    } else {
      setJsonError(null);
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData({ ...formData, type: newType });
    
    // Clear or set JSON validation errors when type changes
    if (newType === 'json') {
      setJsonError(validateJSON(formData.content));
    } else {
      setJsonError(null);
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: 'var(--background-default)',
      borderRadius: 'var(--radius-lg)',
    }}>

      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'var(--background-light)',
              borderRadius: 'var(--radius-sm)',
              '& fieldset': {
                borderColor: 'var(--border-color)'
              }
            }
          }}
          required
          disabled={mode === 'edit'}
        />

        <FormControl fullWidth sx={{ mb: 2 }} required>
          <InputLabel sx={{ 
            backgroundColor: '#fff', 
            px: 0.5,
            zIndex: 1,
            '&.Mui-focused, &.MuiFormLabel-filled': {
              backgroundColor: '#fff',
              padding: '0 8px',
              marginLeft: '-4px',
              zIndex: 1
            }
          }}>Type</InputLabel>
          <Select
            value={normalizeType(formData.type)}
            onChange={handleTypeChange}
            sx={{
              backgroundColor: 'var(--background-light)',
              borderRadius: 'var(--radius-sm)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--border-color)'
              }
            }}
            required
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="markdown">Markdown</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ 
          mb: 2, 
          border: 1, 
          borderColor: 'var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          '& .monaco-editor': {
            backgroundColor: 'var(--background-light) !important'
          },
          '& .monaco-editor .cursors-layer': {
            '& .cursor': {
              borderLeft: '2px solid var(--primary) !important',
              borderRadius: '1px',
            }
          },
          '& .monaco-editor .current-line': {
            border: 'none !important',
            backgroundColor: 'var(--background-subtle) !important'
          }
        }}>
          <Editor
            height="400px"
            language={formData.type === 'json' ? 'json' : 'markdown'}
            value={formData.content}
            onChange={handleEditorChange}
            theme="light"
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontFamily: 'var(--font-mono)',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false
            }}
          />
          {jsonError && (
            <Box sx={{ 
              p: 1, 
              color: 'error.main',
              borderTop: 1,
              borderColor: 'error.main',
              fontSize: '0.875rem'
            }}>
              {jsonError}
            </Box>
          )}
        </Box>

        {submitError && (
          <Box sx={{ 
            mb: 2,
            p: 2,
            color: 'error.main',
            bgcolor: 'error.light',
            borderRadius: 'var(--radius-sm)'
          }}>
            {submitError}
          </Box>
        )}

        <Button 
          variant="contained" 
          type="submit" 
          fullWidth
          disabled={(formData.type === 'json' && jsonError) || isSubmitting}
          sx={{
            bgcolor: 'var(--primary)',
            color: '#fff',
            fontWeight: 'var(--font-weight-medium)',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'var(--primary)',
              opacity: 0.9
            },
            '&.Mui-disabled': {
              bgcolor: 'var(--primary)',
              opacity: 0.5,
              color: '#fff'
            }
          }}
        >
          {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Instruction' : 'Save New Version'}
        </Button>
      </form>
    </Box>
  );
};

export default InstructionEditor; 
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import { Editor } from '@monaco-editor/react';

const InstructionEditor = ({ mode = 'add', instruction, onSave, onClose }) => {
  const [formData, setFormData] = useState(instruction || {
    name: '',
    content: '',
    type: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      version: crypto.randomUUID(),
    });
    onClose();
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
            value={formData.type || ''}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
            onChange={(value) => setFormData({ ...formData, content: value })}
            theme="light"
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              fontFamily: 'var(--font-mono)',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false
            }}
          />
        </Box>

        <Button 
          variant="contained" 
          type="submit" 
          fullWidth
          sx={{
            bgcolor: 'var(--primary)',
            color: '#fff',
            fontWeight: 'var(--font-weight-medium)',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'var(--primary)',
              opacity: 0.9
            }
          }}
        >
          Save New Version
        </Button>
      </form>
    </Box>
  );
};

export default InstructionEditor; 
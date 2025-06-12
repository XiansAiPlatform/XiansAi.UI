import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Editor } from '@monaco-editor/react';
import { useKnowledgeApi } from '../../services/knowledge-api';
import { useAgentsApi } from '../../services/agents-api';
import { useLoading } from '../../contexts/LoadingContext';

const KnowledgeEditor = ({ mode = 'add', knowledge, selectedAgent = '', onSave, onClose }) => {
  const knowledgeApi = useKnowledgeApi();
  const agentsApi = useAgentsApi();
  const { loading, setLoading } = useLoading();
  const nameFieldRef = useRef(null);
  const [formData, setFormData] = useState(knowledge || {
    name: '',
    content: '',
    type: 'markdown',
    agent: selectedAgent || '',
  });
  const [jsonError, setJsonError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Focus on name field when component mounts
  useEffect(() => {
    if (nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, []);

  const normalizeType = (type) => {
    if (!type) return '';
    const normalized = type.toLowerCase();
    if (['text', 'markdown', 'json'].includes(normalized)) {
      return normalized;
    }
    return '';
  };

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      setAgentsError(null);
      try {
        const response = await agentsApi.getAllAgents();
        console.log('Agents API response:', response);
        let agentsList = [];
        if (response && Array.isArray(response)) {
          agentsList = response;
        } else if (response && Array.isArray(response.data)) {
          agentsList = response.data;
        } else {
          console.error('Unexpected agents response format:', response);
          agentsList = [];
        }
        setAgents(agentsList);
        
        // Auto-select agent if there's only one and no agent is already selected
        if (agentsList.length === 1 && !formData.agent && !selectedAgent) {
          setFormData(prev => ({
            ...prev,
            agent: agentsList[0]
          }));
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setAgentsError('Failed to load agents');
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [agentsApi, formData.agent, selectedAgent]);

  useEffect(() => {
    // Fetch knowledge content if in edit mode and content is not available
    const fetchKnowledgeContent = async () => {
      if (mode === 'edit' && knowledge && knowledge.id && (!knowledge.content || knowledge.content === '')) {
        setIsLoadingContent(true);
        try {
          const fullKnowledge = await knowledgeApi.getKnowledge(knowledge.id);
          setFormData(prev => ({
            ...prev,
            ...fullKnowledge,
            type: normalizeType(fullKnowledge.type)
          }));
        } catch (error) {
          console.error('Error fetching knowledge content:', error);
          setSubmitError('Failed to load knowledge content');
        } finally {
          setIsLoadingContent(false);
        }
      }
    };

    fetchKnowledgeContent();
  }, [knowledge, knowledgeApi, mode]);

  useEffect(() => {
    if (knowledge?.type) {
      setFormData(prev => ({
        ...prev,
        type: normalizeType(knowledge.type)
      }));
    }
    
    // If selectedAgent is passed and we're in add mode, update formData
    if (mode === 'add' && selectedAgent && !formData.agent) {
      setFormData(prev => ({
        ...prev,
        agent: selectedAgent
      }));
    }
  }, [knowledge, selectedAgent, mode, formData.agent]);

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
    setLoading(true);
    
    if (formData.type === 'json') {
      const error = validateJSON(formData.content);
      if (error) {
        setJsonError(error);
        setLoading(false);
        return;
      }
    }

    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving knowledge:', error);
      setSubmitError(error.message || 'Failed to save knowledge');
    } finally {
      setLoading(false);
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
      height: 'calc(100vh - 100px)',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--background-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        p: 3
      }}>
        <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            inputRef={nameFieldRef}
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
            }}>Agent</InputLabel>
            <Select
              value={formData.agent || ''}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              sx={{
                backgroundColor: 'var(--background-light)',
                borderRadius: 'var(--radius-sm)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color)'
                }
              }}
              disabled={isLoadingAgents}
              required
            >
              {isLoadingAgents ? (
                <MenuItem disabled><em>Loading agents...</em></MenuItem>
              ) : agentsError ? (
                <MenuItem disabled><em>{agentsError}</em></MenuItem>
              ) : agents.length === 0 ? (
                <MenuItem disabled><em>No agents available</em></MenuItem>
              ) : (
                agents.map(agent => (
                  <MenuItem key={agent} value={agent}>
                    {agent}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Box sx={{ 
            flex: 1,
            minHeight: '300px',
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
            {isLoadingContent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
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
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            )}
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
        </form>
      </Box>

      {/* Fixed button bar at the bottom */}
      <Box sx={{ 
        p: 3,
        borderTop: 1,
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--background-default)',
        display: 'flex', 
        gap: 2, 
        justifyContent: 'flex-end'
      }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)',
            fontWeight: 'var(--font-weight-medium)',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'var(--border-color)',
              bgcolor: 'var(--background-subtle)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={(formData.type === 'json' && jsonError) || loading || isLoadingContent}
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
          {loading ? 'Saving...' : mode === 'add' ? 'Create' : 'Save New Version'}
        </Button>
      </Box>
    </Box>
  );
};

export default KnowledgeEditor; 
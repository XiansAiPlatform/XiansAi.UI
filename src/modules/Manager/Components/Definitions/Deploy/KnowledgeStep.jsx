import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  CircularProgress
} from '@mui/material';
import { Editor } from '@monaco-editor/react';
import { Info as InfoIcon, Save as SaveIcon } from '@mui/icons-material';
import { useKnowledgeApi } from '../../../services/knowledge-api';
import { useNotification } from '../../../contexts/NotificationContext';

const KnowledgeStep = ({ 
  stepData, 
  agentName, 
  onComplete, 
  onError 
}) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingKnowledge, setExistingKnowledge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const knowledgeApi = useKnowledgeApi();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadExistingKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepData.name, agentName]);

  const getDefaultValue = () => {
    if (!stepData.value) return '';
    
    const knowledgeType = stepData.type || 'text';
    
    // For JSON type, stringify the value
    if (knowledgeType === 'json') {
      return typeof stepData.value === 'string' 
        ? stepData.value 
        : JSON.stringify(stepData.value, null, 2);
    }
    
    // For text and markdown, use the value directly as string
    return typeof stepData.value === 'string' 
      ? stepData.value 
      : JSON.stringify(stepData.value, null, 2);
  };

  const loadExistingKnowledge = async () => {
    try {
      setIsLoading(true);
      const knowledge = await knowledgeApi.getKnowledgeByName(stepData.name, agentName);
      if (knowledge) {
        setExistingKnowledge(knowledge);
        setContent(knowledge.content || '');
      } else {
        // If no existing knowledge, use the default value from workflow
        const defaultValue = getDefaultValue();
        setContent(defaultValue);
        setIsEditing(true); // Start in edit mode for new knowledge
      }
    } catch (error) {
      // If knowledge doesn't exist (404), that's okay - we'll use the default value from workflow
      if (error.status === 404) {
        const defaultValue = getDefaultValue();
        setContent(defaultValue);
        setIsEditing(true);
      } else {
        console.error('Error loading knowledge:', error);
        showError('Failed to load existing knowledge');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const knowledgeType = stepData.type || 'text';
      let contentToSave = content;
      
      // Validate and format based on type
      if (knowledgeType === 'json') {
        try {
          const parsedContent = JSON.parse(content);
          contentToSave = JSON.stringify(parsedContent, null, 2);
        } catch (e) {
          showError('Invalid JSON format. Please check your content.');
          return;
        }
      }
      // For markdown and text, save content as-is
      
      const knowledgeData = {
        name: stepData.name,
        content: contentToSave,
        type: knowledgeType,
        agent: agentName
      };

      await knowledgeApi.createKnowledge(knowledgeData);
      
      showSuccess(`Knowledge "${stepData.name}" saved successfully`);
      setIsEditing(false);
      setExistingKnowledge({ ...knowledgeData, id: Date.now() }); // Update local state
      
      // Notify parent that this step is complete
      if (onComplete) {
        onComplete({
          type: 'knowledge',
          name: stepData.name,
          success: true
        });
      }
    } catch (error) {
      console.error('Error saving knowledge:', error);
      showError('Failed to save knowledge: ' + error.message);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to existing content or default
    if (existingKnowledge) {
      setContent(existingKnowledge.content || '');
    } else {
      const defaultValue = getDefaultValue();
      setContent(defaultValue);
    }
    setIsEditing(false);
  };

  const getEditorLanguage = () => {
    const knowledgeType = stepData.type || 'text';
    
    switch (knowledgeType) {
      case 'json':
        return 'json';
      case 'markdown':
        return 'markdown';
      case 'text':
      default:
        return 'plaintext';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>

          {stepData.url && (
            <Alert 
              severity="info" 
              icon={<InfoIcon />}
              sx={{ mb: 2 }}
              action={
                <Button 
                  size="small" 
                  onClick={() => window.open(stepData.url, '_blank')}
                >
                  View Documentation
                </Button>
              }
            >
              Additional documentation is available for this configuration.
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Configuration Content
            </Typography>
            
            {isEditing ? (
              <Box>
                <Box 
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    height: 300
                  }}
                >
                  <Editor
                    height="300px"
                    defaultLanguage={getEditorLanguage()}
                    value={content}
                    onChange={(value) => setContent(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                    theme="vs-light"
                  />
                </Box>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box 
                  sx={{ 
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    maxHeight: 300,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    mb: 2
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {content || 'No configuration set'}
                  </pre>
                </Box>
                
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Edit Configuration
                </Button>
              </Box>
            )}
          </Box>

          {existingKnowledge && !isEditing && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Configuration saved and ready for deployment.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default KnowledgeStep;

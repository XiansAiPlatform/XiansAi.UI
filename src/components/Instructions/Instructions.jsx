import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Fab,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Add} from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import InstructionEditor from './InstructionEditor';
import InstructionItem from './InstructionItem';
import { useInstructionsApi } from '../../services/instructions-api';

const Instructions = () => {
  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openSlider, closeSlider } = useSlider();
  const instructionsApi = useInstructionsApi();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInstructions = instructions.filter(instruction => 
    instruction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instruction.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const data = await instructionsApi.getLatestInstructions();
        // Sort instructions by createdAt in descending order
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInstructions(sortedData);
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
        // TODO: Add error handling/notification
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructions();
  }, [instructionsApi]);

  const handleAdd = () => {
    openSlider(
      <InstructionEditor 
        mode="add"
        onSave={async (newInstruction) => {
          try {
            await instructionsApi.createInstruction(newInstruction);
            // Fetch fresh data after creating
            const updatedInstructions = await instructionsApi.getLatestInstructions();
            const sortedInstructions = updatedInstructions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setInstructions(sortedInstructions);
            closeSlider();
          } catch (error) {
            console.error('Failed to create instruction:', error);
            // TODO: Add error handling/notification
          }
        }}
        onClose={closeSlider}
      />,
      "Add Knowledge"
    );
  };

  const handleUpdateInstruction = async (updatedInstruction) => {
    try {
      await instructionsApi.createInstruction(updatedInstruction);
      // Fetch fresh data after updating
      const updatedInstructions = await instructionsApi.getLatestInstructions();
      const sortedInstructions = updatedInstructions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInstructions(sortedInstructions);
      closeSlider();
    } catch (error) {
      console.error('Failed to update instruction:', error);
      // TODO: Add error handling/notification
    }
  };

  const handleDeleteAllInstruction = async (instruction) => {
    try {
      const success = await instructionsApi.deleteAllVersions(instruction.name);
      if (success) {
        // Fetch fresh data after deletion
        const updatedInstructions = await instructionsApi.getLatestInstructions();
        const sortedInstructions = updatedInstructions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setInstructions(sortedInstructions);
        closeSlider();
      }
    } catch (error) {
      console.error('Failed to delete instruction versions:', error);
      // TODO: Add error handling/notification
    }
  };

  const handleDeleteOneInstruction = async (instruction) => {
    var success = instructionsApi.deleteInstruction(instruction.id);
    if (success) {
      // Fetch fresh data after creating
      const updatedInstructions = await instructionsApi.getLatestInstructions();
      const sortedInstructions = updatedInstructions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInstructions(sortedInstructions);
      closeSlider();
    }
  };

  const handleVersionToggle = (instructionId) => {
    setExpandedId(expandedId === instructionId ? null : instructionId);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 6, mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4
        }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: 'var(--letter-spacing-tight)',
              color: 'var(--text-primary)'
            }}
          >
            Knowledge Base
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: '250px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 'var(--radius-md)',
                }
              }}
            />
            <Fab 
              color="primary" 
              size="medium" 
              onClick={handleAdd}
              sx={{ 
                zIndex: 1,
                bgcolor: 'var(--primary)',
                boxShadow: 'var(--shadow-sm)',
                '&:hover': {
                  bgcolor: 'var(--primary)',
                  opacity: 0.9,
                  transform: 'scale(1.05)',
                  boxShadow: 'var(--shadow-md)'
                },
                '&:active': {
                  bgcolor: 'var(--primary)',
                  opacity: 0.8,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Add />
            </Fab>
          </Box>
        </Box>
        
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : filteredInstructions.length > 0 ? (
          <div className={`instructions-grid ${expandedId ? 'has-expanded' : ''}`}>
            {filteredInstructions
              .map((instruction) => (
                <div 
                  key={instruction.id}
                  className={instruction.id === expandedId ? 'instruction-item-expanded' : ''}
                >
                  <InstructionItem
                    instruction={instruction}
                    onUpdateInstruction={handleUpdateInstruction}
                    onDeleteAllInstruction={handleDeleteAllInstruction}
                    onDeleteOneInstruction={handleDeleteOneInstruction}
                    isExpanded={expandedId === instruction.id}
                    onToggleExpand={() => handleVersionToggle(instruction.id)}
                  />
                </div>
              ))}
          </div>
        ) : (
          <Box
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 500 }}>
              {searchQuery ? 'No matching instructions found' : 'No instructions yet'}
            </Typography>
            <Typography variant="body1" component="div" sx={{ mb: 3, maxWidth: 460 }}>
              {searchQuery 
                ? 'Try adjusting your search terms or clear the search to see all instructions.'
                : 'Create your first instruction by clicking the + button above. Instructions help customize the AI\'s behavior and responses.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Instructions; 
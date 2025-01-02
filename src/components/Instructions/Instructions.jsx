import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  List,
  Fab,
  CircularProgress,
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

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const data = await instructionsApi.getLatestInstructions();
        setInstructions(data);
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
            setInstructions(updatedInstructions);
            closeSlider();
          } catch (error) {
            console.error('Failed to create instruction:', error);
            // TODO: Add error handling/notification
          }
        }}
        onClose={closeSlider}
      />,
      "Add Instruction"
    );
  };

  const handleUpdateInstruction = async (updatedInstruction) => {
    try {
      await instructionsApi.createInstruction(updatedInstruction);
      // Fetch fresh data after updating
      const updatedInstructions = await instructionsApi.getLatestInstructions();
      setInstructions(updatedInstructions);
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
        setInstructions(updatedInstructions);
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
        setInstructions(updatedInstructions);
        closeSlider();
    }
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
            Instructions
          </Typography>
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
        
        <Paper 
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-paper)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            px: 2,
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
              boxShadow: 'var(--shadow-sm)'
            }
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : instructions.length > 0 ? (
            <List
              sx={{
                '& .MuiListItem-root': {
                  px: 0,
                  width: '100%',
                },
                '& > *:not(:last-child)': {
                  mb: 0.5
                }
              }}
            >
              {instructions.map((instruction) => (
                <InstructionItem
                  key={instruction.id}
                  instruction={instruction}
                  onUpdateInstruction={handleUpdateInstruction}
                  onDeleteAllInstruction={handleDeleteAllInstruction}
                  onDeleteOneInstruction={handleDeleteOneInstruction}
                />
              ))}
            </List>
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
                No instructions yet
              </Typography>
              <Typography variant="body1" component="div" sx={{ mb: 3, maxWidth: 460 }}>
                Create your first instruction by clicking the + button above. Instructions help customize the AI's behavior and responses.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Instructions; 
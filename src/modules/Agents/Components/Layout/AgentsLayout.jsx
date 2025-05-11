import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import AgentSidebar from '../Sidebar/AgentSidebar';
import AgentChat from '../Chat/AgentChat';
import TopBar from '../TopBar/TopBar';
import { useNavigate } from 'react-router-dom';

const AgentsLayout = ({ selectedAgent: initialSelectedAgent, initialPrompt }) => {
  const [selectedAgent, setSelectedAgent] = useState(initialSelectedAgent);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // If no agent is selected and one isn't passed in, redirect to explore page
  useEffect(() => {
    if (!selectedAgent && !initialSelectedAgent) {
      navigate('/agents/explore');
    }
  }, [selectedAgent, initialSelectedAgent, navigate]);

  // Set the selected agent from props when it changes
  useEffect(() => {
    if (initialSelectedAgent) {
      setSelectedAgent(initialSelectedAgent);
    }
  }, [initialSelectedAgent]);

  const handleToggleSidebar = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle navigation back to explore page
  const handleBackToExplore = () => {
    console.log('Navigating back to explore page');
    navigate('/agents/explore');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', // Full viewport height
      maxHeight: '100vh', // Ensure it doesn't exceed viewport
      overflow: 'hidden', // Prevent entire page from scrolling
      backgroundColor: 'var(--bg-main)' 
    }}>
      <TopBar 
        handleToggleSidebar={handleToggleSidebar} 
        onBackToExplore={handleBackToExplore}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />
      
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        position: 'relative',
        height: 'calc(100vh - 64px)' // Account for TopBar height
      }}>
        <AgentSidebar 
          selectedAgent={selectedAgent} 
          setSelectedAgent={setSelectedAgent} 
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onBackToExplore={handleBackToExplore}
        />
        
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          position: 'relative',
          maxHeight: '100%' // Ensure it doesn't exceed parent container
        }}>
          <AgentChat 
            selectedAgent={selectedAgent} 
            initialPrompt={initialPrompt}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AgentsLayout; 
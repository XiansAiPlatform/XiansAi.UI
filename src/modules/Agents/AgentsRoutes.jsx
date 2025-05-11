import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AgentsLayout from './Components/Layout/AgentsLayout';
import AgentsLanding from './Components/Landing/AgentsLanding';

const AgentsRoutes = () => {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState('');
  
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    navigate('/agents/chat');
  };
  
  const handleSelectPrompt = (prompt) => {
    setInitialPrompt(prompt);
  };
  
  return (
    <Routes>
      <Route path="/agents" element={<Navigate to="/agents/explore" replace />} />
      <Route 
        path="/agents/explore" 
        element={
          <AgentsLanding 
            onSelectAgent={handleSelectAgent} 
            onSelectPrompt={handleSelectPrompt} 
          />
        } 
      />
      <Route 
        path="/agents/chat" 
        element={
          <AgentsLayout 
            selectedAgent={selectedAgent}
            initialPrompt={initialPrompt}
          />
        } 
      />
    </Routes>
  );
};

export default AgentsRoutes; 
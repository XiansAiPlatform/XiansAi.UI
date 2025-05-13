import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import AgentsLayout from './Components/Layout/AgentsLayout';
import AgentsLanding from './Components/Landing/AgentsLanding';
import { mockAgents } from './definitions';

const AgentsRoutes = () => {
  const navigate = useNavigate();
  const [initialPrompt, setInitialPrompt] = useState('');
  
  const handleSelectAgent = (agent) => {
    navigate(`/agents/chat/${agent.id}`);
  };
  
  const handleSelectPrompt = (prompt) => {
    setInitialPrompt(prompt);
  };

  const AgentChatRoute = () => {
    const { agentId } = useParams();
    const [loadedAgent, setLoadedAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Find and set the agent from the URL parameter
    useEffect(() => {
      if (agentId) {
        const agent = mockAgents.find(a => a.id === agentId);
        if (agent) {
          setLoadedAgent(agent);
        }
      }
      setLoading(false);
    }, [agentId]);
    
    // If loading, show nothing yet
    if (loading) {
      return null;
    }
    
    // If no agent found with that ID, redirect to explore
    if (!loadedAgent) {
      return <Navigate to="/agents/explore" replace />;
    }
    
    // If agent was found, show the chat
    return (
      <AgentsLayout 
        selectedAgent={loadedAgent}
        initialPrompt={initialPrompt}
      />
    );
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
      <Route path="/agents/chat/:agentId" element={<AgentChatRoute />} />
      <Route path="/agents/chat" element={<Navigate to="/agents/explore" replace />} />
    </Routes>
  );
};

export default AgentsRoutes; 
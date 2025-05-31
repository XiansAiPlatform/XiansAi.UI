import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AgentSidebar from '../Sidebar/AgentSidebar';
import AgentChat from '../Chat/AgentChat';
import ProcessPanel from '../ProcessPanel/ProcessPanel';
import TopBar from '../TopBar/TopBar';
import { useNavigate } from 'react-router-dom';

const AgentsLayout = ({ selectedAgent: initialSelectedAgent, initialPrompt }) => {
  const [selectedAgent, setSelectedAgent] = useState(initialSelectedAgent);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [historicalProcesses, setHistoricalProcesses] = useState([]);
  const [processPanelOpen, setProcessPanelOpen] = useState(() => {
    const savedState = localStorage.getItem('processPanelOpen');
    return savedState !== null ? savedState === 'true' : true;
  });
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('processPanelOpen', processPanelOpen);
  }, [processPanelOpen]);

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

  // Simulated process data for demonstration
  useEffect(() => {
    if (selectedAgent) {
      // Simulate loading process data
      setCurrentProcess(null);
      
      // First, set up some historical processes
      const sampleHistoricalProcesses = [
        {
          id: 'process-history-1',
          name: 'Data Analysis',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          completed: true,
          steps: [
            { 
              id: 'step-h1-1', 
              name: 'Initialize', 
              completed: true,
              inputs: { query: "Analyze last quarter sales data" },
              outputs: { status: "Initialized successfully" }
            },
            { 
              id: 'step-h1-2', 
              name: 'Data collection', 
              completed: true,
              inputs: { source: "Sales database", timeRange: "Last quarter" },
              outputs: { recordsCollected: 1250, dataSize: "2.3MB" }
            },
            { 
              id: 'step-h1-3', 
              name: 'Analysis', 
              completed: true,
              inputs: { method: "Statistical regression", parameters: { confidence: 0.95 } },
              outputs: { trends: ["10% increase in online sales", "5% decrease in retail"], anomalies: 2 }
            },
            { 
              id: 'step-h1-4', 
              name: 'Report generation', 
              completed: true,
              inputs: { format: "PDF", includeGraphs: true },
              outputs: { reportUrl: "/reports/q2-analysis.pdf", pages: 15 }
            }
          ]
        },
        {
          id: 'process-history-2',
          name: 'Content Search',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          completed: true,
          steps: [
            { 
              id: 'step-h2-1', 
              name: 'Query parsing', 
              completed: true,
              inputs: { query: "Latest innovations in renewable energy" },
              outputs: { tokens: ["latest", "innovations", "renewable", "energy"], entities: ["renewable energy"] }
            },
            { 
              id: 'step-h2-2', 
              name: 'Database search', 
              completed: true,
              inputs: { indices: ["articles", "research_papers"], limit: 50 },
              outputs: { matchCount: 37, searchTime: "1.2s" }
            },
            { 
              id: 'step-h2-3', 
              name: 'Result compilation', 
              completed: true,
              inputs: { sortBy: "relevance", format: "summary" },
              outputs: { topResults: 10, compilationTime: "0.8s" }
            }
          ]
        },
        {
          id: 'process-history-3',
          name: 'Image Generation',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          completed: true,
          steps: [
            { 
              id: 'step-h3-1', 
              name: 'Prompt analysis', 
              completed: true,
              inputs: { prompt: "A futuristic city with flying cars and green buildings" },
              outputs: { subjects: ["city", "flying cars", "green buildings"], style: "futuristic" }
            },
            { 
              id: 'step-h3-2', 
              name: 'Style selection', 
              completed: true,
              inputs: { baseStyle: "digital art", enhanceDetails: true },
              outputs: { selectedStyles: ["digital art", "cinematic", "detailed"], resolution: "high" }
            },
            { 
              id: 'step-h3-3', 
              name: 'Image creation', 
              completed: true,
              inputs: { dimensions: "1024x1024", iterations: 50 },
              outputs: { imageUrl: "/images/generated/future-city.png", generationTime: "15s" }
            },
            { 
              id: 'step-h3-4', 
              name: 'Post-processing', 
              completed: true,
              inputs: { enhance: true, upscale: true },
              outputs: { finalUrl: "/images/generated/future-city-enhanced.png", finalResolution: "2048x2048" }
            }
          ]
        }
      ];
      
      setHistoricalProcesses(sampleHistoricalProcesses);
      
      // Then set up the current process
      const timer = setTimeout(() => {
        setCurrentProcess({
          id: 'process-current-1',
          name: 'Query Processing',
          timestamp: new Date(),
          completed: false,
          currentStep: 'Analyzing input',
          steps: [
            { 
              id: 'step-c1', 
              name: 'Initialize', 
              completed: true,
              inputs: { query: "How does photosynthesis work?" },
              outputs: { status: "Processing", sessionId: "query-12345" }
            },
            { 
              id: 'step-c2', 
              name: 'Analyzing input', 
              completed: false,
              inputs: { text: "How does photosynthesis work?", language: "English" },
              outputs: null // Currently in progress
            },
            { 
              id: 'step-c3', 
              name: 'Processing data', 
              completed: false,
              inputs: null, // Not started yet
              outputs: null
            },
            { 
              id: 'step-c4', 
              name: 'Generating response', 
              completed: false,
              inputs: null, // Not started yet
              outputs: null
            }
          ]
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedAgent]);

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setMobileOpen(!mobileOpen);
    }
  };
  
  // Handle navigation back to explore page
  const handleBackToExplore = () => {
    console.log('Navigating back to explore page');
    navigate('/agents/explore');
  };

  // Toggle process panel visibility
  const toggleProcessPanel = () => {
    setProcessPanelOpen(!processPanelOpen);
  };

  // Auto-collapse process panel when clicking on chat in mobile view
  const handleChatClick = () => {
    if (!isDesktop && processPanelOpen) {
      setProcessPanelOpen(false);
    }
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
        sidebarOpen={sidebarOpen}
      />
      
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        position: 'relative',
        height: 'calc(100vh - 64px)' // Account for TopBar height
      }}>
        {/* Agent Sidebar - always visible but can be collapsed to icons-only */}
        <AgentSidebar 
          selectedAgent={selectedAgent} 
          setSelectedAgent={setSelectedAgent} 
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onBackToExplore={handleBackToExplore}
          collapsed={isDesktop && !sidebarOpen}
          onToggleCollapse={handleToggleSidebar}
        />
        
        {/* Main content container with chat and process panel */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'row', // Always row layout for both mobile and desktop
          overflow: 'hidden',
          maxHeight: '100%',
          position: 'relative'
        }}>
          {/* Chat panel - adjust width dynamically based on process panel state */}
          <Box 
            sx={{ 
              width: isDesktop 
                ? (processPanelOpen ? 'calc(50% - 1px)' : 'calc(100% - 40px)') 
                : (processPanelOpen ? '100%' : 'calc(100% - 36px)'), // Adjust mobile width to account for collapsed panel
              height: '100%',
              display: 'flex',
              overflow: 'hidden',
              transition: 'width 0.3s ease',
              position: 'relative', // Ensure chat is always in a stable position
              zIndex: 1, // Lower z-index than process panel
            }}
          >
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              <AgentChat 
                selectedAgent={selectedAgent} 
                initialPrompt={initialPrompt}
                onClick={handleChatClick}
              />
            </Box>
          </Box>
          
          {/* Process Visualization panel - slides over on mobile, side by side on desktop */}
          <Box sx={{ 
            width: isDesktop ? (processPanelOpen ? 'calc(50% - 1px)' : '40px') : (processPanelOpen ? '80%' : '36px'),
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
            borderLeft: '1px solid',
            borderColor: 'divider',
            transition: 'width 0.3s ease, transform 0.3s ease',
            position: isDesktop ? 'relative' : 'absolute', // Make it relative on desktop, absolute on mobile
            top: 0,
            right: 0,
            transform: isDesktop ? 'none' : (processPanelOpen ? 'translateX(0)' : 'translateX(calc(100% - 36px))'),
            zIndex: 10, // Higher z-index to ensure it always appears above the chat on mobile
            backgroundColor: theme.palette.background.paper,
            boxShadow: !isDesktop && processPanelOpen ? '-4px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
          }}>
            <ProcessPanel 
              selectedAgent={selectedAgent}
              currentProcess={currentProcess}
              historicalProcesses={historicalProcesses}
              onToggleVisibility={toggleProcessPanel}
              collapsed={!processPanelOpen}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentsLayout; 
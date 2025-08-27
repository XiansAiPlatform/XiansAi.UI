import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Tabs, Tab } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Global flag to track if mermaid has been initialized
let mermaidInitialized = false;

const MermaidDiagram = ({ diagram, source }) => {
  const [activeTab, setActiveTab] = useState(0);
  const diagramRef = useRef(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || activeTab !== 0 || !diagram) return;

      try {
        // Initialize mermaid only once globally
        if (!mermaidInitialized) {
          mermaid.initialize({ 
            startOnLoad: false, // Important: set to false to prevent auto-rendering
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            // Additional config to prevent conflicts
            deterministicIds: false,
            maxTextSize: 50000
          });
          mermaidInitialized = true;
        }

        // Clear any existing content
        diagramRef.current.innerHTML = '';
        
        // Generate a unique ID for this diagram
        const diagramId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram using mermaid.render
        const { svg } = await mermaid.render(diagramId, diagram);
        
        // Insert the rendered SVG
        diagramRef.current.innerHTML = svg;
        
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        diagramRef.current.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
          <p>Error rendering diagram</p>
          <p style="font-size: 0.8em;">${error.message}</p>
        </div>`;
      }
    };

    renderDiagram();
  }, [diagram, activeTab]);

  // Cleanup effect
  useEffect(() => {
    const currentRef = diagramRef.current;
    return () => {
      // Clean up the diagram when component unmounts
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Diagram View" />
        <Tab label="Code View" />
        <Tab label="Mermaid Text" />
      </Tabs>

      {activeTab === 0 ? (
        <Box sx={{ 
          py: 4,
          px: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <div 
            ref={diagramRef} 
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          />
        </Box>
      ) : activeTab === 1 ? (
        <Box sx={{ py: 4, px: 3 }}>
          <SyntaxHighlighter
            language="mermaid"
            style={vs2015}
            customStyle={{ 
              width: '100%',
              fontSize: '0.85rem',
              padding: '1.5rem'
            }}
          >
            {source}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <Box sx={{ py: 4, px: 3 }}>
          <pre style={{ 
            width: '100%',
            fontSize: '0.85rem',
            padding: '1.5rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflow: 'auto',  // Ensures scrollbars appear if needed
            whiteSpace: 'pre-wrap',  // Ensures text wraps within the box
            wordWrap: 'break-word'  // Breaks long words to fit within the box
          }}>
            {diagram}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default MermaidDiagram; 
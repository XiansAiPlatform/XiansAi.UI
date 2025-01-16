import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Tabs, Tab } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const MermaidDiagram = ({ diagram, source }) => {
  const [activeTab, setActiveTab] = useState(0);
  const diagramRef = useRef(null);

  useEffect(() => {
    if (diagramRef.current && activeTab === 0) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [diagram, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Diagram View" />
        <Tab label="Code View" />
      </Tabs>

      {activeTab === 0 ? (
        <Box sx={{ 
          py: 4,
          px: 3,
          '& .mermaid': {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            fontSize: '0.9rem',
            '& svg': {
              maxWidth: '100%'
            }
          }
        }}>
          <div ref={diagramRef} className="mermaid">{diagram}</div>
        </Box>
      ) : (
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
      )}
    </Box>
  );
};

export default MermaidDiagram; 
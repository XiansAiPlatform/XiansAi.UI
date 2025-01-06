import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Box } from '@mui/material';

const MermaidDiagram = ({ diagram }) => {
  const diagramRef = useRef(null);

  useEffect(() => {
    if (diagramRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [diagram]);

  return (
    <Box sx={{ 
      width: '100%',
      py: 4,
      '& .mermaid': {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        '& svg': {
          maxWidth: '100%'
        }
      }
    }}>
      <div ref={diagramRef} className="mermaid">{diagram}</div>
    </Box>
  );
};

export default MermaidDiagram; 
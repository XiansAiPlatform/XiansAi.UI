import React, { useEffect } from 'react';
import MermaidDiagram from './MermaidDiagram';
import { Paper, Typography } from '@mui/material';
const WorkflowViewer = ({ workflowData }) => {
  useEffect(() => {
    console.log('Workflow Data:', workflowData);
  }, [workflowData]);

  const mermaidDiagram = `
flowchart TD
    classDef startEvent fill:#9acd32,stroke:#666,stroke-width:2px;
    classDef endEvent fill:#ff6347,stroke:#666,stroke-width:2px;
    classDef task fill:white,stroke:#4488cc,stroke-width:2px;
    classDef gateway fill:#ffd700,stroke:#666,stroke-width:2px;
    classDef subprocess fill:white,stroke:#666,stroke-width:2px;
    
    Start((●))  --> ScrapeLinks>Scrape News Links]
    ScrapeLinks --> ForEachLoop{For each link}
    
    ForEachLoop --> |Loop| ScrapeDetails>Scrape News Details]
    ScrapeDetails --> SearchCompany>Google Search Company URL]
    SearchCompany --> CheckISV{Is ISV Company?}
    
    CheckISV -->|Yes| AddCompany>Add to isvCompanies]
    CheckISV -->|No| Delay
    AddCompany --> Delay>Delay 10s]
    
    Delay --> ForEachLoop
    
    ForEachLoop -->|Done| Return>Return Results]
    Return --> End((⬤))
    
    subgraph Parameters
        Input1[sourceLink]
        Input2[prompt]
    end

    
    Input1 -.-> Start
    Input2 -.-> Start
    
    class Start startEvent
    class End endEvent
    class ForEachLoop,CheckISV gateway
    class Init,ScrapeLinks,ScrapeDetails,SearchCompany,AddCompany,Delay,Return task
    class Parameters,Config subprocess
  `;

  return (
    <Paper 
    elevation={0} 
    sx={{ 
      p: 3, 
      mb: 4, 
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: 2
    }}
  >
    <Typography variant="h4" gutterBottom>{'Flow Visualization'}</Typography>
    <div style={{ width: '100%' }}>
      <MermaidDiagram diagram={mermaidDiagram} />
    </div>
    </Paper>
  );
};

export default WorkflowViewer;
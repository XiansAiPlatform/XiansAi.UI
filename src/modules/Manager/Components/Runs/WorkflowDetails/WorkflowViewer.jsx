import React, { useState } from 'react';
import MermaidDiagram from './MermaidDiagram';
import { Paper, Typography, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './WorkflowDetails.css';

const WorkflowViewer = ({ workflowData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mermaidDiagram = `
flowchart TD
          classDef startEvent fill:#9acd32,stroke:#666,stroke-width:2px;
          classDef endEvent fill:#ff6347,stroke:#666,stroke-width:2px;
          classDef task fill:white,stroke:#4488cc,stroke-width:2px;
          classDef gateway fill:#ffd700,stroke:#666,stroke-width:2px;
          classDef loop fill:#87ceeb,stroke:#666,stroke-width:2px;
          classDef subprocess fill:white,stroke:#666,stroke-width:2px;
      
          Start(((Start Flow<br>●))) --> ScrapeNewsLinks>Scrape News Links]
          ScrapeNewsLinks --> ForEachLoop
      
          subgraph LoopProcess
              ForEachLoop((For Each<br>↻))
              ForEachLoop --> |Next Link| ScrapeNewsDetails>Scrape News Details]
              ScrapeNewsDetails --> CheckCompany{Check Company<br>Company Name Exists?}
              
              CheckCompany -->|Yes| SearchForWebsite>Search For Website]
              CheckCompany -->|No| ForEachLoop
      
              SearchForWebsite --> CheckISV{Is ISV Company?<br>Yes/No}
              
              CheckISV -->|Yes| AddCompany>Add to isvCompanies]
              CheckISV -->|No| ForEachLoop
          end
      
          LoopProcess -->|Done| Return>Return Results]
          Return --> End(((End Flow<br>⬤)))
      
          subgraph Input Parameters
              Input1[sourceLink]
          end
      
          Input1 -.-> Start
      
          class Start startEvent
          class End endEvent
          class ForEachLoop loop
          class CheckCompany,CheckISV gateway
          class ScrapeNewsLinks,ScrapeNewsDetails,SearchForWebsite,AddCompany,Return task
          class Parameters,LoopProcess subprocess
  `;

  return (
    <Paper className="paper-container">
      <div className="flow-header" onClick={() => setIsExpanded(!isExpanded)}>
        <Typography className="overview-title-small">Flow Visualization</Typography>
        <IconButton 
          className={`expand-button ${isExpanded ? 'expanded' : ''}`}
          aria-label={isExpanded ? 'collapse' : 'expand'}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </div>
      <div className={`flow-content ${isExpanded ? 'expanded' : ''}`}>
        <MermaidDiagram diagram={mermaidDiagram} />
      </div>
    </Paper>
  );
};

export default WorkflowViewer;
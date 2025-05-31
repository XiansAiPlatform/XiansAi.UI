import React from 'react';
import { TableRow, TableCell, Box, Typography, Button, Stack, Collapse, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DefinitionActivities from './DefinitionActivities';
import DefinitionParameters from './DefinitionParameters';
import { useSlider } from '../../contexts/SliderContext';
import MermaidDiagram from '../Runs/WorkflowDetails/MermaidDiagram';
import NewWorkflowForm from './NewWorkflowForm';
import { useLoading } from '../../contexts/LoadingContext';
import './Definitions.css';
import { formatDistanceToNow } from 'date-fns';

const DefinitionRow = ({ definition, isOpen, previousRowOpen, onToggle }) => {
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();

  const handleActivate = async () => {
    const formContent = (
      <NewWorkflowForm 
        definition={definition}
        onSuccess={async () => {
          setLoading(true);
          try {
            await closeSlider();
          } finally {
            setLoading(false);
          }
        }}
        onCancel={async () => {
          setLoading(true);
          try {
            await closeSlider();
          } finally {
            setLoading(false);
          }
        }}
      />
    );
    setLoading(true);
    try {
      await openSlider(formContent, `Activate '${definition.workflowType}'`);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = async () => {
    const diagramContent = (
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <MermaidDiagram diagram={definition.markdown} source={definition.source} />
      </Box>
    );
    setLoading(true);
    try {
      await openSlider(diagramContent, `Visualization of '${definition.workflowType}'`);
    } finally {
      setLoading(false);
    }
  };

  const hasMarkdown = definition.markdown && definition.markdown.trim().length > 0;

  const formatCreatedTime = (date) => {
    try {
      return `Created ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch (error) {
      return 'Created at unknown time';
    }
  };

  const formatUpdatedTime = (date) => {
    try {
      return `Updated ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch (error) {
      return 'Updated at unknown time';
    }
  };

  return (
    <>
      <TableRow 
        className={`definition-row ${isOpen ? 'expanded' : ''} ${previousRowOpen ? 'previous-expanded' : ''}`}
        onClick={() => onToggle(definition.id)}
      >
        <TableCell className="definition-content-cell">
          <div className="definition-content-wrapper">
            <Box>
              <Typography 
                className="definition-title"
              >
                {definition.workflowType}
              </Typography>
              <Typography variant="caption">
                <span className="definition-stat">
                  <span className="stat-value">{definition.activityDefinitions?.length || 0}</span> Activities
                </span>
                <span className="definition-stat">
                  <span className="stat-value">{definition.parameterDefinitions?.length || 0}</span> Inputs
                </span>
                <span className="definition-stat">
                  {formatCreatedTime(definition.createdAt)}
                </span>
                {definition.updatedAt && 
                  definition.updatedAt !== definition.createdAt && 
                  new Date(definition.updatedAt) > new Date(definition.createdAt) && (
                  <span className="definition-stat">
                    {formatUpdatedTime(definition.updatedAt)}
                  </span>
                )}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ marginRight: 2 }}>
              <Tooltip title={!hasMarkdown ? 'Flow code not available' : ''}>
                <span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisualize();
                    }}
                    className="button-base button-outlined-primary visualize-btn"
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    disabled={!hasMarkdown}
                  >
                    Visualize
                  </Button>
                </span>
              </Tooltip>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleActivate();
                }}
                className="button-base button-primary start-btn"
                size="small"
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
              >
                Activate
              </Button>
            </Stack>
          </div>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow>
          <TableCell 
            colSpan={2}
            className="definition-collapse-cell"
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <div className="definition-collapse-content">
                {definition.activityDefinitions?.length > 0 ? (
                  <DefinitionActivities 
                    activities={definition.activityDefinitions} 
                    agentName={definition.agent}
                  />
                ) : (
                  <div className="definition-section">
                    <Typography variant="h6" className="section-title">
                      Activities <span className="section-count">(0)</span>
                    </Typography>
                    <Box sx={{ padding: '8px 16px' }}>
                      <Typography color="text.secondary" variant="body2">No activities to show</Typography>
                    </Box>
                  </div>
                )}
                {definition.parameterDefinitions?.length > 0 ? (
                  <DefinitionParameters parameters={definition.parameterDefinitions} />
                ) : (
                  <div className="definition-section">
                    <Typography variant="h6" className="section-title">
                      Inputs <span className="section-count">(0)</span>
                    </Typography>
                    <Box sx={{ padding: '8px 16px' }}>
                      <Typography color="text.secondary" variant="body2">No inputs to show</Typography>
                    </Box>
                  </div>
                )}
              </div>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DefinitionRow; 
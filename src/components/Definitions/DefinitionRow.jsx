import { TableRow, TableCell, IconButton, Box, Typography, Button, Stack, Collapse, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DefinitionActivities from './DefinitionActivities';
import DefinitionParameters from './DefinitionParameters';
import { useSlider } from '../../contexts/SliderContext';
import MermaidDiagram from '../WorkflowDetails/MermaidDiagram';
import NewWorkflowForm from '../WorkflowList/NewWorkflowForm';
import { useLoading } from '../../contexts/LoadingContext';
import './Definitions.css';
import DefinitionAgents from './DefinitionAgents';
import { useAuth0 } from '@auth0/auth0-react';
import { formatDistanceToNow } from 'date-fns';

const DefinitionRow = ({ definition, isOpen, previousRowOpen, onToggle }) => {
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();
  const { user } = useAuth0();

  const formatTypeName = (typeName) => {
    return typeName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/^\w/, c => c.toUpperCase());
  };

  const handleStartNew = async () => {
    const formContent = (
      <NewWorkflowForm 
        workflowType={definition.typeName}
        parameterInfo={definition.parameters}
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
      await openSlider(formContent, `Start New ${definition.typeName}`);
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
      await openSlider(diagramContent, `${definition.typeName} Visualization`);
    } finally {
      setLoading(false);
    }
  };

  const hasMarkdown = definition.markdown && definition.markdown.trim().length > 0;

  const isCurrentUser = user?.sub === definition.owner;

  const formatCreatedTime = (date) => {
    try {
      return `Created ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch (error) {
      return 'Created at unknown time';
    }
  };

  return (
    <>
      <TableRow 
        onClick={() => onToggle(definition.id)}
        className="definition-row"
        sx={{ 
          '&:last-child td, &:last-child th': { border: 0 },
          borderTop: previousRowOpen ? '1px solid rgba(224, 224, 224, 1)' : 'none',
          borderBottom: isOpen ? '1px solid rgba(224, 224, 224, 1)' : 'inherit',
        }}
      >
        <TableCell className="definition-toggle-cell">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(definition.id);
            }}
            className={`definition-toggle-button ${isOpen ? 'open' : ''}`}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </TableCell>
        <TableCell className="definition-content-cell">
          <div className="definition-content-wrapper">
            <Box>
              <Typography 
                
                className="definition-title"
              >
                {formatTypeName(definition.typeName)}
              </Typography>
              <Typography variant="caption">
                <span className="definition-stat">
                  <span className="stat-value">{definition.activities.length}</span> Activities
                </span>
                <span className="definition-stat">
                  <span className="stat-value">{definition.parameters.length}</span> Inputs
                </span>
                <span className="definition-stat">
                  {formatCreatedTime(definition.createdAt)}
                </span>
                <span className="definition-stat">
                  Owner: <span style={{ 
                    color: isCurrentUser ? 'var(--primary)' : 'inherit',
                    fontWeight: isCurrentUser ? 600 : 'inherit'
                  }}>
                    {definition.owner || 'Unknown'} 
                    {isCurrentUser && ' (me)'}
                  </span>
                </span>
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
                    className="button-base visualize-btn"
                    size="small"
                    variant="text"
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
                  handleStartNew();
                }}
                className="button-base start-btn"
                size="small"
                variant="contained"
                startIcon={<PlayArrowIcon />}
              >
                Start New
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
                <DefinitionAgents activities={definition.activities} />
                <DefinitionActivities activities={definition.activities} />
                <DefinitionParameters parameters={definition.parameters} />
              </div>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DefinitionRow; 
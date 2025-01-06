import { TableRow, TableCell, IconButton, Box, Typography, Button, Stack, Collapse } from '@mui/material';
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

const DefinitionRow = ({ definition, isOpen, onToggle }) => {
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();

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
        <MermaidDiagram diagram={definition.markdown} />
      </Box>
    );
    setLoading(true);
    try {
      await openSlider(diagramContent, `${definition.typeName} Visualization`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TableRow 
        onClick={() => onToggle(definition.id)}
        className="definition-row"
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
                variant="subtitle1" 
                className="definition-title"
              >
                {definition.typeName}
              </Typography>
              <Typography variant="caption">
                <span className="definition-stat">
                  <span className="stat-value">{definition.activities.length}</span> Activities
                </span>
                <span className="definition-stat">
                  <span className="stat-value">{definition.parameters.length}</span> Inputs
                </span>
                <span className="definition-stat">
                  Created {new Date(definition.createdAt).toLocaleDateString()}
                </span>
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVisualize();
                }}
                className="button-base visualize-btn"
                size="small"
                variant="text"
                startIcon={<VisibilityIcon />}
              >
                Visualize
              </Button>
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
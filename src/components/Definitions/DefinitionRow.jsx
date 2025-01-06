import { TableRow, TableCell, IconButton, Box, Typography, Button, Stack, Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DefinitionActivities from './DefinitionActivities';
import DefinitionParameters from './DefinitionParameters';
import { useSlider } from '../../contexts/SliderContext';
import MermaidDiagram from '../WorkflowDetails/MermaidDiagram';

const DefinitionRow = ({ definition, isOpen, onToggle }) => {
  const { openSlider } = useSlider();

  const handleStartNew = () => {
    console.log('Start new flow:', definition.id);
  };

  const handleVisualize = () => {
    const diagramContent = (
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <MermaidDiagram diagram={definition.markdown} />
      </Box>
    );
    openSlider(diagramContent, `${definition.typeName} Visualization`);
  };

  return (
    <>
      <TableRow 
        onClick={() => onToggle(definition.id)}
        sx={{
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
          },
          transition: 'var(--transition-fast)',
          cursor: 'pointer',
        }}
      >
        <TableCell sx={{ width: '48px', borderBottom: 'none' }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(definition.id);
            }}
            sx={{
              transition: 'var(--transition-fast)',
              transform: isOpen ? 'rotate(-180deg)' : 'rotate(0)',
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--primary)',
                }}
              >
                {definition.typeName}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: 'var(--spacing-sm)',
                  mt: 'var(--spacing-xs)',
                }}
              >
                <span>Activities: {definition.activities.length}</span>
                <span>•</span>
                <span>Inputs: {definition.parameters.length}</span>
                <span>•</span>
                <span>Created: {new Date(definition.createdAt).toLocaleDateString()}</span>
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVisualize();
                }}
                className="button-base"
                size="small"
                variant="text"
                startIcon={<VisibilityIcon />}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--primary)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-lighter)',
                  }
                }}
              >
                Visualize
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartNew();
                }}
                className="button-base"
                size="small"
                variant="outlined"
                startIcon={<PlayArrowIcon />}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  transition: 'var(--transition-fast)',
                  '& .MuiButton-startIcon': {
                    color: 'var(--primary)',
                  },
                  '&:hover': {
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--primary-lighter)',
                  }
                }}
              >
                Start New
              </Button>
            </Stack>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell 
          style={{ paddingBottom: 0, paddingTop: 0 }} 
          colSpan={2}
          sx={{ borderBottom: isOpen ? 'var(--border-color)' : 'none' }}
        >
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 'var(--spacing-md)' }}>
              <DefinitionActivities activities={definition.activities} />
              <DefinitionParameters parameters={definition.parameters} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default DefinitionRow; 
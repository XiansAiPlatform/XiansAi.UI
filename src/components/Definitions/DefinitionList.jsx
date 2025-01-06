import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDefinitionsApi } from '../../services/definitions-api';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Row = ({ definition, isOpen, onToggle }) => {
  const handleStartNew = () => {
    console.log('Start new flow:', definition.id);
  };

  const handleVisualize = () => {
    console.log('Visualize flow:', definition.id);
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
              <Typography 
                variant="h6" 
                gutterBottom 
                component="div"
                sx={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)',
                }}
              >
                Activities
              </Typography>
              <Table 
                size="small" 
                sx={{ 
                  backgroundColor: 'var(--bg-overlay)',
                  borderRadius: 'var(--radius-sm)',
                  '& td, & th': { borderBottom: '1px solid var(--border-color)' },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Activity Name</TableCell>
                    <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Docker Image</TableCell>
                    <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Instructions</TableCell>
                    <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Parameters</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {definition.activities.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.activityName}</TableCell>
                      <TableCell>
                        {activity.dockerImage ? (
                          <Typography 
                            component="code" 
                            sx={{ 
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: 'var(--bg-hover)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--text-sm)',
                            }}
                          >
                            {activity.dockerImage}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            No docker
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.instructions && activity.instructions.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {activity.instructions.map((instruction, idx) => (
                              <Typography 
                                key={idx}
                                variant="body2"
                                sx={{ 
                                  backgroundColor: 'var(--primary-light)',
                                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                                  borderRadius: 'var(--radius-sm)',
                                  display: 'inline-block',
                                  width: 'fit-content'
                                }}
                              >
                                {instruction}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            No instructions
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.parameters && activity.parameters.length > 0 ? (
                          activity.parameters.map(param => param.name).join(', ')
                        ) : (
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            No parameters
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Typography 
                variant="h6" 
                gutterBottom 
                component="div" 
                sx={{ 
                  mt: 4,
                  mb: 2,
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)',
                }}
              >
                Input Parameters
              </Typography>
              <Table 
                size="small"
                sx={{ 
                  backgroundColor: 'var(--bg-overlay)',
                  borderRadius: 'var(--radius-sm)',
                  '& td, & th': { borderBottom: '1px solid var(--border-color)' },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {definition.parameters.map((param, index) => (
                    <TableRow key={index}>
                      <TableCell>{param.name}</TableCell>
                      <TableCell>
                        <Typography 
                          component="code" 
                          sx={{ 
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: 'var(--bg-hover)',
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {param.type}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const DefinitionList = () => {
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDefinitionId, setOpenDefinitionId] = useState(null);
  const definitionsApi = useDefinitionsApi();

  const handleToggle = (definitionId) => {
    setOpenDefinitionId(openDefinitionId === definitionId ? null : definitionId);
  };

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        setLoading(true);
        const data = await definitionsApi.getDefinitions();
        setDefinitions(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading definitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitions();
  }, [definitionsApi]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading definitions: {error}</Typography>
      </Box>
    );
  }

  if (!definitions.length) {
    return (
      <Box
        sx={{
          p: 'var(--spacing-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          textAlign: 'center',
          backgroundColor: 'var(--bg-paper)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          margin: 'var(--spacing-md)',
        }}
      >
        <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
          No Flow Definitions Found
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
          Flow definitions are automatically created when flows are run for the first time or when they are modified. 
          To create definitions, please run your flows through the Flow Runner.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 'var(--spacing-md)', maxWidth: '100%' }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflowX: 'auto',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableBody>
            {definitions.map((definition) => (
              <Row 
                key={definition.id} 
                definition={definition}
                isOpen={openDefinitionId === definition.id}
                onToggle={handleToggle}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DefinitionList;
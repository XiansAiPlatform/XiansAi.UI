import React from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { useSlider } from '../../contexts/SliderContext';
import { useInstructionsApi } from '../../services/instructions-api';
import InstructionViewer from '../Instructions/InstructionViewer';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

const DefinitionActivities = ({ activities }) => {
  const { openSlider } = useSlider();
  const instructionsApi = useInstructionsApi();
  const [viewMode, setViewMode] = React.useState('card');

  const formatText = (text) => {
    return text.replace(/([A-Z])/g, ' $1').trim();
  };

  const handleInstructionClick = async (instructionName) => {
    try {
      const instruction = await instructionsApi.getInstructionByName(instructionName);
      showInstruction(instruction);
    } catch (error) {
      console.error('Error fetching instruction by name:', error);
    }
  };

  const showInstruction = (instruction) => {
    const instructionsContent = (
      <InstructionViewer
        instruction={instruction}
        hideActions={true}
      />
    );
    openSlider(instructionsContent, instruction.name);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const renderTableView = () => (
    <Table size="small" sx={{ backgroundColor: 'var(--background-paper)' }}>
      {activities?.length > 0 && (
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--text-primary)', 
              padding: 'var(--spacing-sm)',
              borderBottom: '2px solid var(--primary-dark)'
            }}>
              Action
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--text-primary)', 
              padding: 'var(--spacing-sm)',
              borderBottom: '2px solid var(--primary-dark)'
            }}>
              Tools
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--text-primary)', 
              padding: 'var(--spacing-sm)',
              borderBottom: '2px solid var(--primary-dark)'
            }}>
              Knowledge
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--text-primary)', 
              padding: 'var(--spacing-sm)',
              borderBottom: '2px solid var(--primary-dark)'
            }}>
              Parameters
            </TableCell>
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {activities?.map((activity, index) => (
          <TableRow key={index}>
            <TableCell>{formatText(activity.activityName)}</TableCell>
            <TableCell>
              {activity.agentToolNames?.length > 0 ? (
                activity.agentToolNames.map((agentTool, idx) => {
                  const [name, type] = agentTool.split(' [');
                  return (
                    <Box key={idx} sx={{ mb: 1 }}>
                      <Chip
                        label={name}
                        size="small"
                        sx={{
                          backgroundColor: 'var(--primary-light)',
                          mb: 0.5
                        }}
                      />
                      {type && (
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                          Type: {type.replace(']', '')}
                        </Typography>
                      )}
                    </Box>
                  )
                })
              ) : (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  No tools
                </Typography>
              )}
            </TableCell>
            <TableCell>
              {activity.knowledgeIds?.length > 0 ? (
                activity.knowledgeIds.map((instruction, idx) => (
                  <Chip
                    key={idx}
                    label={instruction}
                    onClick={() => handleInstructionClick(instruction)}
                    sx={{
                      m: 0.5,
                      backgroundColor: 'var(--primary-light)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'transform 0.2s, background-color 0.2s'
                    }}
                  />
                ))
              ) : (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  No knowledge
                </Typography>
              )}
            </TableCell>
            <TableCell>
              {activity.parameterDefinitions?.length > 0 ? (
                activity.parameterDefinitions.map((param, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                      {param.name}: {param.type}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  No parameters
                </Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCardView = () => (
    <Grid container spacing={2}>
      {activities?.map((activity, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ 
            height: '100%',
            backgroundColor: 'var(--background-paper)',
            border: '1px solid var(--border-color)',
            '&:hover': {
              boxShadow: 3
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {formatText(activity.activityName)}
              </Typography>

              {activity.parameterDefinitions?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Parameters:</Typography>
                  {activity.parameterDefinitions.map((param, idx) => (
                    <Typography key={idx} variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                      {param.name}: {param.type}
                    </Typography>
                  ))}
                </Box>
              )}

              <Typography variant="subtitle2" gutterBottom>Tools:</Typography>
              <Box sx={{ mb: 2 }}>
                {activity.agentToolNames?.length > 0 ? (
                  activity.agentToolNames.map((agentTool, idx) => {
                    const [name, type] = agentTool.split(' [');
                    return (
                      <Box key={idx} sx={{ mb: 1 }}>
                        <Chip
                          label={name}
                          size="small"
                          sx={{
                            backgroundColor: 'var(--primary-light)',
                            mb: 0.5
                          }}
                        />
                        {type && (
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                            Type: {type.replace(']', '')}
                          </Typography>
                        )}
                      </Box>
                    )
                  })
                ) : (
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    No tools
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" gutterBottom>Knowledge:</Typography>
              <Box>
                {activity.knowledgeIds?.length > 0 ? (
                  activity.knowledgeIds.map((instruction, idx) => (
                    <Chip
                      key={idx}
                      label={instruction}
                      onClick={() => handleInstructionClick(instruction)}
                      sx={{
                        m: 0.5,
                        backgroundColor: 'var(--primary-light)',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'var(--primary-dark)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'transform 0.2s, background-color 0.2s'
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    No knowledge
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div className="definition-section">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6" className="section-title">
          Agent Activities <span className="section-count">({activities?.length || 0})</span>
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="card" aria-label="card view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {activities?.length > 0 ? (
        viewMode === 'card' ? renderCardView() : renderTableView()
      ) : (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>
          No activities defined
        </Typography>
      )}
    </div>
  );
};

export default DefinitionActivities; 
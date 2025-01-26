import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';
import { tableStyles } from './styles';
import { useSlider } from '../../contexts/SliderContext';
import { useInstructionsApi } from '../../services/instructions-api';
import InstructionViewer from '../Instructions/InstructionViewer';

const DefinitionActivities = ({ activities }) => {
  const { openSlider } = useSlider();
  const instructionsApi = useInstructionsApi();

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

  return (
    <div className="definition-section">
      <Typography variant="h6" className="section-title">
        Flow Activities <span className="section-count">({activities.length})</span>
      </Typography>
      <Table size="small" sx={tableStyles.nestedTable}>
        {activities.length > 0 && (
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--text-primary)', 
                padding: 'var(--spacing-sm)',
                borderBottom: '2px solid var(--primary-dark)'
              }}>
                Activity Name
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--text-primary)', 
                padding: 'var(--spacing-sm)',
                borderBottom: '2px solid var(--primary-dark)'
              }}>
                Agents
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 'bold', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--text-primary)', 
                padding: 'var(--spacing-sm)',
                borderBottom: '2px solid var(--primary-dark)'
              }}>
                Instructions
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {activities.map((activity, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body1" >
                  {activity.activityName}
                </Typography>
                {activity.parameters?.length > 0 && (
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', marginLeft: 'var(--spacing-sm)' }}>
                    -- Parameters: {activity.parameters.map(param => param.name).join(', ')}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {activity.agentNames?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    {activity.agentNames.map((agent, idx) => {
                      const [name, type] = agent.split(' [');
                      return (
                        <Box key={idx}>
                          <Typography 
                            component="code" 
                            variant="caption"
                            sx={{ 
                              backgroundColor: 'var(--primary-light)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-block',
                              width: 'fit-content'
                            }}
                          >
                            {name}
                          </Typography>
                          {type && (
                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', marginLeft: 'var(--spacing-sm)' }}>
                              type: {type.replace(']', '')}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    No agents
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {activity.instructions?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    {activity.instructions.map((instruction, idx) => (
                      <Typography 
                        key={idx}
                        variant="caption"
                        sx={{ 
                          backgroundColor: 'var(--primary-light)',
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-block',
                          width: 'fit-content',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, background-color 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            backgroundColor: 'var(--primary-dark)',
                          }
                        }}
                        onClick={() => handleInstructionClick(instruction)}
                      >
                        {instruction}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    No instructions
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DefinitionActivities; 
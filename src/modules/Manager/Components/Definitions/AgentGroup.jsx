import { keyframes } from '@emotion/react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, Chip, Stack, Button } from '@mui/material';
import { ReactComponent as AgentSvgIcon } from '../../theme/agent.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DefinitionRow from './DefinitionRow';
import { formatAgentName, formatLastUpdated, isRecentlyUpdated } from './definitionUtils';
import { tableStyles } from './styles';

// Define a keyframe animation for the pulsing effect
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--success-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0);
  }
`;

const AgentGroup = ({ 
  agentName, 
  definitions, 
  latestUpdateDate, 
  openDefinitionId, 
  onToggle, 
  isOwnerOfAllWorkflows,
  onDeleteAllClick,
  onShareClick
}) => {
  return (
    <Box 
      sx={{ 
        mb: 4,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: agentName !== 'Ungrouped' && 'none',
        border: agentName !== 'Ungrouped' ? isRecentlyUpdated(latestUpdateDate) 
          ? '1px solid var(--border-color)'
          : '1px solid var(--border-color)' 
          : 'none',
        transition: 'var(--transition-fast)',
        ...(agentName !== 'Ungrouped' && {
          '&:hover': {
            boxShadow: 'var(--shadow-sm)',
            borderColor: 'var(--border-color-hover)'
          }
        })
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          p: 2,
          gap: 2,
          backgroundColor: agentName !== 'Ungrouped' 
            ? isRecentlyUpdated(latestUpdateDate)
              ? 'var(--success-ultralight)'
              : 'var(--bg-subtle)'
            : 'transparent',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          mb: 0,
          position: 'relative',
          '&:after': agentName !== 'Ungrouped' ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'var(--border-light)'
          } : {}
        }}
      >
        <Stack 
          direction="row" 
          spacing={1.5} 
          alignItems="center"
          sx={{ flex: 1 }}
        >
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {agentName !== 'Ungrouped' && (
              <Box sx={{ 
                mr: 2, 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: isRecentlyUpdated(latestUpdateDate) ? 'white' : 'white',
                borderRadius: '50%',
                p: '5px',
                boxShadow: isRecentlyUpdated(latestUpdateDate) 
                  ? '0 0 0 1px var(--success)' 
                  : '0 0 0 1px var(--border-light)',
                ...(isRecentlyUpdated(latestUpdateDate) && {
                  animation: `${pulse} 2s infinite`,
                })
              }}>
                <AgentSvgIcon style={{ 
                  width: '32px', 
                  height: '32px', 
                  opacity: isRecentlyUpdated(latestUpdateDate) ? 1 : 0.85 
                }} />
              </Box>
            )}
            {formatAgentName(agentName)}
          </Typography>
          
          <Chip 
            label={`${definitions.length} flow${definitions.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ 
              fontWeight: 500,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              height: '22px',
              fontSize: '0.75rem',
              borderRadius: '10px',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          
          {agentName !== 'Ungrouped' && isRecentlyUpdated(latestUpdateDate) && (
            <Chip
              label="New"
              size="small"
              color="success"
              sx={{ 
                height: '22px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                borderRadius: '10px',
                background: 'linear-gradient(45deg, var(--success) 0%, var(--success-light) 100%)',
                color: 'white',
                '& .MuiChip-label': {
                  px: 1
                },
                animation: `${pulse} 2s infinite`
              }}
            />
          )}
        </Stack>
        
        {agentName !== 'Ungrouped' && (
          <>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.75rem'
              }}
            >
              {formatLastUpdated(latestUpdateDate)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareClick();
                }}
                disabled={!isOwnerOfAllWorkflows}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  height: '28px',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    borderColor: 'var(--border-color-hover)',
                    backgroundColor: 'var(--bg-hover)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    color: 'text.disabled',
                    borderColor: 'var(--border-color)'
                  }
                }}
              >
                Share
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAllClick();
                }}
                disabled={!isOwnerOfAllWorkflows}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  height: '28px',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    borderColor: 'var(--border-color-hover)',
                    backgroundColor: 'var(--bg-hover)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    color: 'text.disabled',
                    borderColor: 'var(--border-color)'
                  }
                }}
              >
                Delete Agent
              </Button>
            </Stack>
          </>
        )}
      </Box>
      
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{
          ...tableStyles.tableContainer,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderTop: 'none',
          backgroundColor: 'white',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableBody>
            {definitions.map((definition, index) => (
              <DefinitionRow 
                key={definition.id} 
                definition={definition}
                isOpen={openDefinitionId === definition.id}
                previousRowOpen={index > 0 && openDefinitionId === definitions[index - 1].id}
                onToggle={onToggle}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AgentGroup; 
import { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, ToggleButton, ToggleButtonGroup, TextField, Chip, Stack } from '@mui/material';
import { useDefinitionsApi } from '../../services/definitions-api';
import { useLoading } from '../../contexts/LoadingContext';
import DefinitionRow from './DefinitionRow';
import EmptyState from './EmptyState';
import { tableStyles } from './styles';
import { useAuth0 } from '@auth0/auth0-react';
import { formatDistanceToNow } from 'date-fns';

const DefinitionList = () => {
  const [definitions, setDefinitions] = useState([]);
  const [filter, setFilter] = useState('mine');
  const { user } = useAuth0();
  const [error, setError] = useState(null);
  const [openDefinitionId, setOpenDefinitionId] = useState(null);
  const definitionsApi = useDefinitionsApi();
  const { setLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const handleToggle = (definitionId) => {
    setOpenDefinitionId(openDefinitionId === definitionId ? null : definitionId);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTimeFilterChange = (event, newTimeFilter) => {
    if (newTimeFilter !== null) {
      setTimeFilter(newTimeFilter);
    }
  };

  const filteredDefinitions = definitions
    .filter(def => {
      const matchesFilter = filter === 'all' || (filter === 'mine' && def.owner === user?.sub);
      const searchLower = searchQuery.toLowerCase();
      const nameLower = def.typeName?.toLowerCase() || '';
      const agentNameLower = def.agentName?.toLowerCase() || '';
      const matchesSearch = searchQuery === '' || 
                           nameLower.includes(searchLower) || 
                           agentNameLower.includes(searchLower);
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Group definitions by agent name
  const groupDefinitionsByAgent = (definitions) => {
    const grouped = {};
    const latestFlowByAgent = {};
    
    definitions.forEach(def => {
      const agentName = def.agentName || 'Ungrouped';
      if (!grouped[agentName]) {
        grouped[agentName] = [];
        latestFlowByAgent[agentName] = new Date(0);
      }
      grouped[agentName].push(def);
      
      // Track the most recent flow creation/update date for each agent
      const flowDate = new Date(def.createdAt);
      if (flowDate > latestFlowByAgent[agentName]) {
        latestFlowByAgent[agentName] = flowDate;
      }
    });
    
    // Sort agent names by their most recent flow date (descending)
    const sortedAgentNames = Object.keys(grouped).sort((a, b) => {
      // Special case for 'Ungrouped' - always keep at the end
      if (a === 'Ungrouped') return 1;
      if (b === 'Ungrouped') return -1;
      
      // Sort by most recent flow date (newest first)
      return latestFlowByAgent[b] - latestFlowByAgent[a];
    });
    
    return { grouped, sortedAgentNames, latestFlowByAgent };
  };

  const { grouped, sortedAgentNames, latestFlowByAgent } = groupDefinitionsByAgent(filteredDefinitions);

  const formatLastUpdated = (date) => {
    try {
      return `Updated ${formatDistanceToNow(date, { addSuffix: false })} ago`;
    } catch (error) {
      return '';
    }
  };

  const isRecentlyUpdated = (date) => {
    try {
      const now = new Date();
      const lastUpdated = new Date(date);
      const diffInHours = Math.floor((now - lastUpdated) / (1000 * 60 * 60));
      return diffInHours < 24;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        setLoading(true);
        const data = await definitionsApi.getDefinitions(timeFilter, filter);
        setDefinitions(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading definitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitions();
  }, [definitionsApi, setLoading, timeFilter, filter]);

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading definitions: {error}</Typography>
      </Box>
    );
  }

  if (!definitions.length) {
    return <EmptyState 
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      timeFilter={timeFilter}
      onTimeFilterChange={handleTimeFilterChange}
      filter={filter}
      onFilterChange={handleFilterChange}
    />;
  }

  return (
    <Box sx={tableStyles.container}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'var(--text-primary)',
          }}
        >
          Agent Definitions
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <TextField
            size="small"
            placeholder="Search by name or agent..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: { xs: '100%', sm: '250px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-md)',
              }
            }}
          />
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <ToggleButtonGroup
              value={timeFilter}
              exclusive
              onChange={handleTimeFilterChange}
              size="small"
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                '& .MuiToggleButton-root': {
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    backgroundColor: 'var(--bg-selected)',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }
                }
              }}
            >
              <ToggleButton value="7days">Last 7 Days</ToggleButton>
              <ToggleButton value="30days">Last 30 Days</ToggleButton>
              <ToggleButton value="all">All Time</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              size="small"
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                '& .MuiToggleButton-root': {
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    backgroundColor: 'var(--bg-selected)',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }
                }
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="mine">Mine</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Box>

      {sortedAgentNames.map((agentName, groupIndex) => (
        <Box 
          key={agentName} 
          sx={{ 
            mb: 4,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: groupIndex < sortedAgentNames.length - 1 && agentName !== 'Ungrouped' && isRecentlyUpdated(latestFlowByAgent[agentName]) 
              ? '0 0 0 1px var(--success-light)'
              : 'none'
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
                ? isRecentlyUpdated(latestFlowByAgent[agentName]) 
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
                left: 16,
                right: 16,
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
                  fontSize: '1.1rem'
                }}
              >
                {agentName}
              </Typography>
              
              <Chip 
                label={`${grouped[agentName].length} flow${grouped[agentName].length !== 1 ? 's' : ''}`}
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
              
              {agentName !== 'Ungrouped' && isRecentlyUpdated(latestFlowByAgent[agentName]) && (
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
                    }
                  }}
                />
              )}
            </Stack>
            
            {agentName !== 'Ungrouped' && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem'
                }}
              >
                {formatLastUpdated(latestFlowByAgent[agentName])}
              </Typography>
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
                {grouped[agentName].map((definition, index) => (
                  <DefinitionRow 
                    key={definition.id} 
                    definition={definition}
                    isOpen={openDefinitionId === definition.id}
                    previousRowOpen={index > 0 && openDefinitionId === grouped[agentName][index - 1].id}
                    onToggle={handleToggle}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

export default DefinitionList;
import { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, ToggleButton, ToggleButtonGroup, TextField, Divider } from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by name or agent..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: '250px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-md)',
              }
            }}
          />
          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={handleTimeFilterChange}
            size="small"
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
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="mine">Mine</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {sortedAgentNames.map((agentName, groupIndex) => (
        <Box key={agentName} sx={{ mb: 4 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              pb: 1,
              borderBottom: groupIndex > 0 ? '1px solid var(--border-light)' : 'none'
            }}
          >
            <Typography 
              variant="h6" 
              component="h2"
              sx={{ 
                fontWeight: 600,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {agentName === 'Ungrouped' ? (
                <>
                  {agentName} <span style={{ fontWeight: 400, fontSize: '0.9em', color: 'var(--text-secondary)' }}>({grouped[agentName].length})</span>
                </>
              ) : (
                <>
                  {agentName} 
                  <span style={{ fontWeight: 400, fontSize: '0.9em', color: 'var(--text-secondary)' }}>({grouped[agentName].length})</span>
                  {isRecentlyUpdated(latestFlowByAgent[agentName]) && (
                    <span style={{ 
                      marginLeft: '8px', 
                      backgroundColor: 'var(--success-light)', 
                      color: 'var(--success)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.7em',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      New
                    </span>
                  )}
                </>
              )}
            </Typography>
            {agentName !== 'Ungrouped' && (
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 2,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  '&:before': {
                    content: '""',
                    display: 'inline-block',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-secondary)',
                    marginRight: '8px'
                  }
                }}
              >
                {formatLastUpdated(latestFlowByAgent[agentName])}
              </Typography>
            )}
          </Box>
          <TableContainer component={Paper} sx={tableStyles.tableContainer}>
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
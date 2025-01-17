import { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material';
import { useDefinitionsApi } from '../../services/definitions-api';
import { useLoading } from '../../contexts/LoadingContext';
import DefinitionRow from './DefinitionRow';
import EmptyState from './EmptyState';
import { tableStyles } from './styles';
import { useAuth0 } from '@auth0/auth0-react';

const DefinitionList = () => {
  const [definitions, setDefinitions] = useState([]);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth0();
  const [error, setError] = useState(null);
  const [openDefinitionId, setOpenDefinitionId] = useState(null);
  const definitionsApi = useDefinitionsApi();
  const { setLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredDefinitions = definitions
    .filter(def => {
      const matchesFilter = filter === 'all' || (filter === 'mine' && def.owner === user?.sub);
      const searchLower = searchQuery.toLowerCase();
      const nameLower = def.typeName?.toLowerCase() || '';
      const matchesSearch = searchQuery === '' || nameLower.includes(searchLower);
      
      console.log({
        name: def.name,
        searchQuery,
        nameLower,
        searchLower,
        matchesSearch
      });
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
  }, [definitionsApi, setLoading]);

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading definitions: {error}</Typography>
      </Box>
    );
  }

  if (!definitions.length) {
    return <EmptyState />;
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
          Flow Definitions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search definitions..."
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
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            <ToggleButton value="all">All Definitions</ToggleButton>
            <ToggleButton value="mine">My Definitions</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        <Table sx={{ minWidth: 650 }}>
          <TableBody>
            {filteredDefinitions.map((definition, index) => (
              <DefinitionRow 
                key={definition.id} 
                definition={definition}
                isOpen={openDefinitionId === definition.id}
                previousRowOpen={index > 0 && openDefinitionId === filteredDefinitions[index - 1].id}
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
import { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
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

  const handleToggle = (definitionId) => {
    setOpenDefinitionId(openDefinitionId === definitionId ? null : definitionId);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredDefinitions = definitions.filter(def => 
    filter === 'all' || (filter === 'mine' && def.owner === user?.sub)
  );

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
      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        <Table sx={{ minWidth: 650 }}>
          <TableBody>
            {filteredDefinitions.map((definition) => (
              <DefinitionRow 
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
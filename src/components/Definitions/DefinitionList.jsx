import { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableContainer, Paper, Typography } from '@mui/material';
import { useDefinitionsApi } from '../../services/definitions-api';
import { useLoading } from '../../contexts/LoadingContext';
import DefinitionRow from './DefinitionRow';
import EmptyState from './EmptyState';
import { tableStyles } from './styles';

const DefinitionList = () => {
  const [definitions, setDefinitions] = useState([]);
  const [error, setError] = useState(null);
  const [openDefinitionId, setOpenDefinitionId] = useState(null);
  const definitionsApi = useDefinitionsApi();
  const { setLoading } = useLoading();

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
      <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: 'var(--letter-spacing-tight)',
              color: 'var(--text-primary)',
              mb: 4
            }}
          >
            Flow Definitions
      </Typography>
      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        <Table sx={{ minWidth: 650 }}>
          <TableBody>
            {definitions.map((definition) => (
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
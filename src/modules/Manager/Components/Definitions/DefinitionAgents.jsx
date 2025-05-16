import { Typography, Table, TableBody, TableRow, TableCell } from '@mui/material';

const DefinitionAgents = ({ activities }) => {
  // Extract unique Docker images from activities
  const uniqueAgents = [...new Set(activities
    .filter(activity => activity.dockerImage)
    .map(activity => activity.dockerImage)
  )];

  if (!uniqueAgents.length) return null;

  return (
    <div className="definition-section">
      <Typography variant="h6" className="section-title">
        Agents In Use <span className="section-count">({uniqueAgents.length})</span>
      </Typography>
      <Table size="small">
        <TableBody>
          {uniqueAgents.map((agent, index) => (
            <TableRow key={index}>
              <TableCell 
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  border: 'none',
                  padding: '8px 16px'
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    backgroundColor: 'var(--primary-light)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'inline-block',
                    width: 'fit-content',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                >
                  {agent}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DefinitionAgents; 
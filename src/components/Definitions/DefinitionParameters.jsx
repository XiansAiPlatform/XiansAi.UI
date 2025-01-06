import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { tableStyles } from './styles';

const DefinitionParameters = ({ parameters }) => (
  <>
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
    <Table size="small" sx={tableStyles.nestedTable}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Name</TableCell>
          <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Type</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {parameters.map((param, index) => (
          <TableRow key={index}>
            <TableCell>{param.name}</TableCell>
            <TableCell>
              <Typography component="code" sx={tableStyles.codeBlock}>
                {param.type}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
);

export default DefinitionParameters; 
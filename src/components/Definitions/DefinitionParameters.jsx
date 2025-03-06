import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { tableStyles } from './styles';

const DefinitionParameters = ({ parameters }) => (
  <div className="definition-section">
    <Typography variant="h6" className="section-title">
      Agent Inputs <span className="section-count">({parameters.length})</span>
    </Typography>
    <Table size="small" sx={tableStyles.nestedTable}>
      {parameters.length > 0 && (
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Type</TableCell>
          </TableRow>
        </TableHead>
      )}
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
  </div>
);

export default DefinitionParameters; 
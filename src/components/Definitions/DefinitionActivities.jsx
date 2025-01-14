import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';
import { tableStyles } from './styles';

const DefinitionActivities = ({ activities }) => (
  <div className="definition-section">
    <Typography variant="h6" className="section-title">
      Flow Activities <span className="section-count">({activities.length})</span>
    </Typography>
    <Table size="small" sx={tableStyles.nestedTable}>
      {activities.length > 0 && (
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Activity Name</TableCell>
            <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Agent</TableCell>
            <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Instructions</TableCell>
            <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Parameters</TableCell>
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {activities.map((activity, index) => (
          <TableRow key={index}>
            <TableCell>{activity.activityName}</TableCell>
            <TableCell>
              {activity.dockerImage ? (
                <Typography component="code" variant="body2"
                sx={{ 
                  backgroundColor: 'var(--primary-light)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  {activity.dockerImage}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  No docker
                </Typography>
              )}
            </TableCell>
            <TableCell>
              {activity.instructions?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  {activity.instructions.map((instruction, idx) => (
                    <Typography 
                      key={idx}
                      variant="body2"
                      sx={{ 
                        backgroundColor: 'var(--primary-light)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-block',
                        width: 'fit-content'
                      }}
                    >
                      {instruction}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  No instructions
                </Typography>
              )}
            </TableCell>
            <TableCell>
              {activity.parameters?.length > 0 ? (
                activity.parameters.map(param => param.name).join(', ')
              ) : (
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  No parameters
                </Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default DefinitionActivities; 
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';
import { tableStyles } from './styles';

const DefinitionActivities = ({ activities }) => (
  <>
    <Typography 
      variant="h6" 
      gutterBottom 
      component="div"
      sx={{ 
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--text-primary)',
      }}
    >
      Activities
    </Typography>
    <Table size="small" sx={tableStyles.nestedTable}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Activity Name</TableCell>
          <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Docker Image</TableCell>
          <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Instructions</TableCell>
          <TableCell sx={{ fontWeight: 'var(--font-weight-medium)' }}>Parameters</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {activities.map((activity, index) => (
          <TableRow key={index}>
            <TableCell>{activity.activityName}</TableCell>
            <TableCell>
              {activity.dockerImage ? (
                <Typography component="code" sx={tableStyles.codeBlock}>
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
  </>
);

export default DefinitionActivities; 
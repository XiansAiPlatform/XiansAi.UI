import { useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

const DefinitionActivities = ({ activities, agentName }) => {
  const [viewMode, setViewMode] = useState('card');

  const formatText = (text) => {
    return text.replace(/([A-Z])/g, ' $1').trim();
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const renderTableView = () => (
    <Table size="small" sx={{ backgroundColor: 'var(--background-paper)' }}>
      {activities?.length > 0 && (
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--text-primary)', 
              padding: 'var(--spacing-sm)',
              borderBottom: '2px solid var(--primary-dark)'
            }}>
              Activity
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--text-primary)', 
              padding: 'var(--spacing-sm)',
              borderBottom: '2px solid var(--primary-dark)'
            }}>
              Parameters
            </TableCell>
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {activities?.map((activity, index) => (
          <TableRow key={index}>
            <TableCell>{formatText(activity.activityName)}</TableCell>
            
            <TableCell>
              {activity.parameterDefinitions?.length > 0 ? (
                activity.parameterDefinitions.map((param, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                      {param.name}: {param.type}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  No parameters
                </Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCardView = () => (
    <Grid container spacing={2}>
      {activities?.map((activity, index) => (
        <Grid
          key={index}
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <Card sx={{ 
            height: '100%',
            backgroundColor: 'var(--background-paper)',
            border: '1px solid var(--border-color)',
            '&:hover': {
              boxShadow: 3
            }
          }}>
            <CardContent>
              <Typography variant="h7" gutterBottom>
                {formatText(activity.activityName)}
              </Typography>

              {activity.parameterDefinitions?.length > 0 && (
                <Box sx={{ mt: 3, mb: 0 }}>
                  <Typography variant="subtitle2">Parameters:</Typography>
                  {activity.parameterDefinitions.map((param, idx) => (
                    <Typography key={idx} variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                      {param.name}: {param.type}
                    </Typography>
                  ))}
                </Box>
              )}

            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div className="definition-section">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6" className="section-title">
          Activities <span className="section-count">({activities?.length || 0})</span>
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="card" aria-label="card view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {activities?.length > 0 ? (
        viewMode === 'card' ? renderCardView() : renderTableView()
      ) : (
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>
          No activities defined
        </Typography>
      )}
    </div>
  );
};

export default DefinitionActivities; 
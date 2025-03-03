import React from 'react';
import { Box, Typography } from '@mui/material';
import JsonViewer from '../JsonViewer/JsonViewer';

const ActivityDetailsView = ({ activityDetails }) => (
  <Box>
    {activityDetails.result && (
      <>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Output:
        </Typography>
        <JsonViewer data={activityDetails.result} initialDepth={2} />
      </>
    )}
    
    {activityDetails.inputs && (
      <>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Inputs:
        </Typography>
        <JsonViewer data={activityDetails.inputs} initialDepth={2} />
      </>
    )}
  </Box>
);

export default ActivityDetailsView;

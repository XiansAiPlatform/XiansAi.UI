import React from 'react';
import { Box, Typography } from '@mui/material';
import JsonViewer from '../JsonViewer/JsonViewer';

const ActivityDetailsView = ({ activityDetails }) => (
  <Box>
    <Typography variant="h6" sx={{ mt: 3 }}>
      Inputs:
    </Typography>
    <JsonViewer data={activityDetails.inputs} initialDepth={2} />

    <Typography variant="h6" sx={{ mt: 3 }}>
      Result:
    </Typography>
    <JsonViewer data={activityDetails.result} initialDepth={2} />
  </Box>
);

export default ActivityDetailsView;

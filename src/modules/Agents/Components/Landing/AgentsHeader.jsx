import React from 'react';
import { Typography } from '@mui/material';
import { headerStyles } from './styles';

const AgentsHeader = () => {
  return (
    <>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={headerStyles.title}
      >
        Agent Squad
      </Typography>

      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph
        sx={headerStyles.subtitle}
      >
        Explore these prompt suggestions or start a custom conversation.
      </Typography>
    </>
  );
};

export default AgentsHeader; 
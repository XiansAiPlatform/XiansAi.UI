import React from 'react';
import { Typography, Box } from '@mui/material';
import { headerStyles } from './styles';

const AgentsHeader = () => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          component="img"
          src="/images/temp/logo.png"
          alt="Agent Icon"
          sx={{
            width: 40,
            height: 40,
            mr: 2,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            ...headerStyles.title,
            mb: 0,  // Remove bottom margin to improve vertical alignment
          }}
        >
          Agent Squad
        </Typography>
      </Box>

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
import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import CACertificates from './CACertificates';

const Settings = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <CACertificates />
      </Box>
    </Container>
  );
};

export default Settings; 
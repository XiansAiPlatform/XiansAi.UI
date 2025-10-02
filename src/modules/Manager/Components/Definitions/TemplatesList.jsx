import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LibraryBooks as TemplatesIcon } from '@mui/icons-material';
import PageLayout from '../Common/PageLayout';

const TemplatesList = () => {
  return (
    <PageLayout
      title="Agent Templates"
      subtitle="Manage and organize your agent templates"
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            backgroundColor: 'grey.50',
            borderRadius: 2,
            maxWidth: 500,
            width: '100%'
          }}
        >
          <TemplatesIcon 
            sx={{ 
              fontSize: 64, 
              color: 'grey.400', 
              mb: 2 
            }} 
          />
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              color: 'grey.700',
              fontWeight: 500
            }}
          >
            Templates Coming Soon
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'grey.600',
              lineHeight: 1.6
            }}
          >
            This section will allow you to create, manage, and deploy agent templates. 
            Templates will help you quickly set up new agents with predefined configurations 
            and workflows.
          </Typography>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default TemplatesList;

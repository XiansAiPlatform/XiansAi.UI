import { Box, Typography, Container } from '@mui/material';

const PageLayout = ({ 
  title, 
  headerActions, 
  children, 
  maxWidth = 'lg',
  disableGutters = false,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      disableGutters={disableGutters}
      className={className}
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 }
      }}
    >
      {/* Page Header */}
      <Box 
        className={`page-header ${headerClassName}`}
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: { xs: 3, md: 4 },
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            fontSize: { xs: '1.75rem', md: '2.125rem' },
            fontFamily: 'var(--font-family)'
          }}
        >
          {title}
        </Typography>
        
        {headerActions && (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {headerActions}
          </Box>
        )}
      </Box>

      {/* Page Content */}
      <Box className={`page-content ${contentClassName}`}>
        {children}
      </Box>
    </Container>
  );
};

export default PageLayout;

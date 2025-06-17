import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

/**
 * Ultimate flexible loader for any content area - pages, sections, cards, etc.
 * Can also be used inline or with minimal styling.
 * 
 * @param {string} size - Size variant: 'small' (16px), 'medium' (24px), 'large' (32px), 'xlarge' (40px)
 * @param {string} message - Optional message to display below the loader
 * @param {string} direction - Layout direction: 'column' (default) or 'row'
 * @param {boolean} inline - If true, renders just the spinner without container
 * @param {object} sx - MUI sx prop for the container Box (default styling applied first)
 * @param {object} containerProps - Additional props for the container Box
 * @param {object} props - Additional props passed to CircularProgress
 */
export const ContentLoader = ({ 
  size = 'large', 
  message,
  direction = 'column',
  inline = false,
  sx = {},
  containerProps = {},
  ...props 
}) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 40
  };

  const loaderSize = sizeMap[size] ?? sizeMap.large;

  // If inline, just return the spinner
  if (inline) {
    return <CircularProgress size={loaderSize} {...props} />;
  }

  // Default styling - kept pure, not mutated
  const defaultSx = {
    display: 'flex',
    flexDirection: message ? "column" : direction,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    p: 4
  };

  return (
    <Box sx={{ ...defaultSx, ...sx }} {...containerProps}>
      <CircularProgress size={loaderSize} {...props} />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Standardized loader for buttons and form actions
 * Optimized for button startIcon and endIcon usage
 * 
 * @param {string} size - Size variant: 'small' (16px), 'medium' (20px)
 * @param {object} props - Additional props passed to CircularProgress
 */
export const ButtonLoader = ({ size = 'small', ...props }) => {
  const sizeMap = {
    small: 16,
    medium: 20
  };

  const loaderSize = sizeMap[size] ?? sizeMap.small;

  return <CircularProgress size={loaderSize} {...props} />;
};

/**
 * Standardized loader for table and list loading states
 * Provides appropriate spacing and sizing for data tables
 * 
 * @param {number} rows - Number of skeleton rows to suggest (visual only)
 * @param {object} props - Additional props passed to CircularProgress
 */
export const TableLoader = ({ rows = 3, ...props }) => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    p={3}
    minHeight={`${rows * 60}px`} // Approximate row height
  >
    <CircularProgress size={32} {...props} />
  </Box>
);

/**
 * Standardized inline loader for dropdowns, inputs, and small UI elements
 * Minimal spacing, designed to fit within other components
 * 
 * @param {string} size - Size variant: 'small' (14px), 'medium' (18px)
 * @param {object} props - Additional props passed to CircularProgress
 */
export const InlineLoader = ({ size = 'small', ...props }) => {
  const sizeMap = {
    small: 14,
    medium: 18
  };

  const loaderSize = sizeMap[size] ?? sizeMap.small;

  return (
    <Box display="inline-flex" alignItems="center" ml={1}>
      <CircularProgress size={loaderSize} {...props} />
    </Box>
  );
}; 

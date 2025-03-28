import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Match our CSS variable --primary
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    }
  },
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Open Sans"',
      '"Helvetica Neue"',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    button: {
      fontWeight: 500,
      textTransform: 'none'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundColor: '#6366f1',
          '&:hover': {
            backgroundColor: '#4f46e5',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
          color: '#6366f1',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
            borderColor: '#6366f1',
          },
        },
      },
    },
  },
}); 
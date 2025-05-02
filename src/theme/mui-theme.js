import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // Match our CSS variable --primary
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    }
  },
  typography: {
    fontFamily: [
      'JetBrains Mono',
      'Fira Code',
      'Source Code Pro',
      'monospace'
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h2: {
      fontWeight: 700,
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
          fontFamily: 'JetBrains Mono, monospace',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundColor: '#0ea5e9',
          '&:hover': {
            backgroundColor: '#0284c7',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(14, 165, 233, 0.1)',
          color: '#0ea5e9',
          '&:hover': {
            backgroundColor: 'rgba(14, 165, 233, 0.04)',
            borderColor: '#0ea5e9',
          },
        },
      },
    },
  },
}); 
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
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
  },
}); 
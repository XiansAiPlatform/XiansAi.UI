import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // MUI needs actual color for manipulation
      light: '#38bdf8', // MUI needs actual color for manipulation
      dark: '#0284c7', // MUI needs actual color for manipulation
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569', // MUI needs actual color for manipulation  
      light: '#64748b', // MUI needs actual color for manipulation
      dark: '#1e293b', // MUI needs actual color for manipulation
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626', // MUI needs actual color for manipulation
      light: 'rgba(220, 38, 38, 0.08)', // MUI needs actual color for manipulation
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669', // MUI needs actual color for manipulation
      light: '#34d399', // MUI needs actual color for manipulation
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#92400e', // MUI needs actual color for manipulation
      light: '#fef3c7', // MUI needs actual color for manipulation
      dark: '#78350f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0369a1', // MUI needs actual color for manipulation
      light: '#e0f2fe', // MUI needs actual color for manipulation
      dark: '#0c4a6e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // MUI needs actual color for manipulation
      paper: '#ffffff', // MUI needs actual color for manipulation
    },
    text: {
      primary: '#1e293b', // MUI needs actual color for manipulation
      secondary: '#475569', // MUI needs actual color for manipulation
    },
    divider: 'rgba(0, 0, 0, 0.08)', // MUI needs actual color for manipulation
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
  shape: {
    borderRadius: 6, // Match --radius-md (6px)
  },
  spacing: 8, // Keep MUI's default 8px spacing unit
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
          borderRadius: 'var(--radius-md)', // CSS variables work fine in styleOverrides
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: 'var(--primary)', // CSS variables work fine in styleOverrides
          '&:hover': {
            backgroundColor: 'var(--primary-dark)',
            boxShadow: 'var(--button-primary-shadow)',
          },
        },
        outlinedPrimary: {
          borderColor: 'var(--border-color)',
          color: 'var(--primary)',
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--primary)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)', // CSS variables work fine in styleOverrides
        },
        colorSecondary: {
          backgroundColor: 'var(--status-total-bg)', // CSS variables work fine in styleOverrides
          color: 'var(--text-secondary)',
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bg-paper)', // CSS variables work fine in styleOverrides
          borderRadius: 'var(--radius-lg)',
        },
      },
    },
  },
}); 
import { createTheme } from '@mui/material/styles';
import { useTenant } from '../contexts/TenantContext';

// Available color themes
export const colorThemes = {
  // Default theme
  default: {
    primary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569',
      light: '#64748b',
      dark: '#1e293b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: 'rgba(220, 38, 38, 0.08)',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#92400e',
      light: '#fef3c7',
      dark: '#78350f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0369a1',
      light: '#e0f2fe',
      dark: '#0c4a6e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },  
  // Nordic Fjord Theme
  nordicFjord: {
    primary: {
      main: '#005F86',
      light: '#4A9CBF',
      dark: '#003D5C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3E5F6B',
      light: '#607D8B',
      dark: '#263238',
      contrastText: '#ffffff',
    },
    error: {
      main: '#CC4B37', 
      light: '#F8DBDB',
      dark: '#A02F2F',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2D6A4F', // Nordic forest green (inspired by Norwegian pine forests)
      light: '#74B49B',
      dark: '#1B4332',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#CF7F32', // Nordic amber with improved contrast
      light: '#F5E7D3',
      dark: '#A45E06',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0077B6', // Norwegian sea blue
      light: '#90E0EF',
      dark: '#023E8A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7FAFD', // Clean Nordic white with slight blue tint
      paper: '#ffffff',
    },
    text: {
      primary: '#26353F', // Dark slate for better readability
      secondary: '#546E7A',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },  
  // Nordic Aurora Theme
  nordicAurora: {
    primary: {
      main: '#006AA7', // Swedish blue (from national flag)
      light: '#62A6D9',
      dark: '#004E7C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7E4E8E', // Aurora purple with improved contrast ratio
      light: '#B491C8',
      dark: '#5B2E6E',
      contrastText: '#ffffff',
    },
    error: {
      main: '#D32F2F', // Accessible red
      light: '#EFCBCB',
      dark: '#9A0007',
      contrastText: '#ffffff',
    },
    success: {
      main: '#347C59', // Swedish forest green (conforming to accessibility standards)
      light: '#8CBBA6',
      dark: '#1E5237',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#E6A01E', // Nordic amber (matches traditional Swedish design)
      light: '#F2E3C9',
      dark: '#AD7200',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288D1', // Baltic sea blue
      light: '#B1D5E8',
      dark: '#01579B',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FC', // Clean Scandinavian background (slight warm undertone)
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#4F5B62',
    },
    divider: 'rgba(0, 0, 0, 0.07)',
  },  
  // Nordic Minimalist Theme
  nordicMinimalist: {
    primary: {
      main: '#C8102E', // Danish red (from national flag)
      light: '#E35D6A',
      dark: '#8B0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4C566A', // Danish blue-gray (inspired by Copenhagen architecture)
      light: '#7B88A1',
      dark: '#2E3440',
      contrastText: '#ffffff',
    },
    error: {
      main: '#BF4040', // Scandinavian red with proper contrast
      light: '#E9D1D1',
      dark: '#8C2828',
      contrastText: '#ffffff',
    },
    success: {
      main: '#3B7868', // Nordic teal (used in Danish modern furniture)
      light: '#83B5A8',
      dark: '#204038',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#B27D4B', // Danish amber with improved contrast
      light: '#E5D0B1',
      dark: '#7D572D',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3A6EA5', // Copenhagen harbor blue
      light: '#B6D0DE',
      dark: '#1E466F',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ECEFF4', // Danish minimalist background (true to Danish design)
      paper: '#ffffff',
    },
    text: {
      primary: '#2E3440', // Nordic dark gray for optimal readability
      secondary: '#4C566A',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },  
  // European Classic Theme
  europeanClassic: {
    primary: {
      main: '#1A5F7A', // European blue (inspired by EU flag)
      light: '#64B5CD',
      dark: '#003F5C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6B5B95', // Central European purple (cultural heritage inspired)
      light: '#9D8AB7',
      dark: '#48406B',
      contrastText: '#ffffff',
    },
    error: {
      main: '#D64045',
      light: '#FFCCCB',
      dark: '#A32226',
      contrastText: '#ffffff',
    },
    success: {
      main: '#436B56', // Alpine forest green
      light: '#88AE9B',
      dark: '#2A453A',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#D4A24E', // Continental gold
      light: '#F5E6CA',
      dark: '#9C722F',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3E7CB2', // Mediterranean blue
      light: '#A8C8E6',
      dark: '#265785',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F6F9FB', // Clean European white with slight warmth
      paper: '#ffffff',
    },
    text: {
      primary: '#2D3E50',
      secondary: '#54626F',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  // Australasian Coastal Theme
  australasianCoastal: {
    primary: {
      main: '#00859B', // Great Barrier Reef blue
      light: '#5CBBCB',
      dark: '#005F6E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6B4226', // Australian outback red-brown
      light: '#9B7A65',
      dark: '#3D2416',
      contrastText: '#ffffff',
    },
    error: {
      main: '#D63230', // Australasian warning red
      light: '#F5CBCB',
      dark: '#A32121',
      contrastText: '#ffffff',
    },
    success: {
      main: '#107869', // New Zealand forest green
      light: '#5AB1A2',
      dark: '#074D42',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#E29839', // Australian golden wattle
      light: '#F5D6A8',
      dark: '#B97516',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3776AB', // Southern Ocean blue
      light: '#A2C3E3',
      dark: '#1C4D82',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FBF8', // Clean beach sand inspired background
      paper: '#ffffff',
    },
    text: {
      primary: '#2A3F36', // Eucalyptus dark green
      secondary: '#546B61',
    },
    divider: 'rgba(0, 0, 0, 0.07)',
  }
};

// Default color set
var defaultColorSet = colorThemes.default;

// Hook for fetching tenant-specific colors
export const useTenantColors = () => {
  const { tenant } = useTenant();
  try {
    if (tenant && tenant.theme) {      
      if (colorThemes[tenant.theme]) {
        return colorThemes[tenant.theme];
      } else {
        console.warn(`Theme '${tenant.theme}' not found in available themes`);
      }
    }
  } catch (error) {
    console.warn("Error in useTenantColors:", error.message);
    // Fall back to default theme if context is not available
  }
  
  return defaultColorSet;
}

// Create a theme generator function
const createAppTheme = (colorSet) => createTheme({
  palette: colorSet,
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif'
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
    borderRadius: 8, // Match --radius-md (8px) for Nordic design
  },
  spacing: 8, // Keep MUI's default 8px spacing unit
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
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
    },  },
});

// Create default theme using the default color set
export const theme = createAppTheme(defaultColorSet);

// Hook to get a tenant-specific theme
export const useTenantTheme = () => {
  const colors = useTenantColors();
  return createAppTheme(colors);
};
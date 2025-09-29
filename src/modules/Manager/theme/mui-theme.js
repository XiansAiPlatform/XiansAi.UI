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
  // Nordic Midnight Sun Theme (Midnattssol)
  nordicMidnightSun: {
    primary: {
      main: '#F59E0B', // Warm golden amber - the low-hanging midnight sun
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1E3A8A', // Deep twilight blue - the never-quite-dark summer sky
      light: '#3B82F6',
      dark: '#1E293B',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#34D399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#EA580C',
      light: '#FED7AA',
      dark: '#C2410C',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0891B2',
      light: '#67E8F9',
      dark: '#0E7490',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FFFBEB', // Warm, light background like endless summer daylight
      paper: '#ffffff',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },  
  // Nordic Forest Theme (Skogsrike)
  nordicForest: {
    primary: {
      main: '#15803D', // Deep evergreen - Swedish pine forests
      light: '#22C55E',
      dark: '#14532D',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#92400E', // Warm earth brown - forest floor and tree bark
      light: '#D97706',
      dark: '#451A03',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrastText: '#ffffff',
    },
    success: {
      main: '#166534',
      light: '#4ADE80',
      dark: '#14532D',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#CA8A04',
      light: '#FDE047',
      dark: '#A16207',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0F766E',
      light: '#2DD4BF',
      dark: '#115E59',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0FDF4', // Light mint - fresh forest air
      paper: '#ffffff',
    },
    text: {
      primary: '#1A2E05',
      secondary: '#365314',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },  
  // Nordic Ice Theme (Isblink)
  nordicIce: {
    primary: {
      main: '#0EA5E9', // Glacial blue - crystal clear ice
      light: '#38BDF8',
      dark: '#0369A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#52525B', // Warm charcoal - volcanic rock contrast
      light: '#71717A',
      dark: '#27272A',
      contrastText: '#ffffff',
    },
    error: {
      main: '#E11D48',
      light: '#FBE4E8',
      dark: '#BE123C',
      contrastText: '#ffffff',
    },
    success: {
      main: '#0D9488',
      light: '#5EEAD4',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F97316',
      light: '#FED7AA',
      dark: '#EA580C',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06B6D4',
      light: '#A5F3FC',
      dark: '#0891B2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F9FF', // Ice-blue tinted white
      paper: '#ffffff',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },  
  // Nordic Aurora Theme (Nordlys)
  nordicAurora: {
    primary: {
      main: '#10B981', // Aurora green - most common northern lights color
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C3AED', // Deep purple - aurora borealis purple bands
      light: '#A78BFA',
      dark: '#5B21B6',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    success: {
      main: '#14B8A6',
      light: '#5EEAD4',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
      light: '#FDE68A',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',
      light: '#93C5FD',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0FDF4', // Soft aurora glow
      paper: '#ffffff',
    },
    text: {
      primary: '#064E3B',
      secondary: '#047857',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  // Nordic Fjord Theme (Fjordblå)
  nordicFjord: {
    primary: {
      main: '#1E40AF', // Deep fjord blue - Norwegian fjord waters
      light: '#3B82F6',
      dark: '#1E3A8A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6B7280', // Mountain stone gray - steep fjord cliffs
      light: '#9CA3AF',
      dark: '#374151',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#D97706',
      light: '#FCD34D',
      dark: '#B45309',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0891B2',
      light: '#22D3EE',
      dark: '#0E7490',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Misty fjord morning
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B',
      secondary: '#475569',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  
  // Nordic Winter Theme (Vintervit)
  nordicWinter: {
    primary: {
      main: '#06B6D4', // Cool ice blue - frozen lakes and winter sky
      light: '#67E8F9',
      dark: '#0891B2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E11D48', // Warm coral red - winter berries, traditional textiles
      light: '#FB7185',
      dark: '#BE123C',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',
      light: '#34D399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',
      light: '#93C5FD',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F9FF', // Fresh snow on a clear day
      paper: '#ffffff',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
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
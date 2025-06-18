import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useTenantTheme, useTenantColors } from './mui-theme';

export function TenantThemeProvider({ children }) {
  // Get tenant-specific theme and colors
  const tenantTheme = useTenantTheme();
  const tenantColors = useTenantColors();
  
  // Apply CSS variables based on selected theme
  useEffect(() => {
    if (tenantColors) {
      // Update CSS variables to match the MUI theme
      document.documentElement.style.setProperty('--primary', tenantColors.primary.main);
      document.documentElement.style.setProperty('--primary-dark', tenantColors.primary.dark);
      document.documentElement.style.setProperty('--primary-rgb', hexToRgb(tenantColors.primary.main));
      
      // Set success colors if they exist
      if (tenantColors.success) {
        document.documentElement.style.setProperty('--success', tenantColors.success.main);
        document.documentElement.style.setProperty('--success-light', tenantColors.success.light);
        document.documentElement.style.setProperty('--success-rgb', hexToRgb(tenantColors.success.main));
      }
    }
  }, [tenantColors]);
  
  // Helper function to convert hex color to RGB format for CSS variables
  function hexToRgb(hex) {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }
  
  return (
    <ThemeProvider theme={tenantTheme}>
      {children}
    </ThemeProvider>
  );
}

export default TenantThemeProvider;

# Theming Guide

This document outlines how theming should be handled in the application using Material-UI (MUI).

## Theme Configuration

The application uses a centralized theme configuration in `src/theme/mui-theme.js`. This theme is applied globally through the `ThemeProvider` in `App.jsx`.

### Base Theme Setup

```javascript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // Theme configuration
});
```

## Typography

The application uses Plus Jakarta Sans as the primary font family, with system fonts as fallbacks. Typography variants are configured with consistent styling:

```javascript
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
  // Similar configuration for h2-h6
  button: {
    fontWeight: 500,
    textTransform: 'none'
  }
}
```

### Typography Usage

When using typography in components:

```javascript
// Using typography variants
<Typography variant="h1">Main Heading</Typography>
<Typography variant="body1">Regular text content</Typography>

// With additional styling
<Typography 
  variant="h2" 
  sx={{ 
    mb: 2,
    color: 'primary.main' 
  }}
>
  Styled Heading
</Typography>
```

## Component Theming

### Using Styled Components

For component-specific styling, use the `styled` utility from MUI:

```javascript
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));
```

### Theme-Aware Styling

When creating styles that need to respond to theme changes:

1. Access theme values using the theme parameter in styled components:

```javascript
const MyComponent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper
}));
```

1. Use the `useTheme` hook for dynamic styles:

```javascript
import { useTheme } from '@mui/material/styles';

const Component = () => {
  const theme = useTheme();
  return (
    <Box sx={{
      color: theme.palette.mode === 'light' ? 'black' : 'white'
    }}>
      Content
    </Box>
  );
};
```

## CSS Baseline

The application uses MUI's CSSBaseline for consistent base styling:

```javascript
components: {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
    },
  },
}
```

## Best Practices

1. **Consistent Spacing**: Use theme.spacing() for consistent spacing throughout the application

   ```javascript
   padding: theme.spacing(2) // 16px by default
   margin: theme.spacing(1, 2) // 8px vertical, 16px horizontal
   ```

2. **Dark/Light Mode**: Always consider both light and dark modes when defining colors

   ```javascript
   backgroundColor: theme.palette.mode === 'dark' 
     ? 'rgba(255, 255, 255, 0.08)'
     : 'rgba(0, 0, 0, 0.04)'
   ```

3. **Component Styling**: Prefer styled components for reusable styles and the `sx` prop for one-off styles

   ```javascript
   // Reusable styled component
   const StyledBox = styled(Box)(({ theme }) => ({
     padding: theme.spacing(2),
     borderRadius: theme.shape.borderRadius,
   }));

   // One-off styles
   <Box sx={{ mb: 2, p: 1 }}>
     Content
   </Box>
   ```

4. **Typography**: Use MUI's typography variants instead of custom font styles

   ```javascript
   // Good
   <Typography variant="h6">Title</Typography>

   // Avoid
   <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Title</div>
   ```

5. **Theme Spacing**: Use the spacing helper for consistent layout

   ```javascript
   // Good
   <Box sx={{ mt: 2, mb: 4 }}>

   // Avoid
   <Box sx={{ marginTop: '16px', marginBottom: '32px' }}>
   ```

6. **Color Usage**: Use theme palette colors for consistency

   ```javascript
   // Good
   <Button sx={{ color: 'primary.main' }}>

   // Avoid
   <Button sx={{ color: '#1976d2' }}>
   ```

## Global Theme Application

The theme is applied globally in App.jsx using ThemeProvider:

```javascript
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/mui-theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Application content */}
    </ThemeProvider>
  );
}
```

## Customizing Theme

To extend or modify the theme:

1. Create a new theme file or modify the existing one:

```javascript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
    // Add custom colors
    custom: {
      lightGray: '#f5f5f5',
    },
  },
  // Add custom breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
```

1. Access custom theme values in components:

```javascript
const CustomComponent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.custom.lightGray,
  [theme.breakpoints.up('md')]: {
    // Styles for medium and up screens
  },
}));
```

## Responsive Design

Use MUI's breakpoint helpers for responsive designs:

```javascript
const ResponsiveComponent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));
```

This comprehensive guide should help maintain consistent theming across the application. Always refer to the Material-UI documentation for more detailed information about specific components and features.

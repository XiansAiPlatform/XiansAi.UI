# Theming Guide

This document outlines theming best practices using Material-UI (MUI).

## Overview

The application uses a centralized theme configuration in `src/theme/mui-theme.js` applied globally through the `ThemeProvider` in `App.jsx`. The primary font family is Plus Jakarta Sans with appropriate system fallbacks.

## Best Practices

### Typography

- Use MUI's typography variants instead of custom font styles

  ```jsx
  // Good
  <Typography variant="h6">Title</Typography>

  // Avoid
  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Title</div>
  ```

### Component Styling

- **Reusable styles**: Use the `styled` utility

  ```jsx
  const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2)
  }));
  ```

- **One-off styles**: Use the `sx` prop

  ```jsx
  <Box sx={{ mb: 2, p: 1 }}>Content</Box>
  ```

### Theme-Aware Styling

- Access theme values using the theme parameter in styled components
- Use the `useTheme` hook for dynamic styles based on theme values or mode

### Spacing

- Use theme spacing helpers for consistent layout

  ```jsx
  // Good
  <Box sx={{ mt: 2, mb: 4 }}>

  // Avoid
  <Box sx={{ marginTop: '16px', marginBottom: '32px' }}>
  ```

### Colors

- Use theme palette colors for consistency

  ```jsx
  // Good
  <Button sx={{ color: 'primary.main' }}>

  // Avoid
  <Button sx={{ color: '#1976d2' }}>
  ```

### Dark/Light Mode

- Consider both modes when defining colors

  ```jsx
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.04)'
  ```

## Responsive Design

Use MUI's breakpoint helpers for responsive layouts:

```jsx
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

## Customizing Theme

To extend or modify the theme, edit the theme file by adding custom colors, breakpoints, or component overrides. Access these values in your components as needed.

## Troubleshooting

Common issues:

- **Inconsistent styling**: Ensure ThemeProvider wraps your application
- **Custom styles not applying**: Check component specificity and theme access
- **Theme values not available**: Verify you're using the proper hooks or styled API

For more detailed information about specific components and features, refer to the [Material-UI documentation](https://mui.com/material-ui/customization/theming/).

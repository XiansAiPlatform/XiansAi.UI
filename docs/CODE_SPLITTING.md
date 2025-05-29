# Code Splitting Implementation Guide

This document outlines how code splitting is implemented in the XiansAi.UI project and provides guidelines for implementing code splitting for new components and features.

## Overview

Code splitting is a technique that allows you to split your JavaScript bundle into smaller chunks that are loaded on demand. This improves the initial load time of your application by only loading the code that is needed for the current page.

## How to Use Code Splitting

### 1. For Route-based Code Splitting

Route-based code splitting is already implemented for the main routes. To add a new route with code splitting:

```jsx
// Import the lazyLoad utility
import lazyLoad from '../utils/lazyLoad';

// Use the lazyLoad utility to import your component
const MyNewRoute = lazyLoad(() => import('./path/to/MyNewRoute'));

// For components that should be prefetched (e.g., components likely to be used soon)
const FrequentlyUsedComponent = lazyLoad(() => import('./path/to/Component'), { prefetch: true });
```

### 2. For Component-level Code Splitting

For components that are not directly tied to routes but are still large or infrequently used:

```jsx
// Import the LazyComponent wrapper and lazyLoad utility
import LazyComponent from '../components/LazyComponent';
import lazyLoad from '../utils/lazyLoad';

// Define your lazy-loaded component
const HeavyComponent = lazyLoad(() => import('./path/to/HeavyComponent'));

// Use it in your component
function MyComponent() {
  return (
    <div>
      {/* Other components */}
      
      {/* Only when the component needs to be rendered */}
      {showHeavyComponent && (
        <LazyComponent 
          component={HeavyComponent}
          loadingMessage="Loading component..." 
          // Pass any props to the component
          someProps={someValue}
        />
      )}
    </div>
  );
}
```

### 3. For Dynamic Imports

For code that's only needed in specific interactions:

```jsx
// Use dynamic import directly
const handleClick = async () => {
  // Only load the module when needed
  const { default: SomeModule } = await import('./path/to/module');
  // Use the module
  SomeModule.doSomething();
};
```

## Best Practices

1. **Route-based Splitting**: Always use code splitting for routes.
2. **Large Components**: Split any component that's larger than 30KB.
3. **Rarely Used Features**: Split features that are only used in specific scenarios.
4. **Common Code**: Avoid duplicating code in multiple chunks by ensuring common utilities are properly extracted.
5. **Prefetching**: Use the `prefetch` option for components that are likely to be needed soon.

## Webpack Configuration

The project uses CRACO to customize the webpack configuration for optimal code splitting:

- Separate vendor chunks for third-party libraries
- Dedicated chunks for React and MUI libraries
- Common chunk for shared code between routes

The configuration can be found in `craco.config.js`.

## Analyzing Bundle Sizes

To analyze the bundle sizes and see the effect of code splitting:

1. Run `npm run analyze` to build the application and open the webpack bundle analyzer
2. The analyzer will show the size of each chunk and how they relate to each other
3. Use this information to identify opportunities for further optimization

## Performance Monitoring

After implementing code splitting, monitor the application performance:

1. Use the Network tab in Chrome DevTools to see which chunks are loaded and when
2. Check the bundle sizes using the Webpack Bundle Analyzer
3. Measure and compare load times before and after code splitting

## Troubleshooting

If you encounter issues with code splitting:

1. **Build errors**: Ensure CRACO is properly installed (`npm install @craco/craco --save-dev`)
2. **Module not found errors**: Check that import paths are correct
3. **Runtime errors**: Make sure ErrorBoundary components are wrapping lazy-loaded components
4. **Chunks not loading**: Verify that the network requests for chunks are successful
5. **Performance issues**: Check if chunks are too small or too numerous, which can impact load times

If you get a "Cannot read property of null" error in the webpack configuration, it might be related to module resolution. The current configuration has been simplified to avoid these issues.

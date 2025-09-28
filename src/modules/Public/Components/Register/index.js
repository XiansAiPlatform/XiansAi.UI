// Export the main Register component which handles routing
export { default } from './Register';

// Export individual components for direct access if needed
export { default as RegisterSelection } from './RegisterSelection';
export { default as RegisterJoin } from './RegisterJoin';
export { default as RegisterNew } from './RegisterNew';

// Export shared components
export * from './components/SharedComponents';

// Export utilities
export * from './utils/emailValidation';

# Register Component Structure

The Register component has been refactored into multiple files to improve maintainability and organization. Here's the new structure:

## File Structure

```
Register/
├── Register.jsx                     # Main router component
├── RegisterSelection.jsx            # Step 1: Choose join/create
├── RegisterJoin.jsx                # Step 2: Join existing tenant
├── RegisterNew.jsx                 # Step 2: Create new tenant
├── components/
│   ├── SharedComponents.jsx        # Common UI components
│   └── VerificationInput.jsx       # Email verification input
├── utils/
│   └── emailValidation.js          # Email validation utilities
├── index.js                        # Export definitions
└── README.md                       # This file
```

## Routes

The new structure supports the following routes:

- `/register` - Main selection page (join vs create)
- `/register/join` - Join existing tenant flow
- `/register/new` - Create new tenant flow

## Components

### Register.jsx
Main router component that handles nested routing between the different registration stages.

### RegisterSelection.jsx
The initial selection page where users choose between joining an existing tenant or creating a new one.

### RegisterJoin.jsx
Handles the flow for joining an existing tenant, including email verification.

### RegisterNew.jsx
Handles the flow for creating a new tenant with company details.

### SharedComponents.jsx
Contains reusable UI components:
- `Footer` - Styled footer component
- `InfoMessage` - Styled info message component
- `RegisterFooter` - Footer with 99x branding
- `AuthInfoMessage` - Authentication status message
- `UnauthenticatedMessage` - Message shown when user is not authenticated

### VerificationInput.jsx
Specialized component for handling 6-digit verification codes with auto-focus and paste support.

## Utilities

### emailValidation.js
Contains the `validateCompanyEmail` function that checks if an email is a valid company email (not a common consumer email domain).

## Usage

The main Register component is imported the same way as before:

```jsx
import Register from './Components/Register/Register';
```

Individual components can be imported directly if needed:

```jsx
import { RegisterJoin, RegisterNew } from './Components/Register';
```

## Benefits of This Structure

1. **Separation of Concerns**: Each stage has its own component with focused responsibilities
2. **Better Maintainability**: Easier to modify individual stages without affecting others
3. **Reusable Components**: Shared components can be reused across different stages
4. **Clear Navigation**: URL-based routing makes it easier to understand the current stage
5. **Testing**: Each component can be tested independently
6. **Code Splitting**: React can better optimize bundle splitting with this structure

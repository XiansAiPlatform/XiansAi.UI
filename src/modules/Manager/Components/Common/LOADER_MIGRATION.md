# Loader Standardization Migration Guide

## Overview
We've consolidated loading components into a flexible `ContentLoader` that can handle all content area loading scenarios with extensive customization options.

## Available Components & Hooks

### Loading Components
Import from: `'../Common/StandardLoaders'`

### Loading Hooks  
Import from: `'../../utils/useStandardLoading'`

Available hooks:
- `useStandardLoading` - Basic loading with error handling
- `useContentLoading` - Renders ContentLoader automatically  
- `usePaginationLoading` - For lists with "load more"
- `useFormLoading` - Semantic form submission states

## Available Components

### 1. ContentLoader (Primary - Handles All Content Loading)
**Ultimate flexible loader for any content area, inline usage, or simple centering**

```jsx
import { ContentLoader } from '../Common/StandardLoaders';

// Basic usage (full content area)
<ContentLoader />

// Inline usage (replaces old StandardLoader inline)
<ContentLoader inline size="small" />

// Simple centered with custom padding (replaces old StandardLoader)
<ContentLoader sx={{ p: 2 }} />

// Small section loading with custom padding
<ContentLoader size="small" sx={{ p: 2 }} />

// Custom height (like old TenantSettings)
<ContentLoader size="medium" sx={{ height: '200px' }} />

// Extra large with message
<ContentLoader size="xlarge" message="Loading workspace..." />

// Flex layout matching error/empty states
<ContentLoader sx={{ flexGrow: 1 }} />

// Complex custom styling with multiple properties
<ContentLoader 
  size="medium"
  sx={{ 
    flexGrow: 1,
    height: '300px',
    p: 3,
    backgroundColor: 'grey.50', 
    borderRadius: 1 
  }} 
/>
```

**Available Options:**
- `size`: 'small' (16px), 'medium' (24px), 'large' (32px), 'xlarge' (40px)
- `message`: Optional text below spinner
- `direction`: 'column' or 'row' layout
- `inline`: If true, renders just the spinner without container
- `sx`: MUI sx prop for complete styling control (overrides defaults)
- `containerProps`: Additional Box props for advanced usage

**Default Styling (when not inline):**
```jsx
{
  display: 'flex',
  flexDirection: 'column', // or 'row' based on direction prop
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  p: 4 // 32px padding
}
```
The `sx` prop merges with and overrides these defaults, giving you complete control.

### 2. ButtonLoader
**Optimized for button icons**

```jsx
<Button startIcon={<ButtonLoader />}>
  Loading...
</Button>
```

### 3. TableLoader
**For data tables and lists**

```jsx
<TableLoader rows={5} />
```

### 4. InlineLoader
**Minimal for dropdowns/inputs**

```jsx
<InlineLoader size="medium" />
```

## Migration Examples

### Replace CircularProgress + Box patterns:

**Before:**
```jsx
<Box display="flex" justifyContent="center" alignItems="center" p={4} height="100%">
  <CircularProgress size={40} />
</Box>
```

**After:**
```jsx
<ContentLoader />
```

### Replace StandardLoader usage:

**Before:**
```jsx
<StandardLoader size="large" />
```

**After:**
```jsx
<ContentLoader size="large" sx={{ p: 2 }} />
```

**Before:**
```jsx
<StandardLoader size="small" inline />
```

**After:**
```jsx
<ContentLoader size="small" inline />
```

### Replace custom loading states:

**Before:**
```jsx
<Box display="flex" justifyContent="center" alignItems="center" p={2} minHeight="150px">
  <CircularProgress size={32} />
</Box>
```

**After:**
```jsx
<ContentLoader size="large" sx={{ p: 2, minHeight: '150px' }} />
```

### Replace section loading:

**Before:**
```jsx
<Box display="flex" justifyContent="center" alignItems="center" p={3}>
  <CircularProgress size={28} />
</Box>
```

**After:**
```jsx
<ContentLoader size="medium" sx={{ p: 3 }} />
```

## Size Reference
- **small**: 16px - For inline usage, compact sections
- **medium**: 24px - For medium content areas, forms
- **large**: 32px - For main content, pages (default)
- **xlarge**: 40px - For prominent loading states

## Padding Reference
- **0**: No padding
- **1**: 8px - Minimal
- **2**: 16px - Compact
- **3**: 24px - Comfortable
- **4**: 32px - Spacious (default)
- **5+**: 40px+ - Extra spacious

## Common Patterns

### Full Page Loading
```jsx
<ContentLoader />
```

### Tab/Section Loading
```jsx
<ContentLoader size="medium" sx={{ height: '200px' }} />
```

### Card Content Loading
```jsx
<ContentLoader size="small" sx={{ p: 2 }} />
```

### Form Loading
```jsx
<ContentLoader size="medium" sx={{ p: 3 }} />
```

### Table Loading
```jsx
<TableLoader rows={3} />
```

### Button Loading
```jsx
<Button disabled startIcon={<ButtonLoader />}>
  Saving...
</Button>
```

### Flex Layout Loading (matches error/empty states)
```jsx
<ContentLoader sx={{ flexGrow: 1 }} />
```

### Chat/List Loading with Flex Growth
```jsx
<ContentLoader size="medium" sx={{ flexGrow: 1 }} />
```

### Complex Custom Styling
```jsx
<ContentLoader 
  size="large"
  message="Loading workspace..."
  sx={{ 
    flexGrow: 1,
    minHeight: '400px',
    p: 5,
    backgroundColor: 'background.paper',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider'
  }} 
/>
```

## Benefits
- **Consistent**: Same visual appearance across all components
- **Flexible**: Extensive customization without code duplication
- **Maintainable**: Single component to update for design changes
- **Semantic**: Clear naming and purpose-built variants
- **Efficient**: Reduced bundle size and code complexity

---

# 📋 MIGRATION PROGRESS TRACKER

## ✅ COMPLETED MIGRATIONS

### Core Infrastructure
- [x] **StandardLoaders.jsx** - Consolidated components, removed StandardLoader
- [x] **useStandardLoading.js** - Created loading hooks, removed duplicate
- [x] **LOADER_MIGRATION.md** - Complete documentation

## 🔄 MIGRATIONS

### Priority 1: Button Loading States (Use ButtonLoader)
- [ ] **MessagesList.jsx** - Line 189: Load more button (REVERTED - also needs ContentLoader for main loading)
  ```jsx
  // Current: startIcon={isLoadingMore ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
  // Target:  startIcon={isLoadingMore ? <ButtonLoader /> : <ExpandMoreIcon />}
  ```

- [ ] **WorkflowLogComponent.jsx** - Line 452: Load more button
  ```jsx
  // Current: startIcon={isLoadingMore ? <CircularProgress size={16} /> : null}
  // Target:  startIcon={isLoadingMore ? <ButtonLoader /> : null}
  ```

- [ ] **NewWorkflowForm.jsx** - Line 256: Submit button
  ```jsx
  // Current: startIcon={loading && <CircularProgress size={20} />}
  // Target:  startIcon={loading && <ButtonLoader size="medium" />}
  ```

- [ ] **ChatHeader.jsx** - Line 296: Send button
  ```jsx
  // Current: startIcon={isSending ? <CircularProgress size={16} /> : <SendIcon />}
  // Target:  startIcon={isSending ? <ButtonLoader /> : <SendIcon />}
  ```

- [ ] **RegisterWebhookForm.jsx** - Line 429: Submit button
  ```jsx
  // Current: {loading ? <CircularProgress size={24} /> : 'Register Webhook'}
  // Target:  startIcon={loading ? <ButtonLoader size="medium" /> : undefined}
  ```

- [ ] **ConversationThreads.jsx** - Line 372: Load more button
  ```jsx
  // Current: {loadingMore ? <CircularProgress size={16} /> : "Load more"}
  // Target:  startIcon={loadingMore ? <ButtonLoader /> : undefined}
  ```

- [ ] **SendMessageForm.jsx** - Line 605: Submit button
  ```jsx
  // Current: {loading ? <CircularProgress size={24} /> : 'Send Message'}
  // Target:  startIcon={loading ? <ButtonLoader size="medium" /> : undefined}
  ```

- [ ] **BrandingSettings.jsx** - Line 482: Upload button
  ```jsx
  // Current: startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
  // Target:  startIcon={isUploading ? <ButtonLoader size="medium" /> : <SaveIcon />}
  ```

### Priority 2: Content Area Loading (Use ContentLoader)
- [ ] **KnowledgeEditor.jsx** - Content loading state (REVERTED - was using ContentLoader)
  ```jsx
  // Will need: <ContentLoader />
  ```

- [ ] **WorkflowDetails.jsx** - Full page loading state (REVERTED - was using ContentLoader)
  ```jsx
  // Will need: <ContentLoader />
  ```

- [ ] **TenantSettings.jsx** - Custom height settings page (REVERTED - was using ContentLoader)
  ```jsx
  // Will need: <ContentLoader size="medium" sx={{ height: '200px' }} />
  ```

- [ ] **WorkflowLogComponent.jsx** - Line 302: Content loading
  ```jsx
  // Current: <CircularProgress size={24} />
  // Target:  <ContentLoader size="medium" sx={{ p: 3 }} />
  ```

- [ ] **ConversationThreads.jsx** - Line 172: Content loading
  ```jsx
  // Current: <CircularProgress size={24} />
  // Target:  <ContentLoader size="medium" />
  ```

- [ ] **Knowledge.jsx** - Line 343: Content loading
  ```jsx
  // Current: <CircularProgress />
  // Target:  <ContentLoader />
  ```

- [ ] **Knowledge.jsx** - Line 371: Content loading
  ```jsx
  // Current: <CircularProgress size={24} />
  // Target:  <ContentLoader size="medium" />
  ```

- [ ] **Knowledge.jsx** - Line 399: Content loading with margin
  ```jsx
  // Current: <CircularProgress size={24} sx={{ mb: 2 }} />
  // Target:  <ContentLoader size="medium" sx={{ mb: 2 }} />
  ```

- [ ] **KnowledgeViewer.jsx** - Line 119: Content loading
  ```jsx
  // Current: <CircularProgress />
  // Target:  <ContentLoader />
  ```

- [ ] **WorkflowLogs.jsx** - Line 166: Content loading
  ```jsx
  // Current: <CircularProgress />
  // Target:  <ContentLoader />
  ```

### Priority 3: Inline/Dropdown Loading (Use InlineLoader)
- [ ] **MessagesList.jsx** - Messages loading with flex layout (REVERTED - was using ContentLoader, also needs flex styling)
  ```jsx
  // Will need: <ContentLoader sx={{ flexGrow: 1 }} />
  ```

- [ ] **AgentSelector.jsx** - Line 96: Dropdown loading
  ```jsx
  // Current: {isLoadingAgents && <CircularProgress size={20} />}
  // Target:  {isLoadingAgents && <InlineLoader size="medium" />}
  ```

- [ ] **RegisterWebhookForm.jsx** - Line 254: Dropdown loading
  ```jsx
  // Current: {isLoadingTypes && <CircularProgress size={20} />}
  // Target:  {isLoadingTypes && <InlineLoader size="medium" />}
  ```

- [ ] **RegisterWebhookForm.jsx** - Line 339: Dropdown loading
  ```jsx
  // Current: {isLoadingInstances && <CircularProgress size={20} />}
  // Target:  {isLoadingInstances && <InlineLoader size="medium" />}
  ```

- [ ] **RegisterWebhookForm.jsx** - Line 370: Conditional loading
  ```jsx
  // Current: {isLoadingWebhooks ? <CircularProgress size={20} /> : ...}
  // Target:  {isLoadingWebhooks ? <InlineLoader size="medium" /> : ...}
  ```

- [ ] **SendMessageForm.jsx** - Line 375: Dropdown loading
  ```jsx
  // Current: {isLoadingTypes && <CircularProgress size={20} />}
  // Target:  {isLoadingTypes && <InlineLoader size="medium" />}
  ```

- [ ] **SendMessageForm.jsx** - Line 488: Dropdown loading
  ```jsx
  // Current: {isLoadingInstances && <CircularProgress size={20} />}
  // Target:  {isLoadingInstances && <InlineLoader size="medium" />}
  ```

- [ ] **WorkflowAccordion.jsx** - Line 384: Inline loading
  ```jsx
  // Current: <CircularProgress size={20} />
  // Target:  <InlineLoader size="medium" />
  ```

- [ ] **WorkflowAccordion.jsx** - Line 429: Inline loading
  ```jsx
  // Current: <CircularProgress size={20} />
  // Target:  <InlineLoader size="medium" />
  ```

- [ ] **Auditing/AgentSelector.jsx** - Line 89: Dropdown loading
  ```jsx
  // Current: {isLoadingAgents && <CircularProgress size={20} />}
  // Target:  {isLoadingAgents && <InlineLoader size="medium" />}
  ```

- [ ] **WorkflowSelector.jsx** - Line 129: Dropdown loading
  ```jsx
  // Current: {isLoadingWorkflowTypes && <CircularProgress size={20} />}
  // Target:  {isLoadingWorkflowTypes && <InlineLoader size="medium" />}
  ```

- [ ] **WorkflowSelector.jsx** - Line 163: Dropdown loading
  ```jsx
  // Current: {isLoadingWorkflows && <CircularProgress size={20} />}
  // Target:  {isLoadingWorkflows && <InlineLoader size="medium" />}
  ```

### Priority 4: Special Cases
- [ ] **Knowledge.jsx** - Line 279: Icon button loading (custom styling)
  ```jsx
  // Current: <CircularProgress size={16} color="inherit" sx={{ opacity: 0.7 }} />
  // Target:  <ButtonLoader sx={{ opacity: 0.7 }} color="inherit" />
  ```

## 📊 MIGRATION STATISTICS
- **Total Files**: 22 files need updates (18 + 4 reverted)
- **Button Loading**: 8 files (Priority 1)
- **Content Loading**: 11 files (Priority 2) - includes 4 reverted files
- **Inline Loading**: 11 files (Priority 3)
- **Special Cases**: 1 file (Priority 4)
- **Completed**: 0 files ✅ (reverted)
- **Remaining**: 22 files 🔄

## 🎯 MIGRATION STRATEGY
1. **Start with Priority 1** (Button Loading) - Highest visual impact, easiest changes
2. **Move to Priority 2** (Content Loading) - Significant consistency improvements
3. **Complete Priority 3** (Inline Loading) - Final consistency touches
4. **Handle Priority 4** (Special Cases) - Custom requirements

## 📝 NOTES
- Import statements will need to be added: `import { ContentLoader, ButtonLoader, InlineLoader } from '../Common/StandardLoaders';`
- Some files may need path adjustments based on their location relative to the Common folder
- Test each change to ensure loading states work as expected
- Update this checklist as migrations are completed

---

# 🔧 LOADING HOOKS MIGRATION OPPORTUNITIES

## Overview
Many files currently use manual loading state management that could benefit from the standardized loading hooks. These hooks provide consistent error handling, automatic loading state management, and cleaner code patterns.

## 🎯 HOOK MIGRATION CANDIDATES

### Priority 1: Multiple Loading States (Use usePaginationLoading)
Files with both initial loading and "load more" patterns:

- [ ] **ConversationThreads.jsx** - Lines 42, 49: Initial + load more loading
  ```jsx
  // Current: Manual state management
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Target: Standardized pagination loading
  const { isLoading, isLoadingMore, withInitialLoading, withLoadMoreLoading } = usePaginationLoading();
  ```

- [ ] **ChatConversation.jsx** - Lines 35, 36: Messages + load more loading
  ```jsx
  // Current: Manual state management
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Target: Standardized pagination loading
  const { isLoading: isLoadingMessages, isLoadingMore, withInitialLoading, withLoadMoreLoading } = usePaginationLoading();
  ```

- [ ] **WorkflowLogComponent.jsx** - Lines 33, 34: Logs + load more loading
  ```jsx
  // Current: Manual state management
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Target: Standardized pagination loading
  const { isLoading, isLoadingMore, withInitialLoading, withLoadMoreLoading } = usePaginationLoading();
  ```

### Priority 2: Form Submission States (Use useFormLoading)
Files with form submission and deletion patterns:

- [ ] **RegisterWebhookForm.jsx** - Lines 39, 171, 186: Register + delete operations
  ```jsx
  // Current: Manual loading with global context
  const { loading, setLoading } = useLoading();
  
  // Target: Semantic form loading
  const { isSubmitting, isDeleting, withSubmitting, withDeleting } = useFormLoading();
  ```

- [ ] **SendMessageForm.jsx** - Lines 44, 219, 300: Send message operations
  ```jsx
  // Current: Manual loading with global context
  const { loading, setLoading } = useLoading();
  
  // Target: Semantic form loading
  const { isSubmitting, withSubmitting } = useFormLoading();
  ```

- [ ] **ChatHeader.jsx** - Lines 32, 33: Delete + send operations
  ```jsx
  // Current: Manual state management
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Target: Semantic form loading
  const { isSubmitting: isSending, isDeleting, withSubmitting: withSending, withDeleting } = useFormLoading();
  ```

- [ ] **BrandingSettings.jsx** - Line 39: Upload operations
  ```jsx
  // Current: Manual loading state
  const [isUploading, setIsUploading] = useState(false);
  
  // Target: Form loading hook
  const { isSubmitting: isUploading, withSubmitting: withUploading } = useFormLoading();
  ```

### Priority 3: Multiple Async Operations (Use useStandardLoading)
Files with complex async patterns that could benefit from withLoading wrapper:

- [ ] **RegisterWebhookForm.jsx** - Lines 47, 77, 105: Multiple API calls
  ```jsx
  // Current: Manual try-catch-finally patterns
  setIsLoadingTypes(true);
  try {
    const response = await agentsApi.getGroupedDefinitionsBasic();
    // ... process response
  } catch (err) {
    // ... error handling
  } finally {
    setIsLoadingTypes(false);
  }
  
  // Target: Standardized loading wrapper
  const { isLoading: isLoadingTypes, withLoading: withTypesLoading } = useStandardLoading();
  
  const fetchWorkflowTypes = async () => {
    return withTypesLoading(async () => {
      const response = await agentsApi.getGroupedDefinitionsBasic();
      // ... process response
      return response;
    }, handleApiError);
  };
  ```

- [ ] **AgentSelector.jsx** - Lines 26, 48: Agent loading with error handling
- [ ] **WorkflowSelector.jsx** - Lines 41, 74: Workflow types + instances loading
- [ ] **KnowledgeEditor.jsx** - Lines 52, 90, 140: Multiple loading states
- [ ] **Knowledge.jsx** - Lines 90, 97: Agent loading operations

### Priority 4: Simple Loading States (Use useStandardLoading)
Files with basic loading patterns that could be simplified:

- [ ] **TenantSettings.jsx** - Lines 14, 22: Simple loading state
- [ ] **WorkflowDetails.jsx** - Lines 14, 37: Workflow loading
- [ ] **ActivityTimeline.jsx** - Lines 24, 64: Timeline loading
- [ ] **WorkflowList.jsx** - Lines 58, 87: List loading

### Priority 5: Content Loading with Rendering (Use useContentLoading)
Files that could benefit from automatic ContentLoader rendering:

- [ ] **KnowledgeViewer.jsx** - Content loading with spinner
- [ ] **WorkflowLogs.jsx** - Logs content loading
- [ ] **ErrorLogs.jsx** - Error logs content loading

## 📊 HOOKS MIGRATION STATISTICS
- **Total Files**: 16 files could benefit from loading hooks
- **Pagination Loading**: 3 files (Priority 1)
- **Form Loading**: 4 files (Priority 2)
- **Complex Async**: 5 files (Priority 3)
- **Simple Loading**: 4 files (Priority 4)
- **Content Loading**: 3 files (Priority 5)

## 🎯 HOOKS MIGRATION BENEFITS
- **Consistent Error Handling**: Standardized error patterns across all components
- **Reduced Boilerplate**: Less manual try-catch-finally code
- **Better UX**: Automatic loading state management prevents race conditions
- **Maintainable**: Centralized loading logic, easier to update globally
- **Type Safety**: Better TypeScript support with standardized patterns

## ⚠️ CURRENT STATUS
- **None of the loading hooks are currently being used** - All are migration opportunities
- **All patterns found are manual implementations** - Perfect candidates for standardization
- **High impact potential** - Significant code reduction and consistency improvements possible

## 🔄 MIGRATION APPROACH
1. **Start with Priority 1** (Pagination) - Highest complexity reduction
2. **Move to Priority 2** (Forms) - Semantic improvements
3. **Continue with Priority 3** (Complex Async) - Error handling consistency
4. **Complete Priority 4** (Simple) - Final cleanup
5. **Finish with Priority 5** (Content) - UI consistency

## 📋 HOOKS IMPORT STATEMENTS
```jsx
// Basic loading with error handling
import { useStandardLoading } from '../../utils/useStandardLoading';

// Pagination/infinite scroll loading
import { usePaginationLoading } from '../../utils/useStandardLoading';

// Form submission loading
import { useFormLoading } from '../../utils/useStandardLoading';

// Content loading with automatic rendering
import { useContentLoading } from '../../utils/useStandardLoading';
```

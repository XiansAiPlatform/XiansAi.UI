# Loading Indicators Guide

## Overview
This application uses a unified approach to loading indicators for a consistent and polished user experience.

## Loading Indicator Strategy

### 1. **Top Progress Bar** (Primary)
**When to use:** Page navigation and route transitions

**Implementation:**
```jsx
import { useLoading } from '../../contexts/LoadingContext';

function MyComponent() {
  const { setLoading } = useLoading();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await api.getData();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
}
```

**Features:**
- Non-intrusive linear progress bar at the top of the page
- Automatically shown/hidden by the `LoadingContext`
- Fixed position, always visible
- Does not block page content

---

### 2. **Skeleton Loaders** (Secondary)
**When to use:** Initial page loads and content loading

**Available Components:**
Located in: `/src/components/SkeletonLoaders.jsx`

#### **CardSkeleton**
For grid/card layouts (templates, agents, workflows)
```jsx
import { CardSkeleton } from '../../../../components/SkeletonLoaders';

{loading ? (
  <CardSkeleton count={6} gridProps={{ xs: 12, sm: 6, md: 4 }} />
) : (
  // Your actual cards
)}
```

#### **ListSkeleton**
For list-based layouts
```jsx
import { ListSkeleton } from '../../../../components/SkeletonLoaders';

{loading ? <ListSkeleton rows={5} height={80} /> : /* Your list */}
```

#### **TableSkeleton**
For table layouts
```jsx
import { TableSkeleton } from '../../../../components/SkeletonLoaders';

{loading ? <TableSkeleton rows={5} columns={4} /> : /* Your table */}
```

#### **PageSkeleton**
For full page loading states
```jsx
import { PageSkeleton } from '../components/SkeletonLoaders';

// In Suspense fallback
<Suspense fallback={<PageSkeleton variant="simple" />}>
  <AppRoutes />
</Suspense>
```

**Variants:**
- `minimal` - Returns null (top progress bar only)
- `simple` - Simple content blocks
- `full` - Full page with sidebar and content

#### **FormSkeleton**
For form loading states
```jsx
import { FormSkeleton } from '../../../../components/SkeletonLoaders';

{loading ? <FormSkeleton fields={4} /> : /* Your form */}
```

#### **DetailsSkeleton**
For detail/profile pages
```jsx
import { DetailsSkeleton } from '../../../../components/SkeletonLoaders';

{loading ? <DetailsSkeleton /> : /* Your details */}
```

#### **DashboardSkeleton**
For dashboard layouts
```jsx
import { DashboardSkeleton } from '../../../../components/SkeletonLoaders';

{loading ? <DashboardSkeleton /> : /* Your dashboard */}
```

---

### 3. **Spinner Loaders** (Tertiary)
**When to use:** Inline content loading and small UI elements

**Available Components:**
Located in: `/src/modules/Manager/Components/Common/StandardLoaders.jsx`

#### **ContentLoader**
For content area loading
```jsx
import { ContentLoader } from '../Common/StandardLoaders';

{loading ? <ContentLoader size="medium" /> : /* Your content */}
```

#### **ButtonLoader**
For button loading states
```jsx
import { ButtonLoader } from '../Common/StandardLoaders';

<Button startIcon={loading ? <ButtonLoader /> : <SaveIcon />}>
  {loading ? 'Saving...' : 'Save'}
</Button>
```

#### **InlineLoader**
For inline/dropdown loading
```jsx
import { InlineLoader } from '../Common/StandardLoaders';

{isLoading && <InlineLoader size="medium" />}
```

---

## Decision Tree

```
Is it a page navigation?
├─ YES → Use LoadingContext (top progress bar)
└─ NO → Is it initial page load?
    ├─ YES → Use appropriate Skeleton Loader
    └─ NO → Is it a button action?
        ├─ YES → Use ButtonLoader
        └─ NO → Use ContentLoader or InlineLoader
```

---

## Rules

### ✅ DO:
- Use top progress bar for navigation
- Use skeletons for initial page loads
- Use spinners for inline/small content
- Return `null` when using LoadingContext (shows top bar only)
- Keep loading states consistent within similar UI patterns

### ❌ DON'T:
- Show full-page loading popups during navigation
- Mix different loading indicators for the same action
- Use `EnhancedLoadingSpinner` (deprecated)
- Block the entire page for small actions
- Show multiple loading indicators simultaneously

---

## Migration from Old Pattern

### Before (DON'T):
```jsx
if (loading) {
  return <EnhancedLoadingSpinner message="Loading..." />;
}
```

### After (DO):
```jsx
const { setLoading } = useLoading();

useEffect(() => {
  setLoading(true);
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) {
  return null; // Shows top progress bar
}
```

Or with skeleton:
```jsx
if (loading) {
  return <CardSkeleton count={6} />;
}
```

---

## Examples

### Page Navigation
```jsx
// ProtectedRoute.jsx
if (isLoading || isProcessingCallback || isOrgLoading) {
  return null; // LoadingContext shows top progress bar
}
```

### Settings Page
```jsx
// TenantUserManagement.jsx
const { setLoading } = useLoading();

const fetchUsers = useCallback(async () => {
  setLoading(true);
  try {
    const data = await api.getUsers();
    setUsers(data);
  } finally {
    setLoading(false);
  }
}, [setLoading]);
```

### Template List
```jsx
// TemplatesList.jsx
if (loading) {
  return <CardSkeleton count={6} gridProps={{ xs: 12, sm: 6, md: 4 }} />;
}
```

---

## Best Practices

1. **Perceived Performance**: Skeleton loaders make the app feel faster by showing structure
2. **Consistency**: Use the same loading pattern for similar UI elements
3. **Minimal Interruption**: Avoid full-page blocking for small actions
4. **Progressive Enhancement**: Show skeleton → content, not blank → content
5. **User Feedback**: Always provide visual feedback for loading states

---

## Component Locations

- **LoadingContext**: `/src/modules/Manager/contexts/LoadingContext.jsx`
- **SkeletonLoaders**: `/src/components/SkeletonLoaders.jsx`
- **StandardLoaders**: `/src/modules/Manager/Components/Common/StandardLoaders.jsx`

---

## Summary

The unified loading strategy provides:
- ✅ **Clean navigation** with top progress bar only
- ✅ **Better perceived performance** with skeleton loaders
- ✅ **Consistent UX** across all pages
- ✅ **Less intrusive** loading states
- ✅ **Professional appearance** with modern loading patterns


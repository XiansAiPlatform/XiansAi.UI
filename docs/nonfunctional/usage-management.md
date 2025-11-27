## Usage Management UI

### Overview
- The manager portal now exposes token-quota controls in two places:
  - **System Admin → Usage Limits tab** (`AdminDashboard.jsx`).
  - **Tenant Settings → Usage tab** (`Settings.jsx`).
- Both surfaces rely on `useUsageApi` for CRUD operations against `/api/client/usage/*`.
- UI theme matches existing cards/sliders (PageLayout, border tokens, NotificationContext toasts).

### System Admin Tab (Usage Limits)
- Entry point: `src/modules/Manager/Components/Admin/AdminDashboard.jsx` (tab label “Usage Limits”).
- Main component: `TokenUsageManagement.jsx`.
  - Tenant picker (populated via `useTenantsApi.getTenantList()`).
  - `UsageStatsCard` showing current max/used/remaining tokens and reset time.
  - Tenant default limit panel with “Edit Limit” button (opens `UsageLimitForm` inside right slider).
  - User override table with add/edit/delete actions (also uses slider + `UsageLimitForm`).
  - All mutations bubble success/error through `NotificationContext` and refresh on completion.

### Tenant Admin Settings Tab (Usage)
- Entry point: `src/modules/Manager/Components/Settings/Settings.jsx` (tab appended when `useTenant().isAdmin`).
- Component: `TenantUsage.jsx`.
  - Reuses `UsageStatsCard` to show current tenant status.
  - Allows tenant admins to edit their default limit (right slider with `UsageLimitForm`).
  - Overrides are read-only (managed by system admins) but a count is shown if any exist.

### Shared Components & Services
- `UsageStatsCard.jsx`: neutral progress card for both admin/tenant views.
- `UsageLimitForm.jsx`: slider form for tenant limits and user overrides.
- `useUsageApi` (`src/modules/Manager/services/usage-api.js`):
  - `getTenantUsageStatus`
  - `getTenantLimits`
  - `saveTenantLimit`
  - `deleteLimit`
  - (Optional) `getUsageHistory`
- Styled to use existing CSS tokens (`var(--border-color)`, `var(--bg-paper)`) so it blends with other cards.

### Patterns & UX Notes
- All edits use the existing right-slider UX (`useSlider` context) for consistency.
- Toasts use `NotificationContext` (`showSuccess`, `showError`).
- Error states reuse the same typography and messaging as other admin settings.
- Tenant admins only see Usage tab when their role includes `isAdmin` from `useTenant`.
- The Admin tab includes a manual refresh button, but the data auto-refreshes on tab switch and after mutations.



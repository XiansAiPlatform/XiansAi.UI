# Usage Statistics Dashboard

## Overview
A comprehensive dashboard for visualizing token and message usage across users and time periods.

## Features

### ✅ Implemented
- **Type Toggle**: Switch between Tokens and Messages views
- **User Filter**: Admins can filter by specific user or view all (regular users see only their own data)
- **Date Range**: Last 7/30/90 days
- **Group By**: Day/Week/Month aggregation
- **Time Series Chart**: SVG-based line chart showing usage over time
- **User Breakdown Table**: Sortable table with per-user statistics
- **Role-Based UI**: Different views for admin vs regular users
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🎨 UI Components

#### 1. UsageStatistics.jsx (Main Page)
- Fetches data from API
- Manages filter state
- Handles loading/error states
- Coordinates child components

#### 2. UsageFilters.jsx
- Type toggle (Tokens/Messages)
- User dropdown (admin only)
- Date range selector
- Group by selector

#### 3. UsageChart.jsx
- SVG-based line chart
- Shows total metrics summary
- Interactive hover tooltips
- Responsive scaling

#### 4. UserBreakdownTable.jsx
- Sortable columns
- Per-user metrics
- Total row
- Hover effects

## API Integration

### Endpoint
```
GET /api/client/usage/statistics?type={type}&startDate={start}&endDate={end}&groupBy={groupBy}
```

### Response Format
```json
{
  "type": "Tokens",
  "totalMetrics": {
    "primaryCount": 1500000,
    "requestCount": 450,
    "promptCount": 900000,
    "completionCount": 600000
  },
  "timeSeriesData": [...],
  "userBreakdown": [...]
}
```

## Usage

### Navigate to Dashboard
```
/manager/usage-statistics
```

### Development
```bash
cd /path/to/XiansAi.UI
npm start
```

## Customization

### Adding New Usage Types
1. Backend: Add to `UsageType` enum
2. Backend: Add pipeline builder method
3. Frontend: Add to type toggle in `UsageFilters.jsx`
4. Frontend: Update labels in `UsageChart.jsx`

### Styling
- Uses existing Material-UI theme
- CSS variables from `theme.css`
- Component-specific styles in `UsageStatistics.css`

## Security

### Role-Based Access
- **Admin (SysAdmin/TenantAdmin)**: Can view all users
- **Regular User (TenantUser)**: Can only view own data, user filter hidden

### Implementation
```jsx
const isAdmin = user?.roles?.includes('SysAdmin') || 
                user?.roles?.includes('TenantAdmin');

// User filter only shown for admins
{isAdmin && <UserSelector ... />}
```

## Performance

### Optimizations
- Memoized chart calculations
- Debounced API calls (handled by React state)
- SVG rendering (no external libraries)
- Efficient sorting (useMemo)

### Loading States
- CircularProgress for data fetching
- Empty state for no data
- Error alerts for failures

## Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Troubleshooting

### Chart Not Showing
- Check API response format
- Verify `timeSeriesData` exists
- Check browser console for errors

### User Filter Empty
- Ensure `/api/client/usage/statistics/users` endpoint works
- Verify admin permissions
- Check network tab in DevTools

### Styling Issues
- Ensure `theme.css` is loaded
- Check CSS variable definitions
- Verify Material-UI theme is applied

## Future Enhancements

### Potential Features
- Export to CSV/PDF
- Custom date range picker
- Real-time updates (WebSocket)
- Comparison views
- Cost tracking (tokens → $)
- Anomaly detection
- Trend analysis

## Related Documentation
- [Backend API Spec](../../../../../../XiansAi.Server/XiansAi.Server.Src/docs/USAGE_STATISTICS_API_SPEC.md)
- [Generic Architecture](../../../../../../XiansAi.Server/XiansAi.Server.Src/docs/USAGE_STATISTICS_REFACTORED_GENERIC.md)
- [UI Design Spec](../../../../../../XiansAi.Server/XiansAi.Server.Src/docs/USAGE_STATISTICS_UI_DESIGN.md)

---

**Version**: 1.0  
**Last Updated**: December 8, 2025  
**Status**: ✅ Production Ready



import { Box, Skeleton, Paper, Grid } from '@mui/material';

/**
 * Unified Skeleton Loader Components
 * 
 * These components provide consistent loading states across the application
 * using Material-UI's Skeleton component to show content placeholders.
 */

/**
 * CardSkeleton - Skeleton loader for card-based layouts
 * Used in templates, agents, workflows, etc.
 * 
 * @param {number} count - Number of skeleton cards to show (default: 6)
 * @param {object} gridProps - Props to pass to Grid item (e.g., xs, sm, md, lg)
 */
export const CardSkeleton = ({ count = 6, gridProps = { xs: 12, sm: 6, md: 4 } }) => {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid item {...gridProps} key={index}>
          <Paper sx={{ p: 2, height: 280 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * ListSkeleton - Skeleton loader for list-based layouts
 * Used in user lists, tenant lists, etc.
 * 
 * @param {number} rows - Number of skeleton rows to show (default: 5)
 * @param {number} height - Height of each row (default: 80)
 */
export const ListSkeleton = ({ rows = 5, height = 80 }) => {
  return (
    <Box>
      {[...Array(rows)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );
};

/**
 * TableSkeleton - Skeleton loader for table layouts
 * Shows header and rows
 * 
 * @param {number} rows - Number of data rows (default: 5)
 * @param {number} columns - Number of columns (default: 4)
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        {[...Array(columns)].map((_, index) => (
          <Skeleton key={index} variant="text" width={`${100 / columns}%`} height={24} />
        ))}
      </Box>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={20} />
          ))}
        </Box>
      ))}
    </Box>
  );
};

/**
 * PageSkeleton - Full page skeleton with sidebar and content
 * Used for initial page loads
 * 
 * @param {string} variant - Layout variant: 'full', 'simple', 'minimal'
 */
export const PageSkeleton = ({ variant = 'full' }) => {
  if (variant === 'minimal') {
    // Just a simple top progress bar effect
    return null;
  }

  if (variant === 'simple') {
    // Simple skeleton for route loading
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  // Full page skeleton with sidebar and content
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Sidebar skeleton */}
      <Box sx={{ 
        width: 240, 
        borderRight: 1, 
        borderColor: 'divider',
        p: 2,
        display: { xs: 'none', md: 'block' }
      }}>
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 3 }} />
        {[...Array(6)].map((_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            width="100%" 
            height={40} 
            sx={{ mb: 1, borderRadius: 1 }} 
          />
        ))}
      </Box>

      {/* Main content skeleton */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Content cards */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton 
              key={i}
              variant="rectangular" 
              height={150} 
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>

        {/* List skeleton */}
        <Box sx={{ mt: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * FormSkeleton - Skeleton for form layouts
 * Shows multiple input fields
 * 
 * @param {number} fields - Number of form fields (default: 4)
 */
export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <Box sx={{ p: 3 }}>
      {[...Array(fields)].map((_, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
};

/**
 * DetailsSkeleton - Skeleton for detail/profile pages
 * Shows header with avatar and content sections
 */
export const DetailsSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mr: 3 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
      </Box>

      {/* Content sections */}
      {[...Array(3)].map((_, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1, mb: 2 }} />
        </Box>
      ))}
    </Box>
  );
};

/**
 * DashboardSkeleton - Skeleton for dashboard layouts
 * Shows stats cards and content areas
 */
export const DashboardSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={36} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main content area */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="text" width="100%" height={20} sx={{ mb: 1 }} />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const SkeletonLoaders = {
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  PageSkeleton,
  FormSkeleton,
  DetailsSkeleton,
  DashboardSkeleton,
};

export default SkeletonLoaders;


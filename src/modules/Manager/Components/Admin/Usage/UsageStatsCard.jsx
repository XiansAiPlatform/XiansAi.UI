import { Card, CardContent, Typography, LinearProgress, Stack, Chip } from '@mui/material';

const numberFormatter = new Intl.NumberFormat();

const UsageStatsCard = ({ status }) => {
  if (!status) {
    return (
      <Card elevation={0} sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-paper)' }}>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary">
            Select a tenant to view usage details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { maxTokens, tokensUsed, tokensRemaining, windowEndsAt } = status;
  const percentage = maxTokens > 0 ? Math.min(100, Math.round((tokensUsed / maxTokens) * 100)) : 0;
  const resetLabel = windowEndsAt ? new Date(windowEndsAt).toLocaleString() : 'Unknown';

  return (
    <Card elevation={0} sx={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-paper)' }}>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} alignItems="flex-start">
          <Stack spacing={1}>
            <Typography variant="h6">Current Usage</Typography>
            <Typography variant="body2" color="text.secondary">
              {numberFormatter.format(tokensUsed)} / {numberFormatter.format(maxTokens)} tokens used
            </Typography>
          </Stack>
          <Chip
            label={`${numberFormatter.format(tokensRemaining)} tokens remaining`}
            color={tokensRemaining > 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Stack>

        <Stack spacing={1} mt={2}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'var(--border-color)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {percentage}% used
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Window resets {resetLabel}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UsageStatsCard;


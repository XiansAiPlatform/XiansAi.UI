import { Chip } from '@mui/material';
import './StatusChip.css';

const StatusChip = ({ label, status }) => {
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  
  return (
    <Chip
      label={label || 'N/A'}
      className={`status-chip ${normalizedStatus}`}
    />
  );
};

export default StatusChip; 
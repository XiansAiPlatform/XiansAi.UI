import { styled } from '@mui/material/styles';
import { Chip } from '@mui/material';
import './StatusChip.css';

const StatusChip = styled(Chip)(({ status }) => ({
  '&.MuiChip-root': {
    '&.status-chip': {
      // Base styles will be applied from CSS
    }
  },
  [`&.${status?.toLowerCase()}`]: {}
}));

export default function CustomStatusChip(props) {
  return <StatusChip 
    {...props} 
    className={`status-chip ${props.status?.toLowerCase()}`} 
  />;
} 
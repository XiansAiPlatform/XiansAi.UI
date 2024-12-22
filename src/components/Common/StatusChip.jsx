import { styled, keyframes } from '@mui/material/styles';
import { Chip } from '@mui/material';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`;

const StatusChip = styled(Chip)(({ status }) => ({
  '&.MuiChip-root': {
    fontWeight: 500,
    minWidth: '100px',
    justifyContent: 'center',
    ...(status === 'COMPLETED' && {
      backgroundColor: '#a8e6cf', // pastel green
      color: '#2d6a4f'
    }),
    ...(status === 'RUNNING' && {
      backgroundColor: '#b8e0ff', // pastel blue
      color: '#1e4976',
      animation: `${pulse} 1.5s ease-in-out infinite`,
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        animation: `${pulse} 1.5s ease-in-out infinite`
      }
    }),
    ...(status === 'CANCELED' && {
      backgroundColor: '#e9ecef', // pastel gray
      color: '#495057'
    }),
    ...(status === 'TERMINATED' && {
      backgroundColor: '#ffd3d1', // pastel red
      color: '#842029'
    })
  }
}));

export default StatusChip; 
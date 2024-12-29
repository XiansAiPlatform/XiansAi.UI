import React from 'react';
import { Chip } from '@mui/material';
import './StatusChip.css';

const StatusChip = ({ status, label }) => {
  const statusClass = status.toLowerCase();
  
  return (
    <Chip
      label={label}
      className={`status-chip ${statusClass}`}
    />
  );
};

export default StatusChip; 
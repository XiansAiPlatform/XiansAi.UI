import React from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';

const NotImplemented = () => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        color: '#4a5568'
      }}
    >
      <ConstructionIcon 
        sx={{ 
          color: '#667eea',
          marginBottom: '1.5rem',
          fontSize: 64
        }} 
      />
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        marginBottom: '1rem'
      }}>
        Under Construction
      </h1>
      <p style={{
        fontSize: '1.1rem',
        maxWidth: '500px',
        lineHeight: '1.6',
        color: '#718096'
      }}>
        This feature is currently being developed and will be available soon. 
        Check back later for updates!
      </p>
    </div>
  );
};

export default NotImplemented; 
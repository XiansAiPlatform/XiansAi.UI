import React from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useLocation } from 'react-router-dom';
import './NotImplemented.css';

const NotImplemented = () => {
  const location = useLocation();
  const path = location.pathname.slice(1);
  const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="not-implemented">
      <ConstructionIcon className="not-implemented__icon" />
      <h1 className="not-implemented__title">
        {formattedPath} - Under Construction
      </h1>
      <p className="not-implemented__description">
        This feature is currently being developed and will be available soon. 
        Check back later for updates!
      </p>
    </div>
  );
};

export default NotImplemented; 
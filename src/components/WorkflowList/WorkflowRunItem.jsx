import React from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow, formatDistance } from 'date-fns';
import { useAuth0 } from '@auth0/auth0-react';

const WorkflowRunItem = ({ run }) => {
  const { user } = useAuth0();
  const formattedTime = formatDistanceToNow(new Date(run.startTime), { addSuffix: true });
  
  const formatWorkflowType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  const getDuration = () => {
    const startDate = new Date(run.startTime);
    const endDate = run.closeTime ? new Date(run.closeTime) : new Date();
    return formatDistance(startDate, endDate, { includeSeconds: true });
  };

  return (
    <Link 
      to={`/runs/${run.id}`} 
      className="workflow-run-item"
    >
      <div className="run-item-content">
        <div className="run-item-header">
          <div>
            {formatWorkflowType(run.workflowType)}
          </div>
          <StatusChip status={run.status.toLowerCase()} label={run.status} />
        </div>
        
        <div className="run-item-details">
          <div className="run-metadata">
            <span className="run-id">ID: {run.id}</span>
          </div>
          <div className="run-metadata">
            <span className="run-time">Started {formattedTime}</span>
            <span className="metadata-separator">•</span>
            <span className="run-duration">Duration: {getDuration()}</span>
          </div>
          
          {run.owner && (
            <div className="owner-info">
              Owner: <span className={`owner-name ${run.owner === user?.sub ? 'current-user' : ''}`}>
                {run.owner}
                {run.owner === user?.sub && ' (me)'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default WorkflowRunItem; 
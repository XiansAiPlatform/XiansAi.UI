import React from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow, formatDistance } from 'date-fns';

const WorkflowRunItem = ({ run }) => {
  const formattedTime = formatDistanceToNow(new Date(run.startTime), { addSuffix: true });
  
  const getDuration = () => {
    const startDate = new Date(run.startTime);
    const endDate = run.endTime ? new Date(run.endTime) : new Date();
    return formatDistance(startDate, endDate, { includeSeconds: true });
  };

  return (
    <Link 
      to={`/runs/${run.id}`} 
      className="workflow-run-item"
    >
      <div className="run-item-content">
        <div className="run-item-title">
          <div className="workflow-type">{run.workflowType}</div>
          <div className="workflow-id">ID: {run.id}</div>
        </div>
        <div className="run-item-time">
          Started {formattedTime}
          <span className="run-duration"> • Duration: {getDuration()}</span>
        </div>
      </div>
      <StatusChip status={run.status.toLowerCase()} label={run.status} />
    </Link>
  );
};

export default WorkflowRunItem; 
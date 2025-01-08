import React from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow, formatDistance } from 'date-fns';

const WorkflowRunItem = ({ run }) => {
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
        <div className="run-item-title">
          <div className="workflow-type">
            {formatWorkflowType(run.workflowType)}
            <span className="run-time-info text-subtle">
              • Started {formattedTime}
              <span className="run-duration"> • Duration: {getDuration()}</span>
            </span>
          </div>
          <div className="workflow-id">ID: {run.id}</div>
        </div>
      </div>
      <StatusChip status={run.status.toLowerCase()} label={run.status} />
    </Link>
  );
};

export default WorkflowRunItem; 
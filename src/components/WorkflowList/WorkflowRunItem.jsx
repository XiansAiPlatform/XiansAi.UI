import React from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow } from 'date-fns';

const WorkflowRunItem = ({ run }) => {
  const formattedTime = formatDistanceToNow(new Date(run.startTime), { addSuffix: true });

  return (
    <Link 
      to={`/runs/${run.id}`} 
      className="workflow-run-item"
    >
      <div className="run-item-content">
        <div className="run-item-id">{run.id}</div>
        <div className="run-item-time">Started {formattedTime}</div>
      </div>
      <StatusChip status={run.status.toLowerCase()} label={run.status} />
    </Link>
  );
};

export default WorkflowRunItem; 
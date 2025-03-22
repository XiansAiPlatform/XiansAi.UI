import React from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow, formatDistance } from 'date-fns';
import { useAuth0 } from '@auth0/auth0-react';

const WorkflowRunItem = ({ run, isMobile }) => {
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

  // Truncate ID for mobile view
  const displayId = isMobile ? 
    `${run.workflowId.substring(0, 8)}...` : 
    run.workflowId;

  return (
    <Link 
      to={`/runs/${run.workflowId}/${run.runId}`} 
      className="workflow-run-item"
      style={{
        padding: isMobile ? '12px' : '16px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '16px'
      }}
    >
      <div className="run-item-content" style={{ width: isMobile ? '100%' : 'auto' }}>
        <div className="run-item-header" style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: isMobile ? '8px' : '4px'
        }}>
          <div style={{ 
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 500
          }}>
            {formatWorkflowType(run.workflowType)}
          </div>
          <StatusChip 
            status={run.status.toLowerCase()} 
            label={run.status} 
            size={isMobile ? "small" : "medium"}
          />
        </div>
        
        <div className="run-item-details">
          <div className="run-metadata" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px'
          }}>
            <span className="run-id">ID: {displayId}</span>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '4px' : '8px'
            }}>
              <span className="run-time">Started {formattedTime}</span>
              {!isMobile && <span className="metadata-separator">•</span>}
              
              <span className="run-duration">Duration: {getDuration()}</span>
              {!isMobile && run.owner && <span className="metadata-separator">•</span>}
              
              {run.owner && (
                <span className={`owner-name ${run.owner === user?.sub ? 'current-user' : ''}`}>
                  Owner: {isMobile ? (run.owner === user?.sub ? 'me' : run.owner.substring(0, 10) + '...') : run.owner}
                  {!isMobile && run.owner === user?.sub && ' (me)'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkflowRunItem; 
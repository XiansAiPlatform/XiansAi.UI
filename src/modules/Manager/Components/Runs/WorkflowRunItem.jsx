import React from 'react';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow, formatDistance } from 'date-fns';
import { useAuth } from '../../../auth/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const WorkflowRunItem = ({ run, isMobile }) => {
  const { user } = useAuth();
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

  // Helper function to check if run has error in logs
  const hasError = () => {
    if (!run.lastLog) return false;
    return run.lastLog.level === 4;
  };

  const getOwnerDisplay = () => {
    if (!run.permissions?.ownerAccess?.length) return null;
    const owner = run.permissions.ownerAccess[0];
    const isCurrentUser = owner === user?.id;
    
    if (isMobile) {
      return isCurrentUser ? 'me' : owner.substring(0, 10) + '...';
    }
    return `${owner}${isCurrentUser ? ' (me)' : ''}`;
  };

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
          marginBottom: isMobile ? '8px' : '4px',
          minHeight: isMobile ? '24px' : '32px'
        }}>
          <div style={{ 
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {formatWorkflowType(run.workflowType)}
            {hasError() && (
              <ErrorOutlineIcon 
                style={{ 
                  color: '#d32f2f',
                  fontSize: isMobile ? '16px' : '20px'
                }} 
                titleAccess="Error occurred"
              />
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <StatusChip 
              status={run.status.toLowerCase()} 
              label={run.status} 
              size={isMobile ? "small" : "medium"}
            />
          </div>
        </div>
        
        <div className="run-item-details">
          <div className="run-metadata" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '4px' : '8px'
            }}>
              <span className="run-time">Started {formattedTime}</span>
              {!isMobile && <span className="metadata-separator">•</span>}
              
              <span className="run-duration">Duration: {getDuration()}</span>
              {!isMobile && <span className="metadata-separator">•</span>}
              
              <span className="agent-name">Agent: {run.agent}</span>
              {!isMobile && <span className="metadata-separator">•</span>}
              
              {getOwnerDisplay() && (
                <span className={`owner-name ${run.permissions?.ownerAccess?.[0] === user?.id ? 'current-user' : ''}`}>
                  Owner: {getOwnerDisplay()}
                </span>
              )}
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: '400',
              marginTop: '2px'
            }}>
              ID: {run.workflowId}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkflowRunItem; 
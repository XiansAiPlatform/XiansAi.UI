import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import { formatDistanceToNow, formatDistance } from 'date-fns';
import { useAuth } from '../../auth/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const WorkflowRunItem = ({ run, isMobile }) => {
  const { user } = useAuth();
  
  // Safety checks
  if (!run || typeof run !== 'object') {
    console.warn('WorkflowRunItem: Invalid run data received', run);
    return null;
  }

  // Ensure required fields exist with defaults
  const safeRun = {
    startTime: run.startTime || new Date().toISOString(),
    workflowType: run.workflowType || 'Unknown Workflow',
    status: run.status || 'Unknown',
    workflowId: run.workflowId || 'unknown-id',
    runId: run.runId || 'unknown-run-id',
    closeTime: run.closeTime,
    owner: run.owner,
    lastLog: run.lastLog,
    ...run
  };

  const formattedTime = formatDistanceToNow(new Date(safeRun.startTime), { addSuffix: true });
  

  const getDuration = () => {
    const startDate = new Date(safeRun.startTime);
    const endDate = safeRun.closeTime ? new Date(safeRun.closeTime) : new Date();
    return formatDistance(startDate, endDate, { includeSeconds: true });
  };

  // Helper function to check if run has error in logs
  const hasError = () => {
    if (!safeRun.lastLog) return false;
    return safeRun.lastLog.level === 4;
  };

  const getOwnerDisplay = () => {
    if (!safeRun.owner) return null;
    const isCurrentUser = safeRun.owner === user?.id;
    
    if (isMobile) {
      return isCurrentUser ? 'me' : safeRun.owner.substring(0, 10) + '...';
    }
    return `${safeRun.owner}${isCurrentUser ? ' (me)' : ''}`;
  };

  const formatCreatedBy = (createdBy) => {
    if (!createdBy) return createdBy;
    // Remove provider prefix (e.g., "github|")
    return createdBy.includes('|') ? createdBy.split('|')[1] : createdBy;
  };

  return (
    <Link 
      to={`/manager/runs/${safeRun.workflowId}/${safeRun.runId}`} 
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
            {safeRun.workflowId}
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
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <StatusChip 
              status={safeRun.status.toLowerCase()} 
              label={safeRun.status} 
              size={isMobile ? "small" : "medium"}
            />
          </div>
        </div>
        
        <div className="run-item-details">
          <div className="run-metadata" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px'
          }}>
            {/* First row: Basic metadata */}
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
              
              {getOwnerDisplay() && (
                <span className={`owner-name ${safeRun.owner === user?.id ? 'current-user' : ''}`}>
                  Owner: {formatCreatedBy(getOwnerDisplay())}
                </span>
              )}
            </div>

                        
            {/* Third row: Workflow ID */}
            <div style={{ 
              fontSize: '12px', 
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: '400',
              marginTop: '2px'
            }}>
              Flow Type: {safeRun.workflowType}
            </div>
            
            {/* Second row: Last log message */}
            {safeRun.lastLog?.message && (
              <div style={{
                width: '100%',
                marginTop: '2px'
              }}>
                <span className={`last-message ${hasError() ? 'error' : ''}`} style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: hasError() ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)',
                  fontStyle: 'italic',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  backgroundColor: hasError() ? 'rgba(211, 47, 47, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  borderLeft: hasError() ? '3px solid #d32f2f' : '3px solid rgba(0, 0, 0, 0.2)'
                }}>
                  Last Log: {safeRun.lastLog.message}
                </span>
              </div>
            )}

          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkflowRunItem; 

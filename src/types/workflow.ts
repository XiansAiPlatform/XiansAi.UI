export interface WorkflowRun {
  id: string;
  workflowType: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startTime: string;
  endTime?: string;
}

export interface ActivityEvent {
  id: string;
  workflowRunId: string;
  type: string;
  timestamp: string;
  details: any;
} 
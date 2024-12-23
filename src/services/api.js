const API_BASE_URL = 'http://localhost:5257';

export const fetchWorkflowRuns = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workflows`);
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows (${response.status}): ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(`Unable to load workflows: ${error.message}`);
  }
};

export const fetchActivityEvents = async (workflowId) => {
  try {
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }
    const response = await fetch(`${API_BASE_URL}/api/workflows/${workflowId}/events`);
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow events (${response.status}): ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(`Unable to load workflow events: ${error.message}`);
  }
};

export const executeWorkflowCancelAction = async (workflowId, force = false) => {
  try {
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }
    
    const response = await fetch(
      `${API_BASE_URL}/api/workflows/${workflowId}/cancel?force=${force}`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to execute workflow cancel action (${response.status}): ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}; 
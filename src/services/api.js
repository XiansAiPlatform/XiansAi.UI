const API_BASE_URL = 'http://localhost:5257';

export const fetchWorkflowRuns = async () => {
  const response = await fetch(`${API_BASE_URL}/api/workflows`);
  return response.json();
};

export const fetchActivityEvents = async (workflowId) => {
  const response = await fetch(`${API_BASE_URL}/api/workflows/${workflowId}/events`);
  return response.json();
}; 
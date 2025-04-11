import { useMemo } from 'react';
import { useApiClient, getTimeRangeParams } from './api-client';


export const useWorkflowApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getWorkflow: async (workflowId, runId) => {
        try {
          return await apiClient.get(`/api/client/workflows/${workflowId}/${runId}`);
        } catch (error) {
          console.error('Failed to fetch workflow:', error);
          throw error;
        }
      },
      
      fetchWorkflowRuns: async (timeFilter = '7days', ownerFilter = 'all', statusFilter = 'all') => {
        try {
          const { startTime, endTime } = getTimeRangeParams(timeFilter);
          const queryParams = {};
          
          if (startTime) {
            queryParams.startTime = startTime;
            queryParams.endTime = endTime;
          }
          
          if (ownerFilter === 'mine') {
            queryParams.owner = 'current';
          }
          
          if (statusFilter !== 'all') {
            queryParams.status = statusFilter;
          }

          return await apiClient.get('/api/client/workflows', queryParams);
        } catch (error) {
          console.error('Failed to fetch workflows:', error);
          throw error;
        }
      },

      fetchActivityEvents: async (workflowId) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          return await apiClient.get(`/api/client/workflows/${workflowId}/events`);
        } catch (error) {
          console.error('Failed to fetch workflow events:', error);
          throw error;
        }
      },

      executeWorkflowCancelAction: async (workflowId, force = false) => {
        try {
          return await apiClient.post(`/api/client/workflows/${workflowId}/cancel?force=${force}`);
        } catch (error) {
          console.error('Failed to execute workflow cancel action:', error);
          throw error;
        }
      },

      startNewWorkflow: async (workflowType, agentName, parameters, flowId = null, queueName = null) => {
        try {
          return await apiClient.post('/api/client/workflows', {
            WorkflowType: workflowType,
            AgentName: agentName,
            Parameters: parameters,
            WorkflowId: flowId,
            QueueName: queueName
          });
        } catch (error) {
          console.error('Failed to start workflow:', error);
          throw error;
        }
      },

      streamActivityEvents: async (workflowId, onEventReceived) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          await apiClient.stream(`/api/client/workflows/${workflowId}/events/stream`, onEventReceived);
        } catch (error) {
          console.error('Failed to establish event stream:', error);
          throw error;
        }
      },

      getWorkflows: async (status = null) => {
        try {
          // TODO: Adjust endpoint/params if needed for specific status
          // const response = await apiClient.get('/api/client/workflows', { params: { status } });
          // return response.data || []; // Adjust based on actual API response structure

          // Mock Implementation:
          console.log("Mock fetching workflows");
          await new Promise(resolve => setTimeout(resolve, 300));
          return [
            { id: 'wf_123', name: 'Order Processing WF' },
            { id: 'wf_456', name: 'Customer Onboarding' },
            { id: 'wf_789', name: 'Notification Workflow' },
          ];
        } catch (error) {
          console.error('Error fetching workflows:', error);
          throw error;
        }
      },

      getRunningWorkflows: async () => {
        try {
          // TODO: Adjust endpoint/params if needed for specifically 'running' status
          // and ensure agentName and workflowType are returned.
          // const response = await apiClient.get('/api/client/workflows', { params: { status: 'RUNNING' } });
          // return response.data || []; 

          // Mock Implementation with Agent Name and Workflow Type:
          console.log("Mock fetching running workflows with details");
          await new Promise(resolve => setTimeout(resolve, 400));
          return [
            { agentName: 'BillingAgent', workflowType: 'InvoiceProcessing', id: 'wf_inv_123', name: 'Process INV-001' },
            { agentName: 'BillingAgent', workflowType: 'InvoiceProcessing', id: 'wf_inv_124', name: 'Process INV-002' },
            { agentName: 'BillingAgent', workflowType: 'PaymentReminder', id: 'wf_pay_456', name: 'Remind CUST-A' },
            { agentName: 'OnboardingAgent', workflowType: 'NewCustomerSetup', id: 'wf_onb_789', name: 'Setup CUST-X' },
            { agentName: 'OnboardingAgent', workflowType: 'NewCustomerSetup', id: 'wf_onb_790', name: 'Setup CUST-Y' },
            { agentName: 'NotificationAgent', workflowType: 'EmailAlert', id: 'wf_not_101', name: 'Alert User Z' },
          ];
        } catch (error) {
          console.error('Error fetching running workflows:', error);
          throw error;
        }
      },

      getWorkflow: async (id) => {
        try {
          // TODO: Adjust endpoint if needed
          // const response = await apiClient.get(`/api/client/workflows/${id}`);
          // return response.data; // Adjust based on actual API response structure

          // Mock Implementation:
          console.log(`Mock fetching workflow ${id}`);
          await new Promise(resolve => setTimeout(resolve, 300));
          return { id, name: 'Mock Workflow' };
        } catch (error) {
          console.error(`Error fetching workflow ${id}:`, error);
          throw error;
        }
      },

      createWorkflow: async (workflowData) => {
        try {
          // TODO: Adjust endpoint and request body structure if needed
          // const response = await apiClient.post('/api/client/workflows', workflowData);
          // return response.data; // Adjust based on actual API response structure

          // Mock Implementation:
          console.log("Mock creating workflow", workflowData);
          await new Promise(resolve => setTimeout(resolve, 500));
          return { id: `wf_mock_${Date.now()}`, name: workflowData.name };
        } catch (error) {
          console.error('Error creating workflow:', error);
          throw error;
        }
      },

      executeWorkflow: async (id, input) => {
        try {
          // TODO: Adjust endpoint and request body structure if needed
          // const response = await apiClient.post(`/api/client/workflows/${id}/execute`, input);
          // return response.data; // Adjust based on actual API response structure

          // Mock Implementation:
          console.log(`Mock executing workflow ${id}`, input);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { id: `run_mock_${Date.now()}`, status: 'COMPLETED' };
        } catch (error) {
          console.error(`Error executing workflow ${id}:`, error);
          throw error;
        }
      },

      getWorkflowRun: async (runId) => {
        try {
          // TODO: Adjust endpoint if needed
          // const response = await apiClient.get(`/api/client/workflows/runs/${runId}`);
          // return response.data; // Adjust based on actual API response structure

          // Mock Implementation:
          console.log(`Mock fetching workflow run ${runId}`);
          await new Promise(resolve => setTimeout(resolve, 300));
          return { id: runId, status: 'COMPLETED', output: { result: 'Success' } };
        } catch (error) {
          console.error(`Error fetching workflow run ${runId}:`, error);
          throw error;
        }
      },

      sendSignal: async (workflowId, signalName, payload) => {
        try {
          // TODO: Verify endpoint and request body structure from API docs
          // await apiClient.post(`/api/client/workflows/${workflowId}/signal/${signalName}`, payload);
          // console.log(`Signal '${signalName}' sent to workflow ${workflowId}`);

          // Mock Implementation:
          console.log(`Mock sending signal '${signalName}' to ${workflowId}`, payload);
           await new Promise(resolve => setTimeout(resolve, 500));
           return { success: true };
        } catch (error) {
          console.error(`Error sending signal ${signalName} to workflow ${workflowId}:`, error);
          throw error;
        }
      },

      registerWebhook: async (workflowId, url, eventName = null) => {
          try {
              // TODO: Verify endpoint and request body structure from API docs
              const body = { url, eventName: eventName || undefined }; // Only include eventName if provided
              // const response = await apiClient.post(`/api/client/workflows/${workflowId}/webhooks`, body);
              // return response.data; // Assuming API returns the created webhook object { id, url, eventName }

              // Mock Implementation:
              console.log(`Mock registering webhook for ${workflowId}: URL=${url}, Event=${eventName}`);
              await new Promise(resolve => setTimeout(resolve, 500));
              return { id: `wh_mock_${Date.now()}`, url, eventName: eventName || 'DefaultMockEvent' };
          } catch (error) {
              console.error(`Error registering webhook for workflow ${workflowId}:`, error);
              throw error;
          }
      },

      getWebhooks: async (workflowId) => {
          try {
              // TODO: Verify endpoint from API docs
              // const response = await apiClient.get(`/api/client/workflows/${workflowId}/webhooks`);
              // return response.data || []; // Assuming API returns an array of webhook objects

               // Mock Implementation:
              console.log(`Mock fetching webhooks for ${workflowId}`);
              await new Promise(resolve => setTimeout(resolve, 300));
              return [
                  { id: 'wh_mock_abc', url: 'https://mock.example.com/hook1', eventName: 'SignalReceived' },
                  { id: 'wh_mock_def', url: 'https://mock.myservice.com/callback', eventName: 'WorkflowCompleted' },
              ];
          } catch (error) {
              console.error(`Error fetching webhooks for workflow ${workflowId}:`, error);
              throw error;
          }
      },

      deleteWebhook: async (workflowId, webhookId) => {
        try {
            // TODO: Verify endpoint from API docs
            // await apiClient.delete(`/api/client/workflows/${workflowId}/webhooks/${webhookId}`);
            // console.log(`Webhook ${webhookId} deleted for workflow ${workflowId}`);

             // Mock Implementation:
            console.log(`Mock deleting webhook ${webhookId} for ${workflowId}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            return { success: true };
        } catch (error) {
            console.error(`Error deleting webhook ${webhookId} for workflow ${workflowId}:`, error);
            throw error;
        }
      },

      getWorkflowMessages: async (workflowId, type = 'all') => {
        try {
            // TODO: Determine the correct endpoint and params from API docs.
            // This might involve querying execution history, signals, or specific events.
            // Example: const response = await apiClient.get(`/api/client/workflows/${workflowId}/history`, { params: { eventType: 'signal' } });
            // return response.data || [];

            // Mock Implementation:
            console.log(`Mock fetching ${type} messages for ${workflowId}`);
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockInbound = [
                { id: 'msg_in_1', type: 'signal', name: 'UserInfoUpdate', timestamp: new Date(Date.now() - 180000).toISOString(), payload: { userId: 'user1', email: 'test@example.com'} },
                { id: 'msg_in_2', type: 'signal', name: 'ProcessOrder', timestamp: new Date(Date.now() - 60000).toISOString(), payload: { orderId: 'order456'} },
            ];
            const mockOutbound = [
                { id: 'msg_out_1', type: 'webhook', url: 'https://myservice.com/callback', eventName: 'WorkflowCompleted', timestamp: new Date(Date.now() - 120000).toISOString(), payload: { result: 'Success' } },
                { id: 'msg_out_2', type: 'webhook', url: 'https://anotherservice.com/update', eventName: 'StatusUpdate', timestamp: new Date().toISOString(), payload: { status: 'Processing' } },
            ];

            let messages = [];
            if (type === 'inbound') {
                messages = mockInbound;
            } else if (type === 'outbound') {
                messages = mockOutbound;
            } else { // type === 'all'
                messages = [...mockInbound, ...mockOutbound];
            }

            // Sort messages chronologically
            messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            return messages;
        } catch (error) {
            console.error(`Error fetching ${type} messages for workflow ${workflowId}:`, error);
            throw error;
        }
      },


    };
  }, [apiClient]);
};


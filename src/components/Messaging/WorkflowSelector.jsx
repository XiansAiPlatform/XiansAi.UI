import React from 'react';
import {
    Grid,
    TextField,
    Autocomplete,
    CircularProgress,
    Box,
    Typography
} from '@mui/material';

const WorkflowSelector = ({
    agentNames,
    selectedAgentName,
    onAgentChange,
    workflowTypes,
    selectedWorkflowType,
    onTypeChange,
    workflowIds,
    selectedWorkflowId,
    onIdChange,
    isLoadingWorkflows,
    isLoadingWorkflowIds
}) => {

    const selectedWorkflow = Array.isArray(workflowIds) 
        ? workflowIds.find(wf => wf.workflowId === selectedWorkflowId) || null 
        : null;

    const filterWorkflowIds = (options, { inputValue }) => {
        if (!inputValue) return options;
        
        const lowercaseInput = inputValue.toLowerCase();
        return options.filter(option => {
            // Match by workflowId
            if (option.workflowId && option.workflowId.toLowerCase().includes(lowercaseInput))
                return true;
                
            // Match by start time
            if (option.startTime) {
                const dateStr = new Date(option.startTime).toLocaleString().toLowerCase();
                if (dateStr.includes(lowercaseInput))
                    return true;
            }
            
            // Match by agent name or workflow type (fallback) - though less likely needed here
            return (
                (option.agent && option.agent.toLowerCase().includes(lowercaseInput)) ||
                (option.workflowType && option.workflowType.toLowerCase().includes(lowercaseInput))
            );
        });
    };

    return (
        <>
            {/* First row: Agent Name and Workflow Type */}
             <Grid container spacing={2} sx={{ mb: selectedAgentName && selectedWorkflowType ? 1 : 3 }} alignItems="center">
                 {/* Agent Name Selector */}
                 <Grid item xs={12} sm={6}>
                     <Autocomplete
                         id="agent-select"
                         options={agentNames}
                         value={selectedAgentName}
                         onChange={(event, newValue) => onAgentChange(newValue)}
                         renderOption={(props, option) => (
                             <li {...props}>
                                 <Box sx={{ 
                                     display: 'flex', 
                                     flexDirection: 'column',
                                     width: '100%',
                                     py: 0.5
                                 }}>
                                     <Typography variant="body1" fontWeight="medium">
                                         {option}
                                     </Typography>
                                 </Box>
                             </li>
                         )}
                         renderInput={(params) => (
                             <TextField 
                                 {...params} 
                                 label="Agent Name" 
                                 variant="outlined"
                                 InputProps={{
                                     ...params.InputProps,
                                     endAdornment: (
                                         <>
                                             {isLoadingWorkflows && <CircularProgress size={20} />}
                                             {params.InputProps.endAdornment}
                                         </>
                                     ),
                                 }}
                             />
                         )}
                         disabled={isLoadingWorkflows || agentNames.length === 0}
                         fullWidth
                     />
                 </Grid>
 
                 {/* Workflow Type Selector */}
                 <Grid item xs={12} sm={6}>
                     <Autocomplete
                         id="type-select"
                         options={workflowTypes}
                         value={selectedWorkflowType}
                         onChange={(event, newValue) => onTypeChange(newValue)}
                         renderOption={(props, option) => (
                             <li {...props}>
                                 <Box sx={{ 
                                     display: 'flex', 
                                     flexDirection: 'column',
                                     width: '100%',
                                     py: 0.5
                                 }}>
                                     <Typography variant="body1" fontWeight="medium">
                                         {option}
                                     </Typography>
                                 </Box>
                             </li>
                         )}
                         renderInput={(params) => (
                             <TextField 
                                 {...params} 
                                 label="Workflow Type" 
                                 variant="outlined"
                             />
                         )}
                         disabled={!selectedAgentName}
                         fullWidth
                     />
                 </Grid>
             </Grid>
 
             {/* Second row: Workflow Instance (only shown when both Agent and Type are selected) */}
             {selectedAgentName && selectedWorkflowType && (
                 <Grid container spacing={2} sx={{ mt: 1, mb: 5 }} alignItems="center">
                     {/* Workflow Instance Selector */}
                     <Grid item xs={12}>
                         <Autocomplete
                             id="id-select"
                             options={Array.isArray(workflowIds) ? workflowIds : []}
                             value={selectedWorkflow}
                             onChange={(event, newValue) => onIdChange(newValue)}
                             getOptionLabel={(option) => option?.workflowId || ''}
                             filterOptions={filterWorkflowIds}
                             renderOption={(props, option) => (
                                 <li {...props} style={{ padding: '8px 16px' }}>
                                     <Box sx={{ 
                                         display: 'flex', 
                                         flexDirection: 'column', 
                                         width: '100%',
                                         borderLeft: '4px solid',
                                         borderColor: 'primary.main',
                                         pl: 1,
                                         py: 0.5
                                     }}>
                                         <Typography variant="subtitle1" fontWeight="bold">
                                             {option.agent || 'Unnamed Agent'}
                                         </Typography>
                                         <Typography variant="body2" color="text.secondary">
                                             {option.workflowType || 'Unknown Type'} • ID: {option.workflowId?.split(':').pop() || 'N/A'}
                                         </Typography>
                                         <Box sx={{ 
                                             display: 'flex', 
                                             justifyContent: 'space-between', 
                                             mt: 0.5,
                                             alignItems: 'center'
                                         }}>
                                             <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                 <Box component="span" sx={{ 
                                                     width: 8, 
                                                     height: 8, 
                                                     borderRadius: '50%', 
                                                     bgcolor: 'success.main',
                                                     display: 'inline-block',
                                                     mr: 0.5
                                                 }}/>
                                                 Started: {option.startTime ? new Date(option.startTime).toLocaleString() : 'Unknown'}
                                             </Typography>
                                             <Typography variant="caption" sx={{ 
                                                 color: 'grey.700',
                                                 bgcolor: 'grey.100',
                                                 px: 1,
                                                 py: 0.5,
                                                 borderRadius: 1,
                                                 fontFamily: 'monospace'
                                             }}>
                                                 {option.runId?.substring(0, 8) || 'N/A'}
                                             </Typography>
                                         </Box>
                                     </Box>
                                 </li>
                             )}
                             renderInput={(params) => (
                                 <TextField 
                                     {...params} 
                                     label="Running Workflow Instance" 
                                     variant="outlined"
                                     placeholder="Search by ID or start time..."
                                     InputProps={{
                                         ...params.InputProps,
                                         endAdornment: (
                                             <>
                                                 {isLoadingWorkflowIds && <CircularProgress size={20} />}
                                                 {params.InputProps.endAdornment}
                                             </>
                                         ),
                                     }}
                                 />
                             )}
                             disabled={!selectedWorkflowType || isLoadingWorkflowIds}
                             fullWidth
                             ListboxProps={{
                                 style: {
                                     maxHeight: '350px'
                                 }
                             }}
                         />
                     </Grid>
                 </Grid>
             )}
        </>
    );
};

export default WorkflowSelector; 
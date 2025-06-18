import CollapsedProcessPanel from './CollapsedProcessPanel';
import FullProcessPanel from './FullProcessPanel';

const ProcessPanel = ({ selectedAgent, currentProcess, historicalProcesses = [], onToggleVisibility, collapsed = false }) => {
  // Return the appropriate panel based on collapsed state
  return collapsed 
    ? <CollapsedProcessPanel 
        currentProcess={currentProcess} 
        historicalProcesses={historicalProcesses} 
        onToggleVisibility={onToggleVisibility} 
      /> 
    : <FullProcessPanel 
        selectedAgent={selectedAgent} 
        currentProcess={currentProcess} 
        historicalProcesses={historicalProcesses} 
        onToggleVisibility={onToggleVisibility} 
      />;
};

export default ProcessPanel; 
// Mock data for ERP agents
export const mockAgents = [
  { 
    id: 'a1', 
    name: 'Order Agent', 
    description: 'Manage sales orders, tracking, and fulfillment processes.', 
    avatarColor: '#E0F2FE', // Pastel blue
    iconColor: '#7DD3FC',   // Lighter blue for icon
    prompts: [
      "Show me all pending orders from the last week",
      "Create a new sales order for customer ABC Corp",
      "What's the status of order #ORD-12345?"
    ]
  },
  { 
    id: 'a2', 
    name: 'Finance Agent', 
    description: 'Handle financial transactions, reporting, and analysis.', 
    avatarColor: '#DCFCE7', // Pastel green
    iconColor: '#86EFAC',   // Lighter green for icon
    prompts: [
      "Generate a profit and loss statement for Q2",
      "Show outstanding invoices for customer XYZ Ltd",
      "What are our current accounts receivable metrics?"
    ]
  },
  { 
    id: 'a3', 
    name: 'Inventory Agent', 
    description: 'Track inventory levels and manage stock operations.', 
    avatarColor: '#FEF3C7', // Pastel yellow
    iconColor: '#FDE68A',   // Lighter yellow for icon
    prompts: [
      "Show current stock levels for all warehouse locations",
      "Identify products nearing reorder point",
      "Generate a stock movement report for the last month"
    ]
  },
  { 
    id: 'a4', 
    name: 'HR Agent', 
    description: 'Assist with employee management and HR processes.', 
    avatarColor: '#FECDD3', // Pastel red/pink
    iconColor: '#FDA4AF',   // Lighter pink for icon
    prompts: [
      "Process a new employee onboarding request",
      "Show employee attendance records for Department A",
      "Generate a payroll summary for the current period"
    ]
  },
  { 
    id: 'a5', 
    name: 'Procurement Agent', 
    description: 'Manage purchasing processes and supplier relationships.', 
    avatarColor: '#E9D5FF', // Pastel purple
    iconColor: '#D8B4FE',   // Lighter purple for icon
    prompts: [
      "Create a purchase order for supplier ABC Inc",
      "Show all pending purchase requisitions",
      "What's our spending with vendor XYZ for this quarter?"
    ]
  },
];

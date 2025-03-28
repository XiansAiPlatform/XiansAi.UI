export const tableStyles = {
  container: {
    p: 'var(--spacing-md)',
    maxWidth: '100%'
  },
  tableContainer: {
    boxShadow: 'none',
    borderRadius: 'var(--radius-lg)',
    overflowX: 'auto',
    '& .MuiTable-root': {
      borderCollapse: 'separate',
      borderSpacing: 0
    }
  },
  nestedTable: {
    backgroundColor: 'var(--bg-overlay)',
    borderRadius: 'var(--radius-sm)',
    '& td, & th': { borderBottom: '1px solid var(--border-color)' }
  },
  codeBlock: {
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'var(--bg-hover)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-sm)',
  }
}; 
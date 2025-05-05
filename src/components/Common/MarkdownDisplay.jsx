import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box } from '@mui/material';

const MarkdownDisplay = ({ content }) => {
  return (
    <Box 
      sx={{
        '& pre': {
          backgroundColor: 'background.paper',
          borderRadius: 'var(--radius-sm)',
          padding: 2,
          overflow: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          border: '1px solid',
          borderColor: 'divider',
        },
        '& code': {
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          padding: '0.2em 0.4em',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'background.paper',
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 'var(--radius-md)',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontWeight: 'var(--font-weight-semibold)',
          margin: '1em 0 0.5em',
          color: 'text.primary',
        },
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& p': {
          marginBottom: '1em',
          lineHeight: 1.6,
        },
        '& ul, & ol': {
          paddingLeft: 3,
          marginBottom: '1em',
        },
        '& li': {
          marginBottom: '0.5em',
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'divider',
          paddingLeft: 2,
          fontStyle: 'italic',
          marginLeft: 0,
          marginRight: 0,
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          marginBottom: '1em',
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'divider',
          padding: '0.5em',
        },
        '& th': {
          backgroundColor: 'background.paper',
          fontWeight: 'var(--font-weight-semibold)',
        },
      }}
    >
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownDisplay; 
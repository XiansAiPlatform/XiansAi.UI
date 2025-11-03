import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, useTheme } from '@mui/material';

/**
 * Component for rendering markdown content with support for tables, code blocks, and other markdown features
 * 
 * @param {Object} props
 * @param {string} props.content - The markdown content to render
 */
const MarkdownRenderer = ({ content }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                '& p': {
                    margin: '0.5em 0',
                    lineHeight: 1.6,
                    '&:first-of-type': {
                        marginTop: 0,
                    },
                    '&:last-child': {
                        marginBottom: 0,
                    },
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                    marginTop: '1em',
                    marginBottom: '0.5em',
                    fontWeight: 600,
                    lineHeight: 1.25,
                    color: theme.palette.text.primary,
                },
                '& h1': { fontSize: '1.75rem' },
                '& h2': { fontSize: '1.5rem' },
                '& h3': { fontSize: '1.25rem' },
                '& h4': { fontSize: '1.1rem' },
                '& h5': { fontSize: '1rem' },
                '& h6': { fontSize: '0.9rem' },
                '& ul, & ol': {
                    marginTop: '0.5em',
                    marginBottom: '0.5em',
                    paddingLeft: '1.5em',
                },
                '& li': {
                    marginTop: '0.25em',
                    marginBottom: '0.25em',
                },
                '& code': {
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.error.dark,
                    padding: '0.2em 0.4em',
                    borderRadius: '3px',
                    fontSize: '0.9em',
                    fontFamily: '"Fira Code", "Courier New", monospace',
                },
                '& pre': {
                    margin: '1em 0',
                    borderRadius: '5px',
                    overflow: 'hidden',
                },
                '& pre code': {
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    padding: 0,
                },
                '& blockquote': {
                    borderLeft: `4px solid ${theme.palette.grey[300]}`,
                    paddingLeft: '1em',
                    marginLeft: 0,
                    marginRight: 0,
                    color: theme.palette.text.secondary,
                    fontStyle: 'italic',
                },
                '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    marginTop: '1em',
                    marginBottom: '1em',
                    fontSize: '0.9em',
                    border: `1px solid ${theme.palette.grey[300]}`,
                },
                '& thead': {
                    backgroundColor: theme.palette.grey[100],
                },
                '& th': {
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: `2px solid ${theme.palette.grey[400]}`,
                    borderRight: `1px solid ${theme.palette.grey[300]}`,
                    color: theme.palette.text.primary,
                    '&:last-child': {
                        borderRight: 'none',
                    },
                },
                '& td': {
                    padding: '8px 12px',
                    borderBottom: `1px solid ${theme.palette.grey[200]}`,
                    borderRight: `1px solid ${theme.palette.grey[200]}`,
                    '&:last-child': {
                        borderRight: 'none',
                    },
                },
                '& tbody tr': {
                    '&:hover': {
                        backgroundColor: theme.palette.grey[50],
                    },
                    '&:last-child td': {
                        borderBottom: 'none',
                    },
                },
                '& a': {
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                },
                '& hr': {
                    border: 'none',
                    borderTop: `1px solid ${theme.palette.grey[300]}`,
                    margin: '1.5em 0',
                },
                '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '5px',
                    marginTop: '0.5em',
                    marginBottom: '0.5em',
                },
            }}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </Box>
    );
};

export default MarkdownRenderer;


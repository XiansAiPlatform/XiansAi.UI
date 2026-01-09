import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
  Card,
  CardContent,
  Paper,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { useDocumentsApi } from '../../services';
import { useAgentsApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useSlider } from '../../contexts/SliderContext';
import { handleApiError } from '../../utils/errorHandler';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';
import DocumentDetails from './DocumentDetails';

const DataDocuments = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const isMobile = useMediaQuery('(max-width:768px)');
  const { setLoading, isLoading } = useLoading();
  const { showError } = useNotification();
  const { openSlider, closeSlider } = useSlider();
  const documentsApi = useDocumentsApi();
  const agentsApi = useAgentsApi();

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agentsApi.getAllAgents();
      // Ensure data is always an array
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      const errorMessage = handleApiError(error, 'loading agents');
      setError(errorMessage);
      showError(errorMessage);
      setAgents([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [agentsApi, setLoading, showError]);

  const loadDocumentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentsApi.getDocumentTypesByAgent(selectedAgent);
      // Ensure data is always an array
      setDocumentTypes(Array.isArray(data) ? data : []);
      setSelectedDocumentType('');
    } catch (error) {
      console.error('Failed to load document types:', error);
      const errorMessage = handleApiError(error, 'loading document types');
      setError(errorMessage);
      showError(errorMessage);
      setDocumentTypes([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [documentsApi, selectedAgent, setLoading, showError]);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentsApi.getDocumentsByAgentAndType(
        selectedAgent,
        selectedDocumentType,
        0,
        1000 // Load all documents for now
      );
      
      console.log('Documents API Response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Handle different response formats
      let documentArray = [];
      if (Array.isArray(data)) {
        documentArray = data;
      } else if (data && typeof data === 'object') {
        // Check for common response wrapper patterns
        if (Array.isArray(data.documents)) {
          documentArray = data.documents;
        } else if (Array.isArray(data.items)) {
          documentArray = data.items;
        } else if (Array.isArray(data.data)) {
          documentArray = data.data;
        } else if (Array.isArray(data.results)) {
          documentArray = data.results;
        } else {
          console.warn('Unexpected response format:', data);
        }
      }
      
      console.log('Final document array:', documentArray);
      setDocuments(documentArray);
    } catch (error) {
      console.error('Failed to load documents:', error);
      const errorMessage = handleApiError(error, 'loading documents');
      setError(errorMessage);
      showError(errorMessage);
      setDocuments([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [documentsApi, selectedAgent, selectedDocumentType, setLoading, showError]);

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Load document types when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      loadDocumentTypes();
    } else {
      setDocumentTypes([]);
      setSelectedDocumentType('');
      setDocuments([]);
    }
  }, [selectedAgent, loadDocumentTypes]);

  // Load documents when document type is selected
  useEffect(() => {
    if (selectedAgent && selectedDocumentType) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedAgent, selectedDocumentType, loadDocuments]);

  const handleDocumentClick = (document) => {
    openSlider(
      <DocumentDetails
        document={document}
        onClose={closeSlider}
        onUpdate={loadDocuments}
        onDelete={(deletedDoc) => {
          setDocuments(prev => prev.filter(d => d.id !== deletedDoc.id));
        }}
      />,
      document.key || document.id
    );
  };

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        doc.id?.toLowerCase().includes(searchLower) ||
        doc.key?.toLowerCase().includes(searchLower) ||
        doc.type?.toLowerCase().includes(searchLower) ||
        (typeof doc.content === 'string' && doc.content.toLowerCase().includes(searchLower)) ||
        JSON.stringify(doc.content || {}).toLowerCase().includes(searchLower) ||
        JSON.stringify(doc.metadata || {}).toLowerCase().includes(searchLower) ||
        JSON.stringify(doc.data || {}).toLowerCase().includes(searchLower)
      );
    });
  }, [documents, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAgent, selectedDocumentType]);

  // Handle edge case where current page is beyond available pages after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const renderDocumentItem = (document, index) => {
    return (
      <Card
        key={document.id}
        elevation={0}
        className="document-card"
        onClick={() => handleDocumentClick(document)}
        sx={{
          border: 'none',
          borderRadius: 'var(--radius-md)',
          borderTop: index === 0 ? 'none' : '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-paper)',
          margin: '4px 0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
            transform: 'translateX(4px)',
            boxShadow: 'var(--shadow-sm)'
          }
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Icon */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '50%',
              p: '8px',
              boxShadow: '0 0 0 1px var(--border-light)',
              flexShrink: 0
            }}>
              <DescriptionIcon sx={{ 
                width: 24, 
                height: 24,
                color: 'var(--primary-color)'
              }} />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.938rem' }}>
                  {document.key || document.id}
                </Typography>
                <Chip
                  label={document.type}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.688rem',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {document.key && document.key !== document.id && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    ID: {document.id}
                  </Typography>
                )}
                {document.createdAt && (
                  <Typography variant="caption" color="text.secondary">
                    Created {formatTimeAgo(document.createdAt)}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* View indicator */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              flexShrink: 0
            }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                View →
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const headerActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {isMobile ? (
        <IconButton
          onClick={selectedDocumentType ? loadDocuments : selectedAgent ? loadDocumentTypes : loadAgents}
          disabled={isLoading}
          size="medium"
          sx={{
            backgroundColor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
            }
          }}
        >
          <RefreshIcon className={isLoading ? 'spin-icon' : ''} />
        </IconButton>
      ) : (
        <Button
          onClick={selectedDocumentType ? loadDocuments : selectedAgent ? loadDocumentTypes : loadAgents}
          disabled={isLoading}
          className={`button-refresh ${isLoading ? 'loading' : ''}`}
          startIcon={<RefreshIcon />}
          size="small"
        >
          <span>Refresh</span>
        </Button>
      )}
    </Box>
  );

  if (error && !selectedAgent) {
    return (
      <PageLayout 
        title="Documents DB"
        subtitle="Browse and manage agent documents"
      >
        <Box sx={{ p: 6, bgcolor: 'grey.50', textAlign: 'center' }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'left'
            }}
          >
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={loadAgents}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              px: 4,
              py: 1
            }}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Documents DB"
      subtitle="Browse and manage agent documents"
      headerActions={headerActions}
    >
      {/* Filters Row */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          width: '100%',
          alignItems: isMobile ? 'stretch' : 'center',
          flexWrap: 'wrap'
        }}>
          {/* Agent Selector */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: isMobile ? '100%' : 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }
            }}
          >
            <InputLabel>Select Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Select Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {agents.map(agent => (
                <MenuItem key={agent} value={agent}>{agent}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Box */}
          <PageFilters
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            searchPlaceholder="Search documents..."
            sx={{ flex: 1, minWidth: isMobile ? '100%' : 200 }}
          />

          {/* Items Per Page */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: isMobile ? '100%' : 100,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }
            }}
          >
            <InputLabel>Show</InputLabel>
            <Select
              value={itemsPerPage}
              label="Show"
              onChange={handleItemsPerPageChange}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Content Area */}
      {!selectedAgent ? (
        <EmptyState
          icon={<DescriptionIcon sx={{ fontSize: 56, color: 'grey.400' }} />}
          title="Select an Agent"
          description="Choose an agent from the dropdown above to view their document types."
        />
      ) : (
        <Box sx={{ 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          minHeight: '600px'
        }}>
          {/* Left Side - Document Types */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              width: isMobile ? '100%' : '320px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              px: 3, 
              py: 1.5,
              backgroundColor: 'var(--bg-muted)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Document Types ({documentTypes.length})
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {isLoading && !selectedDocumentType ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: 200,
                  color: 'text.secondary',
                  py: 4
                }}>
                  <CircularProgress size={40} thickness={4} sx={{ mr: 2 }} />
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              ) : documentTypes.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {documentTypes.map((type) => {
                    const documentCount = documents.filter(d => d.type === type).length;
                    const isSelected = selectedDocumentType === type;
                    
                    return (
                      <Card
                        key={type}
                        elevation={0}
                        onClick={() => setSelectedDocumentType(type)}
                        sx={{
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--bg-hover)' : 'var(--bg-paper)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'var(--bg-hover)',
                            transform: 'translateX(4px)',
                            boxShadow: 'var(--shadow-sm)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: isSelected ? 'var(--primary)' : 'white',
                              borderRadius: '50%',
                              p: '6px',
                              boxShadow: '0 0 0 1px var(--border-light)',
                            }}>
                              <FolderIcon sx={{ 
                                width: 20, 
                                height: 20,
                                color: isSelected ? 'white' : 'var(--primary-color)'
                              }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: isSelected ? 600 : 500, 
                                  fontSize: '0.875rem',
                                  color: isSelected ? 'var(--primary)' : 'inherit',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {type}
                              </Typography>
                              {selectedDocumentType === type && (
                                <Typography variant="caption" color="text.secondary">
                                  {documentCount} document{documentCount !== 1 ? 's' : ''}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <EmptyState
                  icon={<FolderIcon sx={{ fontSize: 48, color: 'grey.400' }} />}
                  title="No Types"
                  description="This agent has no document types."
                />
              )}
            </Box>
          </Paper>

          {/* Right Side - Documents */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              px: 3, 
              py: 1.5,
              backgroundColor: 'var(--bg-muted)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {selectedDocumentType ? `${selectedDocumentType} Documents` : 'Select a document type'}
              </Typography>
              {selectedDocumentType && filteredDocuments.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 200, position: 'relative' }}>
              {!selectedDocumentType ? (
                <EmptyState
                  icon={<DescriptionIcon sx={{ fontSize: 56, color: 'grey.400' }} />}
                  title="No Type Selected"
                  description="Select a document type from the left panel to view its documents."
                />
              ) : isLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: 300,
                  color: 'text.secondary',
                  py: 4
                }}>
                  <CircularProgress size={40} thickness={4} sx={{ mr: 2 }} />
                  <Typography variant="body2">Loading documents...</Typography>
                </Box>
              ) : paginatedDocuments.length > 0 ? (
                paginatedDocuments.map((document, index) => renderDocumentItem(document, index))
              ) : (
                <EmptyState
                  icon={<DescriptionIcon sx={{ fontSize: 56, color: 'grey.400' }} />}
                  title={searchQuery ? 'No matching documents' : 'No documents found'}
                  description={
                    searchQuery
                      ? "Try adjusting your search query."
                      : "This document type has no documents available."
                  }
                  actions={
                    searchQuery ? [
                      {
                        label: 'Clear Search',
                        onClick: () => setSearchQuery(''),
                        variant: 'outlined'
                      }
                    ] : []
                  }
                />
              )}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                bgcolor: 'var(--bg-muted)',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap'
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  {startIndex + 1}-{Math.min(endIndex, filteredDocuments.length)} of {filteredDocuments.length}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Page {currentPage} of {totalPages}
                  </Typography>
                  <Pagination 
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    size="small"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 1.5,
                        fontWeight: 500,
                        fontSize: '0.8rem'
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}

    </PageLayout>
  );
};

export default DataDocuments;




import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { ErrorProvider } from './contexts/ErrorContext';
import WorkflowList from './components/WorkflowList/WorkflowList';
import WorkflowDetails from './components/WorkflowDetails/WorkflowDetails';
import Layout from './components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  return (
    <BrowserRouter>
      <ErrorProvider>
        <LoadingProvider>
        <SliderProvider>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              error: {
                duration: 5000,
                style: {
                  background: '#FED7D7',
                  color: '#822727',
                  padding: '16px',
                  borderRadius: '8px',
                  width: '400px',
                  maxWidth: '90vw',
                },
                dismissible: true,
                onClick: () => toast.dismiss(),
              }
            }}
          />
          <Layout>
            <Routes>
              <Route path="/" element={<WorkflowList />} />
              <Route path="/workflows" element={<WorkflowList />} />
              <Route path="/workflows/:id" element={<WorkflowDetails />} />
            </Routes>
          </Layout>
        </SliderProvider>
        </LoadingProvider>
      </ErrorProvider>
    </BrowserRouter>
  );
}

export default App; 
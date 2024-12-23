import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import WorkflowList from './components/WorkflowList/WorkflowList';
import WorkflowDetails from './components/WorkflowDetails/WorkflowDetails';
import Layout from './components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Toaster from './components/Toaster/Toaster';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <LoadingProvider>
          <SliderProvider>
            <Toaster />
            <Layout>
              <Routes>
                <Route path="/" element={<WorkflowList />} />
                <Route path="/workflows" element={<WorkflowList />} />
                <Route path="/workflows/:id" element={<WorkflowDetails />} />
              </Routes>
            </Layout>
          </SliderProvider>
        </LoadingProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App; 
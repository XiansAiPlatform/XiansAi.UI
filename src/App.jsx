import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WorkflowList from './components/WorkflowList/WorkflowList';
import WorkflowDetails from './components/WorkflowDetails/WorkflowDetails';
import Layout from './components/Layout/Layout';
import { SliderProvider } from './contexts/SliderContext';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
      <SliderProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflows/:id" element={<WorkflowDetails />} />
          </Routes>
        </Layout>
      </SliderProvider>
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default App; 
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DefinitionsTabNavigation from './DefinitionsTabNavigation';
import DefinitionList from './DefinitionList';
import TemplatesList from './TemplatesList';

const DefinitionsContainer = () => {
  return (
    <DefinitionsTabNavigation>
      <Routes>
        <Route path="deployed" element={<DefinitionList />} />
        <Route path="templates" element={<TemplatesList />} />
        {/* Redirect base definitions route to deployed */}
        <Route path="" element={<Navigate to="deployed" replace />} />
      </Routes>
    </DefinitionsTabNavigation>
  );
};

export default DefinitionsContainer;

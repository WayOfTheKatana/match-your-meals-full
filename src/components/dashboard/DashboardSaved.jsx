import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SavedRecipesSection from './SavedRecipesSection';

const DashboardSaved = () => {
  const context = useOutletContext();
  return <SavedRecipesSection {...context} />;
};

export default DashboardSaved; 
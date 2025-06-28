import React from 'react';
import { useOutletContext } from 'react-router-dom';
import RecipeCategoriesBrowser from './RecipeCategoriesBrowser';

const DashboardCategories = () => {
  const context = useOutletContext();
  return <RecipeCategoriesBrowser {...context} />;
};

export default DashboardCategories; 
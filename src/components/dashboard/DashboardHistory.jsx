import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SearchHistorySection from './SearchHistorySection';

const DashboardHistory = () => {
  const context = useOutletContext();
  return <SearchHistorySection {...context} />;
};

export default DashboardHistory; 
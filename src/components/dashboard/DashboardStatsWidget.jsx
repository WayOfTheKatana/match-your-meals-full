import React from 'react';
import { Activity } from 'lucide-react';

const DashboardStatsWidget = ({ isCreatorMode, currentStats }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-primary-600" />
        {isCreatorMode ? 'Creator Stats' : 'Your Stats'}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {currentStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-3 text-center font-sans">
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStatsWidget;
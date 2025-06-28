import React from 'react';

const ConsumerStatsWidget = ({ followingsCount = 0, searchesCount = 0, savedRecipesCount = 0 }) => (
  <div className="bg-white rounded-xl shadow p-4 mb-4">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <span className="mr-2">📊</span> Your Stats
    </h3>
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Followings</span>
        <span className="font-bold text-primary-700">{followingsCount}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Total Searches</span>
        <span className="font-bold text-primary-700">{searchesCount}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Saved Recipes</span>
        <span className="font-bold text-primary-700">{savedRecipesCount}</span>
      </div>
    </div>
  </div>
);

export default ConsumerStatsWidget; 
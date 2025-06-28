import React from 'react';

const ConsumerStatsWidget = ({ followingsCount = 0, searchesCount = 0, savedRecipesCount = 0 }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Your Stats
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between py-2">
        <span className="text-gray-600 text-sm">Followings</span>
        <span className="font-bold text-lg text-gray-900">{followingsCount}</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-gray-600 text-sm">Total Searches</span>
        <span className="font-bold text-lg text-gray-900">{searchesCount}</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-gray-600 text-sm">Saved Recipes</span>
        <span className="font-bold text-lg text-primary-600">{savedRecipesCount}</span>
      </div>
    </div>
  </div>
);

export default ConsumerStatsWidget;
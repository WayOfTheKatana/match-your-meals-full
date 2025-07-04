import React from 'react';

const CreatorStatsWidget = ({ publishedCount = 0, followersCount = 0, analyticsSummary = {} }) => (
  <div className="bg-white rounded-xl shadow p-4 mb-4">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <span className="mr-2">📈</span> Creator Stats
    </h3>
    <div className="grid grid-cols-1 gap-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Published Recipes</span>
        <span className="font-bold text-primary-700 text-right">{publishedCount}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Followers</span>
        <span className="font-bold text-primary-700 text-right">{followersCount}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Total Views</span>
        <span className="font-semibold text-orange-600 text-right">{analyticsSummary?.totalViews || 0} views</span>
      </div>
    </div>
  </div>
);

export default CreatorStatsWidget; 
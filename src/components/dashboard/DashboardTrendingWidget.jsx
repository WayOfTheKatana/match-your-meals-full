import React from 'react';
import { TrendingUp } from 'lucide-react';

const DashboardTrendingWidget = ({ 
  isCreatorMode, 
  trendingTopics, 
  creatorInsights, 
  handleQuickSearch 
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
        {isCreatorMode ? 'Performance Insights' : 'Trending Topics'}
      </h4>
      
      {isCreatorMode ? (
        <div className="space-y-3">
          {creatorInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-gray-900 text-sm">{insight.title}</h5>
                <span className="text-xs text-green-600 font-medium">{insight.change}</span>
              </div>
              <p className="text-sm text-gray-600">{insight.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleQuickSearch(topic)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-sm text-gray-700 hover:text-primary-600"
            >
              #{topic.replace(/\s+/g, '')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardTrendingWidget;
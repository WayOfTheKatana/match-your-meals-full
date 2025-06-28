import React from 'react';
import { Activity, Users, Search, Bookmark } from 'lucide-react';

const ConsumerStatsWidget = ({ followingsCount = 0, searchesCount = 0, savedRecipesCount = 0 }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <Activity className="w-5 h-5 mr-2 text-primary-600" />
      Your Stats
    </h3>
    <div className="space-y-4">
      {/* Followings Stat */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Followings</p>
          <p className="text-2xl font-bold text-gray-900">{followingsCount}</p>
        </div>
      </div>

      {/* Total Searches Stat */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Total Searches</p>
          <p className="text-2xl font-bold text-gray-900">{searchesCount}</p>
        </div>
      </div>

      {/* Saved Recipes Stat */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Saved Recipes</p>
          <p className="text-2xl font-bold text-gray-900">{savedRecipesCount}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ConsumerStatsWidget;
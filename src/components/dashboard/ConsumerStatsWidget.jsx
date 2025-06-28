import React from 'react';
import { Activity, Users, Search, Bookmark } from 'lucide-react';

const ConsumerStatsWidget = ({ followingsCount = 0, searchesCount = 0, savedRecipesCount = 0 }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
      <Activity className="w-5 h-5 mr-2 text-primary-600" />
      Your Stats
    </h3>
    <div className="grid grid-cols-2 gap-4">
      {/* Followings Stat */}
      <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-lg font-bold text-gray-900">{followingsCount}</p>
        <p className="text-xs font-medium text-gray-600">Followings</p>
      </div>

      {/* Total Searches Stat */}
      <div className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
          <Search className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-lg font-bold text-gray-900">{searchesCount}</p>
        <p className="text-xs font-medium text-gray-600">Total Searches</p>
      </div>

      {/* Saved Recipes Stat - Spans 2 columns for emphasis */}
      <div className="col-span-2 bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 text-center hover:from-primary-100 hover:to-orange-100 transition-colors border border-primary-100">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Bookmark className="w-5 h-5 text-primary-600" />
        </div>
        <p className="text-2xl font-bold text-primary-700">{savedRecipesCount}</p>
        <p className="text-sm font-medium text-primary-600">Saved Recipes</p>
      </div>
    </div>
  </div>
);

export default ConsumerStatsWidget;
import React from 'react';
import { Award, ChefHat } from 'lucide-react';

const DashboardAchievementWidget = ({ isCreatorMode }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
        <Award className="w-5 h-5 mr-2 text-yellow-600" />
        Recent Achievement
      </h4>
      <div className="text-center">
        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <p className="font-medium text-gray-900 text-sm">
          {isCreatorMode ? 'Rising Creator' : 'Recipe Explorer'}
        </p>
        <p className="text-xs text-gray-600">
          {isCreatorMode ? 'Reached 1K followers!' : 'Saved 25 recipes this month!'}
        </p>
      </div>
    </div>
  );
};

export default DashboardAchievementWidget;
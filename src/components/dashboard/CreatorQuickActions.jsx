import React from 'react';
import { PenTool } from 'lucide-react';
import { Button } from '../ui/button';

const CreatorQuickActions = ({ isCreatorMode, handleCreateRecipe }) => {
  if (!isCreatorMode) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <PenTool className="w-8 h-8" />
          <span className="text-primary-100 text-sm">Create</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">New Recipe</h3>
        <p className="text-primary-100 mb-4">Share your culinary creation</p>
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-white text-primary-600 hover:bg-gray-100"
          onClick={handleCreateRecipe}
        >
          Create Recipe
        </Button>
      </div>
    </div>
  );
};

export default CreatorQuickActions;
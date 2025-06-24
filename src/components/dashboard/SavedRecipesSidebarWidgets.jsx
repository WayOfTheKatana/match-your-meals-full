import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Star, 
  Activity, 
  ChefHat, 
  Clock, 
  Users, 
  Heart, 
  ArrowRight, 
  BookOpen, 
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/button';

const SavedRecipesSidebarWidgets = ({ 
  savedRecipes,
  relatedRecipes,
  relatedRecipesLoading,
  formatTime,
  getTotalTime,
  handleSaveSearchedRecipe
}) => {
  return (
    <>
      {/* Related Recipes Widget */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Recommended for You
        </h4>
        
        {relatedRecipesLoading && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Finding recipes you'll love...</p>
          </div>
        )}

        {!relatedRecipesLoading && relatedRecipes.length > 0 && (
          <div className="space-y-3">
            {relatedRecipes.slice(0, 4).map((recipe, index) => (
              <div key={recipe.id} className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex space-x-3">
                  <img
                    src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={recipe.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 text-sm truncate">{recipe.title}</h5>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatTime(getTotalTime(recipe))}</span>
                      <span className="mx-2">•</span>
                      <Users className="w-3 h-3 mr-1" />
                      <span>{recipe.servings}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 text-primary-600 hover:bg-primary-50"
                        onClick={() => handleSaveSearchedRecipe(recipe.id)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Link to={`/recipes/${recipe.slug}`} className="text-gray-400 hover:text-primary-600 transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!relatedRecipesLoading && relatedRecipes.length === 0 && savedRecipes.length > 0 && (
          <div className="text-center py-4">
            <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No related recipes found</p>
          </div>
        )}

        {savedRecipes.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Save some recipes to get personalized recommendations!</p>
          </div>
        )}
      </div>

      {/* Your Preferences Widget */}
      {savedRecipes.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Your Preferences
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Favorite Cuisines</p>
              <div className="flex flex-wrap gap-1">
                {['Mediterranean', 'Asian', 'Italian'].map((cuisine, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</p>
              <div className="flex flex-wrap gap-1">
                {['Vegetarian', 'Low-carb', 'High-protein'].map((diet, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cooking Stats Widget */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Your Cooking Stats
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <BookOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{savedRecipes.length}</p>
            <p className="text-xs text-gray-600">Saved</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">2.5h</p>
            <p className="text-xs text-gray-600">Avg Time</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedRecipesSidebarWidgets;
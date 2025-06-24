import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Filter, 
  Loader2, 
  Clock, 
  Users, 
  Calendar, 
  Star, 
  Trash2, 
  BookOpen, 
  Search 
} from 'lucide-react';
import { Button } from '../ui/button';

const SavedRecipesSection = ({ 
  savedRecipes,
  savedRecipesLoading,
  handleRemoveSavedRecipe,
  formatTime,
  getTotalTime,
  handleNavigationClick
}) => {
  return (
    <div className="space-y-6">
      {/* Saved Recipes Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
              <Bookmark className="w-6 h-6 mr-3 text-primary-600" />
              Your Saved Recipes
            </h2>
            <p className="text-gray-600">
              {savedRecipes.length > 0 
                ? `You have saved ${savedRecipes.length} recipe${savedRecipes.length === 1 ? '' : 's'}`
                : 'No saved recipes yet. Start exploring and save your favorites!'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Saved Recipes List */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6">
          {/* Loading State */}
          {savedRecipesLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your saved recipes...</p>
            </div>
          )}

          {/* Saved Recipes */}
          {!savedRecipesLoading && savedRecipes.length > 0 && (
            <div className="space-y-6">
              {savedRecipes.map((savedRecipe, index) => {
                const recipe = savedRecipe.recipes;
                return (
                  <div key={savedRecipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    {/* Recipe Image */}
                    <div className="relative overflow-hidden rounded-xl w-32 h-32 flex-shrink-0">
                      <img
                        src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">4.8</span>
                      </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">{recipe.title}</h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {recipe.description}
                          </p>
                          
                          {/* Recipe Meta */}
                          <div className="flex items-center space-x-6 text-gray-700 mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-medium">{formatTime(getTotalTime(recipe))}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-medium">{recipe.servings} servings</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-medium">
                                Saved {new Date(savedRecipe.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleRemoveSavedRecipe(recipe.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </Button>
                            <Button
                              asChild
                              size="sm"
                              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                            >
                              <Link to={`/recipes/${recipe.slug}`}>
                                <BookOpen className="w-4 h-4" />
                                <span>View Recipe</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Saved Recipes */}
          {!savedRecipesLoading && savedRecipes.length === 0 && (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Saved Recipes Yet</h4>
              <p className="text-gray-600 mb-4">Start exploring and save recipes you love!</p>
              <Button 
                onClick={() => handleNavigationClick('home')} 
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Explore Recipes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedRecipesSection;
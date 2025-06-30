import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Filter, 
  Loader2, 
  AlertCircle, 
  ChefHat, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  BookOpen, 
  Check, 
  BarChart3, 
  Eye,
  Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import AddToBoardModal from '../AddToBoardModal';

const RecipeFeedSection = ({ 
  isCreatorMode,
  recipesLoading,
  recipesError,
  recentRecipes,
  fetchRecentRecipes,
  publishedRecipes,
  formatTime,
  getTotalTime,
  isRecipeSaved,
  handleSaveSearchedRecipe,
  handleQuickSearch,
  handleCreateRecipe
}) => {
  const { user } = useAuth();
  const [selectedRecipeForBoard, setSelectedRecipeForBoard] = useState(null);

  const handleAddToBoard = (recipeId) => {
    if (!user) {
      alert('Please log in to add recipes to boards');
      return;
    }
    setSelectedRecipeForBoard(recipeId);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-gray-900 font-sans">
              {isCreatorMode ? 'Your Published Recipes' : 'Recipe Feed'}
            </h3>
            <div className="flex items-center space-x-2">
              {!isCreatorMode && (
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-primary-600">
                View All
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {recipesLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading recipes...</p>
            </div>
          )}

          {/* Error State */}
          {recipesError && !recipesLoading && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{recipesError}</p>
              <Button onClick={fetchRecentRecipes} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Real Recipes from Database */}
          {!recipesLoading && !recipesError && recentRecipes.length > 0 && (
            <>
              {recentRecipes.map((recipe, index) => (
                <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl w-24 h-24 flex-shrink-0">
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
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{recipe.title}</h4>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{recipe.description}</p>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(getTotalTime(recipe))}
                          <span className="mx-2">•</span>
                          <Users className="w-4 h-4 mr-1" />
                          {recipe.servings} servings
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {isCreatorMode ? (
                            <>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Published
                              </span>
                              <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`flex items-center space-x-1 transition-colors ${
                                  isRecipeSaved(recipe.id)
                                    ? 'text-red-600 hover:text-red-700'
                                    : 'text-gray-500 hover:text-red-500'
                                }`}
                                onClick={() => handleSaveSearchedRecipe(recipe.id)}
                              >
                                {isRecipeSaved(recipe.id) ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <Heart className="w-4 h-4" />
                                    <span>Save</span>
                                  </>
                                )}
                              </Button>
                              {user && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                                  onClick={() => handleAddToBoard(recipe.id)}
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Board</span>
                                </Button>
                              )}
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                              >
                                <Link to={`/recipes/${recipe.slug}`}>
                                  <BookOpen className="w-4 h-4" />
                                  <span>View Recipe</span>
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Creator Mode Fallback */}
          {isCreatorMode && !recipesLoading && !recipesError && recentRecipes.length === 0 && publishedRecipes && publishedRecipes.length > 0 && (
            <>
              {publishedRecipes.map((recipe, index) => (
                <div key={index} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl w-24 h-24 flex-shrink-0">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{recipe.rating}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          {recipe.time}
                          <span className="mx-2">•</span>
                          <Eye className="w-4 h-4 mr-1" />
                          {recipe.views} views
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            recipe.status === 'Published' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {recipe.status}
                          </span>
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                            <BarChart3 className="w-4 h-4" />
                            <span>Analytics</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Creator Mode - No Published Recipes Placeholder */}
          {isCreatorMode && !recipesLoading && !recipesError && recentRecipes.length === 0 && publishedRecipes && publishedRecipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src="/Social share-cuate.svg"
                alt="No recipes"
                className="w-32 h-32 mb-4"
              />
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Recipes Yet</h4>
              <p className="text-gray-500 mb-4 text-center">
                You haven't published any recipes yet. Start sharing your culinary creations with the world!
              </p>
              <Button
                className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition"
                onClick={handleCreateRecipe ? handleCreateRecipe : () => handleQuickSearch('create')}
              >
                + Create Your First Recipe
              </Button>
            </div>
          )}

          {/* No Recipes State */}
          {!isCreatorMode && !recipesLoading && !recipesError && recentRecipes.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recipes Yet</h4>
              <p className="text-gray-600 mb-4">Be the first to discover amazing recipes!</p>
              <Button onClick={() => handleQuickSearch('healthy breakfast')} className="bg-primary-600 hover:bg-primary-700">
                Explore Recipes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add to Board Modal */}
      <AddToBoardModal
        isOpen={!!selectedRecipeForBoard}
        onClose={() => setSelectedRecipeForBoard(null)}
        recipeId={selectedRecipeForBoard}
      />
    </>
  );
};

export default RecipeFeedSection;
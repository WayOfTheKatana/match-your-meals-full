import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, AlertCircle, ChefHat, Clock, Users, Heart, BookOpen, Check } from 'lucide-react';
import { Button } from '../ui/button';

const DashboardSearchResults = ({ 
  showSearchResults,
  searchLoading,
  searchError,
  searchResults,
  searchQuery,
  hasSearchQuery,
  performSearch,
  formatTime,
  getTotalTime,
  isRecipeSaved,
  handleSaveSearchedRecipe,
  handleQuickSearch
}) => {
  if (!showSearchResults) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-900">
          {searchLoading ? 'Searching...' : 
           searchError ? 'Search Error' :
           searchResults.length > 0 ? `Found ${searchResults.length} Recipe${searchResults.length === 1 ? '' : 's'}` :
           'No Recipes Found'}
        </h3>
        {searchQuery && !searchLoading && (
          <p className="text-gray-600 mt-1">
            {searchError ? searchError : `Results for "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* Loading State */}
      {searchLoading && (
        <div className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              <Search className="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Searching Recipes</h4>
              <p className="text-gray-600 text-sm">
                Finding the best matches for your query...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {searchError && !searchLoading && (
        <div className="p-6">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Search Error</h4>
              <p className="text-sm text-red-500">{searchError}</p>
            </div>
          </div>
          <Button 
            onClick={() => performSearch(searchQuery)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Search Results Grid */}
      {searchResults.length > 0 && !searchLoading && (
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {searchResults.map((recipe, index) => (
              <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                {/* Recipe Image with Ranking Number */}
                <div className="relative overflow-hidden rounded-xl w-32 h-32 flex-shrink-0">
                  <img
                    src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Ranking Number Overlay */}
                  <div className="absolute top-2 left-2">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
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
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center space-x-2 transition-colors ${
                            isRecipeSaved(recipe.id)
                              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                              : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
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
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!searchLoading && !searchError && searchResults.length === 0 && hasSearchQuery && (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-3">No Recipes Found</h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any recipes matching "{searchQuery}". 
            Try adjusting your search terms or being more specific.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2">
            {['high protein chicken', 'quick vegan dinner', 'heart healthy salmon', 'keto breakfast'].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(suggestion)}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200 hover:border-primary-300"
              >
                Try "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSearchResults;
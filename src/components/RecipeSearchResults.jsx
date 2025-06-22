import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, Heart, BookOpen, ChefHat, Loader2, Search, Filter, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

const RecipeSearchResults = ({ searchQuery, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchIntent, setSearchIntent] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('🔍 Starting semantic search for:', query);

      const { data, error: searchError } = await supabase.functions.invoke('recipe-semantic-search', {
        body: {
          query: query,
          limit: 20
        }
      });

      if (searchError) {
        console.error('❌ Search function error:', searchError);
        throw new Error(`Search failed: ${searchError.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      console.log('✅ Search completed:', data);
      
      setResults(data.results || []);
      setSearchIntent(data.intent || null);
      setTotalResults(data.total_results || 0);

    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message || 'Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalTime = (recipe) => {
    return (recipe.prep_time || 0) + (recipe.cook_time || 0);
  };

  const handleSaveRecipe = async (recipeId) => {
    // Implement save functionality
    console.log('Saving recipe:', recipeId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              <Search className="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching Recipes</h3>
              <p className="text-gray-600 text-sm">
                AI is analyzing your query and finding the perfect recipes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-serif text-gray-900 mb-2">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    Found {totalResults} recipes for "{searchQuery}"
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search Intent Display */}
              {searchIntent && (
                <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <h4 className="text-sm font-medium text-primary-900 mb-2">AI Understanding:</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchIntent.dietary_tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {searchIntent.health_tags?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                    {searchIntent.total_time && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Under {searchIntent.total_time} minutes
                      </span>
                    )}
                    {searchIntent.servings && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Serves {searchIntent.servings}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Search Error</h3>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
              <Button 
                onClick={() => performSearch(searchQuery)}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Recipe Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">
                        {(recipe.similarity_score * 5).toFixed(1)}
                      </span>
                    </div>
                    {recipe.similarity_score > 0.8 && (
                      <div className="absolute top-3 left-3 bg-primary-600 text-white rounded-full px-2 py-1">
                        <span className="text-xs font-medium">Perfect Match</span>
                      </div>
                    )}
                  </div>

                  {/* Recipe Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>

                    {/* Recipe Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(getTotalTime(recipe))}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.dietary_tags?.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {recipe.health_tags?.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center space-x-1"
                        onClick={() => handleSaveRecipe(recipe.id)}
                      >
                        <Heart className="w-4 h-4" />
                        <span>Save</span>
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 flex items-center justify-center space-x-1 bg-primary-600 hover:bg-primary-700"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>View Recipe</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any recipes matching "{searchQuery}". Try adjusting your search terms.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['healthy chicken', 'quick pasta', 'vegetarian dinner', 'low carb breakfast'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => performSearch(suggestion)}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors"
                  >
                    Try "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSearchResults;
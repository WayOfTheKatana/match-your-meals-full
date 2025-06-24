import React, { useState, useEffect } from 'react';
import { Clock, Users, Heart, BookOpen, ChefHat, Loader2, Search, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';

const RecipeSearchResults = ({ searchQuery, categoryFilter }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchIntent, setSearchIntent] = useState(null);

  const { user } = useAuth();
  const { saveRecipe, removeSavedRecipe, isRecipeSaved } = useSavedRecipes();

  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      performSemanticSearch(searchQuery.trim());
    } else if (categoryFilter) {
      performCategorySearch(categoryFilter);
    } else {
      fetchAllRecipes();
    }
  }, [searchQuery, categoryFilter]);

  const performSemanticSearch = async (query) => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('🔍 Starting semantic search for:', query);

      const { data, error: searchError } = await supabase.functions.invoke('recipe-semantic-search', {
        body: {
          query: query
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

    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message || 'Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performCategorySearch = async (filter) => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('🏷️ Starting category search for:', filter);

      let query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          prep_time,
          cook_time,
          servings,
          image_path,
          ingredients,
          instructions,
          health_tags,
          dietary_tags,
          health_benefits,
          nutritional_info,
          creator_id,
          created_at
        `)
        .limit(20);

      // Apply category filter
      if (filter.type === 'health_tags') {
        query = query.contains('health_tags', [filter.tag]);
      } else if (filter.type === 'dietary_tags') {
        query = query.contains('dietary_tags', [filter.tag]);
      }

      const { data: categoryResults, error: categoryError } = await query;

      if (categoryError) {
        console.error('❌ Category search error:', categoryError);
        throw categoryError;
      }

      console.log('✅ Category search completed:', categoryResults?.length || 0, 'results');
      
      // Add similarity score for consistency
      const resultsWithScore = (categoryResults || []).map(recipe => ({
        ...recipe,
        similarity_score: 0.8 // Default score for category matches
      }));

      setResults(resultsWithScore);

    } catch (err) {
      console.error('❌ Category search error:', err);
      setError(err.message || 'Failed to search recipes by category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecipes = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('📋 Fetching all recipes...');

      const { data: allRecipes, error: fetchError } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          prep_time,
          cook_time,
          servings,
          image_path,
          ingredients,
          instructions,
          health_tags,
          dietary_tags,
          health_benefits,
          nutritional_info,
          creator_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('✅ All recipes fetched:', allRecipes?.length || 0);
      
      // Add similarity score for consistency
      const resultsWithScore = (allRecipes || []).map(recipe => ({
        ...recipe,
        similarity_score: 0.7 // Default score for all recipes
      }));

      setResults(resultsWithScore);

    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to load recipes. Please try again.');
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
    if (!user) {
      alert('Please log in to save recipes');
      return;
    }

    try {
      if (isRecipeSaved(recipeId)) {
        await removeSavedRecipe(recipeId);
        console.log('✅ Recipe removed from saved recipes');
      } else {
        await saveRecipe(recipeId);
        console.log('✅ Recipe saved successfully');
      }
    } catch (error) {
      console.error('❌ Error saving/removing recipe:', error);
      alert(error.message || 'Failed to save recipe');
    }
  };

  const getHeaderText = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    } else if (categoryFilter) {
      const formattedTag = categoryFilter.tag
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${formattedTag} Recipes`;
    } else {
      return 'All Recipes';
    }
  };

  const getSubHeaderText = () => {
    if (results.length > 0) {
      return `Found ${results.length} recipe${results.length === 1 ? '' : 's'}`;
    } else if (!loading && !error) {
      return 'No recipes found';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <Search className="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Searching Recipes' : categoryFilter ? 'Loading Category Recipes' : 'Loading Recipes'}
          </h3>
          <p className="text-gray-600 text-sm">
            {searchQuery ? 'Finding the best matches for your query...' : 'Please wait while we load the recipes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-serif text-gray-900 mb-2">
          {getHeaderText()}
        </h2>
        <p className="text-gray-600">
          {getSubHeaderText()}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Search Error</h3>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (searchQuery) {
                performSemanticSearch(searchQuery);
              } else if (categoryFilter) {
                performCategorySearch(categoryFilter);
              } else {
                fetchAllRecipes();
              }
            }}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((recipe, index) => (
            <div key={recipe.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Recipe Image with Ranking Number */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Ranking Number Overlay (only for search results) */}
                {searchQuery && (
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                )}

                {/* Category Badge (only for category results) */}
                {categoryFilter && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      {categoryFilter.tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Recipe Content */}
              <div className="p-6">
                {/* Recipe Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {recipe.title}
                </h3>
                
                {/* Recipe Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Recipe Meta - Total Time and Servings */}
                <div className="flex items-center justify-between text-gray-700 mb-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">{formatTime(getTotalTime(recipe))}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">{recipe.servings} servings</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 flex items-center justify-center space-x-2 transition-colors ${
                      isRecipeSaved(recipe.id)
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                    }`}
                    onClick={() => handleSaveRecipe(recipe.id)}
                  >
                    <Heart className={`w-4 h-4 ${isRecipeSaved(recipe.id) ? 'fill-current' : ''}`} />
                    <span>{isRecipeSaved(recipe.id) ? 'Saved' : 'Save'}</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700"
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
      {!loading && !error && results.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Recipes Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? `We couldn't find any recipes matching "${searchQuery}". Try adjusting your search terms or being more specific.`
              : categoryFilter
              ? `No recipes found for the selected category. Try browsing other categories.`
              : 'No recipes have been added yet. Create some recipes to see them here.'
            }
          </p>
          
          {searchQuery && (
            <div className="flex flex-wrap justify-center gap-2">
              {['high protein chicken', 'quick vegan dinner', 'heart healthy salmon', 'keto breakfast'].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => performSemanticSearch(suggestion)}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200 hover:border-primary-300"
                >
                  Try "{suggestion}"
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeSearchResults;
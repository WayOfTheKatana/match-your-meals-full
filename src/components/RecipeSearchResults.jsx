import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, Heart, BookOpen, ChefHat, Loader2, Search, X, AlertCircle, Award, Target, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

const RecipeSearchResults = ({ searchQuery, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchIntent, setSearchIntent] = useState(null);
  const [relevanceInfo, setRelevanceInfo] = useState(null);

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
      console.log('🔍 Starting high-relevance semantic search for:', query);

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

      console.log('✅ High-relevance search completed:', data);
      
      setResults(data.results || []);
      setSearchIntent(data.intent || null);
      setRelevanceInfo(data.relevance_info || null);

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

  const getRelevanceLabel = (score) => {
    if (score >= 0.9) return { label: 'Perfect Match', color: 'bg-green-500', textColor: 'text-green-500' };
    if (score >= 0.8) return { label: 'Excellent Match', color: 'bg-blue-500', textColor: 'text-blue-500' };
    if (score >= 0.7) return { label: 'Good Match', color: 'bg-purple-500', textColor: 'text-purple-500' };
    return { label: 'Relevant', color: 'bg-gray-500', textColor: 'text-gray-500' };
  };

  const getRelevanceIcon = (score) => {
    if (score >= 0.9) return <Award className="w-4 h-4" />;
    if (score >= 0.8) return <Target className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Perfect Matches</h3>
              <p className="text-gray-600 text-sm">
                AI is analyzing your query to find the most relevant recipes...
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
                    High-Relevance Results
                  </h2>
                  <p className="text-gray-600">
                    {results.length > 0 
                      ? `Found ${results.length} highly relevant recipe${results.length === 1 ? '' : 's'} for "${searchQuery}"`
                      : `No highly relevant recipes found for "${searchQuery}"`
                    }
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Relevance Info */}
              {relevanceInfo && (
                <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-primary-900">Search Quality Metrics</h4>
                    <div className="flex items-center space-x-2 text-xs text-primary-700">
                      <Target className="w-4 h-4" />
                      <span>High-Relevance Filter Active</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{relevanceInfo.perfect_matches}</div>
                      <div className="text-xs text-gray-600">Perfect Matches</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{relevanceInfo.high_relevance_count}</div>
                      <div className="text-xs text-gray-600">High Relevance</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-600">{relevanceInfo.max_results}</div>
                      <div className="text-xs text-gray-600">Max Results</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-orange-600">{Math.round(relevanceInfo.min_relevance_threshold * 100)}%</div>
                      <div className="text-xs text-gray-600">Min Relevance</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Intent Display */}
              {searchIntent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <ChefHat className="w-4 h-4 mr-2" />
                    AI Understanding:
                  </h4>
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
                    {searchIntent.health_benefits?.map((benefit, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {benefit}
                      </span>
                    ))}
                    {searchIntent.total_time && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Under {searchIntent.total_time} minutes
                      </span>
                    )}
                    {searchIntent.servings && (
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
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

          {/* High-Relevance Results Grid */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((recipe, index) => {
                const relevanceLabel = getRelevanceLabel(recipe.relevance_score);
                const relevanceIcon = getRelevanceIcon(recipe.relevance_score);
                
                return (
                  <div key={recipe.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-transparent hover:border-primary-200">
                    {/* Recipe Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Relevance Badge */}
                      <div className={`absolute top-3 left-3 ${relevanceLabel.color} text-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg`}>
                        {relevanceIcon}
                        <span className="text-xs font-medium">{relevanceLabel.label}</span>
                      </div>

                      {/* Similarity Score */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">
                          {(recipe.similarity_score * 5).toFixed(1)}
                        </span>
                      </div>

                      {/* Relevance Score */}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white rounded-full px-2 py-1">
                        <span className="text-xs font-medium">
                          {Math.round(recipe.relevance_score * 100)}% match
                        </span>
                      </div>

                      {/* Ranking Badge */}
                      <div className="absolute bottom-3 left-3 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
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
                        <div className={`flex items-center space-x-1 ${relevanceLabel.textColor}`}>
                          {relevanceIcon}
                          <span className="text-xs font-medium">{Math.round(recipe.relevance_score * 100)}%</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {recipe.dietary_tags?.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {recipe.health_tags?.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {recipe.health_benefits?.slice(0, 1).map((benefit, benefitIndex) => (
                          <span key={benefitIndex} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                            {benefit}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center space-x-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          onClick={() => handleSaveRecipe(recipe.id)}
                        >
                          <Heart className="w-4 h-4" />
                          <span>Save</span>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 flex items-center justify-center space-x-1 bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>View Recipe</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Highly Relevant Recipes Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any recipes that meet our high relevance standards for "{searchQuery}". 
                Try adjusting your search terms or being more specific.
              </p>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6 max-w-lg mx-auto">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Search Tips for Better Results:</h4>
                <ul className="text-xs text-blue-700 text-left space-y-1">
                  <li>• Include specific ingredients (e.g., "chicken breast", "quinoa")</li>
                  <li>• Mention dietary preferences (e.g., "vegan", "keto", "gluten-free")</li>
                  <li>• Add cooking time constraints (e.g., "under 30 minutes")</li>
                  <li>• Specify health goals (e.g., "high protein", "heart healthy")</li>
                </ul>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {['high protein chicken', 'quick vegan dinner', 'heart healthy salmon', 'keto breakfast under 20 minutes'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => performSearch(suggestion)}
                    className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200 hover:border-primary-300"
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
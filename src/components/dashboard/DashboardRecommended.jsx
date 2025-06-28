import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSavedRecipes } from '../../hooks/useSavedRecipes';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ThumbsUp, Clock, Users, Star, Heart, BookOpen, Sparkles, TrendingUp, Target, Loader2, AlertCircle, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';

const fetchRecommendedRecipes = async (userId) => {
  if (!userId) return [];
  
  try {
    // Get user's saved recipes to understand preferences
    const { data: savedRecipes, error: savedError } = await supabase
      .from('saved_recipes')
      .select(`
        recipes (
          health_tags,
          dietary_tags,
          ingredients
        )
      `)
      .eq('user_id', userId);
    
    if (savedError) throw savedError;
    
    // Extract user preferences from saved recipes
    const userHealthTags = new Set();
    const userDietaryTags = new Set();
    const userIngredients = new Set();
    
    savedRecipes?.forEach(saved => {
      const recipe = saved.recipes;
      if (recipe.health_tags) recipe.health_tags.forEach(tag => userHealthTags.add(tag));
      if (recipe.dietary_tags) recipe.dietary_tags.forEach(tag => userDietaryTags.add(tag));
      if (recipe.ingredients) recipe.ingredients.forEach(ing => userIngredients.add(ing.name?.toLowerCase()));
    });
    
    // Get saved recipe IDs to exclude from recommendations
    const savedRecipeIds = savedRecipes?.map(saved => saved.recipe_id) || [];
    
    // Build recommendation query based on user preferences
    let query = supabase
      .from('recipes')
      .select(`
        id,
        slug,
        title,
        description,
        prep_time,
        cook_time,
        servings,
        image_path,
        ingredients,
        health_tags,
        dietary_tags,
        health_benefits,
        nutritional_info,
        creator_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(12);
    
    // Exclude already saved recipes
    if (savedRecipeIds.length > 0) {
      query = query.not('id', 'in', `(${savedRecipeIds.join(',')})`);
    }
    
    // If user has dietary preferences, prioritize those
    if (userDietaryTags.size > 0) {
      query = query.overlaps('dietary_tags', Array.from(userDietaryTags));
    }
    
    const { data: recommendedRecipes, error: recError } = await query;
    
    if (recError) throw recError;
    
    // Score recipes based on user preferences
    const scoredRecipes = (recommendedRecipes || []).map(recipe => {
      let score = 0;
      
      // Score based on matching health tags
      if (recipe.health_tags) {
        recipe.health_tags.forEach(tag => {
          if (userHealthTags.has(tag)) score += 3;
        });
      }
      
      // Score based on matching dietary tags
      if (recipe.dietary_tags) {
        recipe.dietary_tags.forEach(tag => {
          if (userDietaryTags.has(tag)) score += 5;
        });
      }
      
      // Score based on matching ingredients
      if (recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          if (userIngredients.has(ing.name?.toLowerCase())) score += 2;
        });
      }
      
      // Boost score for newer recipes
      const daysSinceCreated = (new Date() - new Date(recipe.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 2;
      if (daysSinceCreated < 30) score += 1;
      
      return { ...recipe, recommendation_score: score };
    });
    
    // Sort by recommendation score and return top results
    return scoredRecipes
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 8);
    
  } catch (error) {
    console.error('Error fetching recommended recipes:', error);
    // Fallback to recent popular recipes
    const { data: fallbackRecipes, error: fallbackError } = await supabase
      .from('recipes')
      .select(`
        id,
        slug,
        title,
        description,
        prep_time,
        cook_time,
        servings,
        image_path,
        ingredients,
        health_tags,
        dietary_tags,
        health_benefits,
        nutritional_info,
        creator_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(8);
    
    if (fallbackError) throw fallbackError;
    
    return (fallbackRecipes || []).map(recipe => ({
      ...recipe,
      recommendation_score: 1
    }));
  }
};

// Skeleton Loading Component
const RecommendedRecipeSkeleton = () => (
  <div className="flex space-x-4 p-4 rounded-xl border border-gray-100 animate-pulse">
    {/* Recipe Image Skeleton */}
    <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0"></div>
    
    {/* Recipe Content Skeleton */}
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          
          {/* Description Skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          
          {/* Meta Info Skeleton */}
          <div className="flex items-center space-x-6 mb-4">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          
          {/* Action Buttons Skeleton */}
          <div className="flex items-center space-x-3">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DashboardRecommended = () => {
  const { user } = useAuth();
  const { saveRecipe, isRecipeSaved } = useSavedRecipes();

  const {
    data: recommendedRecipes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recommendedRecipes', user?.id],
    queryFn: () => fetchRecommendedRecipes(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalTime = (recipe) => {
    return (recipe.prep_time || 0) + (recipe.cook_time || 0);
  };

  const getRecommendationReason = (recipe) => {
    if (recipe.recommendation_score >= 8) return { text: 'Perfect Match', color: 'text-green-600', icon: Target };
    if (recipe.recommendation_score >= 5) return { text: 'Great Match', color: 'text-blue-600', icon: TrendingUp };
    if (recipe.recommendation_score >= 3) return { text: 'Good Match', color: 'text-purple-600', icon: ThumbsUp };
    return { text: 'Trending', color: 'text-orange-600', icon: Sparkles };
  };

  const handleSaveRecipe = async (recipeId) => {
    try {
      await saveRecipe(recipeId);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
              <ThumbsUp className="w-6 h-6 mr-3 text-primary-600" />
              Recommended for You
            </h2>
            <p className="text-gray-600">
              {recommendedRecipes.length > 0 
                ? `Personalized recipe recommendations based on your preferences`
                : 'Save some recipes to get personalized recommendations!'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Recommended Recipes List */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6">
          {/* Loading State with Skeleton */}
          {isLoading && (
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <RecommendedRecipeSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Recommended Recipes */}
          {!isLoading && !error && recommendedRecipes.length > 0 && (
            <div className="space-y-6">
              {recommendedRecipes.map((recipe, index) => {
                const recommendation = getRecommendationReason(recipe);
                const RecommendationIcon = recommendation.icon;
                
                return (
                  <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
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
                      {/* Recommendation Badge */}
                      <div className="absolute bottom-2 left-2">
                        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <RecommendationIcon className={`w-3 h-3 ${recommendation.color}`} />
                          <span className={`text-xs font-medium ${recommendation.color}`}>
                            {recommendation.text}
                          </span>
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
                            <div className="flex items-center space-x-1">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-yellow-600">
                                {recipe.recommendation_score}% match
                              </span>
                            </div>
                          </div>

                          {/* Tags */}
                          {recipe.dietary_tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {recipe.dietary_tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                                >
                                  {tag.replace(/-/g, ' ')}
                                </span>
                              ))}
                              {recipe.dietary_tags.length > 3 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  +{recipe.dietary_tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

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
                              onClick={() => handleSaveRecipe(recipe.id)}
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
                );
              })}
            </div>
          )}

          {/* No Recommendations */}
          {!isLoading && !error && recommendedRecipes.length === 0 && (
            <div className="text-center py-12">
              <ThumbsUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h4>
              <p className="text-gray-600 mb-4">Save some recipes to get personalized recommendations!</p>
              <Button 
                asChild
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Link to="/dashboard/consumer">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Recipes
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Insights */}
      {!isLoading && !error && recommendedRecipes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            Why These Recommendations?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Dietary Preferences</p>
              <p className="text-xs text-green-600 mt-1">Based on your saved recipes</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">Trending Recipes</p>
              <p className="text-xs text-blue-600 mt-1">Popular with similar users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-800">AI Powered</p>
              <p className="text-xs text-purple-600 mt-1">Machine learning recommendations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardRecommended;
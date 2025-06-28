import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Eye, Clock, Users, Star, Heart, BookOpen, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';

const fetchRecentlyViewedRecipes = async (userId) => {
  if (!userId) return [];
  
  // Get recently viewed recipe IDs for the user, ordered by most recent
  const { data: viewData, error: viewError } = await supabase
    .from('recipe_views')
    .select('recipe_id, viewed_at')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(20);
  
  if (viewError) throw new Error(viewError.message);
  if (!viewData || viewData.length === 0) return [];
  
  // Get unique recipe IDs (in case user viewed same recipe multiple times)
  const uniqueRecipeIds = [...new Set(viewData.map(view => view.recipe_id))];
  
  // Fetch recipe details
  const { data: recipes, error: recipesError } = await supabase
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
    .in('id', uniqueRecipeIds);
  
  if (recipesError) throw new Error(recipesError.message);
  
  // Combine with view timestamps and sort by most recent view
  const recipesWithViewTime = recipes.map(recipe => {
    const viewRecord = viewData.find(view => view.recipe_id === recipe.id);
    return {
      ...recipe,
      last_viewed_at: viewRecord?.viewed_at
    };
  }).sort((a, b) => new Date(b.last_viewed_at) - new Date(a.last_viewed_at));
  
  return recipesWithViewTime;
};

// Skeleton Loading Component
const RecentRecipeSkeleton = () => (
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
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
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

const DashboardRecent = () => {
  const { user } = useAuth();

  const {
    data: recentRecipes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recentlyViewed', user?.id],
    queryFn: () => fetchRecentlyViewedRecipes(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  const formatViewTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-primary-600" />
              Recently Viewed Recipes
            </h2>
            <p className="text-gray-600">
              {recentRecipes.length > 0 
                ? `You have viewed ${recentRecipes.length} recipe${recentRecipes.length === 1 ? '' : 's'} recently`
                : 'No recently viewed recipes yet. Start exploring to see them here!'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recently Viewed Recipes List */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6">
          {/* Loading State with Skeleton */}
          {isLoading && (
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <RecentRecipeSkeleton key={index} />
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

          {/* Recently Viewed Recipes */}
          {!isLoading && !error && recentRecipes.length > 0 && (
            <div className="space-y-6">
              {recentRecipes.map((recipe, index) => (
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
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600">
                              Viewed {formatViewTime(recipe.last_viewed_at)}
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
                            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          >
                            <Heart className="w-4 h-4" />
                            <span>Save</span>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                          >
                            <Link to={`/recipes/${recipe.slug}`}>
                              <BookOpen className="w-4 h-4" />
                              <span>View Again</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Recently Viewed Recipes */}
          {!isLoading && !error && recentRecipes.length === 0 && (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recently Viewed Recipes</h4>
              <p className="text-gray-600 mb-4">Start exploring recipes to see your viewing history here!</p>
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

      {/* Quick Stats */}
      {!isLoading && !error && recentRecipes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Viewing Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Eye className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{recentRecipes.length}</p>
              <p className="text-sm text-gray-600">Recipes Viewed</p>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(recentRecipes.reduce((sum, recipe) => sum + getTotalTime(recipe), 0) / recentRecipes.length) || 0}m
              </p>
              <p className="text-sm text-gray-600">Avg Cook Time</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(recentRecipes.reduce((sum, recipe) => sum + (recipe.servings || 0), 0) / recentRecipes.length) || 0}
              </p>
              <p className="text-sm text-gray-600">Avg Servings</p>
            </div>
            <div className="text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardRecent;
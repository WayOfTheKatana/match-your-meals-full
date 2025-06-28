import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Loader2, AlertCircle, ChefHat, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const fetchRecentCreators = async () => {
  // Get users who have published at least one recipe, with their recipe count
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, 
      full_name, 
      avatar_url, 
      created_at, 
      email,
      recipes!inner(id)
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) throw new Error(error.message);
  
  // Transform data to include recipe count
  const creatorsWithRecipeCount = (data || []).map(user => ({
    ...user,
    recipe_count: user.recipes?.length || 0
  }));
  
  return creatorsWithRecipeCount;
};

const RecipeCreatorsWidget = () => {
  const {
    data: recentCreators = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recentCreators'],
    queryFn: fetchRecentCreators,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getDisplayName = (user) => {
    if (user.full_name && user.full_name.trim()) {
      return user.full_name;
    }
    // Fallback to email username if no full name
    return user.email ? user.email.split('@')[0] : 'Creator';
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
        New Recipe Creators
      </h3>
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600 mr-2" />
          <span className="text-sm text-gray-600">Loading creators...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700">Failed to load creators</span>
        </div>
      )}

      {!isLoading && !error && recentCreators.length === 0 && (
        <div className="text-center py-4">
          <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No recipe creators yet</p>
          <p className="text-xs text-gray-500 mt-1">Be the first to publish a recipe!</p>
        </div>
      )}

      {!isLoading && !error && recentCreators.length > 0 && (
        <div className="space-y-3">
          {recentCreators.map((creator) => (
            <Link
              key={creator.id}
              to={`/creators/${creator.id}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Creator Avatar */}
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={getDisplayName(creator)}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                ) : (
                  <ChefHat className="w-5 h-5 text-primary-600" />
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {getDisplayName(creator)}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Joined {formatJoinDate(creator.created_at)}</span>
                </div>
                <div className="flex items-center text-xs text-primary-600 mt-0.5">
                  <FileText className="w-3 h-3 mr-1" />
                  <span>{creator.recipe_count} recipe{creator.recipe_count === 1 ? '' : 's'}</span>
                </div>
              </div>

              {/* New Creator Badge for recent creators (joined within last 7 days) */}
              {(() => {
                const daysSinceJoined = Math.floor((new Date() - new Date(creator.created_at)) / (1000 * 60 * 60 * 24));
                return daysSinceJoined <= 7 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    New
                  </span>
                ) : null;
              })()}
            </Link>
          ))}
        </div>
      )}

      {/* View All Link */}
      {!isLoading && !error && recentCreators.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            to="/dashboard/creators"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all creators →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecipeCreatorsWidget;
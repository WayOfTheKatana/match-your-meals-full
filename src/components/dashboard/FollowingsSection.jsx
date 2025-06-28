import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { User, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const fetchFollowings = async (userId) => {
  // Get all followed user IDs for the current user
  const { data: follows, error: followsError } = await supabase
    .from('followers')
    .select('followed_id')
    .eq('follower_id', userId);
  if (followsError) throw new Error(followsError.message);
  if (!follows || follows.length === 0) return [];

  // Fetch user profiles for all followed IDs
  const followedIds = follows.map(f => f.followed_id);
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, email')
    .in('id', followedIds);
  if (usersError) throw new Error(usersError.message);
  return users || [];
};

// Skeleton Loading Component - Minimal Design
const FollowingsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-4 flex items-center space-x-3 border border-gray-100 animate-pulse">
        {/* Avatar Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        
        {/* Name Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

// Header Skeleton Component
const HeaderSkeleton = () => (
  <div className="flex items-center space-x-3 mb-4 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-48"></div>
    <div className="h-6 bg-gray-200 rounded-full w-8"></div>
  </div>
);

const FollowingsSection = () => {
  const { user } = useAuth();

  const {
    data: followings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['followings', user?.id],
    queryFn: () => fetchFollowings(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getDisplayName = (creator) => {
    if (creator.full_name && creator.full_name.trim()) {
      return creator.full_name;
    }
    // Fallback to email username if no full name
    return creator.email ? creator.email.split('@')[0] : 'Creator';
  };

  return (
    <div className="space-y-6">
      {/* Header with Skeleton Loading */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <h2 className="text-2xl font-bold mb-4">Followed Creators</h2>
      )}

      {/* Loading State with Skeleton */}
      {isLoading && <FollowingsSkeleton />}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error.message}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && followings.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-lg font-semibold">You're not following anyone yet.</p>
          <p className="text-sm">Start following creators to see them here!</p>
        </div>
      )}

      {/* Loaded Content - Minimal Design */}
      {!isLoading && !error && followings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {followings.map(creator => (
            <Link
              key={creator.id}
              to={`/creators/${creator.id}`}
              className="bg-white rounded-lg p-4 flex items-center space-x-3 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 group"
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {creator.avatar_url ? (
                  <img 
                    src={creator.avatar_url} 
                    alt={getDisplayName(creator)} 
                    className="w-12 h-12 object-cover rounded-full" 
                  />
                ) : (
                  <User className="w-6 h-6 text-primary-600" />
                )}
              </div>
              
              {/* Name Only */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {getDisplayName(creator)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingsSection;
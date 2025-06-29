import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { User, Loader2, AlertCircle, UserMinus, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';

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

// Skeleton Loading Component - Smaller Design
const FollowingsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-3 flex items-center space-x-2 border border-gray-100 animate-pulse">
        {/* Smaller Avatar Skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
        
        {/* Name Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Unfollow Button Skeleton */}
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
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
  const queryClient = useQueryClient();
  const [unfollowingIds, setUnfollowingIds] = useState(new Set());

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

  const handleUnfollow = async (creatorId, creatorName, event) => {
    // Prevent navigation when clicking unfollow button
    event.preventDefault();
    event.stopPropagation();

    if (!user || unfollowingIds.has(creatorId)) return;

    // Confirm unfollow action
    const confirmed = window.confirm(`Are you sure you want to unfollow ${creatorName}?`);
    if (!confirmed) return;

    setUnfollowingIds(prev => new Set([...prev, creatorId]));

    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', creatorId);

      if (error) throw error;

      // Invalidate and refetch the followings query
      queryClient.invalidateQueries(['followings', user.id]);
      
      console.log(`Successfully unfollowed ${creatorName}`);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert(`Failed to unfollow ${creatorName}. Please try again.`);
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(creatorId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Skeleton Loading */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <div className="flex items-center space-x-3 mb-4">
          <h2 className="text-2xl font-bold">Followed Creators</h2>
          <span className="text-base text-gray-500">({followings.length})</span>
        </div>
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

      {/* Loaded Content - Smaller, Minimal Design with Unfollow */}
      {!isLoading && !error && followings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {followings.map(creator => (
            <div
              key={creator.id}
              className="bg-white rounded-lg p-3 flex items-center space-x-2 border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all duration-200 group relative"
            >
              {/* Clickable Link Area (Avatar + Name) */}
              <Link
                to={`/creators/${creator.id}`}
                className="flex items-center space-x-2 flex-1 min-w-0"
              >
                {/* Smaller Avatar */}
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {creator.avatar_url ? (
                    <img 
                      src={creator.avatar_url} 
                      alt={getDisplayName(creator)} 
                      className="w-8 h-8 object-cover rounded-full" 
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary-600" />
                  )}
                </div>
                
                {/* Smaller Name with Word Wrap */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 group-hover:text-primary-600 transition-colors leading-tight break-words">
                    {getDisplayName(creator)}
                  </p>
                </div>
              </Link>

              {/* Unfollow Button */}
              <button
                onClick={(e) => handleUnfollow(creator.id, getDisplayName(creator), e)}
                disabled={unfollowingIds.has(creator.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Unfollow ${getDisplayName(creator)}`}
              >
                {unfollowingIds.has(creator.id) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserMinus className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowingsSection;
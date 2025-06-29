import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { User, Loader2, AlertCircle, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const fetchFollowers = async (userId) => {
  // Get all follower user IDs for the current user
  const { data: follows, error: followsError } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('followed_id', userId);
  if (followsError) throw new Error(followsError.message);
  if (!follows || follows.length === 0) return [];

  // Fetch user profiles for all follower IDs
  const followerIds = follows.map(f => f.follower_id);
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, created_at')
    .in('id', followerIds);
  if (usersError) throw new Error(usersError.message);
  return users || [];
};

// Skeleton Loading Component
const FollowersSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 animate-pulse">
        <div className="flex items-center space-x-3">
          {/* Avatar Skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          
          {/* Content Skeleton */}
          <div className="flex-1">
            {/* Name Skeleton */}
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            
            {/* Join Date Skeleton */}
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Header Skeleton
const HeaderSkeleton = () => (
  <div className="flex items-center space-x-3 mb-6 animate-pulse">
    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
    <div className="h-8 bg-gray-200 rounded w-32"></div>
    <div className="h-6 bg-gray-200 rounded-full w-8"></div>
  </div>
);

const FollowersSection = () => {
  const { user } = useAuth();

  const {
    data: followers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: () => fetchFollowers(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <FollowersSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Users className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold">Followers</h2>
        <span className="ml-2 text-base text-gray-500">({followers.length})</span>
      </div>
      
      {error ? (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error.message}</span>
        </div>
      ) : followers.length === 0 ? (
        <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm border">
          <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-lg font-semibold">You don't have any followers yet.</p>
          <p className="text-sm">When users follow you, they'll appear here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {followers.map(follower => (
            <div key={follower.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3 border border-gray-100 hover:border-primary-200 hover:shadow transition-all duration-200">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {follower.avatar_url ? (
                  <img src={follower.avatar_url} alt={follower.full_name} className="w-12 h-12 object-cover rounded-full" />
                ) : (
                  <User className="w-6 h-6 text-primary-600" />
                )}
              </div>
              <div>
                <Link to={`/creators/${follower.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  {follower.full_name}
                </Link>
                <div className="text-xs text-gray-500 mt-1">
                  Joined {new Date(follower.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersSection;
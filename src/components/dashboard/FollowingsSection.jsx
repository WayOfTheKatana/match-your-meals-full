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
    .select('id, full_name, avatar_url, created_at')
    .in('id', followedIds);
  if (usersError) throw new Error(usersError.message);
  return users || [];
};

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
        <span className="text-gray-700">Loading followings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700">{error.message}</span>
      </div>
    );
  }

  if (followings.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p className="text-lg font-semibold">You're not following anyone yet.</p>
        <p className="text-sm">Start following creators to see them here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Followed Creators</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {followings.map(creator => (
          <div key={creator.id} className="bg-white rounded-xl shadow p-5 flex items-center space-x-4 border border-gray-100">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.full_name} className="w-14 h-14 object-cover rounded-full" />
              ) : (
                <User className="w-7 h-7 text-primary-600" />
              )}
            </div>
            <div>
              <Link to={`/creators/${creator.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                {creator.full_name}
              </Link>
              <div className="text-xs text-gray-500 mt-1">
                Joined {new Date(creator.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingsSection; 
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useFollowing = (followedUserId) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if current user follows the specified user
  const checkFollowingStatus = async () => {
    if (!user || !followedUserId || user.id === followedUserId) {
      setIsFollowing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('is_following', {
          follower_user_id: user.id,
          followed_user_id: followedUserId
        });

      if (error) throw error;

      setIsFollowing(data || false);
    } catch (err) {
      console.error('Error checking following status:', err);
      setError(err.message);
    }
  };

  // Get follower count for the specified user
  const fetchFollowerCount = async () => {
    if (!followedUserId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_follower_count', {
          user_id: followedUserId
        });

      if (error) throw error;

      setFollowerCount(data || 0);
    } catch (err) {
      console.error('Error fetching follower count:', err);
      setError(err.message);
    }
  };

  // Follow a user
  const followUser = async () => {
    if (!user || !followedUserId || user.id === followedUserId) {
      throw new Error('Cannot follow this user');
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('followers')
        .insert([
          {
            follower_id: user.id,
            followed_id: followedUserId
          }
        ]);

      if (error) {
        // Handle duplicate follow error gracefully
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You are already following this user');
        }
        throw error;
      }

      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      
      return { success: true };
    } catch (err) {
      console.error('Error following user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unfollow a user
  const unfollowUser = async () => {
    if (!user || !followedUserId) {
      throw new Error('Cannot unfollow this user');
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', followedUserId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow status
  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollowUser();
    } else {
      await followUser();
    }
  };

  // Load initial data when hook mounts or dependencies change
  useEffect(() => {
    if (followedUserId) {
      checkFollowingStatus();
      fetchFollowerCount();
    }
  }, [user, followedUserId]);

  // Check if user can follow (not themselves and authenticated)
  const canFollow = user && followedUserId && user.id !== followedUserId;

  return {
    isFollowing,
    followerCount,
    loading,
    error,
    followUser,
    unfollowUser,
    toggleFollow,
    canFollow,
    refetch: () => {
      checkFollowingStatus();
      fetchFollowerCount();
    }
  };
};
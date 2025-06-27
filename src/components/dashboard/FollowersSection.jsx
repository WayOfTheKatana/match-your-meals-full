import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { User, Loader2, AlertCircle, Users } from 'lucide-react';

const FollowersSection = () => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      setError('');
      try {
        // Get all follower user IDs for the current user
        const { data: follows, error: followsError } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('followed_id', user.id);

        if (followsError) throw followsError;
        if (!follows || follows.length === 0) {
          setFollowers([]);
          setLoading(false);
          return;
        }

        // Fetch user profiles for all follower IDs
        const followerIds = follows.map(f => f.follower_id);
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, created_at')
          .in('id', followerIds);

        if (usersError) throw usersError;
        setFollowers(users || []);
      } catch (err) {
        setError(err.message || 'Failed to load followers');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFollowers();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
        <span className="text-gray-700">Loading followers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700">{error}</span>
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
      {followers.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-lg font-semibold">You don't have any followers yet.</p>
          <p className="text-sm">When users follow you, they'll appear here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {followers.map(follower => (
            <div key={follower.id} className="bg-white rounded-xl shadow p-5 flex items-center space-x-4 border border-gray-100">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                {follower.avatar_url ? (
                  <img src={follower.avatar_url} alt={follower.full_name} className="w-14 h-14 object-cover rounded-full" />
                ) : (
                  <User className="w-7 h-7 text-primary-600" />
                )}
              </div>
              <div>
                <Link to={`/creators/${follower.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
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
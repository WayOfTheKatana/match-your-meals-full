import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Loader2, AlertCircle, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const fetchRecentUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, created_at, email')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) throw new Error(error.message);
  return data || [];
};

const RegisteredUsersWidget = () => {
  const {
    data: recentUsers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: fetchRecentUsers,
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
    return user.email ? user.email.split('@')[0] : 'User';
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-primary-600" />
        New Members
      </h3>
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600 mr-2" />
          <span className="text-sm text-gray-600">Loading members...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-700">Failed to load members</span>
        </div>
      )}

      {!isLoading && !error && recentUsers.length === 0 && (
        <div className="text-center py-4">
          <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No members yet</p>
        </div>
      )}

      {!isLoading && !error && recentUsers.length > 0 && (
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <Link
              key={user.id}
              to={`/creators/${user.id}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* User Avatar */}
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={getDisplayName(user)}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-600" />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {getDisplayName(user)}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Joined {formatJoinDate(user.created_at)}</span>
                </div>
              </div>

              {/* New Badge for recent users (joined within last 3 days) */}
              {(() => {
                const daysSinceJoined = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
                return daysSinceJoined <= 3 ? (
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
      {!isLoading && !error && recentUsers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link
            to="/dashboard/community"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View all members →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RegisteredUsersWidget;
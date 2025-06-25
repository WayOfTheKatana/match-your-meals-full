import React from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Clock, 
  Loader2, 
  AlertCircle, 
  X 
} from 'lucide-react';
import { Button } from '../ui/button';

const SearchHistorySection = ({ 
  searchHistory,
  loading,
  error,
  handleDeleteSearchHistory,
  handleClearAllHistory,
  handleSearchFromHistory,
  handleNavigationClick
}) => {
  const formatDate = (dateString) => {
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
      {/* Search History Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
              <History className="w-6 h-6 mr-3 text-primary-600" />
              Recipe Search History
            </h2>
            <p className="text-gray-600">
              {searchHistory.length > 0 
                ? `You have ${searchHistory.length} search${searchHistory.length === 1 ? '' : 'es'} in your history`
                : 'No search history yet. Start exploring recipes to build your search history!'
              }
            </p>
          </div>
          {searchHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllHistory}
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search History List */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your search history...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Search History Items */}
          {!loading && !error && searchHistory.length > 0 && (
            <div className="space-y-4">
              {searchHistory.map((historyItem, index) => (
                <div 
                  key={historyItem.id} 
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Search className="w-5 h-5 text-primary-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleSearchFromHistory(historyItem.query)}
                        className="text-left w-full group-hover:text-primary-600 transition-colors"
                      >
                        <p className="font-medium text-gray-900 truncate">
                          "{historyItem.query}"
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(historyItem.created_at)}</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearchFromHistory(historyItem.query)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 hover:bg-primary-50"
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Search Again
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSearchHistory(historyItem.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Search History */}
          {!loading && !error && searchHistory.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Search History Yet</h4>
              <p className="text-gray-600 mb-4">Start exploring recipes to build your search history!</p>
              <Button 
                onClick={() => handleNavigationClick('home')} 
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Start Searching
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHistorySection;
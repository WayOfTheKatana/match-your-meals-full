import React, { useState, useEffect } from 'react';
import { Search, Mic, Loader2, MicOff, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import LoginModal from '../LoginModal';

const DashboardSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  handleKeyPress, 
  handleSearch, 
  handleQuickSearch, 
  searchLoading, 
  isCreatorMode,
  addSearchHistory // New prop for saving search history
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Speech recognition hook
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: speechSupported,
    toggleListening,
    resetTranscript,
    clearError
  } = useSpeechRecognition();

  // Update search query when transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript, setSearchQuery]);

  // Clear speech error after 5 seconds
  useEffect(() => {
    if (speechError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [speechError, clearError]);

  const handleVoiceSearch = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      toggleListening();
    } else {
      resetTranscript();
      setSearchQuery('');
      toggleListening();
    }
  };

  const handleLoginSuccess = () => {
    console.log('Search after login:', searchQuery);
    navigate('/dashboard');
  };

  // Enhanced handleSearch to save search history
  const handleSearchWithHistory = async () => {
    // Perform the search
    handleSearch();
    
    // Save to search history if user is authenticated and query is not empty
    if (user && searchQuery.trim() && addSearchHistory) {
      try {
        await addSearchHistory(searchQuery.trim());
        console.log('Search query saved to history:', searchQuery.trim());
      } catch (error) {
        console.error('Failed to save search to history:', error);
        // Don't show error to user as this is not critical functionality
      }
    }
  };

  // Enhanced handleQuickSearch to save search history
  const handleQuickSearchWithHistory = async (query) => {
    // Perform the quick search
    handleQuickSearch(query);
    
    // Save to search history if user is authenticated
    if (user && query.trim() && addSearchHistory) {
      try {
        await addSearchHistory(query.trim());
        console.log('Quick search query saved to history:', query.trim());
      } catch (error) {
        console.error('Failed to save quick search to history:', error);
        // Don't show error to user as this is not critical functionality
      }
    }
  };

  // Enhanced handleKeyPress to save search history
  const handleKeyPressWithHistory = (e) => {
    if (e.key === 'Enter') {
      handleSearchWithHistory();
    } else {
      handleKeyPress(e);
    }
  };

  const getPlaceholderText = () => {
    if (isListening) {
      return "Listening... Speak your recipe request";
    } else if (isCreatorMode) {
      return "Search your published recipes...";
    } else {
      return "Search for recipes by ingredients, cuisine, or dietary needs...";
    }
  };

  const getMicrophoneIcon = () => {
    if (!speechSupported) {
      return <MicOff className="w-5 h-5" />;
    }
    return <Mic className="w-5 h-5" />;
  };

  const getMicrophoneButtonClass = () => {
    if (!speechSupported) {
      return 'text-gray-300 cursor-not-allowed opacity-50';
    } else if (isListening) {
      return 'bg-red-50 text-red-500 animate-pulse shadow-md border-2 border-red-200';
    } else {
      return 'text-gray-400 hover:text-primary-600 hover:bg-primary-50';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center font-sans">
          <Search className="w-5 h-5 mr-2 text-primary-600" />
          {isCreatorMode ? 'Search Your Recipes' : 'Find New Recipes'}
        </h3>

        {/* Speech Error Alert */}
        {speechError && (
          <div className="mb-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">Speech Recognition Error</p>
                <p className="text-xs text-red-600">{speechError}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Voice Status Indicator */}
        {isListening && (
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium text-sm">Listening for your voice...</span>
              </div>
              <button
                onClick={handleVoiceSearch}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Stop
              </button>
            </div>
          </div>
        )}
        
        <div className="relative flex items-center bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20 border border-gray-200 focus-within:border-primary-300">
          {/* Voice/Mic Icon */}
          <div className="flex items-center pl-4 pr-3">
            <button
              onClick={handleVoiceSearch}
              disabled={!speechSupported}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${getMicrophoneButtonClass()}`}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              title={
                !speechSupported 
                  ? "Speech recognition not supported in this browser" 
                  : isListening 
                    ? "Stop listening" 
                    : "Start voice search"
              }
            >
              {getMicrophoneIcon()}
            </button>
          </div>
          
          {/* Search Input */}
          <div className="flex-1 font-sans relative">
            <Input
              type="text"
              placeholder={getPlaceholderText()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPressWithHistory}
              className="w-full border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-400 h-12 text-base bg-transparent px-0 text-sm"
            />
            
            {/* Voice Input Indicator */}
            {isListening && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Icon/Button */}
          <div className="flex items-center pr-4 pl-3">
            <button
              onClick={handleSearchWithHistory}
              disabled={searchLoading}
              className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 ease-in-out hover:scale-110 shadow-md hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Search recipes"
            >
              {searchLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Search Tags */}
        <div className="mt-4 flex flex-wrap gap-2 font-sans text-xs">
          {(isCreatorMode 
            ? ['My Popular', 'Recent', 'Drafts', 'High Rated'] 
            : ['Healthy', 'Quick & Easy', 'Vegetarian', 'Low Carb', 'High Protein']
          ).map((tag, index) => (
            <button
              key={index}
              onClick={() => handleQuickSearchWithHistory(tag.toLowerCase())}
              disabled={searchLoading}
              className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Voice Search Tip */}
        {speechSupported && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 flex items-center">
              <Mic className="w-3 h-3 mr-1" />
              Tip: Click the microphone icon to search with your voice
            </p>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default DashboardSearchBar;
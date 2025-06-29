import React, { useState, useEffect } from 'react';
import { Search, Mic, TrendingUp, MicOff, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import LoginModal from './LoginModal';

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
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

  const trendingRecipes = [
    "Tuna with Salads Epic Recipe",
    "Tuna With Salmon Recipe",
    "Vanilla Milkshake Post-workout Recipe"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRecipeIndex((prevIndex) => 
        (prevIndex + 1) % trendingRecipes.length
      );
    }, 3000); // Change recipe every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Update search query when transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

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
      // Stop listening and clear transcript if needed
      toggleListening();
    } else {
      // Start listening and reset previous transcript
      resetTranscript();
      setSearchQuery('');
      toggleListening();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSearch = () => {
    if (user) {
      // User is authenticated, proceed with search
      console.log('Search:', searchQuery);
      // Navigate to search results or dashboard
      navigate('/dashboard');
    } else {
      // User is not authenticated, show login modal
      setShowLoginModal(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, proceed with search
    console.log('Search after login:', searchQuery);
    navigate('/dashboard');
  };

  const getPlaceholderText = () => {
    if (isListening) {
      return "Listening... Speak your recipe request";
    } else if (isFocused) {
      return "Type your recipe search...";
    } else {
      return "pre-workout banana milkshake and suggest me post workout";
    }
  };

  const getMicrophoneIcon = () => {
    if (!speechSupported) {
      return <MicOff className="w-6 h-6" />;
    }
    return <Mic className="w-6 h-6" />;
  };

  const getMicrophoneButtonClass = () => {
    if (!speechSupported) {
      return 'text-gray-300 cursor-not-allowed opacity-50';
    } else if (isListening) {
      return 'bg-red-50 text-red-500 animate-pulse shadow-lg border-2 border-red-200';
    } else {
      return 'text-gray-400 hover:text-primary-600 hover:bg-primary-50';
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto w-full backdrop-blur-sm bg-black/20 py-12 rounded-3xl">
        {/* Badge */}
        <div className="mb-8 animate-fade-in">
          <span className="inline-flex items-center px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-sm font-medium font-urbanist">
            AI Powered Recipe Search
          </span>
        </div>

        {/* Main Heading */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-6xl font-urbanist text-white mb-1.5 leading-tight font-medium tracking-normal">
            Find Your Perfect
          </h1>
          <h1 className="text-3xl md:text-6xl font-urbanist text-white mb-4 leading-tight font-medium">
            Recipe in <span className="italic font-light font-dm-serif md:text-[4rem]">Seconds</span>
          </h1>
        </div>

        {/* Speech Error Alert */}
        {speechError && (
          <div className="w-full max-w-4xl mb-4 animate-slide-up">
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
          <div className="w-full max-w-4xl mb-4 animate-slide-up">
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

        {/* Full-Width Search Bar */}
        <div className="w-full max-w-4xl mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-3xl focus-within:shadow-3xl focus-within:scale-[1.01] border border-white/20">
            {/* Voice/Mic Icon */}
            <div className="flex items-center pl-6 pr-4">
              <button
                onClick={handleVoiceSearch}
                disabled={!speechSupported}
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${getMicrophoneButtonClass()}`}
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
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={getPlaceholderText()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="w-full border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-400 h-16 text-lg bg-transparent px-0 placeholder:transition-opacity placeholder:duration-300 focus:placeholder:opacity-50"
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
            <div className="flex items-center pr-6 pl-4">
              <button
                onClick={handleSearch}
                className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 ease-in-out hover:scale-110 shadow-lg hover:shadow-xl group"
                aria-label="Search recipes"
              >
                <Search className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Search Suggestions/Quick Actions */}
          {isFocused && (
            <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {['Healthy breakfast', 'Quick dinner', 'Vegan protein', 'Low carb', 'Meal prep'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              {/* Voice Search Tip */}
              {speechSupported && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 flex items-center">
                    <Mic className="w-3 h-3 mr-1" />
                    Tip: Click the microphone icon or press and hold to search with your voice
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trending Section */}
        <div className="flex items-center justify-center space-x-6 text-white/80 animate-slide-up max-w-2xl" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">Trending recipes</span>
          </div>
          <div className="relative h-6 flex-1 overflow-hidden">
            <div 
              className="absolute inset-0 transition-transform duration-700 ease-in-out"
              style={{ 
                transform: `translateY(-${currentRecipeIndex * 100}%)` 
              }}
            >
              {trendingRecipes.map((recipe, index) => (
                <div
                  key={index}
                  className="h-6 flex items-center justify-center"
                >
                  <span className="text-sm whitespace-nowrap text-center">
                    {recipe}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default SearchSection;
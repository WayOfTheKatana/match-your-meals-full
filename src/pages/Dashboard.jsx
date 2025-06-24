import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Plus, Heart, BookOpen, Clock, Users, ChefHat, TrendingUp, Sparkles, AlertCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import RecipeCreationModal from '../components/RecipeCreationModal';
import RecipeSearchResults from '../components/RecipeSearchResults';
import { useSavedRecipes } from '../hooks/useSavedRecipes';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResultsQuery, setSearchResultsQuery] = useState('');

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

  // Saved recipes hook
  const { savedRecipes, loading: savedRecipesLoading } = useSavedRecipes();

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
      // Stop listening
      toggleListening();
    } else {
      // Start listening and reset previous transcript
      resetTranscript();
      setSearchQuery('');
      toggleListening();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchResultsQuery(searchQuery.trim());
      setShowSearchResults(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRecipeCreated = (recipe) => {
    console.log('Recipe created:', recipe);
    // Optionally refresh saved recipes or show success message
  };

  const handleRecipePublished = (recipe) => {
    console.log('Recipe published:', recipe);
    // Optionally refresh saved recipes or show success message
  };

  const getPlaceholderText = () => {
    if (isListening) {
      return "Listening... Speak your recipe request";
    } else {
      return "Search for recipes by ingredients, cuisine, or dietary preferences...";
    }
  };

  const getMicrophoneIcon = () => {
    if (!speechSupported) {
      return <MicOff className="w-4 h-4" />;
    }
    return <Mic className="w-4 h-4" />;
  };

  const getMicrophoneButtonClass = () => {
    if (!speechSupported) {
      return 'p-2 rounded-full transition-all duration-300 hover:scale-110 text-gray-300 cursor-not-allowed opacity-50';
    } else if (isListening) {
      return 'p-2 rounded-full transition-all duration-300 hover:scale-110 bg-red-50 text-red-500 animate-pulse shadow-lg border-2 border-red-200';
    } else {
      return 'p-2 rounded-full transition-all duration-300 hover:scale-110 text-gray-400 hover:text-primary-600 hover:bg-primary-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-serif text-primary-600">MatchMyMeals</h1>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Left Sidebar */}
        <aside className="w-64 mr-8">
          <nav className="space-y-2">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
              <Search className="w-4 h-4 mr-3" />
              Recipe Search
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <Heart className="w-4 h-4 mr-3" />
              Saved Recipes ({savedRecipes.length})
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <ChefHat className="w-4 h-4 mr-3" />
              My Recipes
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-3" />
              Trending
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 max-w-2xl">
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-serif text-gray-900">
                Welcome back, {user?.email?.split('@')[0]}!
              </h2>
              <p className="text-gray-600">
                Discover amazing recipes tailored to your taste and dietary preferences
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Speech Error Alert */}
              {speechError && (
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
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Voice Status Indicator */}
              {isListening && (
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
              )}

              {/* Search Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-primary-600" />
                  Find Your Perfect Recipe
                </h3>
                
                <div className="relative flex items-center bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20 border border-gray-200 focus-within:border-primary-300">
                  {/* Voice/Mic Button - This is the inspected element */}
                  <div className="flex items-center pl-4 pr-3">
                    <button
                      onClick={handleVoiceSearch}
                      disabled={!speechSupported}
                      className={getMicrophoneButtonClass()}
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
                      onKeyPress={handleKeyPress}
                      className="w-full border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-400 h-12 bg-transparent px-0"
                    />
                    
                    {/* Voice Input Indicator */}
                    {isListening && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Search Button */}
                  <div className="flex items-center pr-4 pl-3">
                    <button
                      onClick={handleSearch}
                      className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 ease-in-out hover:scale-110 shadow-sm hover:shadow-md"
                      aria-label="Search recipes"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Search Suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {['High protein', 'Vegetarian', 'Quick meals', 'Low carb', 'Heart healthy'].map((suggestion, index) => (
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
                      Tip: Click the microphone icon to search with your voice
                    </p>
                  </div>
                )}
              </div>

              {/* Create Recipe Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary-600" />
                  Share Your Recipe
                </h3>
                <p className="text-gray-600 mb-4">
                  Have a delicious recipe to share? Create and publish your own recipes with AI-powered nutritional analysis.
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create New Recipe</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 ml-8">
          <div className="space-y-6">
            {/* Saved Recipes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Saved Recipes
              </h3>
              
              {savedRecipesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : savedRecipes.length > 0 ? (
                <div className="space-y-3">
                  {savedRecipes.slice(0, 5).map((savedRecipe) => (
                    <div key={savedRecipe.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <img
                        src={savedRecipe.recipes?.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={savedRecipe.recipes?.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {savedRecipe.recipes?.title}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{(savedRecipe.recipes?.prep_time || 0) + (savedRecipe.recipes?.cook_time || 0)}m</span>
                          <Users className="w-3 h-3" />
                          <span>{savedRecipe.recipes?.servings}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {savedRecipes.length > 5 && (
                    <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all {savedRecipes.length} saved recipes
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No saved recipes yet</p>
                  <p className="text-gray-400 text-xs">Start searching to save your favorites!</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Saved Recipes</span>
                  <span className="text-sm font-medium text-gray-900">{savedRecipes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Searches Today</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipes Created</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleRecipeCreated}
        onPublish={handleRecipePublished}
      />

      {/* Search Results Modal */}
      {showSearchResults && (
        <RecipeSearchResults
          searchQuery={searchResultsQuery}
          onClose={() => setShowSearchResults(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
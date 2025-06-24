import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Plus, Heart, BookOpen, Clock, Users, ChefHat, Sparkles, AlertCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import RecipeCreationModal from '../components/RecipeCreationModal';
import RecipeSearchResults from '../components/RecipeSearchResults';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { savedRecipes, loading: savedRecipesLoading } = useSavedRecipes();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  
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
      setShowSearchResults(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getPlaceholderText = () => {
    if (isListening) {
      return "Listening... Speak your recipe request";
    } else if (isFocused) {
      return "Search for recipes by ingredients, cuisine, or dietary preferences...";
    } else {
      return "Search for recipes by ingredients, cuisine, or dietary preferences...";
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
      return 'bg-red-50 text-red-500 animate-pulse shadow-lg border-2 border-red-200';
    } else {
      return 'text-gray-400 hover:text-primary-600 hover:bg-primary-50';
    }
  };

  const handleRecipeCreated = (recipe) => {
    console.log('Recipe created:', recipe);
    // Refresh saved recipes or handle the new recipe
  };

  const handleRecipePublished = (recipe) => {
    console.log('Recipe published:', recipe);
    // Handle published recipe
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalTime = (recipe) => {
    return (recipe.prep_time || 0) + (recipe.cook_time || 0);
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
      <main className="flex max-w-7xl mx-auto">
        {/* Main Content Area */}
        <div className="flex-1 max-w-2xl">
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-serif text-gray-900 mb-2">
                  Welcome back! 👋
                </h2>
                <p className="text-gray-600">
                  Discover amazing recipes tailored to your taste and dietary preferences.
                </p>
              </div>

              {/* Search Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                    AI-Powered Recipe Search
                  </h3>

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
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-700 font-medium text-sm">Listening for your voice...</span>
                        {/* Audio wave indicator */}
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                      <button
                        onClick={handleVoiceSearch}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative flex items-center bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20 border border-gray-200 focus-within:border-primary-300">
                    {/* Voice/Mic Button */}
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

                    {/* Search Input Field */}
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder={getPlaceholderText()}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        className="w-full border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-500 h-12 text-base bg-transparent px-0"
                      />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-center pr-4 pl-3">
                      <button
                        onClick={handleSearch}
                        className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 ease-in-out hover:scale-110 shadow-lg hover:shadow-xl group"
                        aria-label="Search recipes"
                      >
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>

                  {/* Search Suggestions */}
                  {isFocused && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'High protein breakfast',
                          'Quick dinner recipes',
                          'Vegan meal prep',
                          'Low carb lunch',
                          'Heart healthy snacks'
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(suggestion)}
                            className="px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors border border-gray-200 hover:border-primary-200"
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
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center space-x-2 h-12 bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Recipe</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12 border-primary-200 text-primary-700 hover:bg-primary-50"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Browse Favorites</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-6">
            {/* Saved Recipes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Saved Recipes
              </h3>
              
              {savedRecipesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-20"></div>
                    </div>
                  ))}
                </div>
              ) : savedRecipes.length > 0 ? (
                <div className="space-y-3">
                  {savedRecipes.slice(0, 3).map((savedRecipe) => (
                    <div key={savedRecipe.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                      <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                        {savedRecipe.recipes.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {savedRecipe.recipes.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(getTotalTime(savedRecipe.recipes))}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {savedRecipe.recipes.servings}
                        </span>
                      </div>
                    </div>
                  ))}
                  {savedRecipes.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full text-primary-600 hover:text-primary-700">
                      View All ({savedRecipes.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No saved recipes yet</p>
                  <p className="text-gray-400 text-xs">Start exploring to save your favorites!</p>
                </div>
              )}
            </div>

            {/* Recipe Stats */}
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-4 border border-primary-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Recipe Journey</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipes Saved</span>
                  <span className="font-semibold text-primary-600">{savedRecipes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipes Created</span>
                  <span className="font-semibold text-primary-600">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Searches</span>
                  <span className="font-semibold text-primary-600">-</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <RecipeCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleRecipeCreated}
        onPublish={handleRecipePublished}
      />

      {/* Search Results Modal */}
      {showSearchResults && (
        <RecipeSearchResults
          searchQuery={searchQuery}
          onClose={() => setShowSearchResults(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
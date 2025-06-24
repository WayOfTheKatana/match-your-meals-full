import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Plus, Heart, Clock, Users, ChefHat, TrendingUp, User, Settings, LogOut, Sparkles, MicOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import RecipeCreationModal from '../components/RecipeCreationModal';
import RecipeSearchResults from '../components/RecipeSearchResults';
import { useSavedRecipes } from '../hooks/useSavedRecipes';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResultsQuery, setSearchResultsQuery] = useState('');
  const { savedRecipes, loading: savedRecipesLoading } = useSavedRecipes();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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

  const handleRecipeCreated = (recipe) => {
    console.log('Recipe created:', recipe);
    // Optionally refresh saved recipes or show success message
  };

  const handleRecipePublished = (recipe) => {
    console.log('Recipe published:', recipe);
    // Optionally refresh saved recipes or show success message
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
      return 'text-red-500 animate-pulse';
    } else {
      return 'text-gray-400 hover:text-primary-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <ChefHat className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-serif text-gray-900">MatchMyMeals</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search & Actions */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-serif mb-2">Welcome back!</h2>
                <p className="text-primary-100">Ready to discover your next favorite recipe?</p>
              </div>

              {/* Search Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center space-x-3 mb-4">
                    <Search className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Find New Recipes</h3>
                  </div>
                  
                  {/* Search Input with Voice */}
                  <div className="relative">
                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
                      {/* Microphone Button */}
                      <button
                        onClick={handleVoiceSearch}
                        disabled={!speechSupported}
                        className={`p-3 rounded-l-xl transition-all duration-200 ${getMicrophoneButtonClass()}`}
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
                      
                      {/* Search Input */}
                      <Input
                        type="text"
                        placeholder={isListening ? "Listening... Speak your recipe request" : "Search for recipes by ingredients, cuisine, or dietary needs..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                      />
                      
                      {/* Voice Indicator */}
                      {isListening && (
                        <div className="flex items-center space-x-1 px-3">
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                      
                      {/* Search Button */}
                      <Button
                        onClick={handleSearch}
                        className="rounded-l-none bg-primary-600 hover:bg-primary-700"
                        disabled={!searchQuery.trim()}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Speech Error */}
                    {speechError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600">{speechError}</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Search Tags */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Healthy', 'Quick & Easy', 'Vegetarian', 'Low Carb', 'High Protein'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Create Recipe Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <Plus className="w-6 h-6 text-primary-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Share Your Recipe</h3>
                      </div>
                      <p className="text-gray-600">Create and share your own recipes with the community</p>
                    </div>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-primary-600 hover:bg-primary-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Recipe</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Saved Recipes */}
          <div className="space-y-6">
            {/* Saved Recipes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Saved Recipes</h3>
              </div>
              
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
                <div className="space-y-4">
                  {savedRecipes.slice(0, 5).map((savedRecipe) => (
                    <div key={savedRecipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 mb-2">{savedRecipe.recipes.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{savedRecipe.recipes.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
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
                    </div>
                  ))}
                  {savedRecipes.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      View All ({savedRecipes.length})
                    </Button>
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
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Your Stats</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saved Recipes</span>
                  <span className="font-semibold text-gray-900">{savedRecipes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recipes Created</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Searches</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <RecipeCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleRecipeCreated}
        onPublish={handleRecipePublished}
      />

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
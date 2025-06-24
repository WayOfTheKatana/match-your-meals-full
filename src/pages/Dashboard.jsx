import React, { useState } from 'react';
import { Search, Plus, Bookmark, Grid3X3, ChefHat, User, Settings, LogOut, Mic, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import RecipeCreationModal from '../components/RecipeCreationModal';
import RecipeSearchResults from '../components/RecipeSearchResults';
import CategoriesSection from '../components/CategoriesSection';
import { useSavedRecipes } from '../hooks/useSavedRecipes';

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { savedRecipes, loading: savedRecipesLoading } = useSavedRecipes();

  // State management
  const [activeView, setActiveView] = useState('all_recipes'); // 'all_recipes', 'saved_recipes', 'categories'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      setActiveView('all_recipes');
      setCategoryFilter(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategorySelect = (tag, type) => {
    console.log('🏷️ Category selected in Dashboard:', { tag, type });
    setCategoryFilter({ tag, type });
    setSearchQuery('');
    setActiveView('all_recipes');
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view !== 'all_recipes') {
      setSearchQuery('');
      setCategoryFilter(null);
    }
  };

  const handleRecipeCreated = (recipe) => {
    console.log('✅ Recipe created:', recipe);
    setShowCreateModal(false);
    // Refresh the current view
    if (activeView === 'all_recipes') {
      setSearchQuery(''); // This will trigger a refresh of all recipes
      setCategoryFilter(null);
    }
  };

  const handleRecipePublished = (recipe) => {
    console.log('✅ Recipe published:', recipe);
    setShowCreateModal(false);
    // Refresh the current view
    if (activeView === 'all_recipes') {
      setSearchQuery(''); // This will trigger a refresh of all recipes
      setCategoryFilter(null);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'saved_recipes':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-serif text-gray-900 mb-2">Your Saved Recipes</h2>
              <p className="text-gray-600">
                {savedRecipesLoading 
                  ? 'Loading your saved recipes...'
                  : `You have ${savedRecipes.length} saved recipe${savedRecipes.length === 1 ? '' : 's'}`
                }
              </p>
            </div>

            {savedRecipesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading saved recipes...</p>
                </div>
              </div>
            ) : savedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {savedRecipes.map((savedRecipe) => {
                  const recipe = savedRecipe.recipes;
                  if (!recipe) return null;

                  return (
                    <div key={savedRecipe.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            Saved
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {recipe.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {recipe.description}
                        </p>

                        <div className="flex items-center justify-between text-gray-700 mb-6">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">
                              {((recipe.prep_time || 0) + (recipe.cook_time || 0)) < 60 
                                ? `${(recipe.prep_time || 0) + (recipe.cook_time || 0)}m`
                                : `${Math.floor(((recipe.prep_time || 0) + (recipe.cook_time || 0)) / 60)}h ${((recipe.prep_time || 0) + (recipe.cook_time || 0)) % 60}m`
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{recipe.servings} servings</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                            <span>Saved</span>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700"
                          >
                            <span>View Recipe</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bookmark className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Saved Recipes</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't saved any recipes yet. Browse recipes and click the heart icon to save your favorites.
                </p>
                <Button 
                  onClick={() => handleViewChange('all_recipes')}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Browse Recipes
                </Button>
              </div>
            )}
          </div>
        );

      case 'categories':
        return <CategoriesSection onSelectCategory={handleCategorySelect} />;

      case 'all_recipes':
      default:
        return (
          <RecipeSearchResults 
            searchQuery={searchQuery} 
            categoryFilter={categoryFilter}
          />
        );
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
              <ChefHat className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-serif text-gray-900">MatchMyMeals</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder={isSearchFocused ? "Search for recipes..." : "Search healthy recipes, ingredients, or dietary preferences..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-12 h-10 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    onClick={handleSearch}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Recipe</span>
              </Button>

              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => handleViewChange('all_recipes')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'all_recipes'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChefHat className="w-5 h-5" />
                  <span className="font-medium">All Recipes</span>
                </button>

                <button
                  onClick={() => handleViewChange('saved_recipes')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'saved_recipes'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                  <span className="font-medium">Saved Recipes</span>
                  {savedRecipes.length > 0 && (
                    <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                      activeView === 'saved_recipes'
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-100 text-primary-600'
                    }`}>
                      {savedRecipes.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleViewChange('categories')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeView === 'categories'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="font-medium">By Categories</span>
                </button>
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Saved Recipes</span>
                    <span className="text-sm font-medium text-gray-900">{savedRecipes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <span className="text-sm font-medium text-primary-600 capitalize">
                      {userProfile?.subscription_status || 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleRecipeCreated}
        onPublish={handleRecipePublished}
      />
    </div>
  );
};

export default Dashboard;
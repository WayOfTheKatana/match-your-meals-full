import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { AlertCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RecipeCreationModal from '../components/RecipeCreationModal';

// Dashboard Components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebarNav from '../components/dashboard/DashboardSidebarNav';
import DashboardSearchBar from '../components/dashboard/DashboardSearchBar';
import DashboardSearchResults from '../components/dashboard/DashboardSearchResults';
import CreatorQuickActions from '../components/dashboard/CreatorQuickActions';
import RecipeFeedSection from '../components/dashboard/RecipeFeedSection';
import SavedRecipesSection from '../components/dashboard/SavedRecipesSection';
import SearchHistorySection from '../components/dashboard/SearchHistorySection';
import RecipeCategoriesBrowser from '../components/dashboard/RecipeCategoriesBrowser';
import DashboardRightSidebar from '../components/dashboard/DashboardRightSidebar';
import FollowingsSection from '../components/dashboard/FollowingsSection';
import PublishedRecipesSection from '../components/dashboard/PublishedRecipesSection';
import FollowersSection from '../components/dashboard/FollowersSection';

// Navigation items
import { 
  Home, 
  Bookmark, 
  Grid3X3, 
  History, 
  Users, 
  HelpCircle, 
  FileText, 
  UserCheck, 
  CheckCircle, 
  BarChart3, 
  DollarSign,
  BookOpen,
  Heart,
  Search,
  Clock,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, signOut, isConnected } = useAuth();
  const { savedRecipes, saveRecipe, removeSavedRecipe, isRecipeSaved, loading: savedRecipesLoading } = useSavedRecipes();
  const { searchHistory, addSearchHistory, deleteSearchHistory, clearAllSearchHistory, loading: searchHistoryLoading, error: searchHistoryError } = useSearchHistory();
  
  // State variables
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState('');
  const [currentView, setCurrentView] = useState('home');
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [relatedRecipesLoading, setRelatedRecipesLoading] = useState(false);

  useEffect(() => {
    console.log('Dashboard loaded - User:', user?.email);
    console.log('User Profile:', userProfile);
    console.log('Connected to Supabase:', isConnected);
    
    if (isConnected) {
      fetchRecentRecipes();
    }
  }, [user, userProfile, isConnected]);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError('');
    }
  }, [searchQuery]);

  // Fetch related recipes when saved recipes change and we're on saved view
  useEffect(() => {
    if (currentView === 'saved' && savedRecipes.length > 0) {
      fetchRelatedRecipes();
    }
  }, [currentView, savedRecipes]);

  // Fetch recent recipes from database
  const fetchRecentRecipes = async () => {
    setRecipesLoading(true);
    setRecipesError('');

    try {
      console.log('🔄 Fetching recent recipes from database...');
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          slug,
          title,
          description,
          prep_time,
          cook_time,
          servings,
          image_path,
          ingredients,
          instructions,
          health_tags,
          dietary_tags,
          health_benefits,
          nutritional_info,
          creator_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error fetching recipes:', error);
        throw error;
      }

      console.log('✅ Fetched recipes successfully:', data?.length || 0);
      setRecentRecipes(data || []);
    } catch (err) {
      console.error('❌ Error in fetchRecentRecipes:', err);
      setRecipesError(err.message || 'Failed to load recipes');
    } finally {
      setRecipesLoading(false);
    }
  };

  // Fetch related recipes based on saved recipes' tags and ingredients
  const fetchRelatedRecipes = async () => {
    setRelatedRecipesLoading(true);
    
    try {
      console.log('🔄 Fetching related recipes based on saved recipes...');
      
      const allHealthTags = [];
      const allDietaryTags = [];
      const allIngredients = [];
      
      savedRecipes.forEach(saved => {
        const recipe = saved.recipes;
        if (recipe.health_tags) {
          allHealthTags.push(...recipe.health_tags);
        }
        if (recipe.dietary_tags) {
          allDietaryTags.push(...recipe.dietary_tags);
        }
        if (recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            allIngredients.push(ing.name?.toLowerCase());
          });
        }
      });

      const uniqueHealthTags = [...new Set(allHealthTags)];
      const uniqueDietaryTags = [...new Set(allDietaryTags)];
      const uniqueIngredients = [...new Set(allIngredients)];

      console.log('📊 User preferences:', {
        healthTags: uniqueHealthTags,
        dietaryTags: uniqueDietaryTags,
        ingredients: uniqueIngredients.slice(0, 5)
      });

      const savedRecipeIds = savedRecipes.map(saved => saved.recipe_id);

      let query = supabase
        .from('recipes')
        .select(`
          id,
          slug,
          title,
          description,
          prep_time,
          cook_time,
          servings,
          image_path,
          ingredients,
          health_tags,
          dietary_tags,
          health_benefits,
          nutritional_info,
          creator_id,
          created_at
        `)
        .not('id', 'in', `(${savedRecipeIds.join(',')})`)
        .limit(6);

      if (uniqueDietaryTags.length > 0) {
        query = query.overlaps('dietary_tags', uniqueDietaryTags);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching related recipes:', error);
        throw error;
      }

      console.log('✅ Fetched related recipes successfully:', data?.length || 0);
      setRelatedRecipes(data || []);
    } catch (err) {
      console.error('❌ Error in fetchRelatedRecipes:', err);
    } finally {
      setRelatedRecipesLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMode = () => {
    setIsCreatorMode(!isCreatorMode);
  };

  const handleCreateRecipe = () => {
    setShowRecipeModal(true);
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      console.log('🔍 Starting semantic search for:', query);

      const { data, error: searchError } = await supabase.functions.invoke('recipe-semantic-search', {
        body: {
          query: query.trim()
        }
      });

      if (searchError) {
        console.error('❌ Search function error:', searchError);
        throw new Error(`Search failed: ${searchError.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      console.log('✅ Search completed:', data);
      setSearchResults(data.results || []);

    } catch (err) {
      console.error('❌ Search error:', err);
      setSearchError(err.message || 'Failed to search recipes. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Handle search from history
  const handleSearchFromHistory = (query) => {
    setSearchQuery(query);
    performSearch(query);
    // Switch to home view to show search results
    setCurrentView('home');
  };

  // Handle delete search history
  const handleDeleteSearchHistory = async (historyId) => {
    try {
      await deleteSearchHistory(historyId);
      console.log('Search history item deleted:', historyId);
    } catch (error) {
      console.error('Error deleting search history:', error);
      alert(error.message || 'Failed to delete search history. Please try again.');
    }
  };

  // Handle clear all search history
  const handleClearAllHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      try {
        await clearAllSearchHistory();
        console.log('All search history cleared');
      } catch (error) {
        console.error('Error clearing search history:', error);
        alert(error.message || 'Failed to clear search history. Please try again.');
      }
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalTime = (recipe) => {
    return (recipe.prep_time || 0) + (recipe.cook_time || 0);
  };

  const handleSaveSearchedRecipe = async (recipeId) => {
    try {
      if (isRecipeSaved(recipeId)) {
        await removeSavedRecipe(recipeId);
        console.log('Recipe removed from saved list:', recipeId);
      } else {
        await saveRecipe(recipeId);
        console.log('Recipe saved successfully:', recipeId);
      }
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    }
  };

  const handleRecipeSave = async (recipeData) => {
    console.log('Recipe saved as draft:', recipeData);
    await fetchRecentRecipes();
  };

  const handlePublishRecipe = async (recipeData) => {
    console.log('Recipe published:', recipeData);
    await fetchRecentRecipes();
  };

  const handleRemoveSavedRecipe = async (recipeId) => {
    try {
      await removeSavedRecipe(recipeId);
      console.log('Recipe removed from saved list:', recipeId);
    } catch (error) {
      console.error('Error removing saved recipe:', error);
      alert(error.message || 'Failed to remove recipe. Please try again.');
    }
  };

  // Consumer Mode Data
  const consumerStats = [
    { label: 'Recipes Saved', value: savedRecipes.length.toString(), icon: BookOpen, color: 'text-blue-600' },
    { label: 'Favorites', value: '12', icon: Heart, color: 'text-red-500' },
    { label: 'Searches Today', value: '8', icon: Search, color: 'text-green-600' },
    { label: 'Cooking Time', value: '2.5h', icon: Clock, color: 'text-purple-600' }
  ];

  // Creator Mode Data
  const creatorStats = [
    { label: 'Published Recipes', value: '18', icon: FileText, color: 'text-blue-600' },
    { label: 'Total Followers', value: '1.2k', icon: Users, color: 'text-green-600' },
    { label: 'Monthly Views', value: '5.8k', icon: Eye, color: 'text-purple-600' },
    { label: 'Revenue', value: '$234', icon: DollarSign, color: 'text-emerald-600' }
  ];

  // Creator's published recipes
  const publishedRecipes = [
    { name: 'Ultimate Protein Bowl', time: '30 min', rating: 4.9, views: '2.1k', status: 'Published', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Keto Salmon Delight', time: '25 min', rating: 4.8, views: '1.8k', status: 'Published', image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Morning Energy Toast', time: '15 min', rating: 4.7, views: '1.5k', status: 'Under Review', image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Green Power Smoothie', time: '10 min', rating: 4.6, views: '1.2k', status: 'Published', image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  const consumerNavigationItems = [
    { name: 'Home / Feed', icon: Home, active: currentView === 'home', view: 'home' },
    { name: 'Saved Recipes', icon: Bookmark, active: currentView === 'saved', view: 'saved' },
    { name: 'By Categories', icon: Grid3X3, active: currentView === 'categories', view: 'categories' },
    { name: 'Recipe Search History', icon: History, active: currentView === 'history', view: 'history' },
    { name: 'Followings', icon: Users, active: currentView === 'followings', view: 'followings' },
    { name: 'Help & Support', icon: HelpCircle, active: currentView === 'help', view: 'help' }
  ];

  const creatorNavigationItems = [
    { name: 'Dashboard Overview', icon: Home, active: currentView === 'home', view: 'home' },
    { name: 'Published Recipes', icon: FileText, active: currentView === 'published', view: 'published' },
    { name: 'Followers', icon: UserCheck, active: currentView === 'followers', view: 'followers' },
    { name: 'Recipe Vetting', icon: CheckCircle, active: currentView === 'vetting', view: 'vetting' },
    { name: 'Analytics', icon: BarChart3, active: currentView === 'analytics', view: 'analytics' },
    { name: 'Revenue', icon: DollarSign, active: currentView === 'revenue', view: 'revenue' },
    { name: 'Help & Support', icon: HelpCircle, active: currentView === 'help', view: 'help' }
  ];

  const trendingTopics = [
    'Healthy Breakfast Ideas',
    'Quick Dinner Recipes',
    'Vegan Protein Sources',
    'Meal Prep Sunday',
    'Low Carb Snacks'
  ];

  const upcomingEvents = [
    { title: 'Virtual Cooking Class', date: 'Dec 25', time: '2:00 PM' },
    { title: 'Recipe Contest Deadline', date: 'Dec 28', time: '11:59 PM' },
    { title: 'New Year Meal Prep', date: 'Jan 1', time: '10:00 AM' }
  ];

  const creatorInsights = [
    { title: 'Top Performing Recipe', value: 'Ultimate Protein Bowl', change: '+15%' },
    { title: 'Engagement Rate', value: '8.4%', change: '+2.1%' },
    { title: 'New Followers', value: '47', change: '+12%' }
  ];

  const currentStats = isCreatorMode ? creatorStats : consumerStats;
  const currentNavigation = isCreatorMode ? creatorNavigationItems : consumerNavigationItems;

  // Check if we should show search results
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchResults = hasSearchQuery && (searchLoading || searchResults.length > 0 || searchError);

  // Handle navigation click
  const handleNavigationClick = (view) => {
    setCurrentView(view);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  // Render main content based on current view
  const renderMainContent = () => {
    if (currentView === 'categories') {
      return (
        <RecipeCategoriesBrowser
          isConnected={isConnected}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
          isRecipeSaved={isRecipeSaved}
          handleSaveSearchedRecipe={handleSaveSearchedRecipe}
          handleNavigationClick={handleNavigationClick}
        />
      );
    }

    if (currentView === 'saved') {
      return (
        <SavedRecipesSection
          savedRecipes={savedRecipes}
          savedRecipesLoading={savedRecipesLoading}
          handleRemoveSavedRecipe={handleRemoveSavedRecipe}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
          handleNavigationClick={handleNavigationClick}
        />
      );
    }

    if (currentView === 'history') {
      return (
        <SearchHistorySection
          searchHistory={searchHistory}
          loading={searchHistoryLoading}
          error={searchHistoryError}
          handleDeleteSearchHistory={handleDeleteSearchHistory}
          handleClearAllHistory={handleClearAllHistory}
          handleSearchFromHistory={handleSearchFromHistory}
          handleNavigationClick={handleNavigationClick}
        />
      );
    }

    if (currentView === 'followings') {
      return <FollowingsSection />;
    }

    if (currentView === 'published') {
      return <PublishedRecipesSection />;
    }

    if (currentView === 'followers') {
      return <FollowersSection />;
    }

    if (currentView === 'vetting') {
      return (
        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow border text-center">
          <Info className="w-10 h-10 text-blue-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Recipe Vetting</h2>
          <p className="text-gray-600">Recipe vetting is not in work right now.<br/>We will implement this feature soon.</p>
        </div>
      );
    }

    // Default home view content
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="text-2xl font-serif text-gray-900 mb-2">
            {isCreatorMode ? (
              <>Welcome to Creator Dashboard, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 🎨</>
            ) : (
              <>Welcome back, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 👋</>
            )}
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {isCreatorMode ? (
              'Manage your recipes, track performance, and grow your audience.'
            ) : (
              'Ready to discover some amazing recipes today?'
            )}
          </p>
          {user && (
            <p className="text-sm text-gray-500">
              Logged in as: {user.email} • {isCreatorMode ? 'Creator Mode' : 'Consumer Mode'}
            </p>
          )}
        </div>

        {/* Search Bar */}
        <DashboardSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleKeyPress={handleKeyPress}
          handleSearch={handleSearch}
          handleQuickSearch={handleQuickSearch}
          searchLoading={searchLoading}
          isCreatorMode={isCreatorMode}
          addSearchHistory={addSearchHistory}
        />

        {/* Search Results */}
        <DashboardSearchResults
          showSearchResults={showSearchResults}
          searchLoading={searchLoading}
          searchError={searchError}
          searchResults={searchResults}
          searchQuery={searchQuery}
          hasSearchQuery={hasSearchQuery}
          performSearch={performSearch}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
          isRecipeSaved={isRecipeSaved}
          handleSaveSearchedRecipe={handleSaveSearchedRecipe}
          handleQuickSearch={handleQuickSearch}
        />

        {/* Creator Quick Actions */}
        <CreatorQuickActions
          isCreatorMode={isCreatorMode}
          handleCreateRecipe={handleCreateRecipe}
        />

        {/* Recipe Feed */}
        <RecipeFeedSection
          isCreatorMode={isCreatorMode}
          recipesLoading={recipesLoading}
          recipesError={recipesError}
          recentRecipes={recentRecipes}
          fetchRecentRecipes={fetchRecentRecipes}
          publishedRecipes={publishedRecipes}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
          isRecipeSaved={isRecipeSaved}
          handleSaveSearchedRecipe={handleSaveSearchedRecipe}
          handleQuickSearch={handleQuickSearch}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        user={user}
        userProfile={userProfile}
        isCreatorMode={isCreatorMode}
        toggleMode={toggleMode}
        handleSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <DashboardSidebarNav
          currentNavigation={currentNavigation}
          handleNavigationClick={handleNavigationClick}
        />

        {/* Center Content - Scrollable Feed */}
        <div className="flex-1 max-w-2xl">
          <div className="p-6 space-y-6">
            {/* Connection Status */}
            {!isConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Database Connection Issue</p>
                  <p className="text-xs text-yellow-600">Some features may not work properly. Please check your Supabase configuration.</p>
                </div>
              </div>
            )}

            {/* Render main content based on current view */}
            {renderMainContent()}
          </div>
        </div>

        {/* Right Sidebar - Widgets */}
        <DashboardRightSidebar
          currentView={currentView}
          isCreatorMode={isCreatorMode}
          currentStats={currentStats}
          trendingTopics={trendingTopics}
          creatorInsights={creatorInsights}
          upcomingEvents={upcomingEvents}
          handleQuickSearch={handleQuickSearch}
          savedRecipes={savedRecipes}
          relatedRecipes={relatedRecipes}
          relatedRecipesLoading={relatedRecipesLoading}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
          handleSaveSearchedRecipe={handleSaveSearchedRecipe}
        />
      </main>

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSave={handleRecipeSave}
        onPublish={handlePublishRecipe}
      />
    </div>
  );
};

export default Dashboard;
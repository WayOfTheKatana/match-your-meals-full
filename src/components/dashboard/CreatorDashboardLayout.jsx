import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSavedRecipes } from '../../hooks/useSavedRecipes';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import DashboardHeader from './DashboardHeader';
import DashboardSidebarNav from './DashboardSidebarNav';
import DashboardRightSidebar from './DashboardRightSidebar';
import RecipeCreationModal from '../RecipeCreationModal';
import { Home, FileText, UserCheck, CheckCircle, BarChart3, DollarSign, HelpCircle } from 'lucide-react';

const creatorNavigationItems = [
  { type: 'heading', label: 'Dashboard' },
  { type: 'link', name: 'Dashboard Overview', icon: Home, view: 'home' },
  
  { type: 'heading', label: 'Content' },
  { type: 'link', name: 'Published Recipes', icon: FileText, view: 'published' },
  { type: 'link', name: 'Recipe Vetting', icon: CheckCircle, view: 'vetting' },
  
  { type: 'heading', label: 'Audience' },
  { type: 'link', name: 'Followers', icon: UserCheck, view: 'followers' },
  
  { type: 'heading', label: 'Performance' },
  { type: 'link', name: 'Analytics', icon: BarChart3, view: 'analytics' },
  { type: 'link', name: 'Revenue', icon: DollarSign, view: 'revenue' },
  
  { type: 'heading', label: 'Support' },
  { type: 'link', name: 'Help & Support', icon: HelpCircle, view: 'help' }
];

const fetchPublishedRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

const CreatorDashboardLayout = (props) => {
  const { user, userProfile, signOut, isConnected } = useAuth();
  const { savedRecipes, saveRecipe, removeSavedRecipe, isRecipeSaved, loading: savedRecipesLoading } = useSavedRecipes();
  const { searchHistory, addSearchHistory, deleteSearchHistory, clearAllSearchHistory, loading: searchHistoryLoading, error: searchHistoryError } = useSearchHistory();
  const navigate = useNavigate();
  const location = useLocation();

  // State variables
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [relatedRecipesLoading, setRelatedRecipesLoading] = useState(false);
  const [currentStats, setCurrentStats] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [currentView, setCurrentView] = useState('');

  // Update current view based on location
  useEffect(() => {
    const path = location.pathname;
    const view = path.split('/').pop();
    setCurrentView(view === 'creator' ? 'home' : view);
  }, [location]);

  // Published recipes for creator
  const {
    data: publishedRecipes = [],
    isLoading: publishedRecipesLoading,
    error: publishedRecipesError,
    refetch: refetchPublishedRecipes,
  } = useQuery({
    queryKey: ['publishedRecipes', user?.id],
    queryFn: () => fetchPublishedRecipes(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Query stats directly from database
  const { data: publishedData } = useQuery({
    queryKey: ['published-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user?.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: followersData } = useQuery({
    queryKey: ['followers-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', user?.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-summary', user?.id],
    queryFn: async () => {
      // Get analytics for all recipes by this creator
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id')
        .eq('creator_id', user?.id);
      
      if (!recipes || recipes.length === 0) {
        return { totalViews: 0, uniqueUsers: 0, sessionViews: 0 };
      }
      
      const recipeIds = recipes.map(r => r.id);
      
      // Get total views (all-time, no date filter)
      const { count: totalViews, error: totalError } = await supabase
        .from('recipe_views')
        .select('*', { count: 'exact', head: true })
        .in('recipe_id', recipeIds);
      
      if (totalError) throw totalError;
      
      // Get unique users (today)
      const today = new Date().toISOString().split('T')[0];
      const { count: uniqueUsers, error: uniqueError } = await supabase
        .from('recipe_views')
        .select('user_id', { count: 'exact', head: true })
        .in('recipe_id', recipeIds)
        .gte('viewed_at', `${today}T00:00:00`)
        .lt('viewed_at', `${today}T23:59:59`);
      
      if (uniqueError) throw uniqueError;
      
      // Get session views (today)
      const { count: sessionViews, error: sessionError } = await supabase
        .from('recipe_views')
        .select('*', { count: 'exact', head: true })
        .in('recipe_id', recipeIds)
        .gte('viewed_at', `${today}T00:00:00`)
        .lt('viewed_at', `${today}T23:59:59`);
      
      if (sessionError) throw sessionError;
      
      return {
        totalViews: totalViews || 0,
        uniqueUsers: uniqueUsers || 0,
        sessionViews: sessionViews || 0
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate stats for creator widget
  const publishedCount = publishedData || 0;
  const followersCount = followersData || 0;
  const analyticsSummary = analyticsData || { totalViews: 0, uniqueUsers: 0, sessionViews: 0 };

  // Perform search with direct fetch to Edge Function
  const performSearch = async (query, fetchFunction) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      console.log('🔍 Starting search for:', query);
      
      // Use the provided fetch function or fall back to direct fetch
      const searchFn = fetchFunction || (async (q) => {
        // Direct fetch to Edge Function
        const supabaseUrl = supabase.supabaseUrl;
        const supabaseKey = supabase.supabaseKey;
        const functionUrl = `${supabaseUrl}/functions/v1/recipe-semantic-search`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            query: q.trim()
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Search failed: ${response.status} - ${errorText}`);
        }
        
        return await response.json();
      });
      
      const data = await searchFn(query);

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

  // Handlers (copy from Dashboard.jsx as needed)
  const handleCreateRecipe = () => setShowRecipeModal(true);
  const handleKeyPress = (e) => { if (e.key === 'Enter') performSearch(searchQuery); };
  const handleSearch = () => performSearch(searchQuery);
  const handleQuickSearch = (query) => { setSearchQuery(query); performSearch(query); };
  const handleSearchFromHistory = (query) => { 
    // First navigate to the creator dashboard home
    navigate('/dashboard/creator');
    // Then set the search query and perform the search
    setSearchQuery(query); 
    performSearch(query); 
  };
  const handleDeleteSearchHistory = async (historyId) => { await deleteSearchHistory(historyId); };
  const handleClearAllHistory = async () => { await clearAllSearchHistory(); };
  const formatTime = (minutes) => `${minutes} min`;
  const getTotalTime = (recipe) => (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const handleSaveSearchedRecipe = async (recipeId) => { 
    try {
      if (isRecipeSaved(recipeId)) {
        await removeSavedRecipe(recipeId);
      } else {
        await saveRecipe(recipeId);
      }
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    }
  };
  const handleRemoveSavedRecipe = async (recipeId) => { await removeSavedRecipe(recipeId); };

  // Check if we should show search results
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchResults = hasSearchQuery && (searchLoading || searchResults.length > 0 || searchError);

  // Compose context for Outlet
  const context = {
    user,
    userProfile,
    isConnected,
    savedRecipes,
    saveRecipe,
    removeSavedRecipe,
    isRecipeSaved,
    savedRecipesLoading,
    searchHistory,
    addSearchHistory,
    deleteSearchHistory,
    clearAllSearchHistory,
    searchHistoryLoading,
    searchHistoryError,
    showRecipeModal,
    setShowRecipeModal,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    searchLoading,
    setSearchLoading,
    searchError,
    setSearchError,
    relatedRecipes,
    setRelatedRecipes,
    relatedRecipesLoading,
    setRelatedRecipesLoading,
    publishedRecipes,
    publishedRecipesLoading,
    publishedRecipesError,
    refetchPublishedRecipes,
    handleCreateRecipe,
    handleKeyPress,
    handleSearch,
    handleQuickSearch,
    handleSearchFromHistory,
    handleDeleteSearchHistory,
    handleClearAllHistory,
    formatTime,
    getTotalTime,
    handleSaveSearchedRecipe,
    handleRemoveSavedRecipe,
    recentRecipes: publishedRecipes,
    performSearch,
    showSearchResults,
    hasSearchQuery,
    isCreatorMode: true
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} userProfile={userProfile} isConnected={isConnected} handleSignOut={signOut} />
      <main className="flex max-w-7xl mx-auto">
        <DashboardSidebarNav currentNavigation={creatorNavigationItems} mode="creator" />
        <div className="flex-1 max-w-2xl">
          <div className="p-6 space-y-6">
            <Outlet context={context} />
          </div>
        </div>
        <DashboardRightSidebar
          user={user}
          userProfile={userProfile}
          isConnected={isConnected}
          currentStats={currentStats}
          trendingTopics={trendingTopics}
          upcomingEvents={upcomingEvents}
          mode="creator"
          currentView={currentView}
          publishedCount={publishedCount}
          followersCount={followersCount}
          analyticsSummary={analyticsSummary}
        />
      </main>
      <RecipeCreationModal isOpen={showRecipeModal} onClose={() => setShowRecipeModal(false)} />
    </div>
  );
};

export default CreatorDashboardLayout;
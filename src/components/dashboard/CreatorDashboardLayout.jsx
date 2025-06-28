import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
  { name: 'Dashboard Overview', icon: Home, view: 'home' },
  { name: 'Published Recipes', icon: FileText, view: 'published' },
  { name: 'Followers', icon: UserCheck, view: 'followers' },
  { name: 'Recipe Vetting', icon: CheckCircle, view: 'vetting' },
  { name: 'Analytics', icon: BarChart3, view: 'analytics' },
  { name: 'Revenue', icon: DollarSign, view: 'revenue' },
  { name: 'Help & Support', icon: HelpCircle, view: 'help' }
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
      
      // Get total views (all-time)
      const { count: totalViews, error: totalError } = await supabase
        .from('recipe_analytics')
        .select('*', { count: 'exact', head: true })
        .in('recipe_id', recipeIds);
      
      if (totalError) throw totalError;
      
      // Get unique users (today)
      const today = new Date().toISOString().split('T')[0];
      const { count: uniqueUsers, error: uniqueError } = await supabase
        .from('recipe_analytics')
        .select('user_id', { count: 'exact', head: true })
        .in('recipe_id', recipeIds)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (uniqueError) throw uniqueError;
      
      // Get session views (today)
      const { count: sessionViews, error: sessionError } = await supabase
        .from('recipe_analytics')
        .select('*', { count: 'exact', head: true })
        .in('recipe_id', recipeIds)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
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

  // Handlers (copy from Dashboard.jsx as needed)
  const handleCreateRecipe = () => setShowRecipeModal(true);
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };
  const handleSearch = () => { /* implement as in Dashboard.jsx */ };
  const handleQuickSearch = (query) => { setSearchQuery(query); handleSearch(); };
  const handleSearchFromHistory = (query) => { setSearchQuery(query); handleSearch(); };
  const handleDeleteSearchHistory = async (historyId) => { await deleteSearchHistory(historyId); };
  const handleClearAllHistory = async () => { await clearAllSearchHistory(); };
  const formatTime = (minutes) => `${minutes} min`;
  const getTotalTime = (recipe) => (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const handleSaveSearchedRecipe = async (recipeId) => { /* implement as in Dashboard.jsx */ };
  const handleRemoveSavedRecipe = async (recipeId) => { await removeSavedRecipe(recipeId); };

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
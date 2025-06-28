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
import { Home, Bookmark, Grid3X3, History, Users, HelpCircle, Layers, Eye, ThumbsUp } from 'lucide-react';

const consumerNavigationItems = [
  { name: 'Home / Feed', icon: Home, view: 'home' },
  { name: 'Saved Recipes', icon: Bookmark, view: 'saved' },
  { name: 'Recipe Boards', icon: Layers, view: 'boards' },
  { name: 'Recently Viewed', icon: Eye, view: 'recent' },
  { name: 'Recommended for you', icon: ThumbsUp, view: 'recommended' },
  { name: 'By Categories', icon: Grid3X3, view: 'categories' },
  { name: 'Recipe Search History', icon: History, view: 'history' },
  { name: 'Followings', icon: Users, view: 'followings' },
  { name: 'Help & Support', icon: HelpCircle, view: 'help' }
];

const fetchRecentRecipes = async () => {
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
  if (error) throw new Error(error.message);
  return data || [];
};

const ConsumerDashboardLayout = (props) => {
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

  const {
    data: recentRecipes = [],
    isLoading: recipesLoading,
    error: recipesError,
    refetch: refetchRecentRecipes,
  } = useQuery({
    queryKey: ['recentRecipes'],
    queryFn: fetchRecentRecipes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query stats directly from database
  const { data: followingsData } = useQuery({
    queryKey: ['followings-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user?.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: searchesData } = useQuery({
    queryKey: ['searches-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: savedRecipesData } = useQuery({
    queryKey: ['saved-recipes-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('saved_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate stats for consumer widget
  const followingsCount = followingsData || 0;
  const searchesCount = searchesData || 0;
  const savedRecipesCount = savedRecipesData || 0;

  useEffect(() => {
    if (isConnected) {
      fetchRelatedRecipes();
    }
  }, [user, userProfile, isConnected]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError('');
    }
  }, [searchQuery]);

  // Fetch related recipes when saved recipes change and we're on saved view
  useEffect(() => {
    if (savedRecipes.length > 0) {
      fetchRelatedRecipes();
    }
  }, [savedRecipes]);

  // Fetch related recipes based on saved recipes' tags and ingredients
  const fetchRelatedRecipes = async () => {
    setRelatedRecipesLoading(true);
    try {
      const allHealthTags = [];
      const allDietaryTags = [];
      const allIngredients = [];
      savedRecipes.forEach(saved => {
        const recipe = saved.recipes;
        if (recipe.health_tags) allHealthTags.push(...recipe.health_tags);
        if (recipe.dietary_tags) allDietaryTags.push(...recipe.dietary_tags);
        if (recipe.ingredients) recipe.ingredients.forEach(ing => allIngredients.push(ing.name?.toLowerCase()));
      });
      const uniqueHealthTags = [...new Set(allHealthTags)];
      const uniqueDietaryTags = [...new Set(allDietaryTags)];
      const uniqueIngredients = [...new Set(allIngredients)];
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
      if (error) throw error;
      setRelatedRecipes(data || []);
    } catch (err) {
      // Optionally handle error
    } finally {
      setRelatedRecipesLoading(false);
    }
  };

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
    recentRecipes,
    recipesLoading,
    recipesError,
    refetchRecentRecipes,
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} userProfile={userProfile} isConnected={isConnected} handleSignOut={signOut} />
      <main className="flex max-w-7xl mx-auto">
        <DashboardSidebarNav currentNavigation={consumerNavigationItems} mode="consumer" />
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
          mode="consumer"
          followingsCount={followingsCount}
          searchesCount={searchesCount}
          savedRecipesCount={savedRecipesCount}
        />
      </main>
      <RecipeCreationModal isOpen={showRecipeModal} onClose={() => setShowRecipeModal(false)} />
    </div>
  );
};

export default ConsumerDashboardLayout;
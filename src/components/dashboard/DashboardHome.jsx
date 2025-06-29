import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DashboardSearchBar from './DashboardSearchBar';
import DashboardSearchResults from './DashboardSearchResults';
import CreatorQuickActions from './CreatorQuickActions';
import RecipeFeedSection from './RecipeFeedSection';

const DashboardHome = () => {
  const {
    isCreatorMode,
    user,
    userProfile,
    searchQuery,
    setSearchQuery,
    handleKeyPress,
    handleSearch,
    handleQuickSearch,
    searchLoading,
    addSearchHistory,
    showSearchResults,
    searchError,
    searchResults,
    hasSearchQuery,
    performSearch,
    formatTime,
    getTotalTime,
    isRecipeSaved,
    handleSaveSearchedRecipe,
    recentRecipes,
    recipesLoading,
    recipesError,
    refetchRecentRecipes,
    publishedRecipes,
    handleCreateRecipe
  } = useOutletContext();

  // Implement direct fetch to Edge Function
  const directSearchFetch = async (query) => {
    if (!query.trim()) {
      return { success: false, results: [], message: 'Empty search query' };
    }

    try {
      console.log('🔍 Starting direct fetch to semantic search endpoint for:', query);
      
      // Get the Supabase project URL and key from the supabase client
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing. Please check your environment variables.');
      }
      
      const functionUrl = `${supabaseUrl}/functions/v1/recipe-semantic-search`;
      
      console.log('🔗 Function URL:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Direct fetch error:', response.status, errorText);
        throw new Error(`Search failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Search completed successfully:', data);
      
      return {
        success: true,
        results: data.results || [],
        intent: data.intent || null
      };
    } catch (error) {
      console.error('❌ Error in directSearchFetch:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-2xl font-dm-serif text-gray-900 mb-2">
          {isCreatorMode ? (
            <>Welcome to Creator Dashboard, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 🎨</>
          ) : (
            <>Welcome back, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 👋</>
          )}
        </h2>
        <p className="text-gray-600 mb-4 text-md font-urbanist tracking-wide">
          {isCreatorMode ? (
            'Manage your recipes, track performance, and grow your audience.'
          ) : (
            'Ready to discover some amazing recipes today?'
          )}
        </p>
        {user && (
          <p className="text-sm text-gray-500 font-urbanist">
            Logged in as: {user.email} • {isCreatorMode ? 'Creator Mode' : 'Consumer Mode'}
          </p>
        )}
      </div>
      
      {/* Search Bar - Only show for consumer mode */}
      {!isCreatorMode && (
        <DashboardSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleKeyPress={handleKeyPress}
          handleSearch={() => performSearch(searchQuery, directSearchFetch)}
          handleQuickSearch={(query) => {
            setSearchQuery(query);
            performSearch(query, directSearchFetch);
          }}
          searchLoading={searchLoading}
          isCreatorMode={isCreatorMode}
          addSearchHistory={addSearchHistory}
        />
      )}
      
      {/* Search Results - Only show for consumer mode */}
      {!isCreatorMode && (
        <DashboardSearchResults
          showSearchResults={showSearchResults}
          searchLoading={searchLoading}
          searchError={searchError}
          searchResults={searchResults}
          searchQuery={searchQuery}
          hasSearchQuery={hasSearchQuery}
          performSearch={(query) => performSearch(query, directSearchFetch)}
          formatTime={formatTime}
          getTotalTime={getTotalTime}
          isRecipeSaved={isRecipeSaved}
          handleSaveSearchedRecipe={handleSaveSearchedRecipe}
          handleQuickSearch={(query) => {
            setSearchQuery(query);
            performSearch(query, directSearchFetch);
          }}
        />
      )}
      
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
        fetchRecentRecipes={refetchRecentRecipes}
        publishedRecipes={publishedRecipes}
        formatTime={formatTime}
        getTotalTime={getTotalTime}
        isRecipeSaved={isRecipeSaved}
        handleSaveSearchedRecipe={handleSaveSearchedRecipe}
        handleQuickSearch={(query) => {
          setSearchQuery(query);
          performSearch(query, directSearchFetch);
        }}
      />
    </div>
  );
};

export default DashboardHome;
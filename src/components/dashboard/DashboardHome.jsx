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
        fetchRecentRecipes={refetchRecentRecipes}
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

export default DashboardHome; 
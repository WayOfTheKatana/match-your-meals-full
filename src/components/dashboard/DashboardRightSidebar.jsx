import React from 'react';
import ConsumerStatsWidget from './ConsumerStatsWidget';
import CreatorStatsWidget from './CreatorStatsWidget';
import SavedRecipesSidebarWidgets from './SavedRecipesSidebarWidgets';
import RecipeCreatorsWidget from './RecipeCreatorsWidget';

const DashboardRightSidebar = ({ 
  currentView,
  mode = 'consumer',
  // Consumer stats
  followingsCount = 0,
  searchesCount = 0,
  savedRecipesCount = 0,
  // Creator stats
  publishedCount = 0,
  followersCount = 0,
  analyticsSummary = {},
  // Saved recipes specific props
  savedRecipes,
  relatedRecipes,
  relatedRecipesLoading,
  formatTime,
  getTotalTime,
  handleSaveSearchedRecipe
}) => {
  return (
    <aside className="w-80 bg-white border-l border-gray-200 min-h-screen sticky top-0">
      <div className="p-6 space-y-6">
        {/* Render saved recipes specific widgets when on saved view */}
        {currentView === 'saved' ? (
          <SavedRecipesSidebarWidgets
            savedRecipes={savedRecipes}
            relatedRecipes={relatedRecipes}
            relatedRecipesLoading={relatedRecipesLoading}
            formatTime={formatTime}
            getTotalTime={getTotalTime}
            handleSaveSearchedRecipe={handleSaveSearchedRecipe}
          />
        ) : (
          <>
            {/* Show only the appropriate stats widget */}
            {mode === 'creator' ? (
              <CreatorStatsWidget
                publishedCount={publishedCount}
                followersCount={followersCount}
                analyticsSummary={analyticsSummary}
              />
            ) : (
              <ConsumerStatsWidget
                followingsCount={followingsCount}
                searchesCount={searchesCount}
                savedRecipesCount={savedRecipesCount}
              />
            )}

            {/* Recipe Creators Widget - Always show */}
            <RecipeCreatorsWidget />
          </>
        )}
      </div>
    </aside>
  );
};

export default DashboardRightSidebar;
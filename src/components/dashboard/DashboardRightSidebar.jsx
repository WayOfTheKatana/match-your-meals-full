import React from 'react';
import DashboardStatsWidget from './DashboardStatsWidget';
import DashboardTrendingWidget from './DashboardTrendingWidget';
import DashboardUpcomingEventsWidget from './DashboardUpcomingEventsWidget';
import DashboardAchievementWidget from './DashboardAchievementWidget';
import SavedRecipesSidebarWidgets from './SavedRecipesSidebarWidgets';

const DashboardRightSidebar = ({ 
  currentView,
  isCreatorMode,
  currentStats,
  trendingTopics,
  creatorInsights,
  upcomingEvents,
  handleQuickSearch,
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
            {/* Default sidebar widgets */}
            <DashboardStatsWidget 
              isCreatorMode={isCreatorMode}
              currentStats={currentStats}
            />
            
            <DashboardTrendingWidget
              isCreatorMode={isCreatorMode}
              trendingTopics={trendingTopics}
              creatorInsights={creatorInsights}
              handleQuickSearch={handleQuickSearch}
            />
            
            <DashboardUpcomingEventsWidget
              isCreatorMode={isCreatorMode}
              upcomingEvents={upcomingEvents}
            />
            
            <DashboardAchievementWidget
              isCreatorMode={isCreatorMode}
            />
          </>
        )}
      </div>
    </aside>
  );
};

export default DashboardRightSidebar;
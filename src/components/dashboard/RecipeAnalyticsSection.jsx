import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

// Fetch all recipes by the current user
const fetchUserRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, slug')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch analytics for all recipes for a specific date
const fetchRecipeAnalyticsForDate = async (userId, date) => {
  // Get all recipe IDs for this user
  const { data: userRecipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id')
    .eq('creator_id', userId);
  if (recipesError) throw new Error(recipesError.message);
  const recipeIds = (userRecipes || []).map(r => r.id);
  if (!recipeIds.length) return [];

  // Query all views for these recipes on the selected date
  const { data: views, error: viewsError } = await supabase
    .from('recipe_views')
    .select('recipe_id, user_id, session_id, viewed_at')
    .in('recipe_id', recipeIds)
    .gte('viewed_at', date + 'T00:00:00.000Z')
    .lte('viewed_at', date + 'T23:59:59.999Z');
  if (viewsError) throw new Error(viewsError.message);

  // Group by recipe and count metrics
  const analytics = {};
  recipeIds.forEach(id => {
    analytics[id] = { totalViews: 0, uniqueUsers: new Set(), sessionViews: new Set() };
  });
  (views || []).forEach(view => {
    if (!analytics[view.recipe_id]) return;
    analytics[view.recipe_id].totalViews += 1;
    if (view.user_id) analytics[view.recipe_id].uniqueUsers.add(view.user_id);
    if (view.session_id) analytics[view.recipe_id].sessionViews.add(view.session_id);
  });
  // Convert sets to counts
  Object.keys(analytics).forEach(id => {
    analytics[id].uniqueUsers = analytics[id].uniqueUsers.size;
    analytics[id].sessionViews = analytics[id].sessionViews.size;
  });
  return analytics;
};

const RecipeAnalyticsSection = () => {
  const { user } = useAuth();
  // Date state (default today)
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  // Fetch recipes
  const {
    data: recipes = [],
    isLoading: recipesLoading,
    error: recipesError,
  } = useQuery({
    queryKey: ['userRecipes', user?.id],
    queryFn: () => fetchUserRecipes(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch analytics for selected date
  const {
    data: analytics = {},
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ['recipeAnalyticsForDate', user?.id, selectedDate],
    queryFn: () => fetchRecipeAnalyticsForDate(user.id, selectedDate),
    enabled: !!user && !!selectedDate,
    staleTime: 1000 * 60 * 5,
  });

  if (recipesLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
        <span className="text-gray-700">Loading analytics...</span>
      </div>
    );
  }
  if (recipesError || analyticsError) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-red-700">{recipesError?.message || analyticsError?.message}</span>
      </div>
    );
  }
  if (recipes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg font-semibold">No published recipes yet.</p>
        <p className="text-sm">Publish recipes to see analytics here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Recipe Analytics Overview</h2>
      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={selectedDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>
      {/* Analytics Table - Modern UI */}
      <div className="overflow-x-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left font-semibold text-gray-700 rounded-tl-2xl">Recipe</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Total Views</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Unique Users</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700 rounded-tr-2xl">Session Views</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, idx) => (
                <tr
                  key={recipe.id}
                  className={
                    `transition hover:bg-gray-50 ${idx === recipes.length - 1 ? 'rounded-b-2xl' : ''}`
                  }
                >
                  <td className="px-6 py-4 text-gray-900 font-medium flex items-center space-x-3">
                    {/* Optionally add an avatar/icon here if you want */}
                    {recipe.slug ? (
                      <Link
                        to={`/recipes/${recipe.slug}`}
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        {recipe.title}
                      </Link>
                    ) : (
                      <span>{recipe.title}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-gray-800">{analytics[recipe.id]?.totalViews || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-gray-800">{analytics[recipe.id]?.uniqueUsers || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-gray-800">{analytics[recipe.id]?.sessionViews || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecipeAnalyticsSection; 
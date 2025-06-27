import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BarChart3, Loader2, Eye, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecipeAnalyticsSection = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all recipes by the current user
        const { data: userRecipes, error: recipeError } = await supabase
          .from('recipes')
          .select('id, title, slug, image_path')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        if (recipeError) throw recipeError;
        setRecipes(userRecipes || []);

        // For each recipe, fetch analytics
        const analyticsData = {};
        for (const recipe of userRecipes || []) {
          // Total views
          const { count: totalViews } = await supabase
            .from('recipe_views')
            .select('id', { count: 'exact', head: true })
            .eq('recipe_id', recipe.id);

          // Unique users (logged in)
          const { data: uniqueUsers } = await supabase
            .from('recipe_views')
            .select('user_id')
            .eq('recipe_id', recipe.id)
            .not('user_id', 'is', null);
          const uniqueUserCount = new Set((uniqueUsers || []).map(v => v.user_id)).size;

          // Session views (unique sessions)
          const { data: sessionViews } = await supabase
            .from('recipe_views')
            .select('session_id')
            .eq('recipe_id', recipe.id);
          const uniqueSessionCount = new Set((sessionViews || []).map(v => v.session_id)).size;

          analyticsData[recipe.id] = {
            totalViews: totalViews || 0,
            uniqueUsers: uniqueUserCount,
            sessionViews: uniqueSessionCount,
          };
        }
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
        <span className="text-gray-700">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <BarChart3 className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p className="text-lg font-semibold">No published recipes yet.</p>
        <p className="text-sm">Publish recipes to see analytics here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <BarChart3 className="w-7 h-7 mr-2 text-primary-600" />
        Recipe Analytics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                {recipe.image_path ? (
                  <img src={recipe.image_path} alt={recipe.title} className="w-14 h-14 object-cover rounded-full" />
                ) : (
                  <BarChart3 className="w-7 h-7 text-primary-600" />
                )}
              </div>
              <div>
                <Link to={`/recipes/${recipe.slug}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                  {recipe.title}
                </Link>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Total Views:</span>
                <span className="text-lg font-bold text-gray-900">{analytics[recipe.id]?.totalViews ?? 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Unique Users:</span>
                <span className="text-lg font-bold text-gray-900">{analytics[recipe.id]?.uniqueUsers ?? 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-700">Session Views:</span>
                <span className="text-lg font-bold text-gray-900">{analytics[recipe.id]?.sessionViews ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeAnalyticsSection; 
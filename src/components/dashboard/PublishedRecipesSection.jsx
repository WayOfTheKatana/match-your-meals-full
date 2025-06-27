import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ChefHat, Loader2, AlertCircle } from 'lucide-react';

const PublishedRecipesSection = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublishedRecipes = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('recipes')
          .select('id, slug, title, description, image_path, created_at')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setRecipes(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load published recipes');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPublishedRecipes();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600 mr-2" />
        <span className="text-gray-700">Loading published recipes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <ChefHat className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p className="text-lg font-semibold">You haven't published any recipes yet.</p>
        <p className="text-sm">Start creating and publishing recipes to see them here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">My Published Recipes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col">
            <div className="h-40 w-full rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
              {recipe.image_path ? (
                <img src={recipe.image_path} alt={recipe.title} className="object-cover w-full h-full" />
              ) : (
                <ChefHat className="w-10 h-10 text-primary-600" />
              )}
            </div>
            <div className="flex-1">
              <Link to={`/recipes/${recipe.slug}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                {recipe.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
            </div>
            <div className="text-xs text-gray-400 mt-2">Published on {new Date(recipe.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublishedRecipesSection; 
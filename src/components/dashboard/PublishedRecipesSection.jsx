import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ChefHat, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const fetchPublishedRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, slug, title, description, image_path, created_at')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// Skeleton Loading Component
const PublishedRecipeSkeleton = () => (
  <div className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col animate-pulse">
    {/* Image Skeleton */}
    <div className="h-40 w-full rounded-lg overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
    </div>
    
    {/* Title Skeleton */}
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
    
    {/* Description Skeleton */}
    <div className="space-y-2 mb-2 flex-1">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    {/* Date Skeleton */}
    <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
  </div>
);

const PublishedRecipesSection = () => {
  const { user } = useAuth();

  const {
    data: recipes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['publishedRecipes', user?.id],
    queryFn: () => fetchPublishedRecipes(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">My Published Recipes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <PublishedRecipeSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700">{error.message}</span>
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
          <div key={recipe.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col h-full">
            <div className="h-40 w-full rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
              {recipe.image_path ? (
                <img src={recipe.image_path} alt={recipe.title} className="object-cover w-full h-full" />
              ) : (
                <img 
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300" 
                  alt={recipe.title} 
                  className="object-cover w-full h-full" 
                />
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <Link 
                to={`/recipes/${recipe.slug}`} 
                className="text-base font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 mb-2"
              >
                {recipe.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 mb-2 flex-grow">{recipe.description}</p>
              <div className="text-xs text-gray-400 mt-auto">Published on {new Date(recipe.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublishedRecipesSection;
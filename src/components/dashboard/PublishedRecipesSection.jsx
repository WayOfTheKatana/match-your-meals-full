import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Loader2, 
  AlertCircle, 
  Edit, 
  Trash2, 
  MoreVertical,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
    <div className="space-y-2 mb-4 flex-1">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    {/* Divider Skeleton */}
    <div className="h-px bg-gray-200 w-full mb-4"></div>
    
    {/* Action Buttons Skeleton */}
    <div className="flex justify-between">
      <div className="flex space-x-2">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const PublishedRecipesSection = () => {
  const { user } = useAuth();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const {
    data: recipes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['publishedRecipes', user?.id],
    queryFn: () => fetchPublishedRecipes(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleEdit = (recipeId) => {
    console.log('Edit recipe:', recipeId);
    // Implement edit functionality
  };

  const handleDelete = async (recipeId) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      
      if (error) throw error;
      
      // Refetch recipes after deletion
      refetch();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleViewAnalytics = (recipeId) => {
    console.log('View analytics for recipe:', recipeId);
    // Implement analytics view functionality
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">My Published Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col h-full">
            {/* Recipe Image */}
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
            
            {/* Recipe Content */}
            <div className="flex-1 flex flex-col">
              <Link 
                to={`/recipes/${recipe.slug}`} 
                className="text-base font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 mb-2"
              >
                {recipe.title}
              </Link>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{recipe.description}</p>
              
              {/* Horizontal Line */}
              <hr className="border-gray-200 mb-4" />
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => handleEdit(recipe.id)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1 text-red-600 hover:bg-red-50 hover:border-red-200"
                    onClick={() => setDeleteConfirmId(recipe.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
                
                {/* Context Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleViewAnalytics(recipe.id)}
                      className="flex items-center cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                      <span>View Analytics</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Delete Confirmation */}
              {deleteConfirmId === recipe.id && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Are you sure you want to delete this recipe?</p>
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(recipe.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublishedRecipesSection;
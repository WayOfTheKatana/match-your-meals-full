import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
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
import RecipeCreationModal from '../RecipeCreationModal';
import ConfirmationModal from '../ConfirmationModal';

const fetchPublishedRecipes = async (userId) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
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
  const navigate = useNavigate();
  const [showRecipeCreationModal, setShowRecipeCreationModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [recipeToDeleteId, setRecipeToDeleteId] = useState(null);

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
    const recipeToEdit = recipes.find(recipe => recipe.id === recipeId);
    if (recipeToEdit) {
      setEditingRecipe(recipeToEdit);
      setShowRecipeCreationModal(true);
    }
  };

  const handleDelete = (recipeId) => {
    setRecipeToDeleteId(recipeId);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeToDeleteId);
      
      if (error) throw error;
      
      // Refetch recipes after deletion
      refetch();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setShowConfirmDeleteModal(false);
      setRecipeToDeleteId(null);
    }
  };

  const handleViewAnalytics = () => {
    navigate('/dashboard/creator/analytics');
  };

  const handleCloseModal = () => {
    setShowRecipeCreationModal(false);
    setEditingRecipe(null);
  };

  const handleSaveRecipe = async (recipeData) => {
    console.log('Recipe saved:', recipeData);
    await refetch();
  };

  const handlePublishRecipe = async (recipeData) => {
    console.log('Recipe published:', recipeData);
    await refetch();
  };

  if (isLoading) {
    return (
      <>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">My Published Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <PublishedRecipeSkeleton key={index} />
            ))}
          </div>
        </div>
        <RecipeCreationModal
          isOpen={showRecipeCreationModal}
          onClose={handleCloseModal}
          onSave={handleSaveRecipe}
          editingRecipe={editingRecipe}
          onPublish={handlePublishRecipe}
        />
        <ConfirmationModal
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Recipe"
          message="Are you sure you want to delete this recipe? This action cannot be undone."
          confirmText="Delete Recipe"
          cancelText="Cancel"
          isDestructive={true}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error.message}</span>
        </div>
        <RecipeCreationModal
          isOpen={showRecipeCreationModal}
          onClose={handleCloseModal}
          onSave={handleSaveRecipe}
          editingRecipe={editingRecipe}
          onPublish={handlePublishRecipe}
        />
        <ConfirmationModal
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Recipe"
          message="Are you sure you want to delete this recipe? This action cannot be undone."
          confirmText="Delete Recipe"
          cancelText="Cancel"
          isDestructive={true}
        />
      </>
    );
  }

  if (recipes.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-10">
          <img
            src="/Social share-cuate.svg"
            alt="No recipes"
            className="w-32 h-32 mb-4"
          />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Recipes Yet</h4>
          <p className="text-gray-500 mb-4 text-center">
            You haven't published any recipes yet. Start sharing your culinary creations with the world!
          </p>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition"
            onClick={() => setShowRecipeCreationModal(true)}
          >
            + Create Your First Recipe
          </button>
        </div>
        <RecipeCreationModal
          isOpen={showRecipeCreationModal}
          onClose={handleCloseModal}
          onSave={handleSaveRecipe}
          editingRecipe={editingRecipe}
          onPublish={handlePublishRecipe}
        />
        <ConfirmationModal
          isOpen={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Recipe"
          message="Are you sure you want to delete this recipe? This action cannot be undone."
          confirmText="Delete Recipe"
          cancelText="Cancel"
          isDestructive={true}
        />
      </>
    );
  }

  return (
    <>
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
                      onClick={() => handleDelete(recipe.id)}
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
                        onClick={handleViewAnalytics}
                        className="flex items-center cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                        <span>View Analytics</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <RecipeCreationModal
        isOpen={showRecipeCreationModal}
        onClose={handleCloseModal}
        onSave={handleSaveRecipe}
        editingRecipe={editingRecipe}
        onPublish={handlePublishRecipe}
      />
      <ConfirmationModal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete Recipe"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
};

export default PublishedRecipesSection;
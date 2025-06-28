import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchSavedRecipes = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('saved_recipes')
    .select(`
      id,
      recipe_id,
      created_at,
      recipes (
        id,
        slug,
        title,
        description,
        prep_time,
        cook_time,
        servings,
        image_path,
        ingredients,
        instructions,
        health_tags,
        dietary_tags,
        health_benefits,
        nutritional_info,
        creator_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const useSavedRecipes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved recipes
  const {
    data: savedRecipes = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['savedRecipes', user?.id],
    queryFn: () => fetchSavedRecipes(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Save a recipe
  const saveRecipeMutation = useMutation({
    mutationFn: async (recipeId) => {
      if (!user) throw new Error('User must be logged in to save recipes');
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert([
          {
            user_id: user.id,
            recipe_id: recipeId
          }
        ])
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          throw new Error('Recipe is already saved');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['savedRecipes', user?.id]);
    },
  });

  // Remove a saved recipe
  const removeSavedRecipeMutation = useMutation({
    mutationFn: async (recipeId) => {
      if (!user) throw new Error('User must be logged in to remove saved recipes');
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);
      if (error) throw error;
      return recipeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['savedRecipes', user?.id]);
    },
  });

  // Check if a recipe is saved
  const isRecipeSaved = (recipeId) => {
    return savedRecipes.some(saved => saved.recipe_id === recipeId);
  };

  return {
    savedRecipes,
    loading,
    error,
    saveRecipe: saveRecipeMutation.mutateAsync,
    removeSavedRecipe: removeSavedRecipeMutation.mutateAsync,
    isRecipeSaved,
  };
};
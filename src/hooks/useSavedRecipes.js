import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useSavedRecipes = () => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all saved recipes for the current user
  const fetchSavedRecipes = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          id,
          recipe_id,
          created_at,
          recipes (
            id,
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedRecipes(data || []);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save a recipe
  const saveRecipe = async (recipeId) => {
    if (!user) {
      throw new Error('User must be logged in to save recipes');
    }

    try {
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
        // Handle duplicate save error gracefully
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Recipe is already saved');
        }
        throw error;
      }

      // Refresh saved recipes list
      await fetchSavedRecipes();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error saving recipe:', err);
      throw err;
    }
  };

  // Remove a saved recipe
  const removeSavedRecipe = async (recipeId) => {
    if (!user) {
      throw new Error('User must be logged in to remove saved recipes');
    }

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      // Refresh saved recipes list
      await fetchSavedRecipes();
      
      return { success: true };
    } catch (err) {
      console.error('Error removing saved recipe:', err);
      throw err;
    }
  };

  // Check if a recipe is saved
  const isRecipeSaved = (recipeId) => {
    return savedRecipes.some(saved => saved.recipe_id === recipeId);
  };

  // Load saved recipes when user changes
  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    } else {
      setSavedRecipes([]);
    }
  }, [user]);

  return {
    savedRecipes,
    loading,
    error,
    saveRecipe,
    removeSavedRecipe,
    isRecipeSaved,
    fetchSavedRecipes
  };
};
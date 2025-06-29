import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchUserBoards = async (userId) => {
  if (!userId) return [];
  
  console.log('🔍 Fetching boards for user:', userId);
  
  // Get boards with actual recipe counts and images
  const { data: boards, error: boardsError } = await supabase
    .from('recipe_boards')
    .select(`
      id,
      title,
      slug,
      description,
      is_private,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (boardsError) {
    console.error('❌ Error fetching boards:', boardsError);
    throw new Error(boardsError.message);
  }
  
  if (!boards || boards.length === 0) {
    return [];
  }
  
  // Get recipe counts and images for each board
  const boardsWithData = await Promise.all(
    boards.map(async (board) => {
      // Get recipe count for this board
      const { count: recipeCount, error: countError } = await supabase
        .from('board_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('board_id', board.id);
      
      if (countError) {
        console.error('❌ Error fetching recipe count for board:', board.id, countError);
      }
      
      // Get recipe images for this board (up to 4 for display)
      const { data: recipeImages, error: imagesError } = await supabase
        .from('board_recipes')
        .select(`
          recipes (
            image_path
          )
        `)
        .eq('board_id', board.id)
        .limit(4);
      
      if (imagesError) {
        console.error('❌ Error fetching recipe images for board:', board.id, imagesError);
      }
      
      // Extract image URLs
      const imageUrls = recipeImages
        ?.map(item => item.recipes?.image_path)
        .filter(Boolean) || [];
      
      return {
        ...board,
        recipe_count: recipeCount || 0,
        recipe_images: imageUrls
      };
    })
  );
  
  console.log('✅ Fetched boards with data:', boardsWithData.length);
  return boardsWithData;
};

const addRecipeToBoard = async (boardId, recipeId, userId) => {
  if (!userId) throw new Error('User must be logged in to add recipes to boards');
  
  // Verify the board belongs to the user
  const { data: board, error: boardError } = await supabase
    .from('recipe_boards')
    .select('id')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single();
  
  if (boardError || !board) {
    throw new Error('Board not found or access denied');
  }
  
  // Add recipe to board (will handle duplicates with UNIQUE constraint)
  const { data, error } = await supabase
    .from('board_recipes')
    .insert([{
      board_id: boardId,
      recipe_id: recipeId
    }])
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Recipe is already in this board');
    }
    throw error;
  }
  
  return data;
};

const removeRecipeFromBoard = async (boardId, recipeId, userId) => {
  if (!userId) throw new Error('User must be logged in to remove recipes from boards');
  
  // Verify the board belongs to the user
  const { data: board, error: boardError } = await supabase
    .from('recipe_boards')
    .select('id')
    .eq('id', boardId)
    .eq('user_id', userId)
    .single();
  
  if (boardError || !board) {
    throw new Error('Board not found or access denied');
  }
  
  const { error } = await supabase
    .from('board_recipes')
    .delete()
    .eq('board_id', boardId)
    .eq('recipe_id', recipeId);
  
  if (error) throw error;
  return { boardId, recipeId };
};

export const useRecipeBoards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's boards
  const {
    data: boards = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userBoards', user?.id],
    queryFn: () => fetchUserBoards(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create a new board
  const createBoardMutation = useMutation({
    mutationFn: async (boardData) => {
      if (!user) throw new Error('User must be logged in to create boards');
      
      const { data, error } = await supabase
        .from('recipe_boards')
        .insert([{
          user_id: user.id,
          title: boardData.title,
          slug: boardData.slug,
          description: boardData.description || null,
          is_private: boardData.isPrivate || false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBoards', user?.id]);
    },
  });

  // Update a board
  const updateBoardMutation = useMutation({
    mutationFn: async ({ boardId, updates }) => {
      if (!user) throw new Error('User must be logged in to update boards');
      
      const { data, error } = await supabase
        .from('recipe_boards')
        .update(updates)
        .eq('id', boardId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBoards', user?.id]);
    },
  });

  // Delete a board
  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId) => {
      if (!user) throw new Error('User must be logged in to delete boards');
      
      const { error } = await supabase
        .from('recipe_boards')
        .delete()
        .eq('id', boardId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return boardId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBoards', user?.id]);
    },
  });

  // Add recipe to board
  const addRecipeToBoardMutation = useMutation({
    mutationFn: async ({ boardId, recipeId }) => {
      return addRecipeToBoard(boardId, recipeId, user?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBoards', user?.id]);
    },
  });

  // Remove recipe from board
  const removeRecipeFromBoardMutation = useMutation({
    mutationFn: async ({ boardId, recipeId }) => {
      return removeRecipeFromBoard(boardId, recipeId, user?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userBoards', user?.id]);
    },
  });

  return {
    boards,
    loading,
    error,
    refetch,
    createBoard: createBoardMutation.mutateAsync,
    updateBoard: updateBoardMutation.mutateAsync,
    deleteBoard: deleteBoardMutation.mutateAsync,
    addRecipeToBoard: addRecipeToBoardMutation.mutateAsync,
    removeRecipeFromBoard: removeRecipeFromBoardMutation.mutateAsync,
    isCreating: createBoardMutation.isPending,
    isUpdating: updateBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
    isAddingRecipe: addRecipeToBoardMutation.isPending,
    isRemovingRecipe: removeRecipeFromBoardMutation.isPending,
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchUserBoards = async (userId) => {
  if (!userId) return [];
  
  console.log('🔍 Fetching boards for user:', userId);
  
  const { data, error } = await supabase
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
  
  if (error) {
    console.error('❌ Error fetching boards:', error);
    throw new Error(error.message);
  }
  
  console.log('✅ Fetched boards:', data?.length || 0);
  
  // For now, add mock recipe data since we don't have the board_recipes relationship set up yet
  const boardsWithMockData = (data || []).map((board, index) => ({
    ...board,
    recipe_count: Math.floor(Math.random() * 20) + 1, // Random count between 1-20
    recipe_images: [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=200'
    ].slice(0, Math.floor(Math.random() * 4) + 1) // Random 1-4 images
  }));
  
  return boardsWithMockData;
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

  return {
    boards,
    loading,
    error,
    refetch,
    createBoard: createBoardMutation.mutateAsync,
    updateBoard: updateBoardMutation.mutateAsync,
    deleteBoard: deleteBoardMutation.mutateAsync,
    isCreating: createBoardMutation.isPending,
    isUpdating: updateBoardMutation.isPending,
    isDeleting: deleteBoardMutation.isPending,
  };
};
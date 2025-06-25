import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useSearchHistory = () => {
  const { user } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all search history for the current user
  const fetchSearchHistory = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearchHistory(data || []);
    } catch (err) {
      console.error('Error fetching search history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new search query to history
  const addSearchHistory = async (query) => {
    if (!user || !query || !query.trim()) return;

    const trimmedQuery = query.trim();

    try {
      const { data, error } = await supabase
        .from('search_history')
        .insert([
          {
            user_id: user.id,
            query: trimmedQuery
          }
        ])
        .select()
        .single();

      if (error) {
        // Handle duplicate query error gracefully
        if (error.code === '23505') { // Unique constraint violation
          console.log('Query already exists in search history:', trimmedQuery);
          // Update the timestamp by deleting and re-inserting
          await supabase
            .from('search_history')
            .delete()
            .eq('user_id', user.id)
            .eq('query', trimmedQuery);
          
          // Re-insert to update timestamp
          const { data: newData, error: insertError } = await supabase
            .from('search_history')
            .insert([
              {
                user_id: user.id,
                query: trimmedQuery
              }
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          
          // Update local state
          setSearchHistory(prev => [newData, ...prev.filter(item => item.query !== trimmedQuery)]);
          return { success: true, data: newData };
        }
        throw error;
      }

      // Add to local state
      setSearchHistory(prev => [data, ...prev]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error adding search history:', err);
      setError(err.message);
      throw err;
    }
  };

  // Remove a search query from history
  const deleteSearchHistory = async (historyId) => {
    if (!user) {
      throw new Error('User must be logged in to delete search history');
    }

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setSearchHistory(prev => prev.filter(item => item.id !== historyId));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting search history:', err);
      setError(err.message);
      throw err;
    }
  };

  // Clear all search history for the user
  const clearAllSearchHistory = async () => {
    if (!user) {
      throw new Error('User must be logged in to clear search history');
    }

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear local state
      setSearchHistory([]);
      
      return { success: true };
    } catch (err) {
      console.error('Error clearing search history:', err);
      setError(err.message);
      throw err;
    }
  };

  // Load search history when user changes
  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    } else {
      setSearchHistory([]);
    }
  }, [user]);

  return {
    searchHistory,
    loading,
    error,
    addSearchHistory,
    deleteSearchHistory,
    clearAllSearchHistory,
    fetchSearchHistory
  };
};
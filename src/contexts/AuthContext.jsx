import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, testConnection } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test Supabase connection first
    const checkConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Supabase connection failed. Please check your environment variables.');
        setLoading(false);
        return;
      }

      // Get initial session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          // Wait a bit for the trigger to create the profile
          setTimeout(() => fetchUserProfile(session.user.id), 1000);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't set error here as profile might not exist yet
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      setError(null);

      if (!isConnected) {
        throw new Error('Not connected to Supabase. Please check your configuration.');
      }

      console.log('Attempting to sign up user:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      console.log('Signup successful:', data);

      // If user is immediately confirmed (no email confirmation required)
      if (data.user && data.user.email_confirmed_at) {
        console.log('User confirmed immediately, fetching profile...');
        // Wait for trigger to create profile
        setTimeout(() => fetchUserProfile(data.user.id), 1500);
      } else if (data.user) {
        console.log('User created but email confirmation may be required');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      let errorMessage = error.message || 'An error occurred during signup';
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try signing in instead.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      }
      
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      if (!isConnected) {
        throw new Error('Not connected to Supabase. Please check your configuration.');
      }

      console.log('Attempting to sign in user:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Sign in successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      let errorMessage = error.message || 'An error occurred during sign in';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always clear local state first
      const clearLocalState = () => {
        setUser(null);
        setUserProfile(null);
        setError(null);
      };

      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Handle session-related errors gracefully
      if (error) {
        const isSessionError = 
          error.message?.includes('Auth session missing') ||
          error.message?.includes('Session from session_id claim in JWT does not exist') ||
          error.message?.includes('session_not_found') ||
          error.code === 'session_not_found' ||
          error.status === 403;

        if (isSessionError) {
          // Session is already invalid, treat as successful logout
          console.log('Session already invalid, clearing local state');
          clearLocalState();
          return { error: null };
        } else {
          // Other errors should be thrown
          throw error;
        }
      }

      // Successful logout
      clearLocalState();
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Check if this is a session-related error that should be treated as successful logout
      const isSessionError = 
        error.message?.includes('Auth session missing') ||
        error.message?.includes('Session from session_id claim in JWT does not exist') ||
        error.message?.includes('session_not_found') ||
        error.code === 'session_not_found' ||
        error.status === 403;

      if (isSessionError) {
        // Session is already invalid, treat as successful logout
        console.log('Session error during logout, treating as successful');
        setUser(null);
        setUserProfile(null);
        setError(null);
        return { error: null };
      }
      
      // For any other unexpected errors, still clear local state
      // This ensures the user can always "sign out" from the UI perspective
      setUser(null);
      setUserProfile(null);
      
      setError(error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    isConnected,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
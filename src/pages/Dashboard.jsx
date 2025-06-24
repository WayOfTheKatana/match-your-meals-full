import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import RecipeCreationModal from '../components/RecipeCreationModal';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { 
  User, 
  Settings, 
  Heart, 
  BookOpen, 
  Search, 
  TrendingUp,
  Clock,
  Star,
  ChefHat,
  LogOut,
  AlertCircle,
  PenTool,
  Home,
  History,
  Users,
  HelpCircle,
  Grid3X3,
  Bookmark,
  Filter,
  Calendar,
  Award,
  Activity,
  BarChart3,
  DollarSign,
  Eye,
  FileText,
  CheckCircle,
  UserCheck,
  Monitor,
  Mic,
  Loader2,
  Check,
  Trash2,
  ArrowRight,
  Tag,
  Utensils
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { user, userProfile, signOut, isConnected } = useAuth();
  const { savedRecipes, saveRecipe, removeSavedRecipe, isRecipeSaved, loading: savedRecipesLoading } = useSavedRecipes();
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState('');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'saved', 'categories', etc.
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [relatedRecipesLoading, setRelatedRecipesLoading] = useState(false);

  // New state variables for categories section
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryRecipes, setCategoryRecipes] = useState([]);
  const [categoryRecipesLoading, setCategoryRecipesLoading] = useState(false);
  const [categoryRecipesError, setCategoryRecipesError] = useState('');

  useEffect(() => {
    console.log('Dashboard loaded - User:', user?.email);
    console.log('User Profile:', userProfile);
    console.log('Connected to Supabase:', isConnected);
    
    // Fetch recent recipes when component mounts
    if (isConnected) {
      fetchRecentRecipes();
    }
  }, [user, userProfile, isConnected]);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError('');
    }
  }, [searchQuery]);

  // Fetch related recipes when saved recipes change and we're on saved view
  useEffect(() => {
    if (currentView === 'saved' && savedRecipes.length > 0) {
      fetchRelatedRecipes();
    }
  }, [currentView, savedRecipes]);

  // Fetch categories when entering categories view
  useEffect(() => {
    if (currentView === 'categories' && isConnected) {
      fetchCategories();
      // Reset category selection when entering categories view
      setSelectedCategory(null);
      setCategoryRecipes([]);
      setCategoryRecipesError('');
    }
  }, [currentView, isConnected]);

  // Fetch categories from database
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError('');

    try {
      console.log('🔄 Fetching categories from database...');
      
      const { data, error } = await supabase
        .from('recipes')
        .select('health_tags, dietary_tags')
        .not('health_tags', 'is', null)
        .not('dietary_tags', 'is', null);

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }

      console.log('✅ Fetched recipe data for categories:', data?.length || 0);

      // Process the data to extract unique categories
      const healthTagsSet = new Set();
      const dietaryTagsSet = new Set();

      data.forEach(recipe => {
        // Process health_tags (JSONB array)
        if (recipe.health_tags && Array.isArray(recipe.health_tags)) {
          recipe.health_tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              healthTagsSet.add(tag.trim());
            }
          });
        }

        // Process dietary_tags (text array)
        if (recipe.dietary_tags && Array.isArray(recipe.dietary_tags)) {
          recipe.dietary_tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              dietaryTagsSet.add(tag.trim());
            }
          });
        }
      });

      // Create categories object with both types
      const categoriesData = {
        health_tags: Array.from(healthTagsSet).sort(),
        dietary_tags: Array.from(dietaryTagsSet).sort()
      };

      console.log('📊 Processed categories:', {
        health_tags: categoriesData.health_tags.length,
        dietary_tags: categoriesData.dietary_tags.length
      });

      setCategories(categoriesData);
    } catch (err) {
      console.error('❌ Error in fetchCategories:', err);
      setCategoriesError(err.message || 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch recipes by category
  // const fetchRecipesByCategory = async (categoryName, categoryType) => {
  //   setCategoryRecipesLoading(true);
  //   setCategoryRecipesError('');
  //   setSelectedCategory({ name: categoryName, type: categoryType });

  //   try {
  //     console.log('🔄 Fetching recipes for category:', categoryName, 'type:', categoryType);
      
  //     let query = supabase
  //       .from('recipes')
  //       .select(`
  //         id,
  //         title,
  //         description,
  //         prep_time,
  //         cook_time,
  //         servings,
  //         image_path,
  //         ingredients,
  //         instructions,
  //         health_tags,
  //         dietary_tags,
  //         health_benefits,
  //         nutritional_info,
  //         creator_id,
  //         created_at
  //       `);

  //     // Apply different filters based on category type
  //     if (categoryType === 'health_tags') {
  //       // For JSONB array, use @> operator with proper JSON array syntax
  //       query = query.contains('health_tags', [categoryName]);
  //     } else if (categoryType === 'dietary_tags') {
  //       // For text array, use && operator to check for overlap
  //       query = query.overlaps('dietary_tags', [categoryName]);
  //     }

  //     const { data, error } = await query
  //       .order('created_at', { ascending: false })
  //       .limit(20);

  //     if (error) {
  //       console.error('❌ Error fetching recipes by category:', error);
  //       throw error;
  //     }

  //     console.log('✅ Fetched recipes for category successfully:', data?.length || 0);
  //     setCategoryRecipes(data || []);
  //   } catch (err) {
  //     console.error('❌ Error in fetchRecipesByCategory:', err);
  //     setCategoryRecipesError(err.message || 'Failed to load recipes for this category');
  //   } finally {
  //     setCategoryRecipesLoading(false);
  //   }
  // };

//   async function fetchRecipesByCategory(categoryName, categoryType) {
//   try {
//     console.log(`🔍 Fetching recipes by ${categoryType}:`, categoryName);
    
//     let query = supabase
//       .from('recipes')
//       .select(`
//         id,
//         title,
//         description,
//         prep_time,
//         cook_time,
//         servings,
//         image_path,
//         ingredients,
//         instructions,
//         health_tags,
//         dietary_tags,
//         health_benefits,
//         nutritional_info,
//         creator_id,
//         created_at
//       `);

//     // Apply the correct filter based on column type
//     if (categoryType === 'health_tags') {
//       // For JSONB array - use contains with JSON string
//       query = query.contains('health_tags', JSON.stringify([categoryName]));
//     } else if (categoryType === 'dietary_tags') {
//       // For text array - use overlaps
//       query = query.overlaps('dietary_tags', [categoryName]);
//     } else if (categoryType === 'health_benefits') {
//       // For text array - use overlaps
//       query = query.overlaps('health_benefits', [categoryName]);
//     } else {
//       throw new Error(`Unsupported category type: ${categoryType}`);
//     }

//     const { data, error } = await query.limit(20);

//     if (error) {
//       console.error('❌ Database query error:', error);
//       throw error;
//     }

//     console.log(`✅ Found ${data?.length || 0} recipes for ${categoryType}: ${categoryName}`);
//     return data || [];

//   } catch (error) {
//     console.error('❌ Error in fetchRecipesByCategory:', error);
//     throw error;
//   }
// }

  // Replace your current fetchRecipesByCategory function with this complete version:

const fetchRecipesByCategory = async (categoryName, categoryType) => {
  setCategoryRecipesLoading(true);
  setCategoryRecipesError('');
  setSelectedCategory({ name: categoryName, type: categoryType });

  try {
    console.log(`🔍 Fetching recipes by ${categoryType}:`, categoryName);
    
    let query = supabase
      .from('recipes')
      .select(`
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
        creator_id,
        created_at
      `);

    // Apply the correct filter based on column type
    if (categoryType === 'health_tags') {
      // For JSONB array - use contains with JSON string
      query = query.contains('health_tags', JSON.stringify([categoryName]));
    } else if (categoryType === 'dietary_tags') {
      // For text array - use overlaps
      query = query.overlaps('dietary_tags', [categoryName]);
    } else if (categoryType === 'health_benefits') {
      // For text array - use overlaps
      query = query.overlaps('health_benefits', [categoryName]);
    } else {
      throw new Error(`Unsupported category type: ${categoryType}`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} recipes for ${categoryType}: ${categoryName}`);
    
    // Set the recipes to state
    setCategoryRecipes(data || []);
    
    return data || [];

  } catch (error) {
    console.error('❌ Error in fetchRecipesByCategory:', error);
    setCategoryRecipesError(error.message || 'Failed to load recipes for this category');
    setCategoryRecipes([]);
    throw error;
  } finally {
    setCategoryRecipesLoading(false);
  }
};

// And update your category button onClick handlers to this simple version:

  // Fetch recent recipes from database
  const fetchRecentRecipes = async () => {
    setRecipesLoading(true);
    setRecipesError('');

    try {
      console.log('🔄 Fetching recent recipes from database...');
      
      const { data, error } = await supabase
        .from('recipes')
        .select(`
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
          creator_id,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error fetching recipes:', error);
        throw error;
      }

      console.log('✅ Fetched recipes successfully:', data?.length || 0);
      setRecentRecipes(data || []);
    } catch (err) {
      console.error('❌ Error in fetchRecentRecipes:', err);
      setRecipesError(err.message || 'Failed to load recipes');
    } finally {
      setRecipesLoading(false);
    }
  };

  // Fetch related recipes based on saved recipes' tags and ingredients
  const fetchRelatedRecipes = async () => {
    setRelatedRecipesLoading(true);
    
    try {
      console.log('🔄 Fetching related recipes based on saved recipes...');
      
      // Extract tags and ingredients from saved recipes
      const allHealthTags = [];
      const allDietaryTags = [];
      const allIngredients = [];
      
      savedRecipes.forEach(saved => {
        const recipe = saved.recipes;
        if (recipe.health_tags) {
          allHealthTags.push(...recipe.health_tags);
        }
        if (recipe.dietary_tags) {
          allDietaryTags.push(...recipe.dietary_tags);
        }
        if (recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            allIngredients.push(ing.name?.toLowerCase());
          });
        }
      });

      // Get unique tags
      const uniqueHealthTags = [...new Set(allHealthTags)];
      const uniqueDietaryTags = [...new Set(allDietaryTags)];
      const uniqueIngredients = [...new Set(allIngredients)];

      console.log('📊 User preferences:', {
        healthTags: uniqueHealthTags,
        dietaryTags: uniqueDietaryTags,
        ingredients: uniqueIngredients.slice(0, 5) // Show first 5
      });

      // Get saved recipe IDs to exclude them
      const savedRecipeIds = savedRecipes.map(saved => saved.recipe_id);

      // Query for related recipes
      let query = supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          prep_time,
          cook_time,
          servings,
          image_path,
          ingredients,
          health_tags,
          dietary_tags,
          health_benefits,
          nutritional_info,
          creator_id,
          created_at
        `)
        .not('id', 'in', `(${savedRecipeIds.join(',')})`) // Exclude already saved recipes
        .limit(6);

      // Add filters based on user preferences
      if (uniqueDietaryTags.length > 0) {
        query = query.overlaps('dietary_tags', uniqueDietaryTags);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching related recipes:', error);
        throw error;
      }

      console.log('✅ Fetched related recipes successfully:', data?.length || 0);
      setRelatedRecipes(data || []);
    } catch (err) {
      console.error('❌ Error in fetchRelatedRecipes:', err);
      // Don't show error to user for related recipes, just log it
    } finally {
      setRelatedRecipesLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMode = () => {
    setIsCreatorMode(!isCreatorMode);
  };

  const handleCreateRecipe = () => {
    setShowRecipeModal(true);
  };

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // Voice search functionality will be implemented later
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      console.log('🔍 Starting semantic search for:', query);

      const { data, error: searchError } = await supabase.functions.invoke('recipe-semantic-search', {
        body: {
          query: query.trim()
        }
      });

      if (searchError) {
        console.error('❌ Search function error:', searchError);
        throw new Error(`Search failed: ${searchError.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      console.log('✅ Search completed:', data);
      setSearchResults(data.results || []);

    } catch (err) {
      console.error('❌ Search error:', err);
      setSearchError(err.message || 'Failed to search recipes. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalTime = (recipe) => {
    return (recipe.prep_time || 0) + (recipe.cook_time || 0);
  };

  const handleSaveSearchedRecipe = async (recipeId) => {
    try {
      if (isRecipeSaved(recipeId)) {
        await removeSavedRecipe(recipeId);
        console.log('Recipe removed from saved list:', recipeId);
      } else {
        await saveRecipe(recipeId);
        console.log('Recipe saved successfully:', recipeId);
      }
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    }
  };

  const handleRecipeSave = async (recipeData) => {
    console.log('Recipe saved as draft:', recipeData);
    // The actual saving is handled in the modal component
    // You can add additional logic here if needed (e.g., refresh data, show notifications)
    
    // Refresh the recent recipes list to include the new recipe
    await fetchRecentRecipes();
  };

  const handlePublishRecipe = async (recipeData) => {
    console.log('Recipe published:', recipeData);
    // The actual publishing is handled in the modal component
    // You can add additional logic here if needed (e.g., refresh data, show notifications)
    
    // Refresh the recent recipes list to include the new recipe
    await fetchRecentRecipes();
  };

  const handleRemoveSavedRecipe = async (recipeId) => {
    try {
      await removeSavedRecipe(recipeId);
      console.log('Recipe removed from saved list:', recipeId);
    } catch (error) {
      console.error('Error removing saved recipe:', error);
      alert(error.message || 'Failed to remove recipe. Please try again.');
    }
  };

  // Consumer Mode Data
  const consumerStats = [
    { label: 'Recipes Saved', value: savedRecipes.length.toString(), icon: BookOpen, color: 'text-blue-600' },
    { label: 'Favorites', value: '12', icon: Heart, color: 'text-red-500' },
    { label: 'Searches Today', value: '8', icon: Search, color: 'text-green-600' },
    { label: 'Cooking Time', value: '2.5h', icon: Clock, color: 'text-purple-600' }
  ];

  // Creator Mode Data
  const creatorStats = [
    { label: 'Published Recipes', value: '18', icon: FileText, color: 'text-blue-600' },
    { label: 'Total Followers', value: '1.2k', icon: Users, color: 'text-green-600' },
    { label: 'Monthly Views', value: '5.8k', icon: Eye, color: 'text-purple-600' },
    { label: 'Revenue', value: '$234', icon: DollarSign, color: 'text-emerald-600' }
  ];

  // Creator's published recipes
  const publishedRecipes = [
    { name: 'Ultimate Protein Bowl', time: '30 min', rating: 4.9, views: '2.1k', status: 'Published', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Keto Salmon Delight', time: '25 min', rating: 4.8, views: '1.8k', status: 'Published', image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Morning Energy Toast', time: '15 min', rating: 4.7, views: '1.5k', status: 'Under Review', image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { name: 'Green Power Smoothie', time: '10 min', rating: 4.6, views: '1.2k', status: 'Published', image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  const consumerNavigationItems = [
    { name: 'Home / Feed', icon: Home, active: currentView === 'home', view: 'home' },
    { name: 'Saved Recipes', icon: Bookmark, active: currentView === 'saved', view: 'saved' },
    { name: 'By Categories', icon: Grid3X3, active: currentView === 'categories', view: 'categories' },
    { name: 'Recipe Search History', icon: History, active: currentView === 'history', view: 'history' },
    { name: 'Followings', icon: Users, active: currentView === 'followings', view: 'followings' },
    { name: 'Help & Support', icon: HelpCircle, active: currentView === 'help', view: 'help' }
  ];

  const creatorNavigationItems = [
    { name: 'Dashboard Overview', icon: Home, active: currentView === 'home', view: 'home' },
    { name: 'Published Recipes', icon: FileText, active: currentView === 'published', view: 'published' },
    { name: 'Followers', icon: UserCheck, active: currentView === 'followers', view: 'followers' },
    { name: 'Recipe Vetting', icon: CheckCircle, active: currentView === 'vetting', view: 'vetting' },
    { name: 'Analytics', icon: BarChart3, active: currentView === 'analytics', view: 'analytics' },
    { name: 'Revenue', icon: DollarSign, active: currentView === 'revenue', view: 'revenue' },
    { name: 'Help & Support', icon: HelpCircle, active: currentView === 'help', view: 'help' }
  ];

  const trendingTopics = [
    'Healthy Breakfast Ideas',
    'Quick Dinner Recipes',
    'Vegan Protein Sources',
    'Meal Prep Sunday',
    'Low Carb Snacks'
  ];

  const upcomingEvents = [
    { title: 'Virtual Cooking Class', date: 'Dec 25', time: '2:00 PM' },
    { title: 'Recipe Contest Deadline', date: 'Dec 28', time: '11:59 PM' },
    { title: 'New Year Meal Prep', date: 'Jan 1', time: '10:00 AM' }
  ];

  const creatorInsights = [
    { title: 'Top Performing Recipe', value: 'Ultimate Protein Bowl', change: '+15%' },
    { title: 'Engagement Rate', value: '8.4%', change: '+2.1%' },
    { title: 'New Followers', value: '47', change: '+12%' }
  ];

  const currentStats = isCreatorMode ? creatorStats : consumerStats;
  const currentNavigation = isCreatorMode ? creatorNavigationItems : consumerNavigationItems;

  // Check if we should show search results
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showSearchResults = hasSearchQuery && (searchLoading || searchResults.length > 0 || searchError);

  // Handle navigation click
  const handleNavigationClick = (view) => {
    setCurrentView(view);
    // Clear search when switching views
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  // Render main content based on current view
  const renderMainContent = () => {
    if (currentView === 'categories') {
      return (
        <div className="space-y-6">
          {/* Categories Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
                  <Grid3X3 className="w-6 h-6 mr-3 text-primary-600" />
                  Browse by Categories
                </h2>
                <p className="text-gray-600">
                  Discover recipes organized by health benefits and dietary preferences
                </p>
              </div>
            </div>
          </div>

          {/* Categories Loading State */}
          {categoriesLoading && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          )}

          {/* Categories Error State */}
          {categoriesError && !categoriesLoading && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center space-x-3 text-red-600 mb-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Error Loading Categories</h3>
                  <p className="text-sm text-red-500">{categoriesError}</p>
                </div>
              </div>
              <Button onClick={fetchCategories} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Categories Content */}
          {!categoriesLoading && !categoriesError && categories && (
            <div className="space-y-6">
              {/* Health Tags Section */}
              {categories.health_tags && categories.health_tags.length > 0 && (
  <div className="bg-white rounded-2xl p-6 shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Heart className="w-5 h-5 mr-2 text-red-500" />
      Health Benefits
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {categories.health_tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => fetchRecipesByCategory(tag, 'health_tags')}
          className={`p-1.5 rounded-xl text-left transition-all duration-200 border ${
            selectedCategory?.name === tag && selectedCategory?.type === 'health_tags'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-gray-50 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs capitalize text-wrap">
              {tag.replace(/-/g, ' ')}
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
)}

              {/* Dietary Tags Section */}


              {categories.dietary_tags && categories.dietary_tags.length > 0 && (
  <div className="bg-white rounded-2xl p-6 shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Utensils className="w-5 h-5 mr-2 text-green-500" />
      Dietary Preferences
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {categories.dietary_tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => fetchRecipesByCategory(tag, 'dietary_tags')}
          className={`p-1.5 rounded-xl text-left transition-all duration-200 border ${
            selectedCategory?.name === tag && selectedCategory?.type === 'dietary_tags'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs capitalize text-wrap">
              {tag.replace(/-/g, ' ')}
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
)}

              {/* Selected Category Recipes */}
              {selectedCategory && (
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-primary-600" />
                      {selectedCategory.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Recipes
                      {!categoryRecipesLoading && categoryRecipes.length > 0 && (
                        <span className="ml-2 text-sm text-gray-500">({categoryRecipes.length} found)</span>
                      )}
                    </h3>
                  </div>

                  {/* Category Recipes Loading */}
                  {categoryRecipesLoading && (
                    <div className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading recipes...</p>
                    </div>
                  )}

                  {/* Category Recipes Error */}
                  {categoryRecipesError && !categoryRecipesLoading && (
                    <div className="p-6">
                      <div className="flex items-center space-x-3 text-red-600 mb-4">
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Error Loading Recipes</h4>
                          <p className="text-sm text-red-500">{categoryRecipesError}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => fetchRecipesByCategory(selectedCategory.name, selectedCategory.type)} 
                        variant="outline"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Category Recipes List */}
                  {!categoryRecipesLoading && !categoryRecipesError && categoryRecipes.length > 0 && (
                    <div className="p-6">
                      <div className="space-y-6">
                        {categoryRecipes.map((recipe, index) => (
                          <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                            {/* Recipe Image */}
                            <div className="relative overflow-hidden rounded-xl w-32 h-32 flex-shrink-0">
                              <img
                                src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-medium">4.8</span>
                              </div>
                            </div>

                            {/* Recipe Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">{recipe.title}</h4>
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                    {recipe.description}
                                  </p>
                                  
                                  {/* Recipe Meta */}
                                  <div className="flex items-center space-x-6 text-gray-700 mb-4">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4 text-primary-600" />
                                      <span className="text-sm font-medium">{formatTime(getTotalTime(recipe))}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Users className="w-4 h-4 text-primary-600" />
                                      <span className="text-sm font-medium">{recipe.servings} servings</span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center space-x-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`flex items-center space-x-2 transition-colors ${
                                        isRecipeSaved(recipe.id)
                                          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                          : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                                      }`}
                                      onClick={() => handleSaveSearchedRecipe(recipe.id)}
                                    >
                                      {isRecipeSaved(recipe.id) ? (
                                        <>
                                          <Check className="w-4 h-4" />
                                          <span>Saved</span>
                                        </>
                                      ) : (
                                        <>
                                          <Heart className="w-4 h-4" />
                                          <span>Save</span>
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                                    >
                                      <BookOpen className="w-4 h-4" />
                                      <span>View Recipe</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Recipes Found */}
                  {!categoryRecipesLoading && !categoryRecipesError && categoryRecipes.length === 0 && selectedCategory && (
                    <div className="p-12 text-center">
                      <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recipes Found</h4>
                      <p className="text-gray-600 mb-4">
                        No recipes found for "{selectedCategory.name.replace(/-/g, ' ')}" category.
                      </p>
                      <Button 
                        onClick={() => {
                          setSelectedCategory(null);
                          setCategoryRecipes([]);
                        }}
                        variant="outline"
                      >
                        Browse Other Categories
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No Categories Available */}
              {(!categories.health_tags || categories.health_tags.length === 0) && 
               (!categories.dietary_tags || categories.dietary_tags.length === 0) && (
                <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
                  <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Categories Available</h4>
                  <p className="text-gray-600 mb-4">
                    Categories will appear here once recipes with tags are added to the database.
                  </p>
                  <Button onClick={() => handleNavigationClick('home')} className="bg-primary-600 hover:bg-primary-700">
                    <Search className="w-4 h-4 mr-2" />
                    Explore Recipes
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (currentView === 'saved') {
      return (
        <div className="space-y-6">
          {/* Saved Recipes Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
                  <Bookmark className="w-6 h-6 mr-3 text-primary-600" />
                  Your Saved Recipes
                </h2>
                <p className="text-gray-600">
                  {savedRecipes.length > 0 
                    ? `You have saved ${savedRecipes.length} recipe${savedRecipes.length === 1 ? '' : 's'}`
                    : 'No saved recipes yet. Start exploring and save your favorites!'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          {/* Saved Recipes List */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-6">
              {/* Loading State */}
              {savedRecipesLoading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading your saved recipes...</p>
                </div>
              )}

              {/* Saved Recipes */}
              {!savedRecipesLoading && savedRecipes.length > 0 && (
                <div className="space-y-6">
                  {savedRecipes.map((savedRecipe, index) => {
                    const recipe = savedRecipe.recipes;
                    return (
                      <div key={savedRecipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                        {/* Recipe Image */}
                        <div className="relative overflow-hidden rounded-xl w-32 h-32 flex-shrink-0">
                          <img
                            src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">4.8</span>
                          </div>
                        </div>

                        {/* Recipe Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2 text-lg">{recipe.title}</h4>
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                {recipe.description}
                              </p>
                              
                              {/* Recipe Meta */}
                              <div className="flex items-center space-x-6 text-gray-700 mb-4">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4 text-primary-600" />
                                  <span className="text-sm font-medium">{formatTime(getTotalTime(recipe))}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4 text-primary-600" />
                                  <span className="text-sm font-medium">{recipe.servings} servings</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-primary-600" />
                                  <span className="text-sm font-medium">
                                    Saved {new Date(savedRecipe.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleRemoveSavedRecipe(recipe.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Remove</span>
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  <span>View Recipe</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Saved Recipes */}
              {!savedRecipesLoading && savedRecipes.length === 0 && (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Saved Recipes Yet</h4>
                  <p className="text-gray-600 mb-4">Start exploring and save recipes you love!</p>
                  <Button 
                    onClick={() => handleNavigationClick('home')} 
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Explore Recipes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default home view content
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="text-2xl font-serif text-gray-900 mb-2">
            {isCreatorMode ? (
              <>Welcome to Creator Dashboard, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 🎨</>
            ) : (
              <>Welcome back, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Chef'}! 👋</>
            )}
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {isCreatorMode ? (
              'Manage your recipes, track performance, and grow your audience.'
            ) : (
              'Ready to discover some amazing recipes today?'
            )}
          </p>
          {user && (
            <p className="text-sm text-gray-500">
              Logged in as: {user.email} • {isCreatorMode ? 'Creator Mode' : 'Consumer Mode'}
            </p>
          )}
        </div>

        {/* Full-Width Search Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center font-sans">
            <Search className="w-5 h-5 mr-2 text-primary-600" />
            {isCreatorMode ? 'Search Your Recipes' : 'Find New Recipes'}
          </h3>
          
          <div className="relative flex items-center bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20 border border-gray-200 focus-within:border-primary-300">
            {/* Voice/Mic Icon */}
            <div className="flex items-center pl-4 pr-3">
              <button
                onClick={handleVoiceSearch}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isListening 
                    ? 'bg-red-50 text-red-500 animate-pulse shadow-md' 
                    : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                }`}
                aria-label="Voice search"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="flex-1 font-sans">
              <Input
                type="text"
                placeholder={isCreatorMode ? "Search your published recipes..." : "Search for recipes by ingredients, cuisine, or dietary needs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-400 h-12 text-base bg-transparent px-0 text-sm"
              />
            </div>
            
            {/* Search Icon/Button */}
            <div className="flex items-center pr-4 pl-3">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-300 ease-in-out hover:scale-110 shadow-md hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search recipes"
              >
                {searchLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Search Tags */}
          <div className="mt-4 flex flex-wrap gap-2 font-sans text-xs">
            {(isCreatorMode 
              ? ['My Popular', 'Recent', 'Drafts', 'High Rated'] 
              : ['Healthy', 'Quick & Easy', 'Vegetarian', 'Low Carb', 'High Protein']
            ).map((tag, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(tag.toLowerCase())}
                disabled={searchLoading}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Section - Only show when there's a search query */}
        {showSearchResults && (
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {searchLoading ? 'Searching...' : 
                 searchError ? 'Search Error' :
                 searchResults.length > 0 ? `Found ${searchResults.length} Recipe${searchResults.length === 1 ? '' : 's'}` :
                 'No Recipes Found'}
              </h3>
              {searchQuery && !searchLoading && (
                <p className="text-gray-600 mt-1">
                  {searchError ? searchError : `Results for "${searchQuery}"`}
                </p>
              )}
            </div>

            {/* Loading State */}
            {searchLoading && (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                    <Search className="w-6 h-6 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Searching Recipes</h4>
                    <p className="text-gray-600 text-sm">
                      Finding the best matches for your query...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {searchError && !searchLoading && (
              <div className="p-6">
                <div className="flex items-center space-x-3 text-red-600 mb-4">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Search Error</h4>
                    <p className="text-sm text-red-500">{searchError}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => performSearch(searchQuery)}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Search Results Grid */}
            {searchResults.length > 0 && !searchLoading && (
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {searchResults.map((recipe, index) => (
                    <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                      {/* Recipe Image with Ranking Number */}
                      <div className="relative overflow-hidden rounded-xl w-32 h-32 flex-shrink-0">
                        <img
                          src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Ranking Number Overlay */}
                        <div className="absolute top-2 left-2">
                          <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                      </div>

                      {/* Recipe Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2 text-lg">{recipe.title}</h4>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                              {recipe.description}
                            </p>
                            
                            {/* Recipe Meta */}
                            <div className="flex items-center space-x-6 text-gray-700 mb-4">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium">{formatTime(getTotalTime(recipe))}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-medium">{recipe.servings} servings</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className={`flex items-center space-x-2 transition-colors ${
                                  isRecipeSaved(recipe.id)
                                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                    : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                                }`}
                                onClick={() => handleSaveSearchedRecipe(recipe.id)}
                              >
                                {isRecipeSaved(recipe.id) ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <Heart className="w-4 h-4" />
                                    <span>Save</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                              >
                                <BookOpen className="w-4 h-4" />
                                <span>View Recipe</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!searchLoading && !searchError && searchResults.length === 0 && hasSearchQuery && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">No Recipes Found</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any recipes matching "{searchQuery}". 
                  Try adjusting your search terms or being more specific.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2">
                  {['high protein chicken', 'quick vegan dinner', 'heart healthy salmon', 'keto breakfast'].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(suggestion)}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm hover:bg-primary-100 transition-colors border border-primary-200 hover:border-primary-300"
                    >
                      Try "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions - Only show for creator mode */}
        {isCreatorMode && (
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <PenTool className="w-8 h-8" />
                <span className="text-primary-100 text-sm">Create</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">New Recipe</h3>
              <p className="text-primary-100 mb-4">Share your culinary creation</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white text-primary-600 hover:bg-gray-100"
                onClick={handleCreateRecipe}
              >
                Create Recipe
              </Button>
            </div>
          </div>
        )}

        {/* Recipe Feed / Creator Content - Always show below search results */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900 font-sans">
                {isCreatorMode ? 'Your Published Recipes' : 'Recipe Feed'}
              </h3>
              <div className="flex items-center space-x-2">
                {!isCreatorMode && (
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-primary-600">
                  View All
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Loading State */}
            {recipesLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading recipes...</p>
              </div>
            )}

            {/* Error State */}
            {recipesError && !recipesLoading && (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{recipesError}</p>
                <Button onClick={fetchRecentRecipes} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Real Recipes from Database */}
            {!recipesLoading && !recipesError && recentRecipes.length > 0 && (
              <>
                {recentRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl w-24 h-24 flex-shrink-0">
                      <img
                        src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">4.8</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{recipe.title}</h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{recipe.description}</p>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(getTotalTime(recipe))}
                            <span className="mx-2">•</span>
                            <Users className="w-4 h-4 mr-1" />
                            {recipe.servings} servings
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {isCreatorMode ? (
                              <>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Published
                                </span>
                                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                  <BarChart3 className="w-4 h-4" />
                                  <span>Analytics</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`flex items-center space-x-1 transition-colors ${
                                    isRecipeSaved(recipe.id)
                                      ? 'text-red-600 hover:text-red-700'
                                      : 'text-gray-500 hover:text-red-500'
                                  }`}
                                  onClick={() => handleSaveSearchedRecipe(recipe.id)}
                                >
                                  {isRecipeSaved(recipe.id) ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span>Saved</span>
                                    </>
                                  ) : (
                                    <>
                                      <Heart className="w-4 h-4" />
                                      <span>Save</span>
                                    </>
                                  )}
                                </Button>
                                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                  <BookOpen className="w-4 h-4" />
                                  <span>View Recipe</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Creator Mode Fallback */}
            {isCreatorMode && !recipesLoading && !recipesError && recentRecipes.length === 0 && (
              <>
                {publishedRecipes.map((recipe, index) => (
                  <div key={index} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl w-24 h-24 flex-shrink-0">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{recipe.rating}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{recipe.name}</h4>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            {recipe.time}
                            <span className="mx-2">•</span>
                            <Eye className="w-4 h-4 mr-1" />
                            {recipe.views} views
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              recipe.status === 'Published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {recipe.status}
                            </span>
                            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                              <BarChart3 className="w-4 h-4" />
                              <span>Analytics</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* No Recipes State */}
            {!isCreatorMode && !recipesLoading && !recipesError && recentRecipes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recipes Yet</h4>
                <p className="text-gray-600 mb-4">Be the first to discover amazing recipes!</p>
                <Button onClick={() => handleQuickSearch('healthy breakfast')} className="bg-primary-600 hover:bg-primary-700">
                  Explore Recipes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render right sidebar content based on current view
  const renderRightSidebar = () => {
    if (currentView === 'saved') {
      return (
        <div className="p-6 space-y-6">
          {/* Related Recipes Widget */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Recommended for You
            </h4>
            
            {relatedRecipesLoading && (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Finding recipes you'll love...</p>
              </div>
            )}

            {!relatedRecipesLoading && relatedRecipes.length > 0 && (
              <div className="space-y-3">
                {relatedRecipes.slice(0, 4).map((recipe, index) => (
                  <div key={recipe.id} className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex space-x-3">
                      <img
                        src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={recipe.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm truncate">{recipe.title}</h5>
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatTime(getTotalTime(recipe))}</span>
                          <span className="mx-2">•</span>
                          <Users className="w-3 h-3 mr-1" />
                          <span>{recipe.servings}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2 text-primary-600 hover:bg-primary-50"
                            onClick={() => handleSaveSearchedRecipe(recipe.id)}
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!relatedRecipesLoading && relatedRecipes.length === 0 && savedRecipes.length > 0 && (
              <div className="text-center py-4">
                <ChefHat className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No related recipes found</p>
              </div>
            )}

            {savedRecipes.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Save some recipes to get personalized recommendations!</p>
              </div>
            )}
          </div>

          {/* Your Preferences Widget */}
          {savedRecipes.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Your Preferences
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Favorite Cuisines</p>
                  <div className="flex flex-wrap gap-1">
                    {['Mediterranean', 'Asian', 'Italian'].map((cuisine, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-1">
                    {['Vegetarian', 'Low-carb', 'High-protein'].map((diet, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cooking Stats Widget */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Your Cooking Stats
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <BookOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{savedRecipes.length}</p>
                <p className="text-xs text-gray-600">Saved</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">2.5h</p>
                <p className="text-xs text-gray-600">Avg Time</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default right sidebar content
    return (
      <div className="p-6 space-y-6">
        {/* Stats Widget */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-600" />
            {isCreatorMode ? 'Creator Stats' : 'Your Stats'}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {currentStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-3 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Insights or Trending Topics */}
        {isCreatorMode ? (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Performance Insights
            </h4>
            <div className="space-y-3">
              {creatorInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-gray-900 text-sm">{insight.title}</h5>
                    <span className="text-xs text-green-600 font-medium">{insight.change}</span>
                  </div>
                  <p className="text-sm text-gray-600">{insight.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Trending Topics
            </h4>
            <div className="space-y-2">
              {trendingTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(topic)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-sm text-gray-700 hover:text-primary-600"
                >
                  #{topic.replace(/\s+/g, '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Widget */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            {isCreatorMode ? 'Creator Events' : 'Upcoming Events'}
          </h4>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-lg p-3">
                <h5 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h5>
                <div className="flex items-center text-xs text-gray-600">
                  <span>{event.date}</span>
                  <span className="mx-2">•</span>
                  <span>{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Widget */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Recent Achievement
          </h4>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <p className="font-medium text-gray-900 text-sm">
              {isCreatorMode ? 'Rising Creator' : 'Recipe Explorer'}
            </p>
            <p className="text-xs text-gray-600">
              {isCreatorMode ? 'Reached 1K followers!' : 'Saved 25 recipes this month!'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-zinc-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <ChefHat className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-serif text-white">MatchMyMeals</h1>
            </div>
            
            <div className="flex items-center space-x-12">
              {/* Mode Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMode}
                className="text-white hover:bg-white/10 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                {isCreatorMode ? (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    Consumer Mode
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Creator Mode
                  </>
                )}
              </Button>

              <div className="flex items-center space-x-5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">
                      {userProfile?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isCreatorMode ? 'Creator' : userProfile?.subscription_status || 'Free Plan'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-4">
            <nav className="space-y-2">
              {currentNavigation.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigationClick(item.view)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors font-sans ${
                    item.active 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-primary-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Center Content - Scrollable Feed */}
        <div className="flex-1 max-w-2xl">
          <div className="p-6 space-y-6">
            {/* Connection Status */}
            {!isConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Database Connection Issue</p>
                  <p className="text-xs text-yellow-600">Some features may not work properly. Please check your Supabase configuration.</p>
                </div>
              </div>
            )}

            {/* Render main content based on current view */}
            {renderMainContent()}
          </div>
        </div>

        {/* Right Sidebar - Widgets */}
        <aside className="w-80 bg-white border-l border-gray-200 min-h-screen sticky top-0">
          {renderRightSidebar()}
        </aside>
      </main>

      {/* Recipe Creation Modal */}
      <RecipeCreationModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSave={handleRecipeSave}
        onPublish={handlePublishRecipe}
      />
    </div>
  );
};

export default Dashboard;
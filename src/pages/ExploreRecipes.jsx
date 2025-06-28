import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  ChefHat,
  Plus,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { supabase } from '../lib/supabase';
import { formatTime, getTotalTime } from '../lib/utils';
import CommonHeader from '../components/CommonHeader';
import { useQuery } from '@tanstack/react-query';
import AddToBoardModal from '../components/AddToBoardModal';

const fetchAllRecipes = async (searchQuery = '', filterBy = 'all') => {
  let query = supabase
    .from('recipes')
    .select(`
      id,
      slug,
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
    .order('created_at', { ascending: false });

  // Apply search filter
  if (searchQuery.trim()) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  // Apply category filter
  if (filterBy !== 'all') {
    switch (filterBy) {
      case 'vegetarian':
        query = query.contains('dietary_tags', '["vegetarian"]');
        break;
      case 'vegan':
        query = query.contains('dietary_tags', '["vegan"]');
        break;
      case 'gluten-free':
        query = query.contains('dietary_tags', '["gluten-free"]');
        break;
      case 'keto':
        query = query.contains('dietary_tags', '["keto"]');
        break;
      case 'quick':
        query = query.lte('prep_time', 30).lte('cook_time', 30);
        break;
      case 'healthy':
        query = query.contains('health_tags', '["heart-healthy"]');
        break;
    }
  }

  const { data, error } = await query.limit(50);
  
  if (error) throw new Error(error.message);
  return data || [];
};

// Skeleton Loading Component
const RecipeSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
    {/* Image Skeleton */}
    <div className="h-48 bg-gray-200"></div>
    
    {/* Content Skeleton */}
    <div className="p-4">
      {/* Title Skeleton */}
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      
      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      {/* Meta Info Skeleton */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const ExploreRecipes = () => {
  const { user } = useAuth();
  const { saveRecipe, removeSavedRecipe, isRecipeSaved } = useSavedRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedRecipeForBoard, setSelectedRecipeForBoard] = useState(null);

  const {
    data: recipes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['exploreRecipes', searchQuery, filterBy],
    queryFn: () => fetchAllRecipes(searchQuery, filterBy),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // The query will automatically refetch due to the searchQuery dependency
  };

  const handleSaveRecipe = async (recipeId) => {
    if (!user) {
      alert('Please log in to save recipes');
      return;
    }

    try {
      if (isRecipeSaved(recipeId)) {
        await removeSavedRecipe(recipeId);
      } else {
        await saveRecipe(recipeId);
      }
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    }
  };

  const handleAddToBoard = (recipeId) => {
    if (!user) {
      alert('Please log in to add recipes to boards');
      return;
    }
    setSelectedRecipeForBoard(recipeId);
  };

  const filterOptions = [
    { value: 'all', label: 'All Recipes' },
    { value: 'quick', label: 'Quick & Easy' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'keto', label: 'Keto' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CommonHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2 flex items-center">
                <ChefHat className="w-8 h-8 mr-3 text-primary-600" />
                Explore Recipes
              </h1>
              <p className="text-gray-600">
                Discover amazing recipes from our community of creators
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search recipes by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-200 focus:border-primary-500 focus:ring-primary-500 rounded-lg"
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="md:w-48">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              className="h-12 px-6 bg-primary-600 hover:bg-primary-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-gray-600">
              {recipes.length > 0 
                ? `Found ${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`
                : 'No recipes found'
              }
              {searchQuery && ` for "${searchQuery}"`}
              {filterBy !== 'all' && ` in ${filterOptions.find(f => f.value === filterBy)?.label}`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <RecipeSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Recipes Grid */}
        {!isLoading && !error && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 group">
                {/* Recipe Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">4.8</span>
                  </div>
                </div>

                {/* Recipe Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Recipe Meta */}
                  <div className="flex items-center space-x-4 text-gray-700 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium">{formatTime(getTotalTime(recipe))}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium">{recipe.servings}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {recipe.dietary_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.dietary_tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                        >
                          {tag.replace(/-/g, ' ')}
                        </span>
                      ))}
                      {recipe.dietary_tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{recipe.dietary_tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {user && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center space-x-1 transition-colors ${
                            isRecipeSaved(recipe.id)
                              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                              : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                          }`}
                          onClick={() => handleSaveRecipe(recipe.id)}
                        >
                          {isRecipeSaved(recipe.id) ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Heart className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                          onClick={() => handleAddToBoard(recipe.id)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-primary-600 hover:bg-primary-700"
                    >
                      <Link to={`/recipes/${recipe.slug}`}>
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span className="text-xs">View</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && recipes.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No recipes available at the moment'
              }
            </p>
            {(searchQuery || filterBy !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterBy('all');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Add to Board Modal */}
      <AddToBoardModal
        isOpen={!!selectedRecipeForBoard}
        onClose={() => setSelectedRecipeForBoard(null)}
        recipeId={selectedRecipeForBoard}
      />
    </div>
  );
};

export default ExploreRecipes;
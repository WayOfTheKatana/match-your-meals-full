import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid3X3, 
  Heart, 
  Utensils, 
  Tag, 
  Loader2, 
  AlertCircle, 
  ChefHat, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Check, 
  Search 
} from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('recipes')
    .select('health_tags, dietary_tags')
    .not('health_tags', 'is', null)
    .not('dietary_tags', 'is', null);
  if (error) throw new Error(error.message);

  // Process the data to extract unique categories
  const healthTagsSet = new Set();
  const dietaryTagsSet = new Set();
  data.forEach(recipe => {
    if (recipe.health_tags && Array.isArray(recipe.health_tags)) {
      recipe.health_tags.forEach(tag => {
        if (tag && typeof tag === 'string') healthTagsSet.add(tag.trim());
      });
    }
    if (recipe.dietary_tags && Array.isArray(recipe.dietary_tags)) {
      recipe.dietary_tags.forEach(tag => {
        if (tag && typeof tag === 'string') dietaryTagsSet.add(tag.trim());
      });
    }
  });
  return {
    health_tags: Array.from(healthTagsSet).sort(),
    dietary_tags: Array.from(dietaryTagsSet).sort(),
  };
};

const fetchRecipesByCategory = async ({ queryKey }) => {
  const [_key, categoryName, categoryType] = queryKey;
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
      created_at,
      slug
    `);
  if (categoryType === 'health_tags') {
    query = query.contains('health_tags', JSON.stringify([categoryName]));
  } else if (categoryType === 'dietary_tags') {
    query = query.overlaps('dietary_tags', [categoryName]);
  } else if (categoryType === 'health_benefits') {
    query = query.overlaps('health_benefits', [categoryName]);
  } else {
    throw new Error(`Unsupported category type: ${categoryType}`);
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
  if (error) throw new Error(error.message);
  return data || [];
};

// Skeleton Loading Components
const CategoryHeaderSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gray-200 rounded mr-3"></div>
          <div className="h-8 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-80"></div>
      </div>
    </div>
  </div>
);

const CategoryTagsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse">
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(8)].map((_, index) => (
          <div
            key={`health-skeleton-${index}`}
            className="h-8 bg-gray-200 rounded-full"
            style={{ width: `${Math.random() * 60 + 80}px` }}
          ></div>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
        <div className="h-6 bg-gray-200 rounded w-28"></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, index) => (
          <div
            key={`dietary-skeleton-${index}`}
            className="h-8 bg-gray-200 rounded-full"
            style={{ width: `${Math.random() * 50 + 70}px` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

const RecipeResultSkeleton = () => (
  <div className="flex space-x-4 p-4 rounded-xl border border-gray-100 animate-pulse">
    {/* Recipe Image Skeleton */}
    <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0"></div>
    
    {/* Recipe Content Skeleton */}
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title Skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          
          {/* Description Skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          
          {/* Meta Info Skeleton */}
          <div className="flex items-center space-x-6 mb-4">
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
          <div className="flex items-center space-x-3">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RecipeCategoriesBrowser = ({ 
  isConnected,
  formatTime,
  getTotalTime,
  isRecipeSaved,
  handleSaveSearchedRecipe,
  handleNavigationClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryType, setCategoryType] = useState(null);

  // Categories query
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: isConnected,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Recipes by category query
  const {
    data: categoryRecipes = [],
    isLoading: categoryRecipesLoading,
    error: categoryRecipesError,
  } = useQuery({
    queryKey: selectedCategory && categoryType ? ['categoryRecipes', selectedCategory, categoryType] : [],
    queryFn: fetchRecipesByCategory,
    enabled: !!selectedCategory && !!categoryType,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleCategoryClick = (name, type) => {
    setSelectedCategory(name);
    setCategoryType(type);
  };

  return (
    <div className="space-y-6">
      {/* Categories Header */}
      {categoriesLoading ? (
        <CategoryHeaderSkeleton />
      ) : (
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
      )}

      {/* Categories Error State */}
      {categoriesError && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{categoriesError.message}</p>
        </div>
      )}

      {/* Categories List */}
      {categoriesLoading ? (
        <CategoryTagsSkeleton />
      ) : categories && !categoriesError ? (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-primary-600" />
              Health Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.health_tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleCategoryClick(tag, 'health_tags')}
                  className={`px-3 py-1 rounded-full text-sm font-medium border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors ${selectedCategory === tag && categoryType === 'health_tags' ? 'ring-2 ring-primary-400' : ''}`}
                >
                  {tag.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-primary-600" />
              Dietary Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.dietary_tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleCategoryClick(tag, 'dietary_tags')}
                  className={`px-3 py-1 rounded-full text-sm font-medium border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors ${selectedCategory === tag && categoryType === 'dietary_tags' ? 'ring-2 ring-green-400' : ''}`}
                >
                  {tag.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Recipes by Category Loading State */}
      {categoryRecipesLoading && selectedCategory && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <RecipeResultSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {/* Recipes by Category Error State */}
      {categoryRecipesError && selectedCategory && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{categoryRecipesError.message}</p>
        </div>
      )}

      {/* Recipes by Category List */}
      {categoryRecipes && !categoryRecipesLoading && !categoryRecipesError && selectedCategory && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
              Recipes for "{selectedCategory.replace(/-/g, ' ')}"
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Clear
            </Button>
          </div>
          {categoryRecipes.length === 0 ? (
            <div className="text-center py-8">
              <ChefHat className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No recipes found for this category.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categoryRecipes.map(recipe => (
                <div key={recipe.id} className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="relative overflow-hidden rounded-xl w-32 h-32 flex-shrink-0">
                    <img
                      src={recipe.image_path || 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=300'}
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
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">{recipe.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
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
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
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
                            asChild
                            size="sm"
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                          >
                            <Link to={`/recipes/${recipe.slug}`}>
                              <BookOpen className="w-4 h-4" />
                              <span>View Recipe</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeCategoriesBrowser;
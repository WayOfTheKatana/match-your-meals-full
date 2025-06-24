import React, { useState, useEffect } from 'react';
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

const RecipeCategoriesBrowser = ({ 
  isConnected,
  formatTime,
  getTotalTime,
  isRecipeSaved,
  handleSaveSearchedRecipe,
  handleNavigationClick
}) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryRecipes, setCategoryRecipes] = useState([]);
  const [categoryRecipesLoading, setCategoryRecipesLoading] = useState(false);
  const [categoryRecipesError, setCategoryRecipesError] = useState('');

  useEffect(() => {
    if (isConnected) {
      fetchCategories();
    }
  }, [isConnected]);

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
};

export default RecipeCategoriesBrowser;
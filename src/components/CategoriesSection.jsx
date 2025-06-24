import React, { useState, useEffect } from 'react';
import { Tag, Heart, Leaf, Utensils, Clock, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

const CategoriesSection = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState({
    health_tags: [],
    dietary_tags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching all recipes to extract categories...');

      const { data: recipes, error: fetchError } = await supabase
        .from('recipes')
        .select('health_tags, dietary_tags')
        .not('health_tags', 'is', null)
        .not('dietary_tags', 'is', null);

      if (fetchError) {
        throw fetchError;
      }

      console.log('✅ Recipes fetched:', recipes?.length || 0);

      // Extract and deduplicate health tags
      const healthTagsSet = new Set();
      const dietaryTagsSet = new Set();

      recipes?.forEach(recipe => {
        // Process health_tags (JSONB array)
        if (recipe.health_tags && Array.isArray(recipe.health_tags)) {
          recipe.health_tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              healthTagsSet.add(tag.trim());
            }
          });
        }

        // Process dietary_tags (TEXT[] array)
        if (recipe.dietary_tags && Array.isArray(recipe.dietary_tags)) {
          recipe.dietary_tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              dietaryTagsSet.add(tag.trim());
            }
          });
        }
      });

      const uniqueHealthTags = Array.from(healthTagsSet).sort();
      const uniqueDietaryTags = Array.from(dietaryTagsSet).sort();

      setCategories({
        health_tags: uniqueHealthTags,
        dietary_tags: uniqueDietaryTags
      });

      console.log('✅ Categories extracted:', {
        health_tags: uniqueHealthTags.length,
        dietary_tags: uniqueDietaryTags.length
      });

    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (tag, type) => {
    console.log('🏷️ Category selected:', { tag, type });
    onSelectCategory(tag, type);
  };

  const formatTagDisplay = (tag) => {
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTagIcon = (tag, type) => {
    if (type === 'health_tags') {
      if (tag.includes('protein')) return <Users className="w-4 h-4" />;
      if (tag.includes('heart')) return <Heart className="w-4 h-4" />;
      if (tag.includes('fiber')) return <Leaf className="w-4 h-4" />;
      if (tag.includes('energy')) return <Clock className="w-4 h-4" />;
      return <Heart className="w-4 h-4" />;
    } else {
      if (tag.includes('vegan') || tag.includes('vegetarian')) return <Leaf className="w-4 h-4" />;
      if (tag.includes('keto') || tag.includes('paleo')) return <Utensils className="w-4 h-4" />;
      return <Tag className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCategories} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">Browse by Categories</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover recipes by health benefits and dietary preferences. 
          Click on any category to find recipes that match your needs.
        </p>
      </div>

      {/* Health Tags Section */}
      {categories.health_tags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Health Benefits</h3>
            <span className="text-sm text-gray-500">({categories.health_tags.length} categories)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.health_tags.map((tag, index) => (
              <button
                key={`health-${index}`}
                onClick={() => handleCategoryClick(tag, 'health_tags')}
                className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group shadow-sm hover:shadow-md"
              >
                <div className="text-primary-600 group-hover:text-primary-700">
                  {getTagIcon(tag, 'health_tags')}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                  {formatTagDisplay(tag)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dietary Tags Section */}
      {categories.dietary_tags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Dietary Preferences</h3>
            <span className="text-sm text-gray-500">({categories.dietary_tags.length} categories)</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.dietary_tags.map((tag, index) => (
              <button
                key={`dietary-${index}`}
                onClick={() => handleCategoryClick(tag, 'dietary_tags')}
                className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left group shadow-sm hover:shadow-md"
              >
                <div className="text-green-600 group-hover:text-green-700">
                  {getTagIcon(tag, 'dietary_tags')}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  {formatTagDisplay(tag)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {categories.health_tags.length === 0 && categories.dietary_tags.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-600 mb-6">
            No recipes with categories have been added yet. 
            Create some recipes to see categories here.
          </p>
          <Button onClick={fetchCategories} variant="outline">
            Refresh Categories
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;
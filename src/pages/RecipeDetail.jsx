import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Share2, 
  Bookmark, 
  Star,
  Loader2,
  AlertCircle,
  Tag,
  Award,
  Utensils,
  Timer
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { supabase } from '../lib/supabase';
import { formatTime, getTotalTime } from '../lib/utils';
import CommonHeader from '../components/CommonHeader';

const RecipeDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveRecipe, removeSavedRecipe, isRecipeSaved } = useSavedRecipes();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchRecipe();
    }
  }, [slug]);

  const fetchRecipe = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching recipe with slug:', slug);

      const { data, error } = await supabase
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
          instructions,
          health_tags,
          dietary_tags,
          health_benefits,
          nutritional_info,
          creator_id,
          created_at,
          updated_at
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Recipe not found');
        } else {
          console.error('❌ Error fetching recipe:', error);
          setError('Failed to load recipe');
        }
        return;
      }

      console.log('✅ Recipe fetched successfully:', data.title);
      setRecipe(data);
    } catch (err) {
      console.error('❌ Error in fetchRecipe:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      if (isRecipeSaved(recipe.id)) {
        await removeSavedRecipe(recipe.id);
      } else {
        await saveRecipe(recipe.id);
      }
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Recipe</h2>
            <p className="text-gray-600">Please wait while we fetch the recipe details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                <ChefHat className="w-4 h-4 mr-2" />
                Browse Recipes
              </Button>
              <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Common Header */}
      <CommonHeader />

      {/* Recipe Actions Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[80px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              
              {user && (
                <Button
                  variant={isRecipeSaved(recipe.id) ? "default" : "outline"}
                  size="sm"
                  onClick={handleSaveRecipe}
                  disabled={saving}
                  className={`flex items-center space-x-2 ${
                    isRecipeSaved(recipe.id) 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isRecipeSaved(recipe.id) ? 'fill-current' : ''}`} />
                  )}
                  <span>{isRecipeSaved(recipe.id) ? 'Saved' : 'Save'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium">4.8 (127 reviews)</span>
              </div>
              <h1 className="text-4xl font-serif text-white mb-2">{recipe.title}</h1>
              <p className="text-white/90 text-lg">{recipe.description}</p>
            </div>
          </div>

          {/* Recipe Meta */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Timer className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Prep Time</p>
                <p className="font-semibold text-gray-900">{formatTime(recipe.prep_time)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Cook Time</p>
                <p className="font-semibold text-gray-900">{formatTime(recipe.cook_time)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Servings</p>
                <p className="font-semibold text-gray-900">{recipe.servings}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <ChefHat className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="font-semibold text-gray-900">{formatTime(getTotalTime(recipe))}</p>
              </div>
            </div>

            {/* Tags */}
            {(recipe.dietary_tags?.length > 0 || recipe.health_tags?.length > 0) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-primary-600" />
                  Recipe Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietary_tags?.map((tag, index) => (
                    <span
                      key={`dietary-${index}`}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {recipe.health_tags?.map((tag, index) => (
                    <span
                      key={`health-${index}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-primary-600" />
                  Ingredients
                </h3>
                <div className="space-y-3">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                      <span className="text-gray-900">
                        <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                        {' '}
                        <span>{ingredient.name}</span>
                      </span>
                    </div>
                  )) || (
                    <p className="text-gray-600 italic">No ingredients listed</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ChefHat className="w-5 h-5 mr-2 text-primary-600" />
                  Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions?.map((instruction, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-900 leading-relaxed pt-1">{instruction}</p>
                    </div>
                  )) || (
                    <p className="text-gray-600 italic">No instructions provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Health Benefits */}
            {recipe.health_benefits?.length > 0 && (
              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-green-600" />
                  Health Benefits
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {recipe.health_benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0" />
                      <span className="text-green-800 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Info */}
            {recipe.nutritional_info && (
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Nutritional Information (per serving)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(recipe.nutritional_info).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{value}</p>
                      <p className="text-sm text-blue-800 capitalize">
                        {key.replace(/_/g, ' ').replace('grams', 'g').replace('mg', 'mg')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  ChefHat, 
  Clock, 
  Users, 
  Heart, 
  BookOpen, 
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { supabase } from '../lib/supabase';
import { formatTime, getTotalTime } from '../lib/utils';
import CommonHeader from '../components/CommonHeader';

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveRecipe, removeSavedRecipe, isRecipeSaved } = useSavedRecipes();

  const [creatorData, setCreatorData] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalSaves, setTotalSaves] = useState(0);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorProfile();
    }
  }, [creatorId]);

  const fetchCreatorProfile = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching creator profile for ID:', creatorId);

      const { data, error } = await supabase
        .rpc('get_creator_public_profile_data', {
          creator_user_id: creatorId
        });

      if (error) {
        console.error('❌ Error fetching creator profile:', error);
        setError('Failed to load creator profile');
        return;
      }

      if (!data || data.length === 0) {
        setError('Creator not found');
        return;
      }

      console.log('✅ Creator profile data fetched:', data.length, 'records');

      // Extract creator info from first record
      const creatorInfo = {
        id: data[0].creator_id,
        name: data[0].creator_name,
        avatar_url: data[0].creator_avatar_url,
        joined_date: data[0].creator_joined_date
      };

      // Extract recipes (filter out null recipe_id which means no recipes)
      const recipesList = data
        .filter(record => record.recipe_id !== null)
        .map(record => ({
          id: record.recipe_id,
          slug: record.recipe_slug,
          title: record.recipe_title,
          description: record.recipe_description,
          prep_time: record.recipe_prep_time,
          cook_time: record.recipe_cook_time,
          servings: record.recipe_servings,
          image_path: record.recipe_image_path,
          ingredients: record.recipe_ingredients,
          instructions: record.recipe_instructions,
          health_tags: record.recipe_health_tags,
          dietary_tags: record.recipe_dietary_tags,
          health_benefits: record.recipe_health_benefits,
          nutritional_info: record.recipe_nutritional_info,
          created_at: record.recipe_created_at,
          save_count: record.recipe_save_count
        }));

      // Calculate total saves across all recipes
      const totalSaveCount = recipesList.reduce((sum, recipe) => sum + (recipe.save_count || 0), 0);

      setCreatorData(creatorInfo);
      setRecipes(recipesList);
      setTotalSaves(totalSaveCount);

      console.log('✅ Creator profile loaded:', {
        creator: creatorInfo.name,
        recipes: recipesList.length,
        totalSaves: totalSaveCount
      });

    } catch (err) {
      console.error('❌ Error in fetchCreatorProfile:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isRecipeSaved(recipeId)) {
        await removeSavedRecipe(recipeId);
      } else {
        await saveRecipe(recipeId);
      }
      // Refresh the data to update save counts
      await fetchCreatorProfile();
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Creator Profile</h2>
            <p className="text-gray-600">Please wait while we fetch the creator's information...</p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Creator Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                <ChefHat className="w-4 h-4 mr-2" />
                Browse Recipes
              </Button>
              <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!creatorData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Common Header */}
      <CommonHeader />

      {/* Main Content - Flat Design */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Creator Header Section - Flat */}
        <div className="border-b border-gray-200 pb-8 mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              {creatorData.avatar_url ? (
                <img
                  src={creatorData.avatar_url}
                  alt={creatorData.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-serif text-gray-900 mb-1">{creatorData.name}</h1>
              <p className="text-gray-600 mb-3">Recipe Creator</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(creatorData.joined_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChefHat className="w-4 h-4" />
                  <span>{recipes.length} Recipe{recipes.length === 1 ? '' : 's'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{totalSaves} Total Saves</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Stats - Flat */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <ChefHat className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{recipes.length}</p>
            <p className="text-sm text-gray-600">Published Recipes</p>
          </div>
          <div className="text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{totalSaves}</p>
            <p className="text-sm text-gray-600">Total Recipe Saves</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">4.8</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Published Recipes Section - Flat */}
        <div className="space-y-8">
          <h2 className="text-2xl font-serif text-gray-900">Published Recipes</h2>
          
          {recipes.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Yet</h3>
              <p className="text-gray-600">This creator hasn't published any recipes yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="flex space-x-6">
                    {/* Recipe Image */}
                    <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={recipe.image_path || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-medium">{recipe.save_count || 0}</span>
                      </div>
                    </div>

                    {/* Recipe Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {recipe.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
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

                      {/* Tags */}
                      {recipe.dietary_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {recipe.dietary_tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                            >
                              {tag.replace(/-/g, ' ')}
                            </span>
                          ))}
                          {recipe.dietary_tags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{recipe.dietary_tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        {user && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`flex items-center space-x-2 transition-colors ${
                              isRecipeSaved(recipe.id)
                                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                            }`}
                            onClick={() => handleSaveRecipe(recipe.id)}
                          >
                            <Heart className={`w-4 h-4 ${isRecipeSaved(recipe.id) ? 'fill-current' : ''}`} />
                            <span>{isRecipeSaved(recipe.id) ? 'Saved' : 'Save'}</span>
                          </Button>
                        )}
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreatorProfile;
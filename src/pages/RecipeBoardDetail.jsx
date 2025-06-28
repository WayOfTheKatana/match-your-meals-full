import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  Edit3,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Lock,
  Globe,
  Check,
  X,
  Save
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useSavedRecipes } from '../hooks/useSavedRecipes';
import { useRecipeBoards } from '../hooks/useRecipeBoards';
import { supabase } from '../lib/supabase';
import { formatTime, getTotalTime } from '../lib/utils';
import CommonHeader from '../components/CommonHeader';
import ConfirmationModal from '../components/ConfirmationModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AddToBoardModal from '../components/AddToBoardModal';

const fetchBoardDetails = async (boardSlug) => {
  console.log('🔍 Fetching board details for slug:', boardSlug);
  
  // First, get the board details
  const { data: board, error: boardError } = await supabase
    .from('recipe_boards')
    .select(`
      id,
      user_id,
      title,
      slug,
      description,
      is_private,
      created_at,
      updated_at
    `)
    .eq('slug', boardSlug)
    .single();
  
  if (boardError) {
    if (boardError.code === 'PGRST116') {
      throw new Error('Board not found');
    }
    throw new Error(boardError.message);
  }
  
  // Get the board creator's details
  const { data: creator, error: creatorError } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, email')
    .eq('id', board.user_id)
    .single();
  
  if (creatorError) {
    console.error('❌ Error fetching creator:', creatorError);
  }
  
  // Get the recipes in this board
  const { data: boardRecipes, error: recipesError } = await supabase
    .from('board_recipes')
    .select(`
      id,
      added_at,
      recipes (
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
      )
    `)
    .eq('board_id', board.id)
    .order('added_at', { ascending: false });
  
  if (recipesError) {
    throw new Error(recipesError.message);
  }
  
  console.log('✅ Board details fetched successfully');
  
  return {
    ...board,
    creator: creator || null,
    recipes: boardRecipes || [],
    recipe_count: boardRecipes?.length || 0
  };
};

// Skeleton Loading Components
const BoardHeaderSkeleton = () => (
  <div className="bg-white rounded-2xl p-8 shadow-sm border animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const RecipeSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
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
      <div className="flex items-center space-x-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

const RecipeBoardDetail = () => {
  const { boardSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveRecipe, removeSavedRecipe, isRecipeSaved } = useSavedRecipes();
  const { updateBoard, deleteBoard } = useRecipeBoards();
  const queryClient = useQueryClient();
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedIsPrivate, setEditedIsPrivate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for delete confirmation
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Other state
  const [selectedRecipeForBoard, setSelectedRecipeForBoard] = useState(null);

  const {
    data: boardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['boardDetails', boardSlug],
    queryFn: () => fetchBoardDetails(boardSlug),
    enabled: !!boardSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isOwner = user && boardData && user.id === boardData.user_id;
  const canView = boardData && (!boardData.is_private || isOwner);

  // Initialize edit form when boardData changes
  useEffect(() => {
    if (boardData && !isEditing) {
      setEditedTitle(boardData.title || '');
      setEditedDescription(boardData.description || '');
      setEditedIsPrivate(boardData.is_private || false);
    }
  }, [boardData, isEditing]);

  const getDisplayName = (creator) => {
    if (!creator) return 'Unknown Creator';
    if (creator.full_name && creator.full_name.trim()) {
      return creator.full_name;
    }
    return creator.email ? creator.email.split('@')[0] : 'Creator';
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setEditedTitle(boardData.title || '');
    setEditedDescription(boardData.description || '');
    setEditedIsPrivate(boardData.is_private || false);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!boardData || !isOwner) return;
    
    // Validate title
    if (!editedTitle.trim()) {
      alert('Board title is required');
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        title: editedTitle.trim(),
        description: editedDescription.trim() || null,
        is_private: editedIsPrivate
      };

      await updateBoard({ boardId: boardData.id, updates });
      
      // Invalidate and refetch the board details
      queryClient.invalidateQueries(['boardDetails', boardSlug]);
      
      setIsEditing(false);
      console.log('✅ Board updated successfully');
    } catch (error) {
      console.error('❌ Error updating board:', error);
      alert(error.message || 'Failed to update board. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!boardData || !isOwner) return;

    setIsDeleting(true);
    try {
      await deleteBoard(boardData.id);
      navigate('/dashboard/consumer/boards');
    } catch (error) {
      console.error('❌ Error deleting board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirmDeleteModal(false);
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
    } catch (error) {
      console.error('Error toggling recipe save status:', error);
      alert(error.message || 'Failed to save recipe. Please try again.');
    }
  };

  const handleAddToBoard = (recipeId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRecipeForBoard(recipeId);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: boardData.title,
          text: boardData.description || `Check out this recipe board: ${boardData.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Board link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BoardHeaderSkeleton />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <RecipeSkeleton key={index} />
            ))}
          </div>
        </main>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Board Not Found</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/dashboard/consumer/boards')} className="w-full">
                <Layers className="w-4 h-4 mr-2" />
                View All Boards
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

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommonHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto p-6">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Private Board</h2>
            <p className="text-gray-600 mb-6">This board is private and can only be viewed by its creator.</p>
            <Button onClick={() => navigate('/dashboard/consumer/boards')} className="w-full">
              <Layers className="w-4 h-4 mr-2" />
              View Public Boards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CommonHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Board Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Layers className="w-8 h-8 text-primary-600 mr-3" />
                
                {/* Editable Title */}
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-3xl font-serif text-gray-900 border-2 border-primary-300 focus:border-primary-500 h-12 px-3"
                    placeholder="Board title"
                    maxLength={100}
                  />
                ) : (
                  <h1 className="text-3xl font-serif text-gray-900">{boardData.title}</h1>
                )}
                
                {/* Privacy Badge */}
                {(isEditing ? editedIsPrivate : boardData.is_private) ? (
                  <div className="ml-3 flex items-center space-x-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs font-medium">Private</span>
                  </div>
                ) : (
                  <div className="ml-3 flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    <Globe className="w-3 h-3" />
                    <span className="text-xs font-medium">Public</span>
                  </div>
                )}
              </div>
              
              {/* Editable Description */}
              {isEditing ? (
                <div className="mb-4">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-primary-300 focus:border-primary-500 rounded-lg resize-none"
                    placeholder="Board description (optional)"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              ) : (
                boardData.description && (
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                    {boardData.description}
                  </p>
                )
              )}

              {/* Privacy Toggle in Edit Mode */}
              {isEditing && (
                <div className="mb-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editedIsPrivate}
                      onChange={(e) => setEditedIsPrivate(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Make this board private (only you can see it)
                    </span>
                  </label>
                </div>
              )}
              
              {/* Board Stats - Moved here and simplified */}
              <div className="flex items-center space-x-6 text-gray-700">
                {/* Creator Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    {boardData.creator?.avatar_url ? (
                      <img
                        src={boardData.creator.avatar_url}
                        alt={getDisplayName(boardData.creator)}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3 text-primary-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {isOwner ? 'Your Board' : `by ${getDisplayName(boardData.creator)}`}
                  </span>
                </div>
                
                {/* Recipe Count */}
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">
                    {boardData.recipe_count} recipe{boardData.recipe_count === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSaving || !editedTitle.trim()}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                  
                  {isOwner && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                        className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteClick}
                        className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {boardData.recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boardData.recipes.map((boardRecipe) => {
              const recipe = boardRecipe.recipes;
              return (
                <div key={boardRecipe.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 group">
                  {/* Recipe Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image_path || 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                    {/* Added to board date */}
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-black/60 text-white rounded-full px-2 py-1">
                        <span className="text-xs font-medium">
                          Added {new Date(boardRecipe.added_at).toLocaleDateString()}
                        </span>
                      </div>
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
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Yet</h3>
            <p className="text-gray-600 mb-6">
              {isOwner 
                ? 'Start adding recipes to this board to organize your favorites'
                : 'This board doesn\'t have any recipes yet'
              }
            </p>
            {isOwner && (
              <div className="space-y-3">
                <Button 
                  asChild
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Link to="/explore-recipes">
                    <Plus className="w-4 h-4 mr-2" />
                    Explore Recipes
                  </Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Find recipes and add them to this board
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Recipe Board"
        message={`Are you sure you want to delete "${boardData?.title}"? This action cannot be undone and will remove all recipes from this board.`}
        confirmText="Delete Board"
        cancelText="Cancel"
        isDestructive={true}
        loading={isDeleting}
      />

      {/* Add to Board Modal */}
      <AddToBoardModal
        isOpen={!!selectedRecipeForBoard}
        onClose={() => setSelectedRecipeForBoard(null)}
        recipeId={selectedRecipeForBoard}
      />
    </div>
  );
};

export default RecipeBoardDetail;
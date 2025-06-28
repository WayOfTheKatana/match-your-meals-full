import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRecipeBoards } from '../../hooks/useRecipeBoards';
import { Layers, Plus, BookOpen, Loader2, AlertCircle, Star, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import CreateBoardModal from './CreateBoardModal';

// Skeleton Loading Component
const BoardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-pulse">
    {/* Board Cover Skeleton */}
    <div className="relative h-48 bg-gray-200">
      {/* Recipe Images Grid Skeleton */}
      <div className="absolute inset-0 p-4">
        <div className="grid grid-cols-2 gap-2 h-full">
          <div className="bg-gray-300 rounded-lg"></div>
          <div className="grid grid-rows-2 gap-2">
            <div className="bg-gray-300 rounded-lg"></div>
            <div className="bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
      
      {/* Recipe Count Skeleton */}
      <div className="absolute bottom-3 left-3">
        <div className="w-20 h-5 bg-gray-300 rounded"></div>
      </div>
    </div>

    {/* Board Content Skeleton */}
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      
      {/* Board Actions Skeleton */}
      <div className="flex items-center justify-end">
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const DashboardBoards = () => {
  const { user } = useAuth();
  const { boards, loading, error, refetch } = useRecipeBoards();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const generateBoardUrl = (boardSlug) => {
    return `/creators/board/${boardSlug}`;
  };

  const handleBoardCreated = (newBoard) => {
    console.log('✅ Board created:', newBoard);
    // The useRecipeBoards hook will automatically refetch the data
    // due to the query invalidation in the mutation
  };

  const renderRecipeImagesGrid = (images, recipeCount) => {
    // If no recipes, show empty state
    if (recipeCount === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recipes yet</p>
            <Link 
              to="/explore-recipes"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-flex items-center"
            >
              Explore recipes <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      );
    }

    // Ensure we have at least some placeholder images
    const placeholderImages = [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=200'
    ];
    
    const displayImages = images && images.length > 0 ? images : placeholderImages;
    
    if (displayImages.length === 1) {
      // Single image - full cover
      return (
        <img
          src={displayImages[0]}
          alt="Recipe"
          className="w-full h-full object-cover"
        />
      );
    } else if (displayImages.length === 2) {
      // Two images - side by side
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          {displayImages.slice(0, 2).map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Recipe"
              className="w-full h-full object-cover rounded-lg"
            />
          ))}
        </div>
      );
    } else if (displayImages.length === 3) {
      // Three images - one large, two small
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          <img
            src={displayImages[0]}
            alt="Recipe"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="grid grid-rows-2 gap-2">
            <img
              src={displayImages[1]}
              alt="Recipe"
              className="w-full h-full object-cover rounded-lg"
            />
            <img
              src={displayImages[2]}
              alt="Recipe"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      );
    } else {
      // Four or more images - grid layout with overlay for extras
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          <img
            src={displayImages[0]}
            alt="Recipe"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="grid grid-rows-2 gap-2">
            <img
              src={displayImages[1]}
              alt="Recipe"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="relative">
              <img
                src={displayImages[2]}
                alt="Recipe"
                className="w-full h-full object-cover rounded-lg"
              />
              {displayImages.length > 3 && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    +{displayImages.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center">
              <Layers className="w-6 h-6 mr-3 text-primary-600" />
              Recipe Boards
            </h2>
            <p className="text-gray-600">
              Organize your favorite recipes into custom collections
            </p>
          </div>
          <Button 
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <BoardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Boards Grid - 2 Columns */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={generateBoardUrl(board.slug)}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 group"
            >
              {/* Board Cover with Recipe Images */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <div className="absolute inset-0 p-4">
                  {renderRecipeImagesGrid(board.recipe_images, board.recipe_count)}
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Recipe Count */}
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">{board.recipe_count} recipes</span>
                  </div>
                </div>
              </div>

              {/* Board Content - Fixed Heights for Perfect Alignment */}
              <div className="p-4 flex flex-col">
                {/* Fixed Height Title Container */}
                <div className="h-14 flex items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                    {board.title}
                  </h3>
                </div>
                
                {/* Fixed Height Action Container */}
                <div className="h-6 flex items-center justify-end">
                  <span className="text-sm text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                    View Board →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Create New Board Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 hover:border-primary-300 transition-colors h-full min-h-[320px]"
          >
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Board</h3>
              <p className="text-gray-600 text-sm">
                Start organizing your recipes into custom collections
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && boards.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipe Boards Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first board to start organizing your favorite recipes
          </p>
          <div className="space-y-3">
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Board
            </Button>
            <p className="text-sm text-gray-500">
              or{' '}
              <Link 
                to="/explore-recipes" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                explore recipes
              </Link>
              {' '}to find ones to save
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!loading && !error && boards.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Board Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Layers className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
              <p className="text-sm text-gray-600">Total Boards</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {boards.reduce((sum, board) => sum + board.recipe_count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Recipes</p>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {boards.filter(board => !board.is_private).length}
              </p>
              <p className="text-sm text-gray-600">Public Boards</p>
            </div>
            <div className="text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
};

export default DashboardBoards;
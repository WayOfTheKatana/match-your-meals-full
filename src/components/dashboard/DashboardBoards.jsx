import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Layers, Plus, BookOpen, Heart, Clock, Users, Star, Loader2, AlertCircle, Lock, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

// Fetch user's recipe boards
const fetchUserBoards = async (userId) => {
  if (!userId) return [];
  
  // For now, we'll use mock data since we haven't created the boards table yet
  // In a real implementation, this would fetch from a 'recipe_boards' table
  const mockBoards = [
    {
      id: 1,
      name: 'Healthy Breakfast Ideas',
      slug: 'healthy-breakfast-ideas',
      recipe_count: 12,
      is_private: false,
      created_at: '2024-01-15',
      user_id: userId,
      recipe_images: [
        'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=200'
      ]
    },
    {
      id: 2,
      name: 'Quick Dinner Solutions',
      slug: 'quick-dinner-solutions',
      recipe_count: 8,
      is_private: true,
      created_at: '2024-01-10',
      user_id: userId,
      recipe_images: [
        'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200'
      ]
    },
    {
      id: 3,
      name: 'Holiday Favorites',
      slug: 'holiday-favorites',
      recipe_count: 15,
      is_private: false,
      created_at: '2024-01-05',
      user_id: userId,
      recipe_images: [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200'
      ]
    },
    {
      id: 4,
      name: 'Vegan Delights',
      slug: 'vegan-delights',
      recipe_count: 6,
      is_private: true,
      created_at: '2024-01-01',
      user_id: userId,
      recipe_images: [
        'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200',
        'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200'
      ]
    }
  ];
  
  return mockBoards;
};

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
      
      {/* Privacy Badge Skeleton */}
      <div className="absolute top-3 right-3">
        <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
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
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const DashboardBoards = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: userBoards = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userBoards', user?.id],
    queryFn: () => fetchUserBoards(user?.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const generateBoardUrl = (boardSlug) => {
    return `/creators/board/${boardSlug}`;
  };

  const renderRecipeImagesGrid = (images, recipeCount) => {
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
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <BoardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Boards Grid - 2 Columns */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBoards.map((board) => (
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
                
                {/* Privacy Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    board.is_private 
                      ? 'bg-gray-900/70 text-white' 
                      : 'bg-green-500/70 text-white'
                  }`}>
                    {board.is_private ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3" />
                        <span>Public</span>
                      </>
                    )}
                  </span>
                </div>
                
                {/* Recipe Count */}
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">{board.recipe_count} recipes</span>
                  </div>
                </div>
              </div>

              {/* Board Content - Title Only */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                  {board.name}
                </h3>
                
                {/* Board Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {new Date(board.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle favorite toggle
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-primary-600 font-medium group-hover:text-primary-700">
                      View Board →
                    </span>
                  </div>
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
      {!isLoading && !error && userBoards.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border text-center">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipe Boards Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first board to start organizing your favorite recipes
          </p>
          <Button 
            className="bg-primary-600 hover:bg-primary-700"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Board
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      {!isLoading && !error && userBoards.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Board Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Layers className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{userBoards.length}</p>
              <p className="text-sm text-gray-600">Total Boards</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {userBoards.reduce((sum, board) => sum + board.recipe_count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Recipes</p>
            </div>
            <div className="text-center">
              <Globe className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {userBoards.filter(board => !board.is_private).length}
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

      {/* Create Board Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Board</h3>
            <p className="text-gray-600 mb-4">Board creation functionality will be implemented next.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button className="bg-primary-600 hover:bg-primary-700">
                Create Board
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBoards;
import React from 'react';
import { Layers, Plus, Grid, BookOpen, Heart, Clock, Users, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

const DashboardBoards = () => {
  // Mock data for recipe boards
  const recipeBoards = [
    {
      id: 1,
      name: 'Healthy Breakfast Ideas',
      description: 'Start your day right with these nutritious breakfast recipes',
      recipeCount: 12,
      coverImage: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=400',
      isPrivate: false,
      createdAt: '2024-01-15',
      recipes: [
        { id: 1, title: 'Overnight Oats', image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 2, title: 'Avocado Toast', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 3, title: 'Green Smoothie', image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200' }
      ]
    },
    {
      id: 2,
      name: 'Quick Dinner Solutions',
      description: 'Fast and delicious dinner recipes for busy weeknights',
      recipeCount: 8,
      coverImage: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400',
      isPrivate: true,
      createdAt: '2024-01-10',
      recipes: [
        { id: 4, title: 'Pasta Primavera', image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 5, title: 'Stir Fry', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200' }
      ]
    },
    {
      id: 3,
      name: 'Holiday Favorites',
      description: 'Special recipes for celebrations and holidays',
      recipeCount: 15,
      coverImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      isPrivate: false,
      createdAt: '2024-01-05',
      recipes: [
        { id: 6, title: 'Roasted Turkey', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 7, title: 'Pumpkin Pie', image: 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=200' },
        { id: 8, title: 'Cranberry Sauce', image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=200' }
      ]
    }
  ];

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
          <Button className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </Button>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipeBoards.map((board) => (
          <div key={board.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            {/* Board Cover */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={board.coverImage}
                alt={board.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Privacy Badge */}
              {board.isPrivate && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-gray-900/70 text-white rounded-full text-xs font-medium">
                    Private
                  </span>
                </div>
              )}
              
              {/* Recipe Count */}
              <div className="absolute bottom-3 left-3 text-white">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">{board.recipeCount} recipes</span>
                </div>
              </div>
            </div>

            {/* Board Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{board.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{board.description}</p>
              
              {/* Recipe Preview */}
              {board.recipes.length > 0 && (
                <div className="mb-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {board.recipes.slice(0, 3).map((recipe, index) => (
                      <img
                        key={recipe.id}
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        title={recipe.title}
                      />
                    ))}
                    {board.recipes.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">+{board.recipes.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Board Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    View Board
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Board Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 hover:border-primary-300 transition-colors">
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Board</h3>
            <p className="text-gray-600 text-sm mb-4">
              Start organizing your recipes into custom collections
            </p>
            <Button className="bg-primary-600 hover:bg-primary-700">
              Create Board
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Board Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Layers className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{recipeBoards.length}</p>
            <p className="text-sm text-gray-600">Total Boards</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {recipeBoards.reduce((sum, board) => sum + board.recipeCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Recipes</p>
          </div>
          <div className="text-center">
            <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {recipeBoards.filter(board => !board.isPrivate).length}
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
    </div>
  );
};

export default DashboardBoards;
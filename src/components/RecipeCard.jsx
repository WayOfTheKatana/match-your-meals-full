import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart, BookOpen, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { formatTime, getTotalTime } from '../lib/utils';

const RecipeCard = ({ recipe, onSave, isSaved }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group h-full flex flex-col">
      {/* Recipe Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-xs font-medium">{recipe.rating || '4.8'}</span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
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
            <span className="text-sm font-medium">{recipe.servings || 4}</span>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recipe.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center space-x-1 transition-colors ${
              isSaved
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'hover:bg-red-50 hover:border-red-200 hover:text-red-600'
            }`}
            onClick={() => onSave && onSave(recipe.id)}
          >
            <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            <Link to={`/recipes/${recipe.slug || recipe.id}`}>
              <BookOpen className="w-3 h-3 mr-1" />
              <span className="text-xs">View Recipe</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
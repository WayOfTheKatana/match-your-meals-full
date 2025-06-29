import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart, BookOpen, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { formatTime, getTotalTime } from '../lib/utils';

const RecipeCard = ({ recipe, onSave, isSaved }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group h-full flex flex-col">
      {/* Recipe Image - Reduced height */}
      <div className="relative h-36 overflow-hidden">
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

      {/* Recipe Content - Reduced padding */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors text-base">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed flex-grow">
          {recipe.description}
        </p>

        {/* Recipe Meta - Smaller text */}
        <div className="flex items-center space-x-4 text-gray-700 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-primary-600" />
            <span className="text-xs font-medium">{formatTime(getTotalTime(recipe))}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-primary-600" />
            <span className="text-xs font-medium">{recipe.servings || 4}</span>
          </div>
        </div>

        {/* Tags - Optional based on available space */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.tags.slice(0, 1).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 1 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{recipe.tags.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Actions - Smaller buttons */}
        <div className="flex items-center space-x-2 mt-auto">
          <Button
            variant="outline"
            size="xs"
            className={`flex items-center transition-colors ${
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
            size="xs"
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            <Link to={`/recipes/${recipe.slug || recipe.id}`}>
              <BookOpen className="w-3 h-3 mr-1" />
              <span className="text-xs">View</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
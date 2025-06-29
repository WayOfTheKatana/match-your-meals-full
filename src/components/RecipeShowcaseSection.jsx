import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';
import RecipeCard from './RecipeCard';
import { ShimmerButton } from './ui/shimmer-button';

const RecipeShowcaseSection = () => {
  // Sample recipe data
  const recipes = [
    {
      id: '1',
      slug: 'healthy-mediterranean-bowl',
      title: 'Healthy Mediterranean Bowl',
      description: 'A nutritious bowl packed with fresh vegetables, hummus, and grilled chicken. Perfect for a balanced lunch or dinner.',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 20,
      servings: 2,
      rating: '4.9',
      tags: ['Mediterranean', 'Healthy', 'High-Protein']
    },
    {
      id: '2',
      slug: 'avocado-toast-with-poached-eggs',
      title: 'Avocado Toast with Poached Eggs',
      description: 'Creamy avocado spread on whole grain toast topped with perfectly poached eggs and a sprinkle of red pepper flakes.',
      image: 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 5,
      servings: 1,
      rating: '4.7',
      tags: ['Breakfast', 'Vegetarian', 'Quick']
    },
    {
      id: '3',
      slug: 'thai-coconut-curry-soup',
      title: 'Thai Coconut Curry Soup',
      description: 'A fragrant and spicy Thai soup with coconut milk, lemongrass, and your choice of protein. Ready in under 30 minutes!',
      image: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 15,
      servings: 4,
      rating: '4.8',
      tags: ['Thai', 'Soup', 'Spicy']
    },
    {
      id: '4',
      slug: 'berry-protein-smoothie-bowl',
      title: 'Berry Protein Smoothie Bowl',
      description: 'A thick and creamy smoothie bowl loaded with mixed berries, protein powder, and topped with granola and fresh fruit.',
      image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 0,
      servings: 1,
      rating: '4.6',
      tags: ['Breakfast', 'Vegan', 'High-Protein']
    },
    {
      id: '5',
      slug: 'sheet-pan-salmon-with-vegetables',
      title: 'Sheet Pan Salmon with Vegetables',
      description: 'An easy weeknight dinner with perfectly roasted salmon and seasonal vegetables all cooked on one pan for minimal cleanup.',
      image: 'https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 10,
      cook_time: 25,
      servings: 2,
      rating: '4.9',
      tags: ['Seafood', 'One-Pan', 'Low-Carb']
    },
    {
      id: '6',
      slug: 'quinoa-stuffed-bell-peppers',
      title: 'Quinoa Stuffed Bell Peppers',
      description: 'Colorful bell peppers stuffed with protein-rich quinoa, black beans, corn, and topped with melted cheese.',
      image: 'https://images.pexels.com/photos/5737247/pexels-photo-5737247.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 20,
      cook_time: 40,
      servings: 4,
      rating: '4.7',
      tags: ['Vegetarian', 'Gluten-Free', 'Meal-Prep']
    },
    {
      id: '7',
      slug: 'classic-beef-burger',
      title: 'Classic Beef Burger',
      description: 'A juicy homemade beef burger with all the fixings - lettuce, tomato, onion, and special sauce on a toasted brioche bun.',
      image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 10,
      servings: 4,
      rating: '4.8',
      tags: ['Beef', 'American', 'Grill']
    },
    {
      id: '8',
      slug: 'vegan-chocolate-mousse',
      title: 'Vegan Chocolate Mousse',
      description: 'A rich and creamy chocolate mousse made with avocado and coconut cream. No one will believe it\'s vegan!',
      image: 'https://images.pexels.com/photos/2373520/pexels-photo-2373520.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 0,
      servings: 4,
      rating: '4.6',
      tags: ['Dessert', 'Vegan', 'No-Bake']
    },
    {
      id: '9',
      slug: 'lemon-garlic-roast-chicken',
      title: 'Lemon Garlic Roast Chicken',
      description: 'A perfectly roasted whole chicken infused with lemon, garlic, and herbs. Crispy skin outside, juicy meat inside.',
      image: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 20,
      cook_time: 90,
      servings: 6,
      rating: '4.9',
      tags: ['Chicken', 'Sunday Dinner', 'Comfort Food']
    },
    {
      id: '10',
      slug: 'vegetable-stir-fry-with-tofu',
      title: 'Vegetable Stir-Fry with Tofu',
      description: 'A colorful and quick vegetable stir-fry with crispy tofu cubes and a savory ginger-garlic sauce.',
      image: 'https://images.pexels.com/photos/5848182/pexels-photo-5848182.jpeg?auto=compress&cs=tinysrgb&w=400',
      prep_time: 15,
      cook_time: 10,
      servings: 2,
      rating: '4.5',
      tags: ['Vegan', 'Quick', 'Asian']
    }
  ];

  // Mock saved recipes state
  const [savedRecipes, setSavedRecipes] = React.useState([]);

  const handleSaveRecipe = (recipeId) => {
    if (savedRecipes.includes(recipeId)) {
      setSavedRecipes(savedRecipes.filter(id => id !== recipeId));
    } else {
      setSavedRecipes([...savedRecipes, recipeId]);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <ChefHat className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-urbanist">
            Discover Delicious Recipes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of mouth-watering recipes crafted by expert chefs and home cooks alike.
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onSave={() => handleSaveRecipe(recipe.id)}
              isSaved={savedRecipes.includes(recipe.id)}
            />
          ))}
        </div>

        {/* CTA with Shimmer Button */}
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <p className="text-gray-600 mb-6">
              Ready to discover more delicious recipes tailored to your preferences?
            </p>
            <Link to="/explore-recipes">
              <ShimmerButton 
                className="px-8 py-4 text-base font-medium"
                background="rgba(211, 84, 0, 0.9)"
                shimmerColor="#ffffff"
                shimmerDuration="2.5s"
              >
                <span className="flex items-center">
                  Explore More Recipes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecipeShowcaseSection;